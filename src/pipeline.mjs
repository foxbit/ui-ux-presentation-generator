#!/usr/bin/env node
/**
 * Pipeline completo de uma jornada: figma -> narrate -> build -> render.
 *
 * Cada etapa e idempotente e cacheada, entao rodar de novo depois de mexer no
 * roteiro so refaz o que mudou.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { caminhosDaJornada } from "./lib/jornada.mjs";
import { ErroDeUso, RAIZ, encerrarComErro, log } from "./lib/util.mjs";

const ETAPAS = [
  { nome: "figma", script: "figma-import.mjs", pular: (j) => existsSync(j.nodes) && !process.argv.includes("--refigma") },
  { nome: "narrate", script: "narrate.mjs" },
  { nome: "build", script: "build.mjs" },
  { nome: "render", script: "render.mjs" },
];

function main() {
  const slug = process.argv[2];
  if (!slug) throw new ErroDeUso("Uso: npm run pipeline -- <jornada> [--draft] [--refigma]");

  const j = caminhosDaJornada(slug);
  if (!existsSync(j.spec)) throw new ErroDeUso(`Jornada "${slug}" nao existe (${j.spec}).`);

  const extras = process.argv.slice(3);

  for (const etapa of ETAPAS) {
    if (etapa.pular?.(j)) {
      log.detalhe(`${etapa.nome}: ja importado, pulando (use --refigma para refazer).`);
      continue;
    }
    console.log();
    log.passo(`[${etapa.nome}]`);
    const r = spawnSync(process.execPath, [join(RAIZ, "src", etapa.script), slug, ...extras], {
      stdio: "inherit",
    });
    if (r.status !== 0) throw new ErroDeUso(`Etapa "${etapa.nome}" falhou. Pipeline interrompido.`);
  }

  console.log();
  log.ok(`Jornada "${slug}" concluida: ${join(j.saida, `${slug}.mp4`)}`);
}

try {
  main();
} catch (e) {
  encerrarComErro(e);
}
