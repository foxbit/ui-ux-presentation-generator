/**
 * Cliente da Interactions API do Gemini para TTS (GA, endpoint recomendado pelo
 * Google -- a antiga `generateContent` para audio virou a via legada).
 *
 * Formato de resposta CONFIRMADO com uma chamada real (2026-07-16), porque a doc
 * publica so descreve a requisicao e um caminho de conveniencia de SDK que nao
 * bateu com o JSON cru:
 *
 *   { status: "completed", usage: {...},
 *     steps: [ { content: [ { mime_type: "audio/l16", data: "<base64>" } ] } ] }
 *
 * audio/l16 = PCM linear 16-bit, sem header. O mime_type NAO trouxe parametro de
 * rate (so "audio/l16", sem ";rate=NNNN"). O sample rate foi confirmado por
 * espectrograma comparando 16000/22050/24000 Hz contra a cadencia natural de fala
 * (~156 palavras/min em 24kHz vs. ~104 wpm artificialmente lento em 16kHz) e a
 * faixa classica de sibilantes em portugues (8-10kHz): 24000 Hz bate nos dois
 * testes, os outros nao.
 */
import { spawnSync } from "node:child_process";
import { ErroDeUso } from "../lib/util.mjs";

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/interactions";
const SAMPLE_RATE_PADRAO = 24000;

export async function sintetizarGemini({ apiKey, model, voice, texto, saida }) {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "x-goog-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: texto,
      response_format: { type: "audio" },
      generation_config: { speech_config: [{ voice }] },
    }),
  });

  if (!resp.ok) {
    const corpo = await resp.text();
    if (resp.status === 401 || resp.status === 403) {
      throw new ErroDeUso(
        `Gemini recusou a chave (${resp.status}). Gere uma em aistudio.google.com/apikey\n` +
          `  e confira GEMINI_API_KEY no .env.\n  Resposta: ${corpo.slice(0, 300)}`,
      );
    }
    if (resp.status === 429) {
      throw new ErroDeUso(`Gemini limitou a taxa de chamadas (429). Espere um pouco e rode de novo.`);
    }
    throw new ErroDeUso(`Gemini respondeu ${resp.status}: ${corpo.slice(0, 500)}`);
  }

  let dados = await resp.json();

  // O job pode nao vir "completed" na mesma resposta (textos mais longos podem
  // processar de forma assincrona). So testei com frases curtas, que sempre
  // voltaram completas na hora -- isto e defensivo, nao confirmado contra um
  // caso real de "in_progress".
  let tentativas = 0;
  while (dados.status && dados.status !== "completed" && tentativas < 30) {
    if (dados.status === "failed" || dados.status === "error") {
      throw new ErroDeUso(`Gemini marcou a sintese como "${dados.status}": ${JSON.stringify(dados).slice(0, 300)}`);
    }
    await new Promise((r) => setTimeout(r, 1000));
    const poll = await fetch(`${ENDPOINT}/${dados.id}`, { headers: { "x-goog-api-key": apiKey } });
    if (!poll.ok) throw new ErroDeUso(`Gemini falhou ao consultar o status da sintese (${poll.status}).`);
    dados = await poll.json();
    tentativas++;
  }

  const { base64, mimeType } = extrairAudio(dados);
  const sampleRate = Number(mimeType?.match(/rate=(\d+)/)?.[1]) || SAMPLE_RATE_PADRAO;

  const pcm = Buffer.from(base64, "base64");
  empacotarWav(pcm, saida, sampleRate);
  return { duracao: pcm.length / (sampleRate * 2 /* bytes por amostra, 16-bit */) };
}

/**
 * Le o audio de `steps[*].content[*]` (formato confirmado, ver comentario acima).
 * Percorre todos os steps/content -- nao so o primeiro -- porque um input mais
 * longo pode voltar em varios pedacos. Mantem os formatos antigos como
 * fallback (nunca confirmados, mas nao custam nada) para o caso de um modelo
 * futuro devolver outra forma; se nada bater, mostra o JSON cru para ajustar.
 */
function extrairAudio(dados) {
  for (const passo of dados?.steps ?? []) {
    for (const c of passo?.content ?? []) {
      if (c?.data && String(c.mime_type ?? c.mimeType ?? "").startsWith("audio/")) {
        return { base64: c.data, mimeType: c.mime_type ?? c.mimeType };
      }
    }
  }

  const fallback = [
    dados?.interaction?.output_audio,
    dados?.output_audio,
    dados?.candidates?.[0]?.content?.parts?.[0]?.inlineData,
  ];
  for (const c of fallback) {
    if (c?.data) return { base64: c.data, mimeType: c.mimeType ?? c.mime_type };
  }

  throw new ErroDeUso(
    "Gemini respondeu, mas o audio nao apareceu onde eu esperava.\n" +
      `  status: ${dados?.status}, chaves: ${JSON.stringify(Object.keys(dados ?? {})).slice(0, 300)}\n` +
      "  (formato de resposta mudou -- reporte este JSON para ajustar o parsing)",
  );
}

/** Envolve PCM cru (s16le) num WAV valido via ffmpeg -- sem escrever header a mao. */
function empacotarWav(pcmBuffer, saida, sampleRate) {
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-hide_banner", "-loglevel", "error",
     "-f", "s16le", "-ar", String(sampleRate), "-ac", "1",
     "-i", "pipe:0", saida],
    { input: pcmBuffer },
  );
  if (r.status !== 0) {
    throw new ErroDeUso(`ffmpeg falhou ao empacotar o audio do Gemini em WAV:\n${r.stderr}`);
  }
}
