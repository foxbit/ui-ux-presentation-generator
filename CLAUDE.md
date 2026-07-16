# ui-ux-presentation-generator

Gera vídeos narrados de jornadas de usuário (Figma **ou** app rodando localmente
→ MP4) para enviar a clientes. Uma jornada vira um vídeo com narração em pt-BR,
cursor simulado, zoom nos detalhes, legendas e cards de abertura/encerramento.

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
npm run figma      -- <slug>  # PNGs dos frames + bboxes dos elementos (REST API do Figma)
npm run html       -- <slug>  # idem, mas navegando um app local (cenas com `url`)
npm run storyboard -- <slug>  # storyboard.html: telas + locução + animação (portão)
npm run aprovar    -- <slug>  # libera o render para o conteúdo atual
npm run narrate    -- <slug>  # 1 WAV por beat (Kokoro local, pt-BR)
npm run build      -- <slug>  # index.html + roteiro.md + timing.json
npm run render     -- <slug>  # MP4  (--draft para revisar rápido)
npm run pipeline   -- <slug>  # avança até o portão; após aprovar, segue até o MP4
```

Cada etapa é idempotente e cacheada: mexer numa frase só regenera aquele áudio.

## O portão de aprovação

Entre o storyboard e o render existe um portão: **`render` só roda com aprovação
válida.** `npm run aprovar` grava um hash do `jornada.yaml`; o render confere se
esse hash bate com o arquivo atual. Editou o yaml depois de aprovar? O portão
re-arma sozinho — "aprovado" significa "revisei *este* conteúdo", não um carimbo
perpétuo. Sem bypass, por decisão de projeto (`src/lib/aprovacao.mjs`).

O `storyboard.html` é a **estimativa** de pré-produção (tempos por contagem de
palavras, telas com o zoom/cursor desenhados). O `roteiro.md` é o script com tempo
**real**, gerado no `build` depois da narração. Dois momentos, duas precisões.

## Arquivos

| Onde | O quê |
| --- | --- |
| `jornadas/<slug>/jornada.yaml` | **fonte da verdade** — cenas + beats |
| `jornadas/<slug>/storyboard.html` | gerado: board de pré-produção, o portão de aprovação |
| `jornadas/<slug>/.aprovacao.json` | gerado: hash do conteúdo aprovado (destrava o render) |
| `jornadas/<slug>/roteiro.md` | gerado: roteiro cronometrado (tempo real, pós-narração) |
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

## Dois provedores de voz

`voz.provider` no `jornada.yaml` escolhe quem narra. Ambos passam pelo mesmo cache
por hash em `narrate.mjs` — trocar de provider invalida o áudio, de propósito.

| | `kokoro` (padrão) | `gemini` |
| --- | --- | --- |
| Custo | Grátis | ~centavos de dólar por vídeo |
| Onde roda | Local (venv) | API do Google (`GEMINI_API_KEY` no `.env`) |
| Vozes pt-BR nativas | 3 (`pm_alex`, `pm_santa`, `pf_dora`) | 30, idioma é auto-detectado do texto |
| Qualidade | Voz mais fraca do Kokoro | Voz de modelo comercial |

`voz.model` (só para `gemini`) escolhe o modelo — padrão `gemini-2.5-flash-preview-tts`
(trocado de `gemini-3.1-flash-tts-preview`: o 3.1 limitou a taxa após poucas
chamadas seguidas, mesmo com pausas entre tentativas — quota de preview mais
apertada. 2.5 Flash também é mais barato, US$10/milhão vs US$20/milhão).

O parsing de `src/tts/gemini.mjs` foi validado contra uma chamada real (não só
contra a documentação): o áudio vem em `steps[].content[].data`
(`mime_type: "audio/l16"`, PCM 24kHz/16-bit/mono sem header), não em
`interaction.output_audio.data` como a doc/SDK sugerem. Se um formato de resposta
novo aparecer, o erro mostra as chaves do JSON recebido — ajuste `extrairAudio()`
com base nisso.

A estimativa de palavras/segundo do storyboard (`lib/texto.mjs`) foi calibrada
para o Kokoro. Numa jornada com `voz.provider: gemini`, a estimativa de tempo do
storyboard pode destoar do tempo real até alguém recalibrar para aquela voz.

## Duas rotas para o Figma (não confundir)

| Para quê | Como | Limite |
| --- | --- | --- |
| Explorar o arquivo, ver telas, achar node-ids | **`figma-console-mcp`** (ponte WebSocket p/ o Figma Desktop) | sem cota |
| Importar PNGs + bboxes → `nodes.json` | **`npm run figma`** (REST API + `FIGMA_TOKEN`) | ~10+/min |

**Nunca use o MCP oficial `claude.ai Figma` para navegar**: no plano Starter são
**6 chamadas por mês no total** — some no meio do trabalho. Só o `whoami` é isento.

A importação é REST de propósito: roda headless, sem depender do Figma Desktop
aberto, e é a fonte da verdade das coordenadas que miram cursor e callout. O CLI
`hyperframes figma asset` não serve aqui porque **não expõe as bounding boxes** —
por isso o importador é próprio.

## Duas fontes de tela: Figma ou app local

`build.mjs`/`storyboard.mjs` não sabem de onde veio `.media/nodes.json` — só
esperam o mesmo contrato (PNG por cena + bboxes). Isso é o que permite ter dois
importadores, `figma-import.mjs` e `html-import.mjs`, produzindo a mesma saída
por caminhos diferentes. Cada cena escolhe uma fonte:

| Cena aponta pra | Campo no yaml | Importador |
| --- | --- | --- |
| Frame do Figma | `node: "1:2"` | `npm run figma` (REST API) |
| Página de um app rodando localmente | `url: /cadastro` | `npm run html` (navega e tira screenshot) |

Uma jornada pode até misturar as duas — cada importador só mexe nas cenas do seu
campo e funde no mesmo `nodes.json`.

Para a fonte HTML:

- `html.baseUrl` no topo do yaml (ex.: `http://localhost:5173`) é obrigatório se
  alguma cena tiver `url`. O app precisa estar rodando antes de importar.
- Marque no HTML do app os elementos que o roteiro vai mirar com
  `data-jornada="Nome Legível"` — é o equivalente a nomear layers no Figma. Sem
  isso, o elemento não aparece em `nodes.porNome` e `nome:X` não resolve.
- `cena.acoes` (lista opcional de `{ tipo, alvo, valor? }`, tipos `clicar` |
  `digitar` | `esperar` | `rolar`, `alvo` é um seletor CSS) roda antes do
  screenshot — é como alcançar um estado que só existe depois de uma interação
  (erro de validação, modal, hover), quando o app não tem uma URL própria pra
  esse estado.
- O importador reusa o Chrome headless que o `render` já gerencia
  (`npx hyperframes browser path`, via `puppeteer-core`) — não baixa outro
  browser.

## Convenções

- Código e comentários em **português**, sem acento em identificadores.
- Erros de uso (`ErroDeUso`) saem com mensagem acionável e sem stack trace. Se o
  usuário pode consertar, diga como consertar.
