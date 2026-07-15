#!/usr/bin/env node
/**
 * Importa as cenas do Figma: PNG de cada frame + as bounding boxes de todos os
 * nos internos.
 *
 * As bboxes sao o que permite o roteiro dizer `cursor: { para: "nome:Botao Continuar" }`
 * em vez de coordenadas magicas -- o cursor e os callouts miram elementos reais do
 * design, e continuam mirando certo quando voce move o botao no Figma e reimporta.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { carregarJornada } from "./lib/jornada.mjs";
import { ErroDeUso, carregarEnv, encerrarComErro, log } from "./lib/util.mjs";

const API = "https://api.figma.com/v1";
const ESCALA = 2; // 2x: o frame de 1440 vira 2880px e sobra nitidez para o zoom.

function chaveDoArquivo(ref) {
  if (!ref) throw new ErroDeUso("jornada.yaml precisa de `figma.arquivo` (URL ou key).");
  const m = String(ref).match(/(?:file|design|proto)\/([a-zA-Z0-9]{10,})/);
  if (m) return m[1];
  if (/^[a-zA-Z0-9]{10,}$/.test(ref)) return ref;
  throw new ErroDeUso(`Nao consegui extrair a key do Figma de "${ref}".`);
}

/** O Figma aceita "1-23" na URL mas exige "1:23" na API. */
const normalizarNode = (id) => String(id).replace(/-/g, ":");

async function figma(caminho, token) {
  const r = await fetch(`${API}${caminho}`, { headers: { "X-Figma-Token": token } });
  if (r.status === 403) {
    throw new ErroDeUso(
      "Figma recusou o token (403). Gere um novo em Settings -> Security -> Personal access tokens,\n" +
        "  com o escopo `File content: read`, e coloque em FIGMA_TOKEN no .env.",
    );
  }
  if (r.status === 404) {
    throw new ErroDeUso("Figma devolveu 404: arquivo ou node id inexistente / sem acesso.");
  }
  if (!r.ok) throw new ErroDeUso(`Figma respondeu ${r.status}: ${await r.text()}`);
  return r.json();
}

/**
 * Achata a arvore do frame em bboxes relativas ao proprio frame. Coordenadas em
 * px de design -- o build converte para o canvas do video.
 */
function achatar(node, origem, saida, profundidade = 0) {
  const bb = node.absoluteBoundingBox;
  if (bb && node.visible !== false) {
    saida.push({
      id: node.id,
      nome: node.name,
      tipo: node.type,
      profundidade,
      x: Math.round(bb.x - origem.x),
      y: Math.round(bb.y - origem.y),
      w: Math.round(bb.width),
      h: Math.round(bb.height),
    });
  }
  for (const filho of node.children ?? []) {
    achatar(filho, origem, saida, profundidade + 1);
  }
}

async function main() {
  carregarEnv();
  const token = process.env.FIGMA_TOKEN;
  if (!token) {
    throw new ErroDeUso(
      "FIGMA_TOKEN nao definido. Copie .env.example para .env e cole seu token pessoal do Figma.",
    );
  }

  const j = carregarJornada(process.argv[2]);
  const doFigma = j.spec.cenas.filter((c) => c.node);
  if (!doFigma.length) {
    log.aviso("Nenhuma cena com `node` do Figma -- todas usam `imagem` local. Nada a importar.");
    return;
  }

  const key = chaveDoArquivo(j.spec.figma?.arquivo);
  const ids = doFigma.map((c) => normalizarNode(c.node));
  log.passo(`Importando ${ids.length} cena(s) do arquivo ${key}`);

  // 1. Metadados: uma chamada traz a arvore completa de todos os frames.
  const meta = await figma(`/files/${key}/nodes?ids=${ids.join(",")}`, token);

  const nodes = { cenas: {}, porNome: {} };
  for (const cena of doFigma) {
    const nodeId = normalizarNode(cena.node);
    const doc = meta.nodes?.[nodeId]?.document;
    if (!doc) {
      throw new ErroDeUso(
        `Node "${cena.node}" (cena "${cena.id}") nao existe no arquivo ${key}.\n` +
          "  Confira se copiou o id certo (botao direito no frame -> Copy link to selection).",
      );
    }
    const origem = doc.absoluteBoundingBox;
    const lista = [];
    achatar(doc, origem, lista);

    nodes.cenas[cena.id] = {
      node: nodeId,
      nome: doc.name,
      largura: Math.round(origem.width),
      altura: Math.round(origem.height),
      elementos: lista,
    };
    // Indice por nome para o roteiro poder dizer `para: "nome:Botao Continuar"`.
    // Nomes repetidos: o primeiro (mais raso na arvore) vence.
    for (const el of lista) {
      const chave = `${cena.id}::${el.nome}`;
      if (!(chave in nodes.porNome)) nodes.porNome[chave] = el.id;
    }
    log.detalhe(`${cena.id}: "${doc.name}" ${origem.width}x${origem.height} (${lista.length} elementos)`);
  }

  // 2. Imagens: o endpoint devolve URLs temporarias em S3, entao baixamos na sequencia.
  log.passo(`Renderizando PNGs em ${ESCALA}x...`);
  const imgs = await figma(`/images/${key}?ids=${ids.join(",")}&format=png&scale=${ESCALA}`, token);
  if (imgs.err) throw new ErroDeUso(`Figma nao renderizou as imagens: ${imgs.err}`);

  mkdirSync(j.frames, { recursive: true });
  for (const cena of doFigma) {
    const url = imgs.images?.[normalizarNode(cena.node)];
    if (!url) throw new ErroDeUso(`Figma nao devolveu imagem para a cena "${cena.id}".`);
    const bin = Buffer.from(await (await fetch(url)).arrayBuffer());
    writeFileSync(join(j.frames, `${cena.id}.png`), bin);
    log.detalhe(`${cena.id}.png (${Math.round(bin.length / 1024)} KB)`);
  }

  mkdirSync(j.media, { recursive: true });
  writeFileSync(j.nodes, JSON.stringify(nodes, null, 2));
  log.ok(`${doFigma.length} cena(s) importada(s). Bboxes em .media/nodes.json`);
}

main().catch(encerrarComErro);
