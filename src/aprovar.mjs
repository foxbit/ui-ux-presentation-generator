#!/usr/bin/env node
/**
 * Registra a aprovacao do storyboard: libera o render para aquele conteudo.
 *
 * No fluxo da skill, isto roda depois que voce revisa o storyboard.html e diz
 * "aprovado". A aprovacao se prende ao jornada.yaml atual (ver lib/aprovacao).
 */
import { existsSync } from "node:fs";
import { carregarJornada } from "./lib/jornada.mjs";
import { registrarAprovacao } from "./lib/aprovacao.mjs";
import { ErroDeUso, encerrarComErro, log } from "./lib/util.mjs";

function main() {
  const j = carregarJornada(process.argv[2]);

  if (!existsSync(j.storyboard)) {
    throw new ErroDeUso(
      `Sem storyboard para aprovar. Gere e revise antes:\n` +
        `  npm run storyboard -- ${j.spec.id}`,
    );
  }

  const hash = registrarAprovacao(j);
  log.ok(`Jornada "${j.spec.id}" aprovada (conteudo ${hash}).`);
  log.detalhe(`Agora pode renderizar: npm run render -- ${j.spec.id}`);
  log.detalhe("Se editar o jornada.yaml depois disto, sera preciso aprovar de novo.");
}

try {
  main();
} catch (e) {
  encerrarComErro(e);
}
