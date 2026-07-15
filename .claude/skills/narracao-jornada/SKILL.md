---
name: narracao-jornada
description: Escreve o roteiro narrado (os beats do jornada.yaml) de um vídeo de apresentação de jornada de usuário em pt-BR. Use sempre que for criar ou revisar o campo `beats:` de uma jornada, ou quando pedirem roteiro/narração/script para um vídeo de UX. Baseada na análise de apresentações reais do Angelo.
---

# Narração de jornada de usuário (pt-BR)

Você está escrevendo o que uma pessoa vai **falar** enquanto o cliente vê a tela.
Não é texto para ler — é fala. Se a frase não sai natural em voz alta, está errada.

O produto final não é um texto: é o campo `beats:` de um `jornada.yaml`. Cada beat
é **uma frase falada + o que a tela faz enquanto ela é dita**. O pipeline mede o
áudio real de cada beat e sincroniza cena, cursor, zoom e legenda em cima disso —
você nunca cronometra nada à mão.

## O que faz essas apresentações funcionarem

Extraído de três apresentações reais (calendário/pomodoro, cronômetro, ferramenta
de feedback). O tom é **próximo, direto e orientado a benefício** — não é locução
publicitária nem manual técnico.

Todo beat de demonstração segue este ciclo:

| Passo | Padrão de fala | Exemplo |
| --- | --- | --- |
| Apresentar | "Aqui você tem…" / "Vocês podem ver que…" | "Aqui você tem o formulário de cadastro." |
| Explicar | "Clicando em…, você consegue…" | "Clicando aqui, o checkout abre em uma nova aba." |
| Demonstrar | "Você pode ver que…" | "Você pode ver que o período foi adicionado." |
| Benefício | "Para deixar…" / "Isso facilita porque…" | "Isso deixa bem mais fácil para o usuário saber o que corrigir." |
| Transição | "Então…" / "E a outra parte é…" | "E a outra parte é o monitoramento." |

Sempre **você**, nunca "o usuário deve". Sempre o *porquê* junto do *o quê* —
a funcionalidade sozinha não convence; o benefício convence.

## Estrutura e proporção

Quatro seções, e a proporção importa. O `npm run build` mede e reclama se a
demonstração encolher:

- `abertura` (5-10%) — saudação + o que você vai mostrar.
- `contextualizacao` (5-10%) — por que este vídeo existe, quem pediu, em que estágio está.
- `demonstracao` (70-80%) — o vídeo é isto. O resto é moldura.
- `encerramento` (5-10%) — resumo curto, convite para testar, disponibilidade.

Seja transparente sobre o que ainda não está pronto ("ainda estamos em fase de
testes"). Nas apresentações reais isso aumenta a confiança, não diminui.

## Regras de beat

Um beat = **uma ideia**. Se a frase tem dois "e" e três vírgulas, são dois beats.

- **Uma a três frases por beat.** Beat longo demais trava a tela parada por 15s.
- **Cada beat aponta uma `cena`.** Se a fala muda de tela, muda de beat.
- **`cursor` quando a fala descreve uma ação** ("clicando aqui…") — aí o cursor
  precisa estar clicando ali, naquele instante.
- **`callout` quando a fala aponta um detalhe** ("a mensagem de erro aparece na
  hora") — aí a câmera aproxima naquele elemento.
- **Nunca cursor e callout brigando** no mesmo beat, a menos que o clique seja
  dentro da região ampliada.
- Escreva **com acentuação correta**. O TTS pronuncia melhor e a legenda sai certa.
- Números por extenso quando forem falados ("vinte e cinco minutos", não "25 min").

Beats consecutivos com callout na mesma cena fazem a câmera **deslizar** de um
elemento para o outro — é ótimo para detalhar uma tela em duas ou três frases.

## Mirando elementos

Prefira **nome** a coordenada: `para: nome:Botao Continuar` sobrevive a você mover
o botão no Figma; `para: [980, 720]` não. Os nomes vêm de `.media/nodes.json`,
gerado pelo `npm run figma`. Se o nome do layer no Figma for `Frame 1247`, renomeie
no Figma — o roteiro fica legível e o design também.

## Exemplo

```yaml
- id: b04
  secao: demonstracao
  texto: O sistema valida cada campo em tempo real. Se você digita um e-mail inválido, a mensagem de erro aparece na hora.
  cena: cadastro-erro
  callout:
    alvo: nome:Campo E-mail

- id: b05
  secao: demonstracao
  texto: Isso deixa bem mais fácil para o usuário saber exatamente o que precisa corrigir, sem descobrir o problema só no final.
  cena: cadastro-erro
  callout:
    alvo: nome:Mensagem de erro
    zoom: 1.6

- id: b06
  secao: demonstracao
  texto: Quando todos os campos estão corretos e você marca o aceite dos termos, o botão de continuar fica ativo.
  cena: cadastro-ok
  cursor:
    para: nome:Aceite dos termos
    acao: mover
```

Repare: b04 apresenta, b05 entrega o benefício (e a câmera desliza do campo para a
mensagem), b06 transiciona para a próxima ação. É o ciclo da tabela acima, em YAML.

## Antes de entregar

Leia **em voz alta**. Sério. Você vai ouvir na hora o beat que emperra.

- [ ] Todo beat soa como alguém falando, não escrevendo.
- [ ] Demonstração entre 70-80% (o build confere).
- [ ] Toda funcionalidade tem um benefício dito explicitamente.
- [ ] Nenhum jargão técnico não explicado (webhook, polling, endpoint).
- [ ] Acentuação correta em tudo.
- [ ] O que não está pronto foi dito com honestidade.
