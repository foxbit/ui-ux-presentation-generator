import { ErroDeUso } from "./util.mjs";

/**
 * Encaixa o frame de design (ex.: 1440x1024) no canvas do video (1920x1080),
 * preservando proporcao e centralizando. Devolve a funcao que converte
 * coordenadas de design em coordenadas de canvas.
 */
export function encaixar(design, video) {
  const escala = Math.min(video.largura / design.largura, video.altura / design.altura);
  const larguraFinal = design.largura * escala;
  const alturaFinal = design.altura * escala;
  const offsetX = (video.largura - larguraFinal) / 2;
  const offsetY = (video.altura - alturaFinal) / 2;

  return {
    escala,
    larguraFinal,
    alturaFinal,
    offsetX,
    offsetY,
    ponto: (x, y) => ({ x: offsetX + x * escala, y: offsetY + y * escala }),
    caixa: (x, y, w, h) => ({
      x: offsetX + x * escala,
      y: offsetY + y * escala,
      w: w * escala,
      h: h * escala,
    }),
  };
}

/**
 * Resolve uma referencia do roteiro para um elemento real do design.
 * Aceita: "nome:Botao Continuar", "node:1:23", "1:23", [x, y] ou [x, y, w, h].
 */
export function resolverAlvo(ref, cenaId, nodes, onde) {
  if (Array.isArray(ref)) {
    if (ref.length === 2) return { x: ref[0], y: ref[1], w: 0, h: 0, origem: "coordenada" };
    if (ref.length === 4) {
      return { x: ref[0], y: ref[1], w: ref[2], h: ref[3], origem: "coordenada" };
    }
    throw new ErroDeUso(`${onde}: coordenada precisa ser [x, y] ou [x, y, w, h].`);
  }

  const cena = nodes?.cenas?.[cenaId];
  if (!cena) {
    throw new ErroDeUso(
      `${onde}: a cena "${cenaId}" ainda nao foi importada, entao "${ref}" nao pode ser resolvido.\n` +
        "  Rode `npm run figma -- <jornada>` (cena com `node`) ou `npm run html -- <jornada>` (cena com `url`),\n" +
        "  ou use coordenadas [x, y].",
    );
  }

  const texto = String(ref);
  let el;

  if (texto.startsWith("nome:")) {
    const nome = texto.slice(5).trim();
    const id = nodes.porNome[`${cenaId}::${nome}`];
    if (!id) {
      const parecidos = cena.elementos
        .map((e) => e.nome)
        .filter((n) => n.toLowerCase().includes(nome.toLowerCase().slice(0, 5)))
        .slice(0, 5);
      throw new ErroDeUso(
        `${onde}: nao existe elemento chamado "${nome}" na cena "${cenaId}".` +
          (parecidos.length ? `\n  Parecidos: ${parecidos.join(", ")}` : ""),
      );
    }
    el = cena.elementos.find((e) => e.id === id);
  } else {
    const id = texto.replace(/^node:/, "").replace(/-/g, ":");
    el = cena.elementos.find((e) => e.id === id);
    if (!el) throw new ErroDeUso(`${onde}: node "${id}" nao existe na cena "${cenaId}".`);
  }

  return { x: el.x, y: el.y, w: el.w, h: el.h, origem: el.nome };
}

export const centro = (a) => ({ x: a.x + a.w / 2, y: a.y + a.h / 2 });
