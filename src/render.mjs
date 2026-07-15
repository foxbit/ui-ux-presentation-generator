#!/usr/bin/env node
/**
 * Renderiza a composicao em MP4 via HyperFrames (Chrome headless quadro a quadro).
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { carregarJornada } from "./lib/jornada.mjs";
import { estadoAprovacao } from "./lib/aprovacao.mjs";
import { ErroDeUso, RAIZ, carregarEnv, encerrarComErro, log } from "./lib/util.mjs";

const MOTIVO = {
  "ainda-nao-aprovado":
    "o storyboard ainda nao foi aprovado.\n" +
    "  Revise e aprove:\n" +
    "    npm run storyboard -- {slug}\n" +
    "    npm run aprovar   -- {slug}",
  "conteudo-mudou":
    "o jornada.yaml mudou depois da aprovacao.\n" +
    "  Revise o storyboard atualizado e aprove de novo:\n" +
    "    npm run storyboard -- {slug}\n" +
    "    npm run aprovar   -- {slug}",
  "aprovacao-corrompida":
    "o registro de aprovacao esta ilegivel. Aprove de novo: npm run aprovar -- {slug}",
};

async function main() {
  carregarEnv();
  const slug = process.argv[2];
  const j = carregarJornada(slug);

  // Portao: render so roda com aprovacao valida para o conteudo atual.
  const estado = estadoAprovacao(j);
  if (!estado.ok) {
    throw new ErroDeUso(
      `Render bloqueado — ${MOTIVO[estado.motivo].replaceAll("{slug}", slug)}`,
    );
  }

  if (!existsSync(j.composicao)) {
    throw new ErroDeUso(`Falta o index.html. Rode antes: npm run build -- ${slug}`);
  }

  // draft = rapido, para revisar; high = entrega ao cliente.
  const qualidade = process.argv.includes("--draft") ? "draft" : "high";
  mkdirSync(j.saida, { recursive: true });
  const destino = join(j.saida, `${slug}.mp4`);

  log.passo(`Renderizando em qualidade "${qualidade}"...`);

  // Chama o cli.js pelo Node em vez de `npx`: desde o Node 20, spawnar um .cmd
  // sem shell e bloqueado, e usar shell:true traria dor de cabeca com aspas em
  // caminhos que tem espaco (este projeto tem).
  const cli = join(RAIZ, "node_modules", "hyperframes", "dist", "cli.js");
  if (!existsSync(cli)) throw new ErroDeUso("hyperframes nao instalado. Rode: npm install");

  const r = spawnSync(
    process.execPath,
    [cli, "render", j.dir, "--output", destino, "--quality", qualidade, "--strict"],
    { stdio: "inherit", encoding: "utf-8" },
  );

  if (r.status !== 0) {
    throw new ErroDeUso(
      "O render falhou. Dicas:\n" +
        "  - `npx hyperframes lint <dir>` aponta erro de estrutura da composicao;\n" +
        "  - tela preta quase sempre e clip fora da raiz ou <audio> aninhado;\n" +
        "  - pouca RAM livre derruba workers -- feche outros apps.",
    );
  }

  if (!existsSync(destino)) throw new ErroDeUso("O render terminou mas nao gerou o MP4.");
  const mb = (statSync(destino).size / 1024 / 1024).toFixed(1);
  log.ok(`Video pronto: ${destino} (${mb} MB)`);
}

main().catch(encerrarComErro);
