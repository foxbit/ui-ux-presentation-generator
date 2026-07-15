#!/usr/bin/env node
/**
 * Gera o storyboard.html: o board de pre-producao que voce revisa ANTES de
 * processar o video.
 *
 * Um painel por beat, agrupado por sessao (tela). Cada painel mostra a tela real
 * com o zoom/cursor daquele beat ja desenhados por cima, o texto da locucao e o
 * tempo ESTIMADO (por contagem de palavras -- ainda nao existe audio). E o
 * artefato do portao de aprovacao: aprovado aqui, o pipeline processa.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { calcularTimingEstimado, carregarJornada, proporcoes } from "./lib/jornada.mjs";
import { centro, resolverAlvo } from "./lib/geometria.mjs";
import { RAIZ, ErroDeUso, encerrarComErro, escaparHtml, log, seg } from "./lib/util.mjs";

const LARGURA_MINIATURA = 460;

function carregarMarca() {
  return JSON.parse(readFileSync(join(RAIZ, "config", "marca.json"), "utf-8"));
}

const mmss = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(Math.round(s) % 60)).padStart(2, "0")}`;

/** Frase curta que descreve a animacao do beat, para o revisor ler de relance. */
function descreverAnimacao(b) {
  const partes = [];
  if (b.callout) {
    const z = b.callout.zoom ? ` (${b.callout.zoom}x)` : "";
    partes.push({ icone: "🔍", texto: `Zoom em "${rotuloAlvo(b.callout.alvo ?? b.callout)}"${z}` });
  }
  if (b.cursor) {
    const verbo = { mover: "Cursor sobre", clicar: "Clique em", digitar: "Digita em", rolar: "Rola ate" };
    partes.push({ icone: "🖱", texto: `${verbo[b.cursor.acao ?? "mover"]} "${rotuloAlvo(b.cursor.para)}"` });
  }
  if (!partes.length) partes.push({ icone: "🎬", texto: "Tela cheia, sem destaque" });
  return partes;
}

function rotuloAlvo(ref) {
  if (Array.isArray(ref)) return `${ref[0]}, ${ref[1]}`;
  return String(ref).replace(/^nome:|^node:/, "");
}

/**
 * Overlays (caixa do callout, marcador do cursor) em coordenadas da miniatura.
 * Reusa o mesmo resolvedor de alvo do build, entao o storyboard aponta
 * exatamente para onde o video vai apontar. Sem nodes.json (cena de imagem
 * local), devolve vazio -- o texto ja diz o alvo.
 */
function overlays(b, cena, nodes, escala) {
  const out = { callout: null, cursor: null };
  if (!nodes?.cenas?.[b.cena]) return out;
  try {
    if (b.callout) {
      const a = resolverAlvo(b.callout.alvo ?? b.callout, b.cena, nodes, `beat ${b.id}`);
      out.callout = { x: a.x * escala, y: a.y * escala, w: a.w * escala, h: a.h * escala };
    }
    if (b.cursor) {
      const a = resolverAlvo(b.cursor.para, b.cena, nodes, `beat ${b.id}`);
      const c = centro(a);
      out.cursor = { x: c.x * escala, y: c.y * escala, acao: b.cursor.acao ?? "mover" };
    }
  } catch (e) {
    // No storyboard, alvo invalido nao derruba a geracao: vira um aviso visivel
    // no proprio painel, que e onde voce quer ver o problema.
    out.erro = e.message.split("\n")[0];
  }
  return out;
}

/**
 * Junta sessoes vizinhas de mesmo titulo numa so. E o que permite tratar duas
 * telas ("cadastro-ok" e "cadastro-erro") como a mesma sessao de apresentacao
 * quando voce da a elas o mesmo `titulo`. Titulo distinto continua sessao a parte.
 */
function mesclarPorTitulo(sessoes) {
  const out = [];
  for (const s of sessoes) {
    const ult = out.at(-1);
    if (ult && ult.titulo === s.titulo) {
      ult.fim = s.fim;
      ult.beats.push(...s.beats);
    } else {
      out.push({ ...s, beats: [...s.beats] });
    }
  }
  return out;
}

