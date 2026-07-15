#!/usr/bin/env node
/**
 * Compila jornada.yaml + audios + bboxes do Figma numa composicao HyperFrames.
 *
 * Regras do runtime que o codigo abaixo respeita (elas nao sao negociaveis --
 * violar qualquer uma renderiza tela preta sem erro):
 *   1. Todo clip e <audio> e filho DIRETO da raiz da composicao.
 *   2. Elementos visiveis com tempo levam class="clip".
 *   3. Clips na mesma track nao se sobrepoem -- por isso as cenas alternam
 *      entre as tracks 0 e 1: o crossfade exige que duas cenas coexistam.
 *   4. A timeline GSAP nasce pausada e e registrada em window.__timelines.
 *      O renderer avanca o tempo quadro a quadro; nada pode se mover sozinho.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { calcularTiming, carregarJornada, proporcoes } from "./lib/jornada.mjs";
import { centro, encaixar, resolverAlvo } from "./lib/geometria.mjs";
import { ErroDeUso, RAIZ, encerrarComErro, escaparHtml, log, seg } from "./lib/util.mjs";

const TRANSICAO = 0.5; // crossfade entre cenas
const TRACK = { cenaPar: 0, cenaImpar: 1, cursor: 3, legenda: 4, cards: 6, audio: 10 };

function carregarMarca() {
  return JSON.parse(readFileSync(join(RAIZ, "config", "marca.json"), "utf-8"));
}

/**
 * Posicao do cursor no canvas levando o zoom em conta.
 *
 * Quando um beat tem callout, a cena inteira e escalada por `z` em torno do
 * centro do callout. O cursor vive fora dessa transformacao, entao a mira dele
 * precisa passar pela mesma matriz -- senao ele aponta para o lugar errado
 * exatamente nos momentos em que o espectador esta olhando de perto.
 */
function projetarCursor(pontoCanvas, callout, video) {
  if (!callout) return pontoCanvas;
  const cx = video.largura / 2;
  const cy = video.altura / 2;
  const z = callout.zoom;
  return {
    x: cx + (pontoCanvas.x - callout.centro.x) * z,
    y: cy + (pontoCanvas.y - callout.centro.y) * z,
  };
}

