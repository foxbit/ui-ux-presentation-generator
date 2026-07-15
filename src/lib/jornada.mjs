import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import { ErroDeUso, JORNADAS, RAIZ, duracaoDoAudio, seg } from "./util.mjs";

export const SECOES = ["abertura", "contextualizacao", "demonstracao", "encerramento"];
export const ACOES = ["mover", "clicar", "digitar", "rolar"];

const PADRAO = {
  video: { largura: 1920, altura: 1080, fps: 30 },
  voz: { voz: "pm_alex", velocidade: 1.0, idioma: "pt-br" },
  cards: { abertura: 3.2, encerramento: 3.2 },
  // Respiro padrao entre beats. Sem isso a narracao emenda uma frase na outra
  // e o video soa afobado -- o Kokoro nao deixa silencio nas bordas.
  pausaEntreBeats: 0.35,
};

export function caminhosDaJornada(slug) {
  const dir = join(JORNADAS, slug);
  return {
    slug,
    dir,
    spec: join(dir, "jornada.yaml"),
    media: join(dir, ".media"),
    frames: join(dir, ".media", "frames"),
    audio: join(dir, ".media", "audio"),
    nodes: join(dir, ".media", "nodes.json"),
    timing: join(dir, ".media", "timing.json"),
    composicao: join(dir, "index.html"),
    roteiro: join(dir, "roteiro.md"),
    saida: join(dir, "out"),
  };
}

export function carregarJornada(slug) {
  if (!slug) {
    throw new ErroDeUso("Informe a jornada. Ex.: npm run build -- us-001-cadastro");
  }
  const p = caminhosDaJornada(slug);
  if (!existsSync(p.spec)) {
    throw new ErroDeUso(`Jornada "${slug}" nao encontrada (esperava ${p.spec}).`);
  }

  let bruto;
  try {
    bruto = YAML.parse(readFileSync(p.spec, "utf-8"));
  } catch (e) {
    throw new ErroDeUso(`jornada.yaml de "${slug}" tem YAML invalido: ${e.message}`);
  }

  const spec = normalizar(bruto, slug);
  validar(spec, p);
  return { ...p, spec };
}

function normalizar(bruto, slug) {
  const spec = { ...bruto };
  spec.id ??= slug;
  spec.video = { ...PADRAO.video, ...(bruto.video ?? {}) };
  spec.voz = { ...PADRAO.voz, ...(bruto.voz ?? {}) };
  spec.cards = { ...PADRAO.cards, ...(bruto.cards ?? {}) };
  spec.pausaEntreBeats = bruto.pausaEntreBeats ?? PADRAO.pausaEntreBeats;
  spec.cenas = bruto.cenas ?? [];
  spec.beats = bruto.beats ?? [];
  return spec;
}

function validar(spec, p) {
  const erros = [];

  if (!spec.titulo) erros.push("falta `titulo` (aparece no card de abertura).");
  if (!spec.cliente) erros.push("falta `cliente`.");
  if (!spec.cenas.length) erros.push("nenhuma cena declarada em `cenas`.");
  if (!spec.beats.length) erros.push("nenhum beat declarado em `beats`.");

  const idsCena = new Set();
  for (const [i, c] of spec.cenas.entries()) {
    if (!c.id) erros.push(`cenas[${i}]: falta \`id\`.`);
    else if (idsCena.has(c.id)) erros.push(`cenas[${i}]: id "${c.id}" duplicado.`);
    else idsCena.add(c.id);
    if (!c.node && !c.imagem) {
      erros.push(`cena "${c.id ?? i}": precisa de \`node\` (Figma) ou \`imagem\` (arquivo local).`);
    }
  }

  const idsBeat = new Set();
  for (const [i, b] of spec.beats.entries()) {
    const onde = `beats[${i}]${b.id ? ` (${b.id})` : ""}`;
    if (!b.id) erros.push(`${onde}: falta \`id\`.`);
    else if (idsBeat.has(b.id)) erros.push(`${onde}: id duplicado.`);
    else idsBeat.add(b.id);

    if (!b.texto?.trim()) erros.push(`${onde}: \`texto\` vazio -- todo beat vira audio.`);
    if (!b.secao) erros.push(`${onde}: falta \`secao\` (${SECOES.join(" | ")}).`);
    else if (!SECOES.includes(b.secao)) {
      erros.push(`${onde}: secao "${b.secao}" invalida. Use: ${SECOES.join(" | ")}.`);
    }
    if (!b.cena) erros.push(`${onde}: falta \`cena\`.`);
    else if (!idsCena.has(b.cena)) erros.push(`${onde}: cena "${b.cena}" nao existe em \`cenas\`.`);

    if (b.cursor) {
      const acao = b.cursor.acao ?? "mover";
      if (!ACOES.includes(acao)) {
        erros.push(`${onde}: cursor.acao "${acao}" invalida. Use: ${ACOES.join(" | ")}.`);
      }
      if (!b.cursor.para) erros.push(`${onde}: cursor precisa de \`para\` (node ou [x, y]).`);
    }
  }

  if (erros.length) {
    throw new ErroDeUso(
      `jornada.yaml de "${spec.id}" tem ${erros.length} problema(s):\n` +
        erros.map((e) => `    - ${e}`).join("\n"),
    );
  }
}

