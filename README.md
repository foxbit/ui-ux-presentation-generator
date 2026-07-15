# Gerador de vídeos de jornada

Transforma uma jornada do Figma num vídeo narrado em português, pronto para mandar
ao cliente: cursor simulado, zoom nos detalhes que a narração cita, legendas e
cards de abertura e encerramento.

<p align="center">
  <em>jornada.yaml → PNGs do Figma + narração pt-BR → MP4 1080p</em>
</p>

## Como se usa

Peça ao Claude: **"quero fazer o vídeo da jornada de cadastro"**. A skill
`nova-jornada` entrevista você, lê o Figma, escreve o roteiro, mostra para aprovação
e renderiza.

Na mão, se preferir:

```bash
npm run pipeline -- exemplo-cadastro
```

## A ideia

Um `jornada.yaml` descreve **beats** — uma frase falada e o que a tela faz enquanto
ela é dita:

```yaml
- id: b04
  secao: demonstracao
  texto: O sistema valida cada campo em tempo real. Se você digita um e-mail inválido, a mensagem de erro aparece na hora.
  cena: cadastro-erro
  callout:
    alvo: nome:Campo E-mail      # mira o layer do Figma pelo nome, não por coordenada

- id: b07
  secao: demonstracao
  texto: Clicando aqui, o checkout abre em uma nova aba.
  cena: cadastro-ok
  cursor:
    para: nome:Botao Continuar
    acao: clicar
```

Você **nunca escreve tempo**. O pipeline sintetiza cada beat, mede a duração real do
áudio com `ffprobe` e monta a timeline em cima dessa medida. Mudou uma frase? Roda
de novo — cursor, zoom e legenda se reencaixam sozinhos.

## Instalação

Precisa de Node 22+, FFmpeg e Python 3.10+.

```bash
winget install Gyan.FFmpeg Python.Python.3.12 eSpeak-NG.eSpeak-NG

npm install
python -m venv .venv
.venv\Scripts\python.exe -m pip install kokoro-onnx soundfile
npx hyperframes browser ensure

cp .env.example .env    # cole seu FIGMA_TOKEN (escopo: File content: read)
npm run doctor          # confere tudo
```

O modelo de voz (~310 MB) é baixado no primeiro uso para `~/.cache/hyperframes/tts/`.

## O storyboard e o portão de aprovação

Antes de processar o vídeo, o sistema gera um **storyboard** — um board de
pré-produção, uma tela por painel, com o texto da locução, a animação daquele
trecho (zoom/cursor desenhados na própria tela) e o tempo estimado. Você revisa,
ajusta o `jornada.yaml` se precisar, e aprova:

```bash
npm run storyboard -- <slug>   # gera jornadas/<slug>/storyboard.html
npm run aprovar    -- <slug>   # libera o render para esse conteúdo
```

O **`render` só roda com aprovação válida.** A aprovação se prende ao conteúdo: se
você editar o `jornada.yaml` depois de aprovar, o portão re-arma e exige nova
revisão — nunca se renderiza algo que não passou pelo storyboard.

## Ver funcionando sem Figma

O exemplo vem com telas sintéticas — dá para chegar ao vídeo sem token nenhum:

```bash
node scripts/gerar-telas-exemplo.mjs
npm run storyboard -- exemplo-cadastro
npm run aprovar    -- exemplo-cadastro
npm run narrate    -- exemplo-cadastro
npm run build      -- exemplo-cadastro
npm run render     -- exemplo-cadastro --draft
```

## Voz

TTS local (Kokoro-82M), sem custo e sem API. Três vozes pt-BR: `pm_alex`,
`pm_santa` (masculinas) e `pf_dora` (feminina). Escolha em `voz:` no `jornada.yaml`.

**Escreva com acentuação.** Sem acento o modelo atropela as palavras.

## Marca

`config/marca.json` controla cores, tipografia, cursor, callout e legendas de todos
os vídeos. Troque num lugar só.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run doctor` | confere ambiente e lista as jornadas |
| `npm run figma -- <slug>` | baixa PNGs e as bounding boxes dos elementos |
| `npm run storyboard -- <slug>` | gera o board de pré-produção para aprovação |
| `npm run aprovar -- <slug>` | libera o render para o conteúdo atual |
| `npm run narrate -- <slug>` | gera um WAV por beat (cacheado por hash) |
| `npm run build -- <slug>` | monta a composição, o roteiro e o timing |
| `npm run render -- <slug>` | renderiza o MP4 (`--draft`; exige aprovação) |
| `npm run pipeline -- <slug>` | avança até o portão; após aprovar, segue até o MP4 |
