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

## 2. Explorar o Figma (use o figma-console-mcp)

Para achar os frames e ver as telas, use o **`figma-console-mcp`** — é uma ponte
WebSocket local para o Figma Desktop, sem cota de uso.

**Não use o MCP oficial `claude.ai Figma` para navegar**: no plano Starter do Angelo
ele dá **6 chamadas por mês no total** (confirmado na doc da Figma), e acaba sem
aviso no meio de uma jornada. O `whoami` é isento; o resto não.

Confirme a ponte com `figma_get_status` (`probe: true`). Se não estiver conectada,
peça ao Angelo para abrir o arquivo no Figma **Desktop** com o plugin da ponte.

Fluxo de descoberta:

- **`figma_get_selection`** — o Angelo seleciona um frame no Figma e você recebe
  node-id, nome e dimensões. É o jeito mais rápido de montar a lista de `cenas`.
- **`figma_get_file_data`** (`verbosity: "summary"`, `depth: 1`) — navega a árvore
  do arquivo atrás dos frames e seus ids/nomes, sem estourar o contexto.
- **`figma_capture_screenshot`** (`nodeId`) — mostra como a tela realmente é.

Você precisa ver cada tela para escrever narração honesta. **Não invente elemento
que não está no design.** (Depois do `npm run figma`, os PNGs também ficam em
`.media/frames/` — dá para simplesmente abri-los.)

O node-id sai no formato `2888-115663` (com traço). Cole assim mesmo no
`jornada.yaml`: o importador normaliza para `2888:115663` sozinho.

Confira os **nomes dos layers** que você vai mirar com cursor/callout. Se estiverem
como `Frame 1247`, avise o Angelo — vale renomear no Figma antes, porque o roteiro
fica ilegível e frágil. Renomear pelo MCP é possível, mas é edição no arquivo dele:
só com aval explícito.

> **Duas rotas para o Figma, de propósito.** Descoberta e autoria: figma-console-mcp
> (ver telas, achar ids). Importação de PNGs + bboxes: `npm run figma`, pela REST API
> (token, limite por minuto), que é a fonte da verdade das coordenadas. Uma não
> substitui a outra.

## 3. Escrever o roteiro

Leia a skill `narracao-jornada` e siga. Escreva o `jornadas/<slug>/jornada.yaml`
completo: `cenas` (id → node do Figma) e `beats`.

Regra que evita retrabalho: **um beat = uma ideia falada + uma coisa acontecendo na
tela.** Se a fala tem duas ideias, são dois beats.

## 4. Importar as telas e gerar o storyboard

```bash
npm run figma      -- <slug>   # PNGs + bounding boxes dos elementos
npm run storyboard -- <slug>   # storyboard.html: telas + locução + animação
```

O `storyboard.html` é o artefato de aprovação. Cada painel mostra a **tela real
com o zoom/cursor daquele beat desenhados por cima**, o texto da locução e o tempo
**estimado** (por contagem de palavras — ainda não há áudio). Ele imprime a
proporção das seções; se a demonstração ficar abaixo de 70%, a abertura ou o
contexto estão longos demais — corte, não justifique.

## 5. Aprovação (o portão — não pule)

Mostre o storyboard ao Angelo (abra o `storyboard.html`, ou tire um screenshot dele
com o Chrome headless para revisar aqui na conversa). Ele **aprova ou pede ajustes**.

- Ajuste → edite o `jornada.yaml`, rode `npm run storyboard` de novo, mostre outra vez.
- Aprovado → **rode `npm run aprovar -- <slug>`**.

A aprovação se prende ao conteúdo do `jornada.yaml`. Se você editar qualquer coisa
depois de aprovar, o portão re-arma e o render volta a ser bloqueado — é de
propósito, para nunca renderizar algo que não foi revisado.

## 6. Narrar e renderizar

```bash
npm run narrate -- <slug>          # um WAV por beat (Kokoro, pt-BR, local)
npm run build   -- <slug>          # composição + roteiro.md + timing.json
npm run render  -- <slug> --draft  # revisão rápida
npm run render  -- <slug>          # entrega ao cliente
```

O `render` recusa rodar sem aprovação válida. Se você quiser ouvir a voz antes de
renderizar, os WAVs ficam em `.media/audio/` depois do `narrate`.

Saída em `jornadas/<slug>/out/<slug>.mp4`.

Ou tudo de uma vez: `npm run pipeline -- <slug>` avança até o portão na primeira
rodada e, depois de `aprovar`, segue até o MP4 na rodada seguinte.

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
