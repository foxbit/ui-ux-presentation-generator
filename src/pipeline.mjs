#!/usr/bin/env node
/**
 * Pipeline de uma jornada, ciente do portao de aprovacao.
 *
 * "Avanca ate onde e permitido":
 *   importar (figma e/ou html) -> storyboard -> [PORTAO] -> narrate -> build -> render
 *
 * A primeira rodada para no portao e mostra o storyboard para revisar. Depois de
 * `npm run aprovar`, rodar de novo segue direto ate o MP4. Cada etapa e
 * idempotente e cacheada, entao repetir so refaz o que mudou.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { caminhosDaJornada, carregarJornada } from "./lib/jornada.mjs";
import { estadoAprovacao } from "./lib/aprovacao.mjs";
import { ErroDeUso, RAIZ, encerrarComErro, log } from "./lib/util.mjs";

function etapa(nome, script, slug, extras) {
  console.log();
  log.passo(`[${nome}]`);
  const r = spawnSync(process.execPath, [join(RAIZ, "src", script), slug, ...extras], {
    stdio: "inherit",
  });
  if (r.status !== 0) throw new ErroDeUso(`Etapa "${nome}" falhou. Pipeline interrompido.`);
}

function main() {
  const slug = process.argv[2];
  if (!slug) throw new ErroDeUso("Uso: npm run pipeline -- <jornada> [--draft] [--reimportar]");

  const j = caminhosDaJornada(slug);
  if (!existsSync(j.specPath)) throw new ErroDeUso(`Jornada "${slug}" nao existe (${j.specPath}).`);
  const extras = process.argv.slice(3);
  const reimportar = extras.includes("--refigma") || extras.includes("--reimportar");

  // Ate o portao: importar telas (Figma e/ou HTML, conforme as cenas) e (re)gerar o storyboard.
  const { spec } = carregarJornada(slug);
  const temFigma = spec.cenas.some((c) => c.node);
  const temHtml = spec.cenas.some((c) => c.url);

  if (existsSync(j.nodes) && !reimportar) {
    log.detalhe("importar: ja importado, pulando (use --reimportar para refazer).");
  } else {
    if (temFigma) etapa("figma", "figma-import.mjs", slug, extras);
    if (temHtml) etapa("html", "html-import.mjs", slug, extras);
  }
  etapa("storyboard", "storyboard.mjs", slug, extras);

  // O portao.
  const estado = estadoAprovacao(j);
  if (!estado.ok) {
    console.log();
    log.aviso("Pipeline pausado no portao de aprovacao.");
    log.detalhe(`Revise: ${j.storyboard}`);
    log.detalhe(`Aprove: npm run aprovar -- ${slug}`);
    log.detalhe(`Depois rode de novo: npm run pipeline -- ${slug}${extras.length ? " " + extras.join(" ") : ""}`);
    return;
  }
  log.detalhe(`aprovado em ${estado.aprovadoEm} — seguindo para o render.`);

  // Depois do portao: narrar, compor, renderizar.
  etapa("narrate", "narrate.mjs", slug, extras);
  etapa("build", "build.mjs", slug, extras);
  etapa("render", "render.mjs", slug, extras);

  console.log();
  log.ok(`Jornada "${slug}" concluida: ${join(j.saida, `${slug}.mp4`)}`);
}

try {
  main();
} catch (e) {
  encerrarComErro(e);
}
