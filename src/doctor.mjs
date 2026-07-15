#!/usr/bin/env node
/**
 * Confere se a maquina consegue rodar o pipeline inteiro, antes de voce
 * descobrir isso no meio de um render.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";
import { JORNADAS, carregarEnv, log } from "./lib/util.mjs";

const checagens = [];
const checar = (nome, fn, dica) => {
  try {
    const detalhe = fn();
    checagens.push({ nome, ok: true, detalhe });
  } catch (e) {
    checagens.push({ nome, ok: false, detalhe: e.message.split("\n")[0], dica });
  }
};

const versao = (cmd, args = ["-version"]) =>
  execFileSync(cmd, args, { encoding: "utf-8", stdio: ["pipe", "pipe", "pipe"] })
    .split(/\r?\n/)[0]
    .slice(0, 60);

carregarEnv();

checar("Node", () => process.version);
checar("FFmpeg", () => versao("ffmpeg"), "winget install Gyan.FFmpeg");
checar("FFprobe", () => versao("ffprobe"), "vem junto com o FFmpeg");

checar(
  "Python (venv)",
  () => {
    const py = process.env.HYPERFRAMES_PYTHON ?? ".venv/Scripts/python.exe";
    if (!existsSync(py)) throw new Error(`nao encontrado em ${py}`);
    return versao(py, ["--version"]);
  },
  "python -m venv .venv",
);

checar(
  "Kokoro (TTS pt-BR)",
  () => {
    const py = process.env.HYPERFRAMES_PYTHON ?? ".venv/Scripts/python.exe";
    const r = spawnSync(py, ["-c", "import kokoro_onnx, soundfile; print('ok')"], {
      encoding: "utf-8",
    });
    if (r.status !== 0) throw new Error("kokoro_onnx/soundfile nao importam");
    return "kokoro-onnx + soundfile";
  },
  ".venv/Scripts/python.exe -m pip install kokoro-onnx soundfile",
);

checar(
  "Modelo Kokoro",
  () => {
    const m = join(homedir(), ".cache", "hyperframes", "tts", "models", "kokoro-v1.0.onnx");
    const v = join(homedir(), ".cache", "hyperframes", "tts", "voices", "voices-v1.0.bin");
    if (!existsSync(m) || !existsSync(v)) throw new Error("modelo/vozes ausentes no cache");
    return "kokoro-v1.0 + vozes";
  },
  "baixe de github.com/thewh1teagle/kokoro-onnx/releases (model-files-v1.0)",
);

checar(
  "Chrome headless",
  () => {
    const base = join(homedir(), ".cache", "hyperframes", "chrome");
    if (!existsSync(base)) throw new Error("nao instalado");
    return "instalado";
  },
  "npx hyperframes browser ensure",
);

checar(
  "FIGMA_TOKEN",
  () => {
    if (!process.env.FIGMA_TOKEN) throw new Error("ausente no .env");
    return "definido";
  },
  "copie .env.example para .env e cole seu token pessoal do Figma",
);

console.log();
for (const c of checagens) {
  if (c.ok) log.ok(`${c.nome.padEnd(20)} ${c.detalhe}`);
  else {
    log.erro(`${c.nome.padEnd(20)} ${c.detalhe}`);
    if (c.dica) log.detalhe(`↳ ${c.dica}`);
  }
}

const jornadas = existsSync(JORNADAS)
  ? readdirSync(JORNADAS, { withFileTypes: true }).filter((d) => d.isDirectory())
  : [];
console.log();
log.passo(`${jornadas.length} jornada(s): ${jornadas.map((d) => d.name).join(", ") || "nenhuma ainda"}`);

const falhas = checagens.filter((c) => !c.ok);
console.log();
if (falhas.length) {
  log.aviso(`${falhas.length} item(ns) pendente(s) -- veja as dicas acima.`);
  process.exit(1);
}
log.ok("Ambiente pronto para renderizar.");
