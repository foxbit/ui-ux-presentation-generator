#!/usr/bin/env node
/**
 * Gera um WAV por beat com o Kokoro (pt-BR, local).
 *
 * Um audio por beat -- nao um blob unico -- porque e a duracao real de cada fala
 * que define a janela da cena, do cursor, do callout e da legenda. Um WAV so
 * obrigaria a adivinhar onde cada frase comeca, e a sincronia iria embora.
 *
 * Cache por hash (texto + voz + velocidade): reescrever uma frase do roteiro
 * regenera so aquela frase.
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { carregarJornada } from "./lib/jornada.mjs";
import { prepararTexto } from "./lib/texto.mjs";
import { ErroDeUso, RAIZ, carregarEnv, encerrarComErro, log, pythonDoVenv } from "./lib/util.mjs";

const hashDe = (texto, voz) =>
  createHash("sha1").update(`${texto}|${voz.voz}|${voz.velocidade}|${voz.idioma}`).digest("hex").slice(0, 12);

async function main() {
  carregarEnv();
  const j = carregarJornada(process.argv[2]);
  const forcar = process.argv.includes("--forcar");
  const python = pythonDoVenv();

  mkdirSync(j.audio, { recursive: true });

  const manifestoPath = join(j.audio, "manifesto.json");
  const manifesto = existsSync(manifestoPath) && !forcar
    ? JSON.parse(readFileSync(manifestoPath, "utf-8"))
    : {};

  const itens = [];
  const novoManifesto = {};

  for (const b of j.spec.beats) {
    const texto = prepararTexto(b.texto);
    const hash = hashDe(texto, j.spec.voz);
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

  log.passo(`Sintetizando ${itens.length} beat(s) com ${j.spec.voz.voz} @ ${j.spec.voz.velocidade}x`);

  const r = spawnSync(python, [join(RAIZ, "src", "tts", "kokoro_batch.py")], {
    input: JSON.stringify({ ...j.spec.voz, itens }),
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

  writeFileSync(manifestoPath, JSON.stringify(novoManifesto, null, 2));

  const { resultados } = JSON.parse(r.stdout);
  const total = resultados.reduce((s, x) => s + x.duracao, 0);
  log.ok(`${resultados.length} beat(s) gerados (${total.toFixed(1)}s de fala nova).`);
}

main().catch(encerrarComErro);
