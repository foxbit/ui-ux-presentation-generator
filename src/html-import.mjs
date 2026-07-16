#!/usr/bin/env node
/**
 * Importa as cenas de uma pagina HTML local (servidor de dev rodando): navega ate
 * cada `url`, executa as `acoes` que levam ao estado certo, tira um screenshot e
 * extrai as bounding boxes dos elementos marcados com `data-jornada="Nome"`.
 *
 * Mesma saida do figma-import.mjs (PNG + nodes.json) -- e o unico motivo disso
 * funcionar sem tocar em build.mjs/storyboard.mjs: os dois importadores produzem
 * o mesmo contrato, so muda de onde os dados vem.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import puppeteer from "puppeteer-core";
import { carregarJornada } from "./lib/jornada.mjs";
import { ErroDeUso, RAIZ, encerrarComErro, log } from "./lib/util.mjs";

const ESCALA = 2; // mesma logica do figma-import.mjs: nitidez de sobra para o zoom.
const TIMEOUT_PADRAO = 5000;

function chromeHeadless() {
  const cli = join(RAIZ, "node_modules", "hyperframes", "dist", "cli.js");
  if (!existsSync(cli)) throw new ErroDeUso("hyperframes nao instalado. Rode: npm install");
  try {
    return execFileSync(process.execPath, [cli, "browser", "path"], { encoding: "utf-8" }).trim();
  } catch {
    throw new ErroDeUso(
      "Chrome headless nao encontrado. Rode: npx hyperframes browser ensure",
    );
  }
}

/** Le o nodes.json existente (pode ja ter cenas importadas do Figma). */
function carregarNodesExistentes(caminho) {
  if (!existsSync(caminho)) return { cenas: {}, porNome: {} };
  try {
    return JSON.parse(readFileSync(caminho, "utf-8"));
  } catch {
    return { cenas: {}, porNome: {} };
  }
}

async function executarAcao(page, acao, cenaId) {
  const { tipo, alvo, valor, timeout } = acao;
  const onde = `cena "${cenaId}", acao "${tipo}"${alvo ? ` (${alvo})` : ""}`;
  try {
    switch (tipo) {
      case "clicar":
        await page.waitForSelector(alvo, { timeout: timeout ?? TIMEOUT_PADRAO });
        await page.click(alvo);
        break;
      case "digitar":
        await page.waitForSelector(alvo, { timeout: timeout ?? TIMEOUT_PADRAO });
        await page.type(alvo, String(valor ?? ""));
        break;
      case "esperar":
        await page.waitForSelector(alvo, { timeout: timeout ?? TIMEOUT_PADRAO });
        break;
      case "rolar":
        await page.evaluate(
          (sel) => document.querySelector(sel)?.scrollIntoView({ block: "center" }),
          alvo,
        );
        break;
    }
  } catch (e) {
    throw new ErroDeUso(`${onde}: ${e.message.split("\n")[0]}`);
  }
}

/** Bboxes relativas ao viewport (mesmo espaco do screenshot, sem precisar subtrair origem). */
async function extrairElementos(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll("[data-jornada]")).map((el) => {
      const r = el.getBoundingClientRect();
      return {
        nome: el.getAttribute("data-jornada"),
        tipo: el.tagName.toLowerCase(),
        x: Math.round(r.x),
        y: Math.round(r.y),
        w: Math.round(r.width),
        h: Math.round(r.height),
      };
    }),
  );
}

async function main() {
  const j = carregarJornada(process.argv[2]);
  const doHtml = j.spec.cenas.filter((c) => c.url);
  if (!doHtml.length) {
    log.aviso("Nenhuma cena com `url` -- nada a importar via HTML.");
    return;
  }

  const baseUrl = j.spec.html?.baseUrl;
  if (!baseUrl) {
    throw new ErroDeUso(
      "jornada.yaml precisa de `html.baseUrl` (ex.: http://localhost:5173) para cenas com `url`.",
    );
  }

  const largura = j.spec.html?.viewport?.largura ?? j.spec.video.largura;
  const altura = j.spec.html?.viewport?.altura ?? j.spec.video.altura;

  log.passo(`Importando ${doHtml.length} cena(s) de ${baseUrl}`);

  const browser = await puppeteer.launch({ executablePath: chromeHeadless(), headless: true });

  const nodes = carregarNodesExistentes(j.nodes);
  mkdirSync(j.frames, { recursive: true });

  try {
    for (const cena of doHtml) {
      const url = new URL(cena.url, baseUrl).toString();
      const page = await browser.newPage();
      await page.setViewport({ width: largura, height: altura, deviceScaleFactor: ESCALA });

      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
      } catch (e) {
        throw new ErroDeUso(
          `Nao consegui abrir "${url}" (cena "${cena.id}"): ${e.message.split("\n")[0]}\n` +
            "  O servidor local esta rodando nesse endereco?",
        );
      }

      for (const acao of cena.acoes ?? []) {
        await executarAcao(page, acao, cena.id);
      }

      const destino = join(j.frames, `${cena.id}.png`);
      await page.screenshot({ path: destino, type: "png" });

      const elementos = await extrairElementos(page);
      elementos.forEach((el, i) => (el.id = `${cena.id}-${i}`));

      nodes.cenas[cena.id] = { url: cena.url, largura, altura, elementos };
      for (const el of elementos) {
        const chave = `${cena.id}::${el.nome}`;
        if (!(chave in nodes.porNome)) nodes.porNome[chave] = el.id;
      }

      log.detalhe(`${cena.id}: "${url}" ${largura}x${altura} (${elementos.length} elemento(s) marcado(s))`);
      await page.close();
    }
  } finally {
    await browser.close();
  }

  mkdirSync(j.media, { recursive: true });
  writeFileSync(j.nodes, JSON.stringify(nodes, null, 2));
  log.ok(`${doHtml.length} cena(s) importada(s). Bboxes em .media/nodes.json`);
}

main().catch(encerrarComErro);
