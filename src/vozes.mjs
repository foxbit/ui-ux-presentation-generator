#!/usr/bin/env node
/**
 * Gera uma pagina para voce ESCOLHER a voz com o ouvido.
 *
 * O Kokoro so tem 3 vozes nativas de pt-BR, e sao reconhecidamente as mais fracas
 * do modelo. Mas voz e idioma sao parametros independentes (`create(text, voice,
 * speed, lang)`), entao da para por uma voz espanhola ou inglesa -- mais bem
 * treinada -- para falar portugues: o fonemizador gera os fonemas pt-BR e a voz so
 * empresta o timbre. E `voice` aceita um vetor, entao da para misturar duas vozes.
 *
 * Todas as amostras saem normalizadas a -16 LUFS para voce comparar TIMBRE, nao
 * volume. Uso: npm run vozes
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { RAIZ, ErroDeUso, carregarEnv, encerrarComErro, escaparHtml, log, pythonDoVenv } from "./lib/util.mjs";

const SAIDA = join(RAIZ, "amostras-voz");
const ALVO_LUFS = -16;

// Frase real de narracao, carregada de acentos -- e assim que voce vai usar a voz.
const TEXTO =
  "Boa tarde! Vou mostrar como ficou o novo fluxo de cadastro. " +
  "Se você digita um e-mail inválido, a validação avisa na hora. " +
  "Isso deixa bem mais fácil o usuário corrigir antes de seguir.";

const GRUPOS = [
  {
    titulo: "Nativas pt-BR",
    nota: "As únicas 3 vozes de português do Kokoro. São o padrão — e o ponto de comparação.",
    vozes: [
      { id: "pm_alex", voz: "pm_alex", rotulo: "pm_alex", nota: "masculina · a voz usada hoje", atual: true },
      { id: "pm_santa", voz: "pm_santa", rotulo: "pm_santa", nota: "masculina" },
      { id: "pf_dora", voz: "pf_dora", rotulo: "pf_dora", nota: "feminina" },
    ],
  },
  {
    titulo: "Espanholas falando português",
    nota: "Espanhol é o idioma foneticamente mais próximo do português. O texto é fonemizado em pt-BR; só o timbre vem da voz espanhola.",
    vozes: [
      { id: "em_alex", voz: "em_alex", rotulo: "em_alex", nota: "masculina" },
      { id: "em_santa", voz: "em_santa", rotulo: "em_santa", nota: "masculina" },
      { id: "ef_dora", voz: "ef_dora", rotulo: "ef_dora", nota: "feminina" },
    ],
  },
  {
    titulo: "Inglesas falando português",
    nota: "As vozes mais bem treinadas do modelo (af_heart é a principal). Timbre melhor, mas pode escapar um sotaque.",
    vozes: [
      { id: "af_heart", voz: "af_heart", rotulo: "af_heart", nota: "feminina · voz principal do modelo" },
      { id: "af_bella", voz: "af_bella", rotulo: "af_bella", nota: "feminina" },
      { id: "am_michael", voz: "am_michael", rotulo: "am_michael", nota: "masculina" },
      { id: "am_onyx", voz: "am_onyx", rotulo: "am_onyx", nota: "masculina · grave" },
    ],
  },
  {
    titulo: "Misturas",
    nota: "Média ponderada dos vetores de estilo: tenta somar a pronúncia nativa de uma com o timbre da outra.",
    vozes: [
      {
        id: "mix_alex",
        voz: { blend: { pm_alex: 0.5, em_alex: 0.5 } },
        rotulo: "pm_alex + em_alex",
        nota: "50/50 · nativa + espanhola",
      },
      {
        id: "mix_dora",
        voz: { blend: { pf_dora: 0.5, ef_dora: 0.5 } },
        rotulo: "pf_dora + ef_dora",
        nota: "50/50 · nativa + espanhola",
      },
      {
        id: "mix_heart",
        voz: { blend: { pm_alex: 0.65, af_heart: 0.35 } },
        rotulo: "pm_alex + af_heart",
        nota: "65/35 · nativa puxando o timbre da principal",
      },
    ],
  },
];

/** Normaliza para -16 LUFS e converte para MP3 (a pagina fica leve). */
function normalizar(wav, mp3) {
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-hide_banner", "-loglevel", "error", "-i", wav,
     "-af", `loudnorm=I=${ALVO_LUFS}:TP=-1.5:LRA=11`,
     "-ar", "24000", "-b:a", "128k", mp3],
    { encoding: "utf-8" },
  );
  if (r.status !== 0) throw new ErroDeUso(`ffmpeg falhou ao normalizar ${wav}: ${r.stderr}`);
}

