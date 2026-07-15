# ui-ux-presentation-generator

Gera vídeos narrados de jornadas de usuário (Figma → MP4) para enviar a clientes.
Uma jornada vira um vídeo com narração em pt-BR, cursor simulado, zoom nos
detalhes, legendas e cards de abertura/encerramento.

**Para produzir um vídeo, use a skill `nova-jornada`.** Ela conduz o processo todo.
Para escrever ou revisar roteiro, use `narracao-jornada`.

## A ideia central

`jornada.yaml` é a única fonte da verdade. Ele descreve **beats**: uma frase falada
+ o que a tela faz enquanto ela é dita.

O pipeline gera um WAV por beat e mede a **duração real** de cada um com `ffprobe`.
Toda a timeline (cena, cursor, zoom, legenda) é construída a partir dessas durações
medidas — nunca de estimativa. É por isso que a sincronia não desanda: ela não
depende de ninguém acertar um cronômetro.

Consequência prática: **você nunca escreve tempo em lugar nenhum.** Muda o texto,
roda de novo, tudo se reencaixa.

## Fluxo

```bash
npm run doctor                # confere o ambiente
npm run figma   -- <slug>     # PNGs dos frames + bboxes dos elementos (REST API)
npm run narrate -- <slug>     # 1 WAV por beat (Kokoro local, pt-BR)
npm run build   -- <slug>     # index.html + roteiro.md + timing.json
npm run render  -- <slug>     # MP4  (--draft para revisar rápido)
npm run pipeline -- <slug>    # tudo acima, em sequência
```

Cada etapa é idempotente e cacheada: mexer numa frase só regenera aquele áudio.

## Arquivos

| Onde | O quê |
| --- | --- |
| `jornadas/<slug>/jornada.yaml` | **fonte da verdade** — cenas + beats |
| `jornadas/<slug>/roteiro.md` | gerado: roteiro cronometrado, para aprovação |
| `jornadas/<slug>/.media/` | gerado: frames, áudios, `nodes.json`, `timing.json` |
| `jornadas/<slug>/out/<slug>.mp4` | o vídeo |
| `config/marca.json` | cores, tipografia, cursor, callout — a identidade |
| `src/build.mjs` | compila a composição HyperFrames (o coração) |

Tudo em `.media/`, `out/` e `index.html` é **derivado** e está no `.gitignore`.
Não edite — edite o `jornada.yaml` e rode de novo.

## Restrições do HyperFrames que não se negocia

O renderer abre a composição no Chrome headless e **avança o tempo quadro a quadro**
numa timeline GSAP pausada. Violar qualquer uma destas renderiza errado, em geral
sem erro nenhum:

1. Clips e `<audio>` são filhos **diretos** da raiz da composição.
2. Elementos visíveis com tempo levam `class="clip"`.
3. Clips na mesma track **não se sobrepõem** (por isso as cenas alternam entre as
   tracks 0 e 1 — o crossfade exige que duas cenas coexistam).
4. Animação de **saída** vai num wrapper interno, nunca no próprio clip, e termina
   com um `tl.set(..., { opacity: 0 })`. Sem esse "hard kill", um seek que aterrissa
   depois do fade encontra o elemento visível e ele reaparece.
5. Nada de `play()`/`pause()`/`seek()` — o HyperFrames é dono da reprodução.

`npx hyperframes lint jornadas/<slug>` pega quase tudo isso. Rode antes de renderizar.

## Ambiente

- **Kokoro** (TTS local) vive no venv `.venv`, apontado por `HYPERFRAMES_PYTHON` no
  `.env`. Vozes pt-BR: `pm_alex`, `pm_santa`, `pf_dora`. **São as únicas três** —
  o Kokoro não tem mais nenhuma.
- **FFmpeg** é obrigatório (render e medição de duração).
- **FIGMA_TOKEN** no `.env`, com escopo `File content: read`.
- O modelo (~310 MB) fica em `~/.cache/hyperframes/tts/`, compartilhado com o CLI.

## Convenções

- Código e comentários em **português**, sem acento em identificadores.
- Erros de uso (`ErroDeUso`) saem com mensagem acionável e sem stack trace. Se o
  usuário pode consertar, diga como consertar.
