import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
export const JORNADAS = join(RAIZ, "jornadas");

const cores = {
  cinza: "\x1b[90m",
  vermelho: "\x1b[31m",
  verde: "\x1b[32m",
  amarelo: "\x1b[33m",
  ciano: "\x1b[36m",
  reset: "\x1b[0m",
};

export const log = {
  passo: (m) => console.log(`${cores.ciano}▸${cores.reset} ${m}`),
  ok: (m) => console.log(`${cores.verde}✓${cores.reset} ${m}`),
  aviso: (m) => console.log(`${cores.amarelo}!${cores.reset} ${m}`),
  erro: (m) => console.error(`${cores.vermelho}✗${cores.reset} ${m}`),
  detalhe: (m) => console.log(`  ${cores.cinza}${m}${cores.reset}`),
};

/** Erro esperado: mensagem acionavel para o usuario, sem stack trace. */
export class ErroDeUso extends Error {}

/**
 * Encerra o processo com uma mensagem limpa quando o erro for de uso.
 * Erros inesperados sobem com stack, porque ai e bug nosso.
 */
export function encerrarComErro(err) {
  if (err instanceof ErroDeUso) {
    log.erro(err.message);
    process.exit(1);
  }
  throw err;
}

/** Le .env sem dependencia externa. Nao sobrescreve o que ja existe no ambiente. */
export function carregarEnv() {
  const arquivo = join(RAIZ, ".env");
  if (!existsSync(arquivo)) return;
  for (const linha of readFileSync(arquivo, "utf-8").split(/\r?\n/)) {
    const m = linha.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/i);
    if (!m) continue;
    const valor = m[2].replace(/^["']|["']$/g, "");
    if (valor && process.env[m[1]] === undefined) process.env[m[1]] = valor;
  }
}

/**
 * Python do venv, onde vive o Kokoro. Resolvido para caminho absoluto porque
 * o HyperFrames roda o interpretador a partir de outro working directory.
 */
export function pythonDoVenv() {
  const bruto = process.env.HYPERFRAMES_PYTHON || join(".venv", "Scripts", "python.exe");
  const abs = resolve(RAIZ, bruto);
  if (!existsSync(abs)) {
    throw new ErroDeUso(
      `Python do venv nao encontrado em ${abs}.\n` +
        `  Crie com:  python -m venv .venv\n` +
        `  E instale: .venv\\Scripts\\python.exe -m pip install kokoro-onnx soundfile`,
    );
  }
  return abs;
}

/** Duracao real de um arquivo de audio, em segundos. Fonte da verdade do timing. */
export function duracaoDoAudio(caminho) {
  const saida = execFileSync(
    "ffprobe",
    [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      caminho,
    ],
    { encoding: "utf-8" },
  ).trim();
  const s = Number.parseFloat(saida);
  if (!Number.isFinite(s)) throw new Error(`ffprobe nao leu a duracao de ${caminho}`);
  return s;
}

/** Arredonda para 3 casas: evita drift de ponto flutuante somando dezenas de beats. */
export const seg = (n) => Math.round(n * 1000) / 1000;

export function escaparHtml(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
