"""Sintetiza varios beats num unico processo.

O modelo Kokoro tem ~310 MB: carregar uma vez e gerar N falas e ordens de
grandeza mais rapido que abrir um processo por frase. Recebe um JSON de job
pelo stdin e escreve os WAVs; devolve um JSON com a duracao de cada um.
"""

import json
import os
import sys

import soundfile as sf
import kokoro_onnx

CACHE = os.path.join(os.path.expanduser("~"), ".cache", "hyperframes", "tts")
MODELO = os.path.join(CACHE, "models", "kokoro-v1.0.onnx")
VOZES = os.path.join(CACHE, "voices", "voices-v1.0.bin")


def main() -> int:
    # Le os BYTES e decodifica UTF-8 na mao. `json.load(sys.stdin)` usaria o
    # encoding do locale -- cp1252 no Windows -- e transformaria "você" em
    # "vocÃª", que o Kokoro pronuncia literalmente. O texto chega sempre em
    # UTF-8 do Node, entao decodificamos UTF-8, independente da maquina.
    job = json.loads(sys.stdin.buffer.read().decode("utf-8"))
    itens = job["itens"]
    if not itens:
        json.dump({"resultados": []}, sys.stdout)
        return 0

    for caminho, rotulo in ((MODELO, "modelo"), (VOZES, "vozes")):
        if not os.path.exists(caminho):
            print(f"ERRO: {rotulo} do Kokoro nao encontrado em {caminho}", file=sys.stderr)
            return 1

    k = kokoro_onnx.Kokoro(MODELO, VOZES)

    resultados = []
    for item in itens:
        samples, sr = k.create(
            item["texto"],
            voice=job["voz"],
            speed=float(job["velocidade"]),
            lang=job["idioma"],
        )
        os.makedirs(os.path.dirname(item["saida"]), exist_ok=True)
        sf.write(item["saida"], samples, sr)
        resultados.append({"id": item["id"], "duracao": len(samples) / sr})
        print(f"  {item['id']}  {len(samples) / sr:5.1f}s", file=sys.stderr)

    json.dump({"resultados": resultados}, sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
