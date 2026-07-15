---
name: nova-jornada
description: Produz um vídeo narrado de jornada de usuário do começo ao fim — entrevista o Angelo, lê os frames do Figma, escreve o roteiro, mostra para aprovação e renderiza o MP4. Use quando pedirem para criar/gerar/produzir um vídeo de jornada, apresentação de fluxo, demo de tela ou "mandar a jornada X para o cliente".
---

# Produzir uma jornada

Você conduz a produção inteira, conversando. **Não despeje perguntas todas de uma
vez e não saia executando sozinho** — descubra o que precisa, mostre o roteiro,
espere o "pode ir" e só então renderize.

O trabalho de fato é escrever bons beats. O resto é encanamento.

## 1. Entender a jornada

Descubra (perguntando, ou lendo o que o Angelo já mandou):

- **Título e cliente** — vão no card de abertura.
- **URL do arquivo do Figma** e quais frames formam a jornada, na ordem.
- **O que o vídeo precisa provar.** Esta é a pergunta que importa. "Mostrar o
  cadastro" é fraco. "Mostrar que a validação inline evita o usuário descobrir o
  erro só no final" tem um argumento — e o roteiro se escreve quase sozinho.
- **Quem assiste** (cliente final, PM, QA) e **em que estágio está** (protótipo,
  homologação, no ar). Muda o tom e o que precisa ser dito com honestidade.

Se existir história de usuário escrita, leia antes de perguntar qualquer coisa.

## 2. Ler o Figma

Use o MCP do Figma (já autenticado) para ver os frames: `get_metadata` no arquivo
lista os nós com seus ids e nomes; `get_screenshot` mostra como a tela realmente é.

Você precisa saber o que existe em cada tela para escrever narração honesta. **Não
invente elemento que não está no design.**

Confira os **nomes dos layers** que você vai mirar com cursor/callout. Se estiverem
como `Frame 1247`, avise o Angelo — vale renomear no Figma antes, porque o roteiro
vai ficar ilegível e frágil.

## 3. Escrever o roteiro

Leia a skill `narracao-jornada` e siga. Escreva o `jornadas/<slug>/jornada.yaml`
completo: `cenas` (id → node do Figma) e `beats`.

Regra que evita retrabalho: **um beat = uma ideia falada + uma coisa acontecendo na
tela.** Se a fala tem duas ideias, são dois beats.

## 4. Importar e narrar

```bash
npm run figma   -- <slug>    # PNGs + bounding boxes dos elementos
npm run narrate -- <slug>    # um WAV por beat (Kokoro, pt-BR, local)
npm run build   -- <slug>    # composição + roteiro.md + timing.json
```

O `build` imprime a proporção das seções. Se a demonstração ficar abaixo de 70%,
a abertura ou o contexto estão longos demais — corte, não justifique.

## 5. Aprovação (não pule)

Mostre ao Angelo o **`roteiro.md`** gerado: é o texto cronometrado, com as marcações
de cursor e zoom em cada beat. Renderizar leva minutos; corrigir o roteiro leva
segundos. Ajuste até ele aprovar.

Se ele quiser ouvir antes, os WAVs estão em `.media/audio/` — dá para tocar um beat
isolado sem renderizar nada.

## 6. Renderizar

```bash
npm run render -- <slug> --draft   # revisão rápida
npm run render -- <slug>           # entrega ao cliente
```

Saída em `jornadas/<slug>/out/<slug>.mp4`.

Depois de renderizar, **olhe o vídeo antes de dizer que está pronto**: extraia alguns
quadros nos beats com cursor e callout (`ffmpeg -ss <t> -i video.mp4 -frames:v 1 f.png`)
e confirme que o cursor caiu no elemento certo e a legenda está sincronizada. O
`timing.json` tem o instante exato de cada beat.

## Quando algo quebra

- **Tela preta no vídeo** — quase sempre é clip fora da raiz da composição ou
  `<audio>` aninhado. `npx hyperframes lint jornadas/<slug>` aponta.
- **"nome:X não existe na cena"** — o layer tem outro nome no Figma. O erro lista
  os parecidos.
- **Narração atropelada** — texto sem acento. O Kokoro precisa dos acentos para
  pronunciar no ritmo certo.
- **Cursor no lugar errado** — o frame do Figma mudou de tamanho. Rode
  `npm run figma -- <slug>` de novo para reimportar as bboxes.
