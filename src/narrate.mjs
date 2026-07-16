#!/usr/bin/env node
/**
 * Gera um WAV por beat: Kokoro (local, pt-BR, gratis) ou Gemini (API do Google,
 * pago, ~centavos por video) -- escolhido por `voz.provider` no jornada.yaml.
 *
 * Um audio por beat -- nao um blob unico -- porque e a duracao real de cada fala
 * que define a janela da cena, do cursor, do callout e da legenda. Um WAV so
 * obrigaria a adivinhar onde cada frase comeca, e a sincronia iria embora.
 *
 * Cache por hash (texto + provider + voz + velocidade): reescrever uma frase do
 * roteiro regenera so aquela frase. Trocar de provider tambem invalida o cache,
 * de proposito -- audios de vozes diferentes nao devem se misturar sem perceber.
 *
 * A chamada de rede do Gemini acontece so aqui, nesta etapa de importacao/cache.
 * O resultado congela num WAV local antes do build/render rodarem -- o render
 * continua 100% offline, igual ao Kokoro.
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { carregarJornada } from "./lib/jornada.mjs";
import { prepararTexto } from "./lib/texto.mjs";
import { sintetizarGemini } from "./tts/gemini.mjs";
import { ErroDeUso, RAIZ, carregarEnv, encerrarComErro, log, pythonDoVenv } from "./lib/util.mjs";

const GEMINI_MODELO_PADRAO = "gemini-3.1-flash-tts-preview";

const hashDe = (texto, voz) =>
  createHash("sha1")
    .update(`${texto}|${voz.provider}|${voz.voz}|${voz.velocidade}|${voz.idioma}|${voz.model ?? ""}`)
    .digest("hex")
    .slice(0, 12);

async function main() {
  carregarEnv();
  const j = carregarJornada(process.argv[2]);
  const forcar = process.argv.includes("--forcar");
  const voz = j.spec.voz;

  mkdirSync(j.audio, { recursive: true });

  const manifestoPath = join(j.audio, "manifesto.json");
  const manifesto = existsSync(manifestoPath) && !forcar
    ? JSON.parse(readFileSync(manifestoPath, "utf-8"))
    : {};

  const itens = [];
  const novoManifesto = {};

  for (const b of j.spec.beats) {
    const texto = prepararTexto(b.texto);
    const hash = hashDe(texto, voz);
    const saida = join(j.audio, `${b.id}.wav`);
    novoManifesto[b.id] = { hash, texto };

    if (!forcar && manifesto[b.id]?.hash === hash && existsSync(saida)) continue;
    itens.push({ id: b.id, texto, saida });
  }

  const reaproveitados = j.spec.beats.length - itens.length;
  if (reaproveitados) log.detalhe(`${reaproveitados} beat(s) sem mudanca -- audio reaproveitado.`);

  if (!itens.length) {
    log.ok("Narracao ja esta em dia.");
    return;
  }

  const resultados =
    voz.provider === "gemini" ? await narrarComGemini(itens, voz) : narrarComKokoro(itens, voz);

  writeFileSync(manifestoPath, JSON.stringify(novoManifesto, null, 2));

  const total = resultados.reduce((s, x) => s + x.duracao, 0);
  log.ok(`${resultados.length} beat(s) gerados (${total.toFixed(1)}s de fala nova).`);
}

function narrarComKokoro(itens, voz) {
  const python = pythonDoVenv();
  log.passo(`Sintetizando ${itens.length} beat(s) com Kokoro: ${voz.voz} @ ${voz.velocidade}x`);

  const r = spawnSync(python, [join(RAIZ, "src", "tts", "kokoro_batch.py")], {
    input: JSON.stringify({ ...voz, itens }),
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "inherit"],
    maxBuffer: 32 * 1024 * 1024,
  });

  if (r.status !== 0) {
    throw new ErroDeUso(
      "O Kokoro falhou. Confira se o venv tem as dependencias:\n" +
        `  ${python} -m pip install kokoro-onnx soundfile`,
    );
  }
  return JSON.parse(r.stdout).resultados;
}

async function narrarComGemini(itens, voz) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new ErroDeUso(
      "GEMINI_API_KEY nao definida.\n" +
        "  1. Gere uma chave em https://aistudio.google.com/apikey\n" +
        "  2. Cole em GEMINI_API_KEY no .env",
    );
  }
  const model = voz.model ?? GEMINI_MODELO_PADRAO;
  log.passo(`Sintetizando ${itens.length} beat(s) com Gemini (${model}, voz "${voz.voz}")`);

  const resultados = [];
  for (const item of itens) {
    const { duracao } = await sintetizarGemini({
      apiKey,
      model,
      voice: voz.voz,
      texto: item.texto,
      saida: item.saida,
    });
    log.detalhe(`${item.id}  ${duracao.toFixed(1)}s`);
    resultados.push({ id: item.id, duracao });
  }
  return resultados;
}

main().catch(encerrarComErro);