async function main() {
  const j = carregarJornada(process.argv[2]);
  const marca = carregarMarca();
  const { spec } = j;
  const video = spec.video;

  const nodes = existsSync(j.nodes) ? JSON.parse(readFileSync(j.nodes, "utf-8")) : null;
  const timing = calcularTiming({ spec, audio: j.audio });
  const prop = proporcoes(timing);

  log.passo(`Compondo "${spec.titulo}" -- ${timing.total.toFixed(1)}s, ${timing.beats.length} beats`);

  // --- Cenas: imagem + encaixe no canvas -----------------------------------
  const cenasPorId = new Map();
  for (const c of spec.cenas) {
    const arquivo = c.imagem
      ? join(j.dir, c.imagem)
      : join(j.frames, `${c.id}.png`);
    if (!existsSync(arquivo)) {
      throw new ErroDeUso(
        `Falta a imagem da cena "${c.id}" (${arquivo}).\n` +
          `  Rode: npm run figma -- ${spec.id}`,
      );
    }
    const meta = nodes?.cenas?.[c.id];
    const design = {
      largura: meta?.largura ?? c.largura ?? video.largura,
      altura: meta?.altura ?? c.altura ?? video.altura,
    };
    cenasPorId.set(c.id, {
      ...c,
      src: c.imagem ?? `.media/frames/${c.id}.png`,
      design,
      fit: encaixar(design, video),
    });
  }

  // --- Beats: resolve cursor e callout em coordenadas de canvas -------------
  const beats = timing.beats.map((b) => {
    const cena = cenasPorId.get(b.cena);
    const onde = `beat "${b.id}"`;

    let callout = null;
    if (b.callout) {
      const alvo = resolverAlvo(b.callout.alvo ?? b.callout, b.cena, nodes, `${onde} (callout)`);
      const caixa = cena.fit.caixa(alvo.x, alvo.y, alvo.w, alvo.h);
      const zoom = b.callout.zoom ?? marca.callout.escalaZoom;
      callout = {
        caixa,
        zoom,
        centro: { x: caixa.x + caixa.w / 2, y: caixa.y + caixa.h / 2 },
        rotulo: alvo.origem,
      };
    }

    let cursor = null;
    if (b.cursor) {
      const alvo = resolverAlvo(b.cursor.para, b.cena, nodes, `${onde} (cursor)`);
      const meio = centro(alvo);
      const p = cena.fit.ponto(meio.x, meio.y);
      cursor = {
        acao: b.cursor.acao ?? "mover",
        ponto: projetarCursor(p, callout, video),
        rotulo: alvo.origem,
      };
    }

    return { ...b, callout, cursor };
  });

  // --- HTML ----------------------------------------------------------------
  const html = montarHtml({ spec, marca, video, timing, beats, cenasPorId });
  mkdirSync(j.dir, { recursive: true });
  writeFileSync(j.composicao, html);

  // Roteiro legivel: e o que voce le em voz alta para conferir antes de renderizar.
  writeFileSync(j.roteiro, montarRoteiro({ spec, timing, beats, prop }));
  writeFileSync(j.timing, JSON.stringify({ ...timing, proporcoes: prop }, null, 2));

  log.ok(`index.html gerado (${timing.total.toFixed(1)}s)`);
  log.detalhe(
    `secoes: ${Object.entries(prop.pct).map(([s, p]) => `${s} ${p}%`).join(" · ")}`,
  );

  // A skill de narracao pede 70-80% de demonstracao. Aviso, nao bloqueio:
  // quem decide se o corte esta bom e voce.
  const demo = prop.pct.demonstracao ?? 0;
  if (demo < 60) {
    log.aviso(
      `Demonstracao ocupa so ${demo}% da fala (a skill pede 70-80%). ` +
        "A abertura/contexto podem estar longas demais.",
    );
  }
}

