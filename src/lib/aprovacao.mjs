import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

/**
 * Portao de aprovacao preso ao CONTEUDO.
 *
 * A aprovacao guarda um hash do jornada.yaml no momento em que voce aprovou. O
 * render so roda se esse hash bater com o jornada.yaml atual. Editou uma frase
 * depois de aprovar? O hash muda, o portao re-arma sozinho e exige nova revisao.
 * E o que faz "aprovado" significar "revisei ISTO", nao um carimbo perpetuo.
 */

export function hashDoConteudo(specPath) {
  return createHash("sha256").update(readFileSync(specPath)).digest("hex").slice(0, 16);
}

export function registrarAprovacao(paths) {
  const hash = hashDoConteudo(paths.specPath);
  writeFileSync(
    paths.aprovacao,
    JSON.stringify({ hash, aprovadoEm: new Date().toISOString() }, null, 2),
  );
  return hash;
}

/**
 * Estado do portao para uma jornada. `ok` significa liberado para render.
 * `motivo` explica, em linguagem acionavel, por que esta travado.
 */
export function estadoAprovacao(paths) {
  if (!existsSync(paths.aprovacao)) {
    return { ok: false, motivo: "ainda-nao-aprovado" };
  }
  let registro;
  try {
    registro = JSON.parse(readFileSync(paths.aprovacao, "utf-8"));
  } catch {
    return { ok: false, motivo: "aprovacao-corrompida" };
  }
  const atual = hashDoConteudo(paths.specPath);
  if (registro.hash !== atual) {
    return { ok: false, motivo: "conteudo-mudou", aprovadoEm: registro.aprovadoEm };
  }
  return { ok: true, aprovadoEm: registro.aprovadoEm };
}
