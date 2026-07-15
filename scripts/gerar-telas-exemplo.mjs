/**
 * Fixture: gera telas sinteticas + nodes.json, imitando o que o figma-import
 * produziria. Serve para validar build/render sem depender do FIGMA_TOKEN.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const DIR = "a:/0 - Projetos-GIT/ui-ux-presentation-generator/jornadas/exemplo-cadastro/.media";
const W = 1440;
const H = 1024;

const els = {}; // cena -> [{nome,x,y,w,h}]

function campo({ x, y, w, rotulo, valor, erro }) {
  const cor = erro ? "#D92D20" : "#D0D5DD";
  return `
    <text x="${x}" y="${y - 10}" font-size="15" font-weight="600" fill="#344054">${rotulo}</text>
    <rect x="${x}" y="${y}" width="${w}" height="52" rx="8" fill="#fff" stroke="${cor}" stroke-width="${erro ? 2 : 1}"/>
    <text x="${x + 16}" y="${y + 33}" font-size="17" fill="${valor ? "#101828" : "#98A2B3"}">${valor || "Digite aqui"}</text>
    ${erro ? `<text x="${x}" y="${y + 74}" font-size="14" fill="#D92D20">${erro}</text>` : ""}`;
}

function moldura(conteudo) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"
    font-family="Segoe UI, Inter, sans-serif">
    <rect width="${W}" height="${H}" fill="#F9FAFB"/>
    <rect x="0" y="0" width="${W}" height="72" fill="#fff"/>
    <line x1="0" y1="72" x2="${W}" y2="72" stroke="#EAECF0"/>
    <circle cx="40" cy="36" r="12" fill="#FF6B35"/>
    <text x="64" y="43" font-size="19" font-weight="700" fill="#101828">Plataforma</text>
    ${conteudo}
  </svg>`;
}

// ---------- Cena 1: formulario vazio ----------
const cartaoX = 420;
const cartaoY = 130;
const cartaoW = 600;

const formBase = (erro) => `
  <rect x="${cartaoX}" y="${cartaoY}" width="${cartaoW}" height="800" rx="16" fill="#fff" stroke="#EAECF0"/>
  <text x="${cartaoX + 40}" y="${cartaoY + 62}" font-size="30" font-weight="700" fill="#101828">Criar sua conta</text>
  <text x="${cartaoX + 40}" y="${cartaoY + 94}" font-size="16" fill="#667085">Leva menos de dois minutos.</text>
  ${campo({ x: cartaoX + 40, y: cartaoY + 140, w: 520, rotulo: "Nome completo", valor: "Angelo Rosa" })}
  ${campo({ x: cartaoX + 40, y: cartaoY + 232, w: 520, rotulo: "E-mail", valor: erro ? "angelo@" : "angelo@exemplo.com", erro: erro ? "Digite um e-mail valido." : null })}
  ${campo({ x: cartaoX + 40, y: cartaoY + 344, w: 250, rotulo: "CPF", valor: "123.456.789-00" })}
  ${campo({ x: cartaoX + 310, y: cartaoY + 344, w: 250, rotulo: "CEP", valor: "01310-100" })}
  ${campo({ x: cartaoX + 40, y: cartaoY + 436, w: 520, rotulo: "Senha", valor: "••••••••••" })}
  <rect x="${cartaoX + 40}" y="${cartaoY + 528}" width="22" height="22" rx="6" fill="${erro ? "#fff" : "#FF6B35"}" stroke="${erro ? "#D0D5DD" : "#FF6B35"}"/>
  ${erro ? "" : `<path d="M ${cartaoX + 45} ${cartaoY + 539} l 5 5 l 8 -9" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/>`}
  <text x="${cartaoX + 74}" y="${cartaoY + 545}" font-size="15" fill="#475467">Li e aceito os termos de uso</text>
  <rect x="${cartaoX + 40}" y="${cartaoY + 590}" width="520" height="56" rx="10" fill="${erro ? "#F2F4F7" : "#FF6B35"}"/>
  <text x="${cartaoX + 300}" y="${cartaoY + 625}" font-size="18" font-weight="600" fill="${erro ? "#98A2B3" : "#fff"}" text-anchor="middle">Continuar</text>`;

els["cadastro-erro"] = [
  { nome: "Campo E-mail", x: cartaoX + 40, y: cartaoY + 232, w: 520, h: 52 },
  { nome: "Mensagem de erro", x: cartaoX + 40, y: cartaoY + 296, w: 300, h: 22 },
  { nome: "Botao Continuar", x: cartaoX + 40, y: cartaoY + 590, w: 520, h: 56 },
];
els["cadastro-ok"] = [
  { nome: "Aceite dos termos", x: cartaoX + 40, y: cartaoY + 522, w: 300, h: 34 },
  { nome: "Botao Continuar", x: cartaoX + 40, y: cartaoY + 590, w: 520, h: 56 },
];

// ---------- Cena 3: monitorando ----------
const monitorando = `
  <rect x="${cartaoX}" y="300" width="${cartaoW}" height="380" rx="16" fill="#fff" stroke="#EAECF0"/>
  <circle cx="${cartaoX + 300}" cy="400" r="38" fill="#FFF4EF"/>
  <circle cx="${cartaoX + 300}" cy="400" r="38" fill="none" stroke="#FF6B35" stroke-width="4" stroke-dasharray="60 180" stroke-linecap="round"/>
  <text x="${cartaoX + 300}" y="480" font-size="26" font-weight="700" fill="#101828" text-anchor="middle">Monitorando pagamento</text>
  <text x="${cartaoX + 300}" y="516" font-size="16" fill="#667085" text-anchor="middle">Conclua o checkout na aba que abrimos.</text>
  <text x="${cartaoX + 300}" y="544" font-size="16" fill="#667085" text-anchor="middle">Avisamos aqui assim que confirmar.</text>
  <rect x="${cartaoX + 140}" y="586" width="320" height="48" rx="10" fill="#F2F4F7"/>
  <text x="${cartaoX + 300}" y="616" font-size="15" font-weight="600" fill="#667085" text-anchor="middle">Aguardando confirmacao...</text>`;
els["pagamento-monitorando"] = [
  { nome: "Status do pagamento", x: cartaoX + 140, y: 460, w: 320, h: 100 },
];

// ---------- Cena 4: aprovado ----------
const aprovado = `
  <rect x="${cartaoX}" y="300" width="${cartaoW}" height="380" rx="16" fill="#fff" stroke="#EAECF0"/>
  <circle cx="${cartaoX + 300}" cy="400" r="38" fill="#ECFDF3"/>
  <path d="M ${cartaoX + 282} 400 l 12 13 l 22 -26" stroke="#12B76A" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="${cartaoX + 300}" y="480" font-size="28" font-weight="700" fill="#101828" text-anchor="middle">Pagamento aprovado</text>
  <text x="${cartaoX + 300}" y="516" font-size="16" fill="#667085" text-anchor="middle">Sua assinatura ja esta ativa.</text>
  <rect x="${cartaoX + 140}" y="580" width="320" height="56" rx="10" fill="#FF6B35"/>
  <text x="${cartaoX + 300}" y="616" font-size="18" font-weight="600" fill="#fff" text-anchor="middle">Acessar painel</text>`;
els["pagamento-aprovado"] = [
  { nome: "Botao Acessar painel", x: cartaoX + 140, y: 580, w: 320, h: 56 },
];

const cenas = {
  "cadastro-erro": moldura(formBase(true)),
  "cadastro-ok": moldura(formBase(false)),
  "pagamento-monitorando": moldura(monitorando),
  "pagamento-aprovado": moldura(aprovado),
};

mkdirSync(join(DIR, "frames"), { recursive: true });

const nodes = { cenas: {}, porNome: {} };
let i = 0;
for (const [id, svg] of Object.entries(cenas)) {
  await sharp(Buffer.from(svg)).png().toFile(join(DIR, "frames", `${id}.png`));
  const elementos = (els[id] ?? []).map((e, k) => ({
    id: `${++i}:${k}`,
    tipo: "FRAME",
    profundidade: 1,
    ...e,
  }));
  nodes.cenas[id] = { node: `${i}:0`, nome: id, largura: W, altura: H, elementos };
  for (const e of elementos) nodes.porNome[`${id}::${e.nome}`] = e.id;
  console.log(`  ${id}.png  (${elementos.length} elementos)`);
}

writeFileSync(join(DIR, "nodes.json"), JSON.stringify(nodes, null, 2));
console.log("\nTelas e nodes.json gerados em", DIR);