function main() {
  carregarEnv();
  const python = pythonDoVenv();

  if (existsSync(SAIDA)) rmSync(SAIDA, { recursive: true, force: true });
  mkdirSync(SAIDA, { recursive: true });

  const itens = GRUPOS.flatMap((g) =>
    g.vozes.map((v) => ({ id: v.id, voz: v.voz, saida: join(SAIDA, `${v.id}.wav`) })),
  );

  log.passo(`Sintetizando ${itens.length} amostras...`);
  const r = spawnSync(python, [join(RAIZ, "src", "tts", "kokoro_vozes.py")], {
    input: JSON.stringify({ texto: TEXTO, itens }),
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "inherit"],
    maxBuffer: 32 * 1024 * 1024,
  });
  if (r.status !== 0) throw new ErroDeUso("O Kokoro falhou ao gerar as amostras.");

  const geradas = new Set(JSON.parse(r.stdout).resultados.map((x) => x.id));

  log.passo(`Normalizando a ${ALVO_LUFS} LUFS e convertendo para MP3...`);
  for (const it of itens) {
    if (!geradas.has(it.id)) continue;
    normalizar(it.saida, join(SAIDA, `${it.id}.mp3`));
    rmSync(it.saida);
  }

  const pagina = join(SAIDA, "index.html");
  writeFileSync(pagina, montarHtml(geradas));
  log.ok(`${geradas.size} amostras prontas.`);
  log.detalhe(`abra: ${pagina}`);
}

function montarHtml(geradas) {
  const secoes = GRUPOS.map((g) => {
    const cards = g.vozes
      .filter((v) => geradas.has(v.id))
      .map(
        (v) => `
        <div class="card${v.atual ? " card--atual" : ""}">
          <div class="card-topo">
            <code>${escaparHtml(v.rotulo)}</code>
            ${v.atual ? '<span class="tag">em uso</span>' : ""}
          </div>
          <p class="card-nota">${escaparHtml(v.nota)}</p>
          <audio controls preload="none" src="${v.id}.mp3"></audio>
          <p class="card-yaml">voz: <b>${escaparHtml(typeof v.voz === "string" ? v.voz : "(mistura)")}</b></p>
        </div>`,
      )
      .join("");
    return `
      <section>
        <h2>${escaparHtml(g.titulo)}</h2>
        <p class="secao-nota">${escaparHtml(g.nota)}</p>
        <div class="grade">${cards}</div>
      </section>`;
  }).join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8" />
<title>Escolha da voz — narração pt-BR</title>
<style>
  :root { color-scheme: dark; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #0E1116; color: #F2F4F7;
    font-family: Inter, "Segoe UI", system-ui, sans-serif;
    padding: 48px 32px 96px; line-height: 1.5;
  }
  .topo { max-width: 900px; margin: 0 auto 40px; }
  .etiqueta { font-size: 13px; letter-spacing: .18em; text-transform: uppercase; color: #FF6B35; font-weight: 700; }
  h1 { font-size: 38px; margin: 8px 0 16px; }
  .frase {
    background: #171B22; border-left: 3px solid #FF6B35; border-radius: 8px;
    padding: 16px 20px; font-size: 16px; color: #D7DCE3; margin-bottom: 12px;
  }
  .aviso { font-size: 14px; color: #98A2B3; }
  section { max-width: 900px; margin: 0 auto 44px; }
  h2 { font-size: 22px; margin-bottom: 6px; }
  .secao-nota { font-size: 14px; color: #98A2B3; margin-bottom: 18px; }
  .grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
  .card {
    background: #171B22; border: 1px solid rgba(255,255,255,.08);
    border-radius: 12px; padding: 16px;
  }
  .card--atual { border-color: #FF6B35; }
  .card-topo { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  code { font-family: ui-monospace, monospace; font-size: 15px; font-weight: 700; color: #F2F4F7; }
  .tag {
    font-size: 11px; text-transform: uppercase; letter-spacing: .08em;
    background: #FF6B35; color: #0E1116; padding: 2px 7px; border-radius: 999px; font-weight: 700;
  }
  .card-nota { font-size: 13px; color: #98A2B3; margin-bottom: 12px; min-height: 34px; }
  audio { width: 100%; height: 36px; }
  .card-yaml { font-size: 12px; color: #667085; margin-top: 10px; font-family: ui-monospace, monospace; }
  .card-yaml b { color: #98A2B3; }
</style>
</head>
<body>
  <div class="topo">
    <p class="etiqueta">Narração pt-BR · Kokoro-82M</p>
    <h1>Qual voz vai narrar?</h1>
    <p class="frase">“${escaparHtml(TEXTO)}”</p>
    <p class="aviso">
      Todas normalizadas a ${ALVO_LUFS} LUFS — compare <b>timbre e pronúncia</b>, não volume.
      Escolheu? É só trocar <code style="font-size:13px">voz:</code> no <code style="font-size:13px">jornada.yaml</code>.
    </p>
  </div>
  ${secoes}
</body>
</html>
`;
}

try {
  main();
} catch (e) {
  encerrarComErro(e);
}
