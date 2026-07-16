"""Sintetiza amostras para comparar vozes (inclusive mistura de vozes).

Diferente do kokoro_batch.py (que usa uma voz so, a da jornada), aqui cada item
traz sua propria voz e idioma. Serve ao `npm run vozes`.

Uma voz pode ser:
  - "pm_alex"                          -> voz do modelo
  - {"blend": {"pm_alex": 0.5, "em_alex": 0.5}} -> media ponderada dos vetores
"""

import json
import os
import sys

import numpy as np
import soundfile as sf
import kokoro_onnx

CACHE = os.path.join(os.path.expanduser("~"), ".cache", "hyperframes", "tts")
MODELO = os.path.join(CACHE, "models", "kokoro-v1.0.onnx")
VOZES = os.path.join(CACHE, "voices", "voices-v1.0.bin")


def resolver_voz(k, voz):
    """String -> nome da voz. Dict -> mistura ponderada dos vetores de estilo."""
    if isinstance(voz, str):
        return voz
    pesos = voz["blend"]
    total = sum(pesos.values())
    estilo = None
    for nome, peso in pesos.items():
        parcela = k.get_voice_style(nome) * (peso / total)
        estilo = parcela if estilo is None else estilo + parcela
    return estilo.astype(np.float32)


def main() -> int:
    # UTF-8 explicito: sys.stdin usaria cp1252 no Windows e quebraria os acentos.
    job = json.loads(sys.stdin.buffer.read().decode("utf-8"))

    k = kokoro_onnx.Kokoro(MODELO, VOZES)
    texto = job["texto"]

    resultados = []
    for item in job["itens"]:
        try:
            voz = resolver_voz(k, item["voz"])
            samples, sr = k.create(
                texto, voice=voz, speed=float(item.get("velocidade", 1.0)), lang="pt-br"
            )
        except Exception as e:  # noqa: BLE001
            print(f"  FALHOU {item['id']}: {e}", file=sys.stderr)
            continue
        os.makedirs(os.path.dirname(item["saida"]), exist_ok=True)
        sf.write(item["saida"], samples, sr)
        dur = len(samples) / sr
        resultados.append({"id": item["id"], "duracao": dur})
        print(f"  {item['id']:<28} {dur:5.1f}s", file=sys.stderr)

    json.dump({"resultados": resultados}, sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