/**
 * Monta a timeline a partir da duracao REAL de cada audio (ffprobe), nunca de
 * estimativa de palavras-por-minuto. Cada beat ocupa exatamente o tempo da sua
 * fala + um respiro; cena, cursor, callout e legenda herdam essa janela. E isso
 * que mantem tudo sincronizado por construcao.
 */
export function calcularTiming({ spec, audio }) {
  const abertura = Number(spec.cards.abertura) || 0;
  const encerramento = Number(spec.cards.encerramento) || 0;

  let t = abertura;
  const beats = spec.beats.map((b) => {
    const wav = join(audio, `${b.id}.wav`);
    if (!existsSync(wav)) {
      throw new ErroDeUso(
        `Falta o audio do beat "${b.id}". Rode primeiro: npm run narrate -- ${spec.id}`,
      );
    }
    const fala = duracaoDoAudio(wav);
    const pausa = b.pausaDepois ?? spec.pausaEntreBeats;
    const inicio = seg(t);
    const duracao = seg(fala + pausa);
    t = seg(t + duracao);
    return { ...b, inicio, duracao, fala: seg(fala), pausa: seg(pausa), wav };
  });

  const fimDosBeats = seg(t);
  const total = seg(fimDosBeats + encerramento);

  // Agrupa beats consecutivos da mesma cena numa unica janela de imagem: e o que
  // permite o zoom sair suave de um beat para o outro em vez de reiniciar.
  const cenas = [];
  for (const b of beats) {
    const ultima = cenas.at(-1);
    if (ultima && ultima.cena === b.cena) {
      ultima.fim = seg(b.inicio + b.duracao);
      ultima.beats.push(b.id);
    } else {
      cenas.push({
        cena: b.cena,
        inicio: b.inicio,
        fim: seg(b.inicio + b.duracao),
        beats: [b.id],
      });
    }
  }

  return {
    abertura: { inicio: 0, duracao: abertura },
    encerramento: { inicio: fimDosBeats, duracao: encerramento },
    beats,
    cenas,
    fimDosBeats,
    total,
  };
}

/** Proporcao por secao -- a skill de narracao pede demonstracao em 70-80%. */
export function proporcoes(timing) {
  const porSecao = {};
  let falado = 0;
  for (const b of timing.beats) {
    porSecao[b.secao] = seg((porSecao[b.secao] ?? 0) + b.duracao);
    falado += b.duracao;
  }
  const pct = {};
  for (const [s, d] of Object.entries(porSecao)) {
    pct[s] = Math.round((d / falado) * 100);
  }
  return { porSecao, pct, falado: seg(falado) };
}

export function urlRelativa(caminhoAbs, dirBase) {
  return caminhoAbs.replace(dirBase, "").replace(/^[\\/]/, "").replaceAll("\\", "/");
}

export { RAIZ };