function montarHtml({ spec, marca, video, timing, beats, cenasPorId }) {
  const c = marca.cores;
  const partes = [];
  const tl = []; // linhas do timeline GSAP, em tempo global

  // ---- Card de abertura ----
  // Fades de saida vao SEMPRE num wrapper interno (nunca no proprio clip) e
  // terminam com um tl.set. O renderer salta no tempo em vez de tocar linear:
  // sem o "hard kill", um seek que aterrissa depois do fade acha o elemento
  // ainda visivel e o card reaparece por cima da cena.
  if (timing.abertura.duracao > 0) {
    const saida = seg(timing.abertura.duracao - TRANSICAO);
    partes.push(`
    <section id="card-abertura" class="clip card" data-start="0" data-duration="${timing.abertura.duracao}" data-track-index="${TRACK.cards}">
      <div class="card-inner" id="ca-inner">
        <div class="card-conteudo">
          <p class="card-etiqueta" id="ca-etiqueta">${escaparHtml(spec.cliente)}</p>
          <h1 class="card-titulo" id="ca-titulo">${escaparHtml(spec.titulo)}</h1>
          <div class="card-regua" id="ca-regua"></div>
          <p class="card-rodape" id="ca-rodape">${escaparHtml(marca.estudio)} · ${escaparHtml(marca.assinatura)}</p>
        </div>
      </div>
    </section>`);
    tl.push(`  tl.from("#ca-etiqueta", { y: 16, opacity: 0, duration: 0.5, ease: "power2.out" }, 0.25);`);
    tl.push(`  tl.from("#ca-titulo",   { y: 28, opacity: 0, duration: 0.7, ease: "power3.out" }, 0.4);`);
    tl.push(`  tl.fromTo("#ca-regua",  { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: "power3.inOut" }, 0.7);`);
    tl.push(`  tl.from("#ca-rodape",   { opacity: 0, duration: 0.5 }, 0.95);`);
    tl.push(`  tl.to("#ca-inner", { opacity: 0, duration: ${TRANSICAO}, ease: "power2.inOut" }, ${saida});`);
    tl.push(`  tl.set("#ca-inner", { opacity: 0 }, ${timing.abertura.duracao});`);
  }

  // ---- Cenas ----
  // Alternar tracks 0/1 e o que torna o crossfade legal: duas cenas coexistem
  // durante a transicao, e o runtime proibe sobreposicao na mesma track.
  timing.cenas.forEach((janela, i) => {
    const cena = cenasPorId.get(janela.cena);
    const idDom = `cena-${i}`;
    const inicio = seg(Math.max(0, janela.inicio - TRANSICAO));
    const duracao = seg(janela.fim - inicio);
    const track = i % 2 === 0 ? TRACK.cenaPar : TRACK.cenaImpar;

    // O callout mora dentro do wrapper que sofre o zoom, para acompanhar a escala.
    const calloutsDaCena = beats
      .filter((b) => janela.beats.includes(b.id) && b.callout)
      .map((b) => {
        const q = b.callout.caixa;
        const borda = Math.max(2, 3 / b.callout.zoom);
        return `
          <div class="callout" id="callout-${b.id}" style="left:${q.x.toFixed(1)}px; top:${q.y.toFixed(1)}px; width:${q.w.toFixed(1)}px; height:${q.h.toFixed(1)}px; border-width:${borda.toFixed(1)}px;"></div>`;
      })
      .join("");

    partes.push(`
    <div id="${idDom}" class="clip cena" data-start="${inicio}" data-duration="${duracao}" data-track-index="${track}">
      <div class="cena-inner" id="${idDom}-inner">
        <img src="${cena.src}" alt="" style="left:${cena.fit.offsetX.toFixed(1)}px; top:${cena.fit.offsetY.toFixed(1)}px; width:${cena.fit.larguraFinal.toFixed(1)}px; height:${cena.fit.alturaFinal.toFixed(1)}px;" />${calloutsDaCena}
      </div>
    </div>`);

    tl.push(`  tl.fromTo("#${idDom}-inner", { opacity: 0 }, { opacity: 1, duration: ${TRANSICAO}, ease: "power2.inOut" }, ${inicio});`);
  });

  // ---- Zoom + callouts, no tempo global ----
  const cx = video.largura / 2;
  const cy = video.altura / 2;
  const dur = marca.callout.duracaoTransicao;

  beats.forEach((b, i) => {
    if (!b.callout) return;
    const idx = timing.cenas.findIndex((jn) => jn.beats.includes(b.id));
    const inner = `#cena-${idx}-inner`;
    const z = b.callout.zoom;
    const tx = seg(-(b.callout.centro.x - cx) * z);
    const ty = seg(-(b.callout.centro.y - cy) * z);
    const fim = seg(b.inicio + b.fala);

    tl.push(`  tl.to("${inner}", { scale: ${z}, x: ${tx}, y: ${ty}, duration: ${dur}, ease: "power2.inOut", overwrite: "auto" }, ${b.inicio});`);
    tl.push(`  tl.to("#callout-${b.id}", { opacity: 1, duration: ${dur} }, ${b.inicio});`);
    tl.push(`  tl.to("#callout-${b.id}", { opacity: 0, duration: ${dur} }, ${fim});`);

    // Se o proximo beat continua na mesma cena e tambem tem callout, NAO volta
    // o zoom: a camera desliza de um elemento para o outro. Recuar e reaproximar
    // entre duas frases seguidas embrulha o olho -- e ainda faria dois tweens de
    // scale brigarem pelo mesmo elemento no mesmo instante.
    const proximo = beats[i + 1];
    const continuaFocado = proximo && proximo.cena === b.cena && proximo.callout;
    if (!continuaFocado) {
      tl.push(`  tl.to("${inner}", { scale: 1, x: 0, y: 0, duration: ${dur}, ease: "power2.inOut", overwrite: "auto" }, ${fim});`);
    }
  });

  // ---- Cursor ----
  const beatsComCursor = beats.filter((b) => b.cursor);
  if (beatsComCursor.length) {
    const primeiro = beatsComCursor[0];
    partes.push(`
    <div id="cursor" class="clip" data-start="${primeiro.inicio}" data-duration="${seg(timing.fimDosBeats - primeiro.inicio)}" data-track-index="${TRACK.cursor}">
      <div class="cursor-seta" id="cursor-seta">
        <svg width="${marca.cursor.tamanho}" height="${marca.cursor.tamanho}" viewBox="0 0 24 24" fill="none">
          <path d="M5 2.5 L5 19.5 L9.4 15.4 L12.1 21.5 L15.2 20.1 L12.5 14.2 L18.5 13.8 Z"
                fill="${marca.cursor.cor}" stroke="rgba(0,0,0,0.55)" stroke-width="1.1" stroke-linejoin="round"/>
        </svg>
        <span class="cursor-onda" id="cursor-onda"></span>
      </div>
    </div>`);

    // O cursor comeca ja em cima do primeiro alvo -- aparecer no canto e deslizar
    // ate a tela parece bug, nao demo.
    tl.push(`  tl.set("#cursor-seta", { x: ${primeiro.cursor.ponto.x.toFixed(1)}, y: ${primeiro.cursor.ponto.y.toFixed(1)} }, ${primeiro.inicio});`);

    let anterior = primeiro.cursor.ponto;
    for (const b of beatsComCursor) {
      const p = b.cursor.ponto;
      const distancia = Math.hypot(p.x - anterior.x, p.y - anterior.y);
      // Lei de Fitts, versao pobre: percursos longos levam mais tempo, mas o
      // movimento nunca passa de 0.9s nem fica instantaneo.
      const viagem = Math.min(0.9, Math.max(0.28, distancia / 1400));
      // Move na primeira metade da fala; o clique cai depois, ja com o
      // espectador olhando para o alvo certo.
      const quando = b === primeiro ? seg(b.inicio + 0.15) : b.inicio;

      if (b !== primeiro) {
        tl.push(`  tl.to("#cursor-seta", { x: ${p.x.toFixed(1)}, y: ${p.y.toFixed(1)}, duration: ${seg(viagem)}, ease: "power2.inOut" }, ${quando});`);
      }

      if (b.cursor.acao === "clicar") {
        // O afunda-e-volta do clique sao dois tweens de `scale` encostados: sem
        // overwrite eles se sobrepoem por um frame de arredondamento e brigam.
        const noClique = seg(quando + viagem + 0.1);
        tl.push(`  tl.to("#cursor-seta", { scale: 0.82, duration: 0.09, ease: "power2.in", overwrite: "auto" }, ${noClique});`);
        tl.push(`  tl.to("#cursor-seta", { scale: 1, duration: 0.16, ease: "back.out(3)", overwrite: "auto" }, ${seg(noClique + 0.1)});`);
        tl.push(`  tl.fromTo("#cursor-onda", { scale: 0, opacity: 0.85 }, { scale: 3.2, opacity: 0, duration: 0.55, ease: "power2.out" }, ${noClique});`);
      }
      anterior = p;
    }
  }

  // ---- Legendas ----
  beats.forEach((b) => {
    // A legenda dura a fala, nao a fala + pausa: some junto com a voz, senao
    // fica um texto orfao pairando no silencio.
    const fim = seg(b.inicio + b.fala);
    partes.push(`
    <div id="legenda-${b.id}" class="clip legenda" data-start="${b.inicio}" data-duration="${b.fala}" data-track-index="${TRACK.legenda}">
      <p id="legenda-${b.id}-txt">${escaparHtml(b.texto)}</p>
    </div>`);
    tl.push(`  tl.fromTo("#legenda-${b.id}-txt", { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.22, ease: "power2.out" }, ${b.inicio});`);
    tl.push(`  tl.to("#legenda-${b.id}-txt", { opacity: 0, duration: 0.18 }, ${seg(fim - 0.18)});`);
    tl.push(`  tl.set("#legenda-${b.id}-txt", { opacity: 0 }, ${fim});`);
  });

  // ---- Card de encerramento ----
  if (timing.encerramento.duracao > 0) {
    const e = timing.encerramento;
    partes.push(`
    <section id="card-fim" class="clip card" data-start="${e.inicio}" data-duration="${e.duracao}" data-track-index="${TRACK.cards}">
      <div class="card-inner" id="cf-inner">
        <div class="card-conteudo">
          <h2 class="card-titulo" id="cf-titulo">${escaparHtml(spec.cards.textoFinal ?? "Obrigado!")}</h2>
          <p class="card-rodape" id="cf-rodape">${escaparHtml(spec.cards.contato ?? "Estamos aqui para qualquer duvida.")}</p>
        </div>
      </div>
    </section>`);
    tl.push(`  tl.fromTo("#cf-inner", { opacity: 0 }, { opacity: 1, duration: ${TRANSICAO}, ease: "power2.inOut" }, ${e.inicio});`);
    tl.push(`  tl.from("#cf-titulo", { y: 20, opacity: 0, duration: 0.6, ease: "power3.out" }, ${seg(e.inicio + 0.3)});`);
    tl.push(`  tl.from("#cf-rodape", { opacity: 0, duration: 0.5 }, ${seg(e.inicio + 0.7)});`);
  }

  // ---- Audio: um <audio> por beat, na raiz, sem class="clip" ----
  for (const b of beats) {
    partes.push(
      `    <audio id="voz-${b.id}" src=".media/audio/${b.id}.wav" data-start="${b.inicio}" data-duration="${b.fala}" data-track-index="${TRACK.audio}"></audio>`,
    );
  }

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${video.largura}, height=${video.altura}" />
    <title>${escaparHtml(spec.titulo)} — ${escaparHtml(spec.cliente)}</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        background: ${c.fundo};
        font-family: ${marca.tipografia.familia};
        -webkit-font-smoothing: antialiased;
      }
      #root {
        position: relative;
        width: ${video.largura}px;
        height: ${video.altura}px;
        overflow: hidden;
        background: ${c.fundo};
      }

      /* --- Cenas --- */
      .cena { position: absolute; inset: 0; }
      .cena-inner { position: absolute; inset: 0; will-change: transform; }
      .cena-inner img {
        position: absolute;
        object-fit: contain;
        border-radius: 6px;
        box-shadow: 0 24px 80px rgba(0, 0, 0, 0.45);
      }

      /* Um elemento so faz o realce e escurece o resto: a borda marca o alvo e o
         box-shadow gigante cobre todo o entorno. */
      .callout {
        position: absolute;
        opacity: 0;
        border-style: solid;
        border-color: ${c.destaque};
        border-radius: ${marca.callout.raioBorda}px;
        box-shadow: 0 0 0 9999px rgba(8, 10, 14, ${marca.callout.escurecerFundo});
        pointer-events: none;
      }

      /* --- Cursor --- */
      .cursor-seta {
        position: absolute;
        top: 0; left: 0;
        width: ${marca.cursor.tamanho}px;
        height: ${marca.cursor.tamanho}px;
        filter: drop-shadow(0 3px 6px ${marca.cursor.corSombra});
        will-change: transform;
      }
      .cursor-onda {
        position: absolute;
        top: 50%; left: 25%;
        width: 34px; height: 34px;
        margin: -17px 0 0 -17px;
        border-radius: 50%;
        background: ${marca.cursor.corClique};
        opacity: 0;
      }

      /* --- Legendas --- */
      .legenda {
        position: absolute;
        left: 50%;
        bottom: ${marca.legendas.margemInferior}px;
        transform: translateX(-50%);
        max-width: ${marca.legendas.larguraMaxima}px;
        padding: 18px 32px;
        background: ${c.legendaFundo};
        backdrop-filter: blur(6px);
        border-radius: 14px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .legenda p {
        font-size: ${marca.legendas.tamanho}px;
        line-height: 1.35;
        font-weight: 500;
        color: ${c.texto};
        text-align: center;
        text-wrap: balance;
      }

      /* --- Cards ---
         O fundo mora no .card-inner, nao no clip: e o inner que recebe o fade,
         entao fundo e texto entram e saem juntos. Fundo no clip apareceria de
         estalo antes do texto. */
      .card { position: absolute; inset: 0; }
      .card-inner {
        position: absolute;
        inset: 0;
        display: grid;
        place-items: center;
        background: radial-gradient(circle at 50% 40%, ${c.fundoSuave} 0%, ${c.fundo} 70%);
      }
      .card-conteudo { text-align: center; max-width: 1400px; padding: 0 80px; }
      .card-etiqueta {
        font-size: 26px;
        letter-spacing: 0.22em;
        text-transform: uppercase;
        color: ${c.destaque};
        font-weight: 600;
        margin-bottom: 28px;
      }
      .card-titulo {
        font-size: 92px;
        line-height: 1.08;
        font-weight: ${marca.tipografia.tituloPeso};
        color: ${c.texto};
        text-wrap: balance;
      }
      .card-regua {
        width: 220px;
        height: 4px;
        margin: 40px auto;
        background: ${c.destaque};
        border-radius: 2px;
        transform-origin: center;
      }
      .card-rodape { font-size: 28px; color: ${c.textoSuave}; }
    </style>
  </head>
  <body>
    <div
      id="root"
      data-composition-id="main"
      data-start="0"
      data-width="${video.largura}"
      data-height="${video.altura}"
      data-fps="${video.fps}"
      data-duration="${timing.total}"
    >
${partes.join("\n")}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      // Pausada de proposito: o renderer e quem avanca o tempo, quadro a quadro.
      // E isso que faz o mesmo jornada.yaml gerar sempre o mesmo MP4.
      const tl = gsap.timeline({ paused: true });
${tl.join("\n")}
      window.__timelines["main"] = tl;
    </script>
  </body>
</html>
`;
}

function montarRoteiro({ spec, timing, beats, prop }) {
  const mmss = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  const linhas = [
    `# ${spec.titulo}`,
    ``,
    `**Cliente:** ${spec.cliente}  `,
    `**Duracao:** ${mmss(timing.total)} (${timing.total.toFixed(1)}s)  `,
    `**Voz:** ${spec.voz.voz} @ ${spec.voz.velocidade}x`,
    ``,
    `> Gerado por \`npm run build\`. Nao edite aqui -- edite \`jornada.yaml\` e rode de novo.`,
    ``,
    `## Proporcao das secoes`,
    ``,
    `| Secao | Tempo | % da fala |`,
    `| --- | --- | --- |`,
    ...Object.entries(prop.porSecao).map(
      ([s, d]) => `| ${s} | ${d.toFixed(1)}s | ${prop.pct[s]}% |`,
    ),
    ``,
    `## Roteiro`,
    ``,
  ];

  let secaoAtual = null;
  for (const b of beats) {
    if (b.secao !== secaoAtual) {
      secaoAtual = b.secao;
      linhas.push(`### ${secaoAtual.toUpperCase()}`, ``);
    }
    const marcas = [];
    if (b.cursor) marcas.push(`🖱 ${b.cursor.acao} → ${b.cursor.rotulo}`);
    if (b.callout) marcas.push(`🔍 zoom → ${b.callout.rotulo}`);
    linhas.push(
      `**[${mmss(b.inicio)}] ${b.id}** · cena \`${b.cena}\`${marcas.length ? ` · ${marcas.join(" · ")}` : ""}`,
      ``,
      b.texto,
      ``,
    );
  }
  return linhas.join("\n");
}

main().catch(encerrarComErro);