function main() {
  const j = carregarJornada(process.argv[2]);
  const { spec } = j;
  const marca = carregarMarca();

  if (!existsSync(j.nodes) && spec.cenas.some((c) => c.node)) {
    throw new ErroDeUso(
      `Storyboard precisa das telas. Rode antes: npm run figma -- ${spec.id}`,
    );
  }
  const nodes = existsSync(j.nodes) ? JSON.parse(readFileSync(j.nodes, "utf-8")) : null;

  const timing = calcularTimingEstimado({ spec });
  const prop = proporcoes(timing);
  const beatsPorId = new Map(timing.beats.map((b) => [b.id, b]));

  const sessoesExibidas = mesclarPorTitulo(timing.sessoes);
  const paineis = [];
  for (const sessao of sessoesExibidas) {
    const dur = seg(sessao.fim - sessao.inicio);

    // A miniatura e resolvida por BEAT (nao por sessao): uma sessao pode reunir
    // duas telas -- p.ex. o formulario nos estados "ok" e "erro" sob o mesmo
    // titulo -- e cada painel precisa mostrar a sua propria tela.
    const linhas = sessao.beats.map((id) => {
      const b = beatsPorId.get(id);
      const cenaSpec = spec.cenas.find((c) => c.id === b.cena);
      const meta = nodes?.cenas?.[b.cena];
      const design = {
        largura: meta?.largura ?? cenaSpec?.largura ?? spec.video.largura,
        altura: meta?.altura ?? cenaSpec?.altura ?? spec.video.altura,
      };
      const escala = LARGURA_MINIATURA / design.largura;
      const alturaMin = design.altura * escala;
      const src = cenaSpec?.imagem ?? `.media/frames/${b.cena}.png`;
      const ov = overlays(b, cenaSpec, nodes, escala);
      const anim = descreverAnimacao(b)
        .map((a) => `<span class="chip"><span class="chip-ic">${a.icone}</span>${escaparHtml(a.texto)}</span>`)
        .join("");

      const marcadores = [];
      if (ov.callout) {
        const c = ov.callout;
        marcadores.push(
          `<div class="ov-callout" style="left:${c.x.toFixed(1)}px;top:${c.y.toFixed(1)}px;width:${c.w.toFixed(1)}px;height:${c.h.toFixed(1)}px"></div>`,
        );
      }
      if (ov.cursor) {
        const c = ov.cursor;
        const clique = c.acao === "clicar" ? " ov-cursor--clique" : "";
        marcadores.push(
          `<div class="ov-cursor${clique}" style="left:${c.x.toFixed(1)}px;top:${c.y.toFixed(1)}px" title="${c.acao}"></div>`,
        );
      }
      const aviso = ov.erro
        ? `<p class="painel-erro">⚠ ${escaparHtml(ov.erro)}</p>`
        : "";

      return `
        <div class="painel">
          <div class="miniatura" style="width:${LARGURA_MINIATURA}px;height:${alturaMin.toFixed(1)}px">
            <img src="${src}" alt="" />
            ${marcadores.join("\n            ")}
          </div>
          <div class="fala">
            <div class="fala-topo">
              <span class="beat-id">${escaparHtml(b.id)}</span>
              <span class="beat-secao">${escaparHtml(b.secao)}</span>
              <span class="beat-tempo">~${b.fala}s</span>
            </div>
            <p class="beat-texto">${escaparHtml(b.texto)}</p>
            <div class="beat-anim">${anim}</div>
            ${aviso}
          </div>
        </div>`;
    });

    paineis.push(`
      <section class="sessao">
        <header class="sessao-cab">
          <h2>${escaparHtml(sessao.titulo)}</h2>
          <span class="sessao-meta">${sessao.beats.length} beat(s) · ~${dur}s</span>
        </header>
        ${linhas.join("\n")}
      </section>`);
  }

  const c = marca.cores;
  const html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>Storyboard — ${escaparHtml(spec.titulo)}</title>
<style>
  :root { color-scheme: dark; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: ${c.fundo};
    color: ${c.texto};
    font-family: ${marca.tipografia.familia};
    -webkit-font-smoothing: antialiased;
    padding: 48px 40px 96px;
  }
  .topo { max-width: 900px; margin: 0 auto 12px; }
  .etiqueta {
    font-size: 13px; letter-spacing: .18em; text-transform: uppercase;
    color: ${c.destaque}; font-weight: 700;
  }
  .topo h1 { font-size: 40px; margin: 8px 0 6px; }
  .topo .sub { color: ${c.textoSuave}; font-size: 16px; }
  .previa {
    max-width: 900px; margin: 20px auto 0; padding: 12px 18px;
    background: ${c.fundoSuave}; border: 1px solid rgba(255,255,255,.08);
    border-left: 3px solid ${c.destaque}; border-radius: 8px;
    color: ${c.textoSuave}; font-size: 14px; line-height: 1.5;
  }
  .props { max-width: 900px; margin: 16px auto 0; display: flex; gap: 8px; flex-wrap: wrap; }
  .prop {
    font-size: 13px; color: ${c.textoSuave};
    background: ${c.fundoSuave}; border: 1px solid rgba(255,255,255,.06);
    padding: 6px 12px; border-radius: 999px;
  }
  .prop b { color: ${c.texto}; font-weight: 600; }

  .sessao { max-width: 900px; margin: 40px auto 0; }
  .sessao-cab {
    display: flex; align-items: baseline; justify-content: space-between;
    padding: 0 0 12px; border-bottom: 1px solid rgba(255,255,255,.1); margin-bottom: 18px;
  }
  .sessao-cab h2 { font-size: 22px; font-weight: 700; }
  .sessao-meta { font-size: 13px; color: ${c.textoSuave}; }

  .painel {
    display: grid; grid-template-columns: ${LARGURA_MINIATURA}px 1fr; gap: 24px;
    padding: 18px 0; border-bottom: 1px solid rgba(255,255,255,.05);
    align-items: start;
  }
  .miniatura {
    position: relative; overflow: hidden; border-radius: 8px;
    border: 1px solid rgba(255,255,255,.1); background: #fff; flex: none;
  }
  .miniatura img { display: block; width: 100%; height: 100%; object-fit: cover; }

  .ov-callout {
    position: absolute; border: 2px solid ${c.destaque}; border-radius: 6px;
    box-shadow: 0 0 0 9999px rgba(8,10,14,.5);
  }
  .ov-cursor {
    position: absolute; width: 16px; height: 16px; margin: -3px 0 0 -2px;
    background: ${c.cursor?.cor ?? "#fff"};
    clip-path: polygon(0 0, 0 70%, 22% 55%, 40% 90%, 55% 82%, 38% 48%, 70% 48%);
    filter: drop-shadow(0 1px 2px rgba(0,0,0,.6));
  }
  .ov-cursor--clique::after {
    content: ""; position: absolute; left: 50%; top: 50%;
    width: 30px; height: 30px; margin: -15px 0 0 -15px;
    border: 2px solid ${c.destaque}; border-radius: 50%; opacity: .9;
  }

  .fala-topo { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .beat-id {
    font-family: ui-monospace, monospace; font-size: 12px; font-weight: 700;
    color: ${c.fundo}; background: ${c.destaque}; padding: 2px 8px; border-radius: 5px;
  }
  .beat-secao { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; color: ${c.textoSuave}; }
  .beat-tempo { margin-left: auto; font-size: 13px; color: ${c.textoSuave}; }
  .beat-texto { font-size: 17px; line-height: 1.5; margin-bottom: 12px; }
  .beat-anim { display: flex; flex-wrap: wrap; gap: 8px; }
  .chip {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 13px; color: ${c.texto};
    background: ${c.fundoSuave}; border: 1px solid rgba(255,255,255,.1);
    padding: 5px 12px; border-radius: 999px;
  }
  .chip-ic { font-size: 13px; }
  .painel-erro { color: #FF6B6B; font-size: 13px; margin-top: 8px; }
</style>
</head>
<body>
  <div class="topo">
    <p class="etiqueta">Storyboard · ${escaparHtml(spec.cliente)}</p>
    <h1>${escaparHtml(spec.titulo)}</h1>
    <p class="sub">Duração estimada ~${mmss(timing.total)} · voz ${escaparHtml(spec.voz.voz)} @ ${spec.voz.velocidade}x</p>
  </div>
  <div class="previa">
    <b>Prévia de pré-produção.</b> Os tempos são estimados por contagem de palavras —
    a duração real é medida na narração. Revise as telas, os textos e as animações;
    ao aprovar, o pipeline processa o vídeo.
  </div>
  <div class="props">
    ${Object.entries(prop.pct).map(([s, p]) => `<span class="prop"><b>${escaparHtml(s)}</b> ${p}%</span>`).join("\n    ")}
    <span class="prop"><b>${timing.beats.length}</b> beats · <b>${sessoesExibidas.length}</b> sessões</span>
  </div>
  ${paineis.join("\n")}
</body>
</html>
`;

  mkdirSync(j.dir, { recursive: true });
  writeFileSync(j.storyboard, html);

  log.ok(`storyboard.html gerado — ${sessoesExibidas.length} sessões, ~${mmss(timing.total)}`);
  log.detalhe(`secoes: ${Object.entries(prop.pct).map(([s, p]) => `${s} ${p}%`).join(" · ")}`);
  log.detalhe(`abra: ${j.storyboard}`);
}

try {
  main();
} catch (e) {
  encerrarComErro(e);
}
