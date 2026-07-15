# SKILL: Geração de Narração Profissional para Vídeos de Jornada de Usuário

**Nome da Skill**: `narration-generation-skill`
**Versão**: 1.0.0
**Autor**: Angelo Rosa
**Data**: 2026-07-14
**Objetivo**: Guiar Claude na geração de scripts de narração profissionais, didáticos e alinhados com o tom real de apresentações de layouts/funcionalidades.

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Princípios Fundamentais](#princípios-fundamentais)
3. [Estrutura de Narração](#estrutura-de-narração)
4. [Tom e Linguagem](#tom-e-linguagem)
5. [Padrões de Apresentação](#padrões-de-apresentação)
6. [Técnicas de Comunicação](#técnicas-de-comunicação)
7. [Tratamento de Diferentes Tipos de Funcionalidade](#tratamento-de-diferentes-tipos-de-funcionalidade)
8. [Checklist de Qualidade](#checklist-de-qualidade)
9. [Exemplos Práticos](#exemplos-práticos)
10. [Instruções Passo-a-Passo](#instruções-passo-a-passo)

---

## Visão Geral

Esta skill ensina Claude como gerar narrações para vídeos de apresentação de jornadas de usuário, funcionalidades e layouts. A narração deve ser profissional, didática, pessoal e orientada ao benefício do usuário.

### Baseado em Análise Real

Esta skill foi desenvolvida analisando 3 apresentações reais de layouts/funcionalidades, extraindo padrões de:
- Tom e linguagem
- Estrutura de apresentação
- Técnicas de comunicação
- Tratamento de informações técnicas
- Engajamento com audiência

### Resultado Esperado

Narração que:
- ✅ Cria conexão pessoal com o espectador
- ✅ Explica funcionalidades de forma clara e didática
- ✅ Conecta cada feature com benefício do usuário
- ✅ Segue estrutura lógica e fácil de acompanhar
- ✅ Mantém tom profissional mas acessível
- ✅ Justifica decisões de design
- ✅ É transparente sobre limitações

---

## Princípios Fundamentais

### 1. Público-Alvo

A narração é direcionada a:
- **Clientes/Stakeholders**: Que precisam entender valor da funcionalidade
- **Usuários Potenciais**: Que vão usar a plataforma
- **Equipes Internas**: Que precisam validar implementação

**Características do público**:
- Podem não ter conhecimento técnico profundo
- Buscam entender o valor e benefício
- Preferem clareza e objetividade
- Respondem bem a narrativas que conectam problema → solução

### 2. Objetivo da Narração

A narração deve:

1. **Contextualizar**: Explicar o cenário e o problema que será resolvido
2. **Guiar**: Conduzir o espectador através da jornada passo a passo
3. **Educar**: Esclarecer cada etapa e sua importância
4. **Motivar**: Demonstrar o valor e benefício de cada ação
5. **Tranquilizar**: Mostrar que o processo é simples e seguro

### 3. Princípio da Proximidade

A narração deve criar uma **conexão pessoal** com o espectador:

- Use "você" para dirigir-se diretamente
- Mencione o nome do cliente/stakeholder quando apropriado
- Crie um tom conversacional, não robótico
- Mostre que você entende as necessidades do usuário

---

## Estrutura de Narração

### Padrão Geral: 4 Seções

```
┌─────────────────────────────────────────┐
│  1. ABERTURA (5-10%)                    │
│     - Saudação pessoal                  │
│     - Apresentação do objetivo          │
│     - Contexto breve                    │
├─────────────────────────────────────────┤
│  2. CONTEXTUALIZAÇÃO (5-10%)            │
│     - Por que está apresentando         │
│     - Quem pediu/aprovou                │
│     - Avisos sobre status               │
├─────────────────────────────────────────┤
│  3. DEMONSTRAÇÃO (70-80%)               │
│     - Passo-a-passo das funcionalidades │
│     - Explicação de cada elemento       │
│     - Justificativa de design           │
│     - Benefício para o usuário          │
├─────────────────────────────────────────┤
│  4. ENCERRAMENTO (5-10%)                │
│     - Resumo rápido                     │
│     - Chamada à ação                    │
│     - Disponibilidade para suporte      │
└─────────────────────────────────────────┘
```

### 1. ABERTURA (5-10% do tempo)

**Objetivo**: Criar conexão imediata e deixar claro o objetivo

**Padrão**:
```
[Saudação] + [Objetivo] + [Contexto Breve]
```

**Exemplos**:

✅ **Exemplo 1 (Formal)**:
"Boa tarde! Vou mostrar para vocês como ficou o novo fluxo de cadastro 
e assinatura que desenvolvemos."

✅ **Exemplo 2 (Pessoal)**:
"Ola, pessoal! Vou mostrar uma nova ferramenta que vai ajudar bastante 
vocês durante os testes."

✅ **Exemplo 3 (Com Nome)**:
"Botarde, Natalha! Estou gravando esse vídeo para mostrar o pomodoro 
e o cronômetro que desenvolvemos."

**Elementos Essenciais**:
- Saudação calorosa ("Boa tarde", "Ola, pessoal")
- Verbo de ação ("vou mostrar", "vou explicar")
- Objeto claro ("novo fluxo", "nova ferramenta")

### 2. CONTEXTUALIZAÇÃO (5-10% do tempo)

**Objetivo**: Explicar por que está apresentando e definir expectativas

**Padrão**:
```
[Por que] + [Quem pediu] + [Status/Avisos]
```

**Exemplos**:

✅ **Exemplo 1**:
"Esse vídeo é para vocês entenderem cada etapa do processo e como 
o usuário vai interagir com a plataforma. Esse foi um pedido do Danilo 
e estamos ainda em fase de testes."

✅ **Exemplo 2**:
"Estou gravando esse vídeo porque a gente teve uma reunião com Danilo 
e ele pediu para que eu gravasse isso para vocês. Lembrando que isso 
ainda não está 100% pronto, mas vocês podem testar."

✅ **Exemplo 3**:
"Essa ferramenta foi desenvolvida para facilitar o reporte de erros 
e sugestões de melhoria. Vai estar disponível no ambiente de homologação 
durante os testes."

**Elementos Essenciais**:
- Explicação do "por quê"
- Menção de quem pediu/aprovou
- Avisos sobre status (beta, testes, etc)

### 3. DEMONSTRAÇÃO (70-80% do tempo)

**Objetivo**: Guiar através de cada funcionalidade de forma clara e didática

**Padrão Geral por Funcionalidade**:
```
[Apresentar] → [Explicar] → [Demonstrar] → [Benefício] → [Transição]
```

#### 3.1 Apresentar o Elemento

**Padrão**:
"Aqui você pode ver que..." / "Vocês podem ver que..."

**Exemplos**:
- "Aqui, quando o usuário entra na página de cadastro, ele vê um formulário"
- "Vocês podem ver que em todas as telas existe um botão laranja"
- "Aqui no calendário, você tem a visualização por semana"

**Função**: Guiar a atenção do espectador para o que é importante

#### 3.2 Explicar o Que Faz

**Padrão**:
"Clicando em..." / "Se você..." / "Quando você..."

**Exemplos**:
- "Clicando em cima desse botão, você consegue criar um novo período"
- "Se você digita um e-mail inválido, o sistema mostra uma mensagem de erro"
- "Quando todos os campos estão preenchidos, o botão fica ativo"

**Função**: Deixar claro como o usuário interage

#### 3.3 Demonstrar o Resultado

**Padrão**:
"Você pode ver que..." / "Então, vocês podem ver que..."

**Exemplos**:
- "Você pode ver que o período foi adicionado ao calendário"
- "Então, vocês podem ver que a validação acontece em tempo real"
- "Você pode ver que automaticamente o descanso é implementado"

**Função**: Confirmar visualmente o que foi explicado

#### 3.4 Destacar o Benefício

**Padrão**:
"Para deixar..." / "Para que..." / "Isso facilita porque..."

**Exemplos**:
- "Para deixar bem mais fácil para o aluno"
- "Para que o usuário não precise buscar em outra aba"
- "Isso facilita porque o usuário não precisa ficar anotando em um bloco de notas"

**Função**: Conectar funcionalidade com valor para o usuário

#### 3.5 Transição para Próximo

**Padrão**:
"Então, outra coisa que temos aqui é..." / "E a outra parte é..." / "Partindo agora para..."

**Exemplos**:
- "Então, outra coisa que temos aqui é a possibilidade de registrar tempo"
- "E a outra parte é o cronômetro simples"
- "Partindo agora para os ajustes do pomodoro"

**Função**: Conectar tópicos de forma natural

### 4. ENCERRAMENTO (5-10% do tempo)

**Objetivo**: Resumir, motivar e oferecer suporte

**Padrão**:
```
[Resumo] + [Chamada à Ação] + [Disponibilidade]
```

**Exemplos**:

✅ **Exemplo 1**:
"Esse é o novo fluxo de cadastro! Bem mais simples e intuitivo. 
Vocês podem testar no ambiente de staging. Qualquer dúvida, estamos aqui."

✅ **Exemplo 2**:
"Sinta-se livre para usar isso sempre que encontrarem algo. Estamos 
aqui para qualquer ajuste. Muito obrigado e um ótimo trabalho!"

✅ **Exemplo 3**:
"Pronto! Vocês já sabem como usar a ferramenta. Estamos aqui para 
qualquer problema ou sugestão de melhoria. Boa tarde aí para vocês!"

**Elementos Essenciais**:
- Resumo rápido (1-2 frases)
- Chamada à ação (testar, usar, explorar)
- Disponibilidade para suporte

---

## Tom e Linguagem

### Características Principais

| Aspecto | Recomendação | Exemplos |
|---------|-------------|----------|
| **Formalidade** | Casual + Profissional | "Boa tarde", "tudo bem com vocês" |
| **Proximidade** | Muito próxima, pessoal | Chama por nome, "vocês" |
| **Energia** | Entusiasmada, positiva | "Vou mostrar", "vai ajudar bastante" |
| **Clareza** | Direta, sem rodeios | "Clicando aqui, você consegue..." |
| **Empatia** | Alta, pensando no usuário | "Para deixar mais fácil" |

### Saudações Recomendadas

**Formal**:
- "Boa tarde!"
- "Ola, pessoal!"
- "Tudo bem com vocês?"

**Pessoal (com nome)**:
- "Botarde, Natalha!"
- "Ola, Danilo e equipe!"
- "Boa tarde, pessoal!"

**Casual**:
- "E aí, tudo certo?"
- "Tudo bem, pessoal?"

### Pronúncia e Entonação

**Use "você" para criar conexão**:
- ✅ "Você preenche o formulário"
- ✅ "Você clica aqui"
- ✅ "Você consegue registrar o tempo"

**Evite impessoalidade**:
- ❌ "O usuário preenche"
- ❌ "Preenche-se o formulário"
- ❌ "Deve-se clicar aqui"

### Verbos Recomendados

| Contexto | Verbos |
|----------|--------|
| Ação do usuário | preencher, clicar, confirmar, selecionar, inserir, digitar |
| Ação do sistema | validar, processar, confirmar, atualizar, sincronizar, monitorar |
| Resultado | obter, receber, ganhar acesso, visualizar, acessar, ver |
| Transição | passar para, seguir para, avançar, prosseguir, ir para |

### Expressões Que Funcionam

**Para Criar Proximidade**:
- "Tudo bem com vocês?"
- "Tranquilo?"
- "Tá?"
- "Pessoal"
- "Vocês"

**Para Mostrar Entusiasmo**:
- "Vou mostrar para vocês"
- "Vai ajudar bastante"
- "Bem fácil de usar"
- "Fica um fluxo bem legal"

**Para Mostrar Empatia**:
- "Para deixar bem mais fácil"
- "Ele não precisa ficar se preocupando"
- "Sinta-se livre para usar"
- "Estamos aqui para qualquer problema"

### Evitar

❌ **Muito Formal**:
- "Proceda à conclusão do formulário"
- "Mediante o preenchimento dos campos"
- "Conforme especificado pela interface"

❌ **Muito Técnico**:
- "O webhook da IUGU dispara um evento"
- "Atualiza o estado da aplicação via polling"
- "Sincronização de dados em tempo real"

❌ **Impessoal**:
- "O usuário deve preencher"
- "Preenche-se o formulário"
- "Deve-se clicar aqui"

---

## Padrões de Apresentação

### Padrão 1: Funcionalidade Visual (Calendário, Dashboard, etc)

**Estrutura**:
```
1. Mostrar a tela completa
2. Apontar elementos principais
3. Explicar cada elemento
4. Demonstrar interação
5. Mostrar resultado
6. Destacar benefício
```

**Exemplo**:

```
"Aqui você tem a visualização do calendário por semana. 
Vocês podem ver que temos alguns cards mostrando as disciplinas, 
os temas e a porcentagem de conclusão.

Clicando em cima de um desses cards, você consegue registrar o tempo 
de estudo. Você pode ver que o sistema já traz a disciplina e o tema 
pré-preenchidos, porque você acessou direto do calendário.

Isso deixa bem mais fácil para o aluno, porque ele não precisa ficar 
buscando essas informações em outra aba."
```

### Padrão 2: Fluxo com Estados (Pomodoro, Checkout, etc)

**Estrutura**:
```
1. Explicar o estado inicial
2. Mostrar como muda de estado
3. Explicar cada estado
4. Demonstrar transição
5. Mencionar alternativas
6. Destacar benefício
```

**Exemplo**:

```
"O pomodoro começa com 25 minutos configurados. Quando você clica em iniciar, 
o cronômetro começa a contar para baixo.

Quando chegar em 20 minutos, o sistema automaticamente dispara o intervalo 
de descanso. Você pode ver que a tela muda para mostrar que é hora de descansar.

Se você quiser descansar menos, você pode clicar em 'Ignorar' e volta direto 
para o estudo. Se quiser finalizar, você clica em 'Finalizar' e o tempo é 
registrado automaticamente.

Isso facilita porque o aluno não precisa ficar controlando manualmente quando 
é hora de descansar."
```

### Padrão 3: Ferramenta/Recurso (Feedback, Relatório, etc)

**Estrutura**:
```
1. Apresentar o problema que resolve
2. Mostrar onde está
3. Explicar como usar
4. Demonstrar com exemplo real
5. Destacar benefícios
6. Oferecer suporte
```

**Exemplo**:

```
"Às vezes, durante os testes, vocês encontram erros ou têm sugestões de melhoria. 
Normalmente, vocês anotam em um bloco de notas e depois enviam por e-mail, certo?

Agora, temos uma ferramenta integrada na plataforma. Vocês podem ver que 
em todas as telas existe um botão laranja aqui na lateral inferior direita.

Clicando nele, abre uma janela onde vocês podem descrever o problema. 
Vocês selecionam o tipo: se é um erro, uma solicitação de recurso ou 
um comentário geral. Depois, vocês podem anexar uma captura de tela.

Por exemplo, se vocês encontram um erro na listagem de documentos, 
vocês clicam aqui, descrevem o problema, selecionam 'Erro', e anexam 
uma captura de tela. Pronto! O relatório é enviado automaticamente para 
a gente em tempo real.

Isso facilita bastante porque tudo fica centralizado e a gente recebe 
com contexto completo. Não precisa mais de e-mails e bloco de notas."
```

---

## Técnicas de Comunicação

### Técnica 1: Confirmação Visual Constante

**Padrão**: "Vocês podem ver que..." / "Você pode ver que..."

**Função**: Guiar a atenção do espectador para o que é importante

**Exemplos**:
- "Vocês podem ver que já temos a visualização do calendário"
- "Você pode ver que aparece um botão aqui"
- "Então, vocês podem ver que o período foi adicionado"

**Quando Usar**: Sempre que apresentar algo visualmente importante

### Técnica 2: Justificativa de Design

**Padrão**: "Para que..." / "Para deixar..." / "Isso facilita porque..."

**Função**: Conectar funcionalidade com benefício do usuário

**Exemplos**:
- "Para que fique mais fácil para o aluno"
- "Para deixar bem mais acessível"
- "Isso facilita porque o usuário não precisa..."

**Quando Usar**: Depois de explicar cada funcionalidade

### Técnica 3: Menção de Contexto/Origem

**Padrão**: "Esse foi um pedido de..." / "Danilo pediu..." / "A gente recebeu feedback que..."

**Função**: Mostrar que decisões vêm de feedback real

**Exemplos**:
- "Esse foi um pedido do Danilo"
- "Danilo já pediu uma alteração"
- "Recebemos feedback que o aluno queria poder configurar isso"

**Quando Usar**: Para validar decisões de design

### Técnica 4: Transições Suaves

**Padrão**: "Então..." / "E a outra parte é..." / "Partindo agora para..."

**Função**: Conectar tópicos de forma natural

**Exemplos**:
- "Então, vamos lá"
- "Partindo agora para os ajustes"
- "E a outra parte é o cronômetro"

**Quando Usar**: Entre cada funcionalidade/seção

### Técnica 5: Avisos sobre Status

**Padrão**: "Ainda não está..." / "Estamos mapeando..." / "Vai ter melhorias..."

**Função**: Definir expectativas realistas

**Exemplos**:
- "Ainda não está 100% implementado"
- "Estamos mapeando a questão de configuração"
- "Acredito que vão ter melhorias nisso"

**Quando Usar**: Quando mencionar funcionalidades em desenvolvimento

---

## Tratamento de Diferentes Tipos de Funcionalidade

### Tipo 1: Formulário com Validação

**Estrutura**:
```
1. Apresentar o formulário
2. Explicar os campos principais
3. Destacar validações
4. Mostrar mensagens de erro
5. Explicar como corrigir
6. Indicar próximo passo
```

**Exemplo**:

```
"Aqui você tem o formulário de cadastro. Os campos principais são: 
nome, e-mail, CPF, CEP, senha e confirmação de senha.

O sistema valida cada campo em tempo real. Se você digita um e-mail 
inválido, por exemplo, você vê uma mensagem de erro imediatamente.

Se o CPF não está no formato correto, o sistema avisa. Mesma coisa 
com o CEP. Isso deixa bem mais fácil para o usuário saber exatamente 
o que precisa corrigir.

Quando todos os campos estão preenchidos corretamente e você marca 
o aceite dos termos, o botão de próximo fica ativo."
```

### Tipo 2: Fluxo de Pagamento

**Estrutura**:
```
1. Explicar o que vai acontecer
2. Mostrar a tela de monitoramento
3. Explicar que abre em nova aba
4. Mostrar estados possíveis
5. Explicar o que fazer em cada estado
6. Tranquilizar sobre segurança
```

**Exemplo**:

```
"Quando você clica em próximo, o checkout da IUGU abre em uma nova aba. 
Enquanto isso, a tela original entra em modo de monitoramento de pagamento.

Você vê uma mensagem dizendo que estamos monitorando o status. Assim que 
você completa o pagamento na aba do checkout, a plataforma detecta automaticamente.

A tela muda para 'Pagamento aprovado' e você vê um botão 'Acessar painel'. 
Se algo der errado com o pagamento, você vê uma mensagem com a opção de 
tentar novamente.

Tudo é seguro e criptografado. A IUGU é uma plataforma confiável de pagamento."
```

### Tipo 3: Cronômetro/Timer

**Estrutura**:
```
1. Explicar o que é
2. Mostrar como inicia
3. Explicar os botões
4. Mostrar estados (rodando, pausado, finalizado)
5. Explicar o resultado
6. Destacar benefício
```

**Exemplo**:

```
"O cronômetro é simples: ele começa do zero e conta para cima até 
onde você quiser.

Você clica em 'Iniciar' e ele começa a contar. Se você quer pausar, 
clica em 'Pausar' e o botão muda para 'Retomar'. Se você quer finalizar, 
clica em 'Finalizar' e o tempo é registrado automaticamente.

Você pode usar isso para registrar quanto tempo você estudou, sem precisar 
configurar nada. Bem simples e direto."
```

### Tipo 4: Configurações/Ajustes

**Estrutura**:
```
1. Mostrar onde está o botão de configuração
2. Explicar o que pode ser configurado
3. Mostrar as opções disponíveis
4. Explicar cada opção
5. Mostrar como salvar
6. Destacar flexibilidade
```

**Exemplo**:

```
"Você pode ver que tem uma engrenagem aqui em cima do cronômetro. 
Clicando nela, abre as configurações.

Você pode configurar o tempo de estudo. As opções vão de 5 até 90 minutos. 
Você também pode configurar o tempo de intervalo.

Por exemplo, se você quer estudar 45 minutos e descansar 10, você seleciona 
essas opções e clica em salvar.

Isso deixa bem mais acessível porque cada aluno pode usar o método que 
funciona melhor para ele."
```

---

## Checklist de Qualidade

Quando Claude gerar um script de narração, ele deve verificar:

### ✅ Conteúdo

- [ ] Abertura clara que contextualiza o cenário
- [ ] Objetivo bem definido
- [ ] Desenvolvimento que guia passo a passo
- [ ] Cada funcionalidade tem: apresentação, explicação, demonstração, benefício
- [ ] Confirmação que reforça o resultado
- [ ] Encerramento motivador
- [ ] Linguagem acessível (sem jargão técnico desnecessário)
- [ ] Todas as histórias de usuário foram cobertas

### ✅ Tom

- [ ] Profissional mas não formal demais
- [ ] Amigável e confiante
- [ ] Empático com o usuário
- [ ] Sem sarcasmo ou ironia
- [ ] Sem entusiasmo exagerado
- [ ] Pessoal e próximo
- [ ] Usa "você" para criar conexão

### ✅ Estilo

- [ ] Voz ativa predominante
- [ ] Verbos claros e dinâmicos
- [ ] Português brasileiro natural
- [ ] Sem expressões problemáticas
- [ ] Transições suaves entre tópicos
- [ ] Pausas estratégicas para leitura (indicadas com [PAUSA])

### ✅ Estrutura

- [ ] Sincronização com visual (narração acompanha telas)
- [ ] Pausas estratégicas para leitura
- [ ] Duração apropriada (~10-15 palavras por segundo)
- [ ] Transições suaves entre etapas
- [ ] Ritmo que acompanha ações na tela
- [ ] Cada seção tem duração apropriada (abertura 5-10%, contextualização 5-10%, demonstração 70-80%, encerramento 5-10%)

### ✅ Português Brasileiro

- [ ] Pronúncia clara
- [ ] Expressões naturais do PT-BR
- [ ] Números e datas em formato correto
- [ ] Sem lusitanismos
- [ ] Sotaque neutro

### ✅ Alinhamento com Histórias de Usuário

- [ ] Todos os critérios de aceitação foram mencionados
- [ ] Todos os estados visuais foram explicados
- [ ] Todos os requisitos técnicos foram contextualizados
- [ ] Benefício para o usuário está claro

---

## Exemplos Práticos

### Exemplo 1: Cadastro e Assinatura (US-001)

**História de Usuário**:
- Como usuário visitante, quero me cadastrar e assinar o serviço
- Fluxo em 2 etapas: formulário + monitoramento de pagamento
- Validação inline, integração IUGU, confirmação de pagamento

**Script de Narração**:

```
[ABERTURA - 8s]
"Boa tarde! Vou mostrar para vocês como ficou o novo fluxo de cadastro 
e assinatura que desenvolvemos."

[CONTEXTUALIZAÇÃO - 8s]
"Esse vídeo é para vocês entenderem cada etapa do processo e como o novo 
usuário vai interagir com a plataforma. Esse foi um pedido do time de produto 
e estamos em fase de testes."

[DEMONSTRAÇÃO - ETAPA 1 - 20s]
"Aqui você tem o formulário de cadastro. Os campos principais são: nome, 
e-mail, celular, CPF, CEP, senha e confirmação de senha.

O sistema valida cada campo em tempo real. Se você digita um e-mail inválido, 
você vê uma mensagem de erro imediatamente. Se o CPF não está no formato correto, 
o sistema avisa.

Isso deixa bem mais fácil para o usuário saber exatamente o que precisa corrigir.

Você também precisa marcar o aceite dos termos de uso. Quando todos os campos 
estão preenchidos corretamente e você marca o aceite, o botão de próximo fica ativo."

[DEMONSTRAÇÃO - ETAPA 2 - 15s]
"Quando você clica em próximo, o checkout da IUGU abre em uma nova aba. 
Enquanto isso, a tela original entra em modo de monitoramento de pagamento.

Você vê uma mensagem dizendo que estamos monitorando o status. Assim que você 
completa o pagamento na aba do checkout, a plataforma detecta automaticamente.

A tela muda para 'Pagamento aprovado' e você vê um botão 'Acessar painel'."

[DEMONSTRAÇÃO - ETAPA 3 - 10s]
"Quando você clica em 'Acessar painel', você entra no seu painel de aluno. 
Você vai ver um alerta no topo dizendo que seu e-mail ainda não foi validado.

Você pode clicar no link para validar seu e-mail. Assim que você valida, 
o alerta desaparece e você tem acesso completo à plataforma."

[ENCERRAMENTO - 8s]
"Pronto! Esse é o novo fluxo de cadastro e assinatura. Bem mais simples 
e intuitivo. Vocês podem testar no ambiente de staging. Qualquer dúvida, 
estamos aqui."

[DURAÇÃO TOTAL: ~69 segundos]
```

### Exemplo 2: Exibição de Data de Renovação (US-002)

**História de Usuário**:
- Como aluno assinante, quero ver a data de renovação da minha assinatura
- Informação no header do painel
- Comportamento responsivo

**Script de Narração**:

```
[ABERTURA - 5s]
"Ola, pessoal! Vou mostrar um detalhe importante que adicionamos ao painel 
do aluno."

[CONTEXTUALIZAÇÃO - 5s]
"Essa informação ajuda o aluno a saber quando sua assinatura vai ser renovada 
e quando a próxima cobrança vai acontecer."

[DEMONSTRAÇÃO - 15s]
"No header do painel, você visualiza a informação de próxima renovação da 
sua assinatura. Você pode ver aqui: 'Próxima renovação: 17 de maio de 2026'.

Essa informação aparece em todas as páginas do painel, então o aluno sempre 
sabe quando sua assinatura vai ser renovada.

Em telas menores, como em celulares, a informação fica mais compacta, mas 
continua visível. Você pode clicar nessa informação para ir para a página 
de gerenciamento da assinatura, onde você tem controle total sobre seu plano."

[ENCERRAMENTO - 5s]
"Simples, mas muito importante para o aluno ter clareza sobre sua conta. 
Estamos aqui para qualquer dúvida."

[DURAÇÃO TOTAL: ~30 segundos]
```

### Exemplo 3: Cancelamento de Assinatura (US-003)

**História de Usuário**:
- Como aluno assinante, quero cancelar minha assinatura
- Confirmação em 2 etapas
- Avisos sobre não-reembolso e data de encerramento

**Script de Narração**:

```
[ABERTURA - 5s]
"Se em algum momento você decidir cancelar sua assinatura, o processo é 
simples e seguro."

[CONTEXTUALIZAÇÃO - 5s]
"Vou mostrar como funciona e quais são as informações importantes que você 
precisa saber antes de cancelar."

[DEMONSTRAÇÃO - ETAPA 1 - 10s]
"Você acessa a página de gerenciamento da sua assinatura. Aqui você visualiza 
seu plano atual, a data de renovação, e o botão 'Cancelar assinatura'.

Clicando nele, o sistema abre uma confirmação em duas etapas."

[DEMONSTRAÇÃO - ETAPA 2 - 15s]
"Primeiro, você recebe um aviso claro: o valor já pago não será estornado. 
Mas você mantém acesso aos cursos até o fim do período vigente.

Por exemplo, se você pagou até 17 de maio, você continua tendo acesso até 
essa data, mesmo que cancele hoje.

Você precisa confirmar uma segunda vez para concluir o cancelamento."

[DEMONSTRAÇÃO - ETAPA 3 - 10s]
"Depois que você confirma, a página muda. Você vê o status 'Assinatura cancelada 
— acesso disponível até 17 de maio de 2026'.

Você não vê mais o botão de cancelar. Você continua tendo acesso normal até 
a data de encerramento."

[ENCERRAMENTO - 5s]
"Bem simples, certo? Você tem controle total sobre sua assinatura. Estamos 
aqui para qualquer dúvida."

[DURAÇÃO TOTAL: ~50 segundos]
```

---

## Instruções Passo-a-Passo

### Passo 1: Ler a História de Usuário Completa

Antes de gerar narração, Claude deve:

1. Ler a história de usuário completa
2. Entender o contexto (Como/Quero/Para que)
3. Identificar os critérios de aceitação
4. Listar os estados visuais mencionados
5. Identificar os requisitos técnicos

### Passo 2: Estruturar a Narração

1. **Abertura**: Saudação + Objetivo (5-10% do tempo)
2. **Contextualização**: Por que + Quem pediu + Status (5-10% do tempo)
3. **Demonstração**: Passo-a-passo (70-80% do tempo)
4. **Encerramento**: Resumo + Chamada à ação (5-10% do tempo)

### Passo 3: Aplicar o Tom

1. Usar saudação pessoal
2. Usar "você" para criar conexão
3. Manter tom profissional mas acessível
4. Usar voz ativa
5. Usar verbos claros e dinâmicos

### Passo 4: Desenvolver Demonstração

Para cada funcionalidade:

1. **Apresentar**: "Aqui você pode ver que..."
2. **Explicar**: "Clicando em..., você consegue..."
3. **Demonstrar**: "Você pode ver que..."
4. **Benefício**: "Para deixar mais fácil..."
5. **Transição**: "E a outra parte é..."

### Passo 5: Sincronizar com Visual

1. Indicar pausas com [PAUSA Xs] onde X é segundos
2. Indicar quando narração acompanha ação visual
3. Deixar tempo para leitura de texto na tela
4. Sincronizar com transições

### Passo 6: Validar com Checklist

Usar checklist de qualidade para validar:
- [ ] Conteúdo completo
- [ ] Tom apropriado
- [ ] Estilo consistente
- [ ] Estrutura clara
- [ ] Português correto
- [ ] Alinhamento com histórias

### Passo 7: Revisar e Refinar

1. Ler em voz alta (mentalmente)
2. Verificar se flui naturalmente
3. Remover redundâncias
4. Adicionar pausas onde necessário
5. Confirmar duração apropriada

---

## Referência Rápida

### Estrutura Geral

```
ABERTURA (5-10%)
├─ Saudação
├─ Objetivo
└─ Contexto

CONTEXTUALIZAÇÃO (5-10%)
├─ Por que
├─ Quem pediu
└─ Status

DEMONSTRAÇÃO (70-80%)
├─ Funcionalidade 1
│  ├─ Apresentar
│  ├─ Explicar
│  ├─ Demonstrar
│  ├─ Benefício
│  └─ Transição
├─ Funcionalidade 2
│  └─ [Mesmo padrão]
└─ ...

ENCERRAMENTO (5-10%)
├─ Resumo
├─ Chamada à ação
└─ Disponibilidade
```

### Padrões de Linguagem

| Situação | Padrão | Exemplo |
|----------|--------|---------|
| Apresentar | "Aqui você pode ver que..." | "Aqui você tem o formulário" |
| Explicar | "Clicando em..., você consegue..." | "Clicando aqui, você cria um período" |
| Demonstrar | "Você pode ver que..." | "Você pode ver que foi adicionado" |
| Benefício | "Para deixar..." | "Para deixar mais fácil" |
| Transição | "Então..." / "E a outra parte é..." | "Então, vamos lá" |
| Avisar | "Ainda não está..." | "Ainda não está 100% pronto" |
| Encerrar | "Estamos aqui para..." | "Estamos aqui para qualquer dúvida" |

### Duração por Tipo

| Tipo | Duração Típica |
|------|----------------|
| Funcionalidade simples | 15-20s |
| Fluxo com 2-3 etapas | 40-60s |
| Ferramenta completa | 30-45s |
| Vídeo completo | 2-4 minutos |

---

## Conclusão

Esta skill fornece a Claude um guia completo para gerar narrações profissionais, didáticas e pessoais para vídeos de apresentação de jornadas de usuário.

**Pontos-chave**:
- ✅ Estrutura clara em 4 seções
- ✅ Tom profissional mas acessível
- ✅ Padrões de apresentação por tipo de funcionalidade
- ✅ Técnicas de comunicação comprovadas
- ✅ Checklist de qualidade
- ✅ Exemplos práticos

Seguindo esta skill, Claude pode gerar narrações que:
- Criam conexão pessoal
- Explicam de forma clara
- Conectam com benefício do usuário
- Mantêm tom profissional
- São fáceis de acompanhar
- Geram confiança

---

## Apêndice: Análise Baseada em Transcrições Reais

Esta skill foi desenvolvida analisando 3 transcrições reais de apresentações de layouts/funcionalidades, extraindo padrões autênticos de:

1. **Apresentação 1**: Calendário + Pomodoro (~4 min)
2. **Apresentação 2**: Pomodoro + Cronômetro (~4 min)
3. **Apresentação 3**: Ferramenta de Feedback (~4 min)

Os padrões identificados foram validados e incorporados nesta skill para garantir que a narração gerada por Claude seja autêntica, profissional e alinhada com o tom real de apresentações bem-sucedidas.
