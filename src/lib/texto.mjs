/**
 * Normalizacao do texto falado e estimativa de duracao.
 *
 * Compartilhado entre narrate.mjs (que sintetiza) e o storyboard (que estima o
 * tempo antes de existir audio). Ter um lugar so garante que a contagem de
 * palavras do storyboard bate com o que o Kokoro realmente fala.
 */

// Medido com pm_alex @ 1x sobre os 11 beats da jornada de exemplo (194 palavras,
// 65.1s): ~2.98 palavras por segundo, variando entre 2.7 e 3.5 por beat. Serve para
// a ESTIMATIVA do storyboard; a duracao real vem do ffprobe depois da narracao.
//
// Recalibrado: o valor antigo (2.18) foi medido antes da correcao de encoding no
// kokoro_batch.py, quando o texto acentuado chegava como mojibake e o modelo
// gastava tempo pronunciando lixo. Se voce trocar a voz ou mexer no `velocidade`,
// vale remedir -- e so comparar contagem de palavras com a duracao dos WAVs.
const PALAVRAS_POR_SEGUNDO = 2.98;

/**
 * O Kokoro le literalmente o que recebe: marcacao de roteiro vira ruido na boca
 * do narrador. Tira marcacao e normaliza o que o modelo pronuncia mal.
 */
export function prepararTexto(bruto) {
  let t = String(bruto)
    .replace(/\[[^\]]*\]/g, " ") // [PAUSA 2s], [ABERTURA] etc.
    .replace(/[*_`#]/g, " ") // markdown
    .replace(/\s+/g, " ")
    .trim();

  // Siglas que o modelo soletraria errado em portugues.
  const pronuncia = [
    [/\bUX\b/g, "U Xis"],
    [/\bUI\b/g, "U Ai"],
    [/\bCPF\b/g, "C P F"],
    [/\bCEP\b/g, "C E P"],
    [/\bCNPJ\b/g, "C N P J"],
    [/\bAPI\b/g, "A P I"],
    [/\bSMS\b/g, "S M S"],
    [/\be-mail\b/gi, "email"],
  ];
  for (const [de, para] of pronuncia) t = t.replace(de, para);
  return t;
}

/** Estimativa da duracao falada (sem a pausa entre beats), em segundos. */
export function estimarSegundos(texto, voz) {
  const limpo = prepararTexto(texto);
  const palavras = limpo.split(/\s+/).filter(Boolean).length;
  const velocidade = voz?.velocidade ?? 1.0;
  return palavras / (PALAVRAS_POR_SEGUNDO * velocidade);
}
