# Guia de Estrutura: Projeto Claude para HyperFrames com Histórias de Usuário

**Objetivo**: Estruturar um projeto Claude que leia histórias de usuário, importe jornadas do Figma via MCP, gere narração em português, crie animações e renderize vídeos profissionais.

---

## 1. Arquitetura Geral do Projeto

```
projeto-hyperframes-claude/
├── .claude/
│   ├── claude.json                 # Configuração do projeto Claude
│   ├── instructions.md             # Instruções do projeto
│   └── mcp-config.json             # Configuração MCP (Figma)
├── docs/
│   ├── user-stories/               # Histórias de usuário
│   │   ├── us-001-signup.md
│   │   ├── us-002-subscription.md
│   │   └── us-003-cancel.md
│   └── design-specs/               # Especificações de design
│       ├── design-system.md
│       └── brand-guidelines.md
├── figma/
│   ├── figma-urls.json             # URLs das jornadas no Figma
│   └── imported-assets/            # Assets importados
├── hyperframes/
│   ├── projects/                   # Projetos HyperFrames
│   │   ├── signup-flow/
│   │   ├── subscription-header/
│   │   └── cancel-subscription/
│   ├── scripts/
│   │   ├── import-figma.mjs        # Script para importar Figma
│   │   ├── generate-narration.mjs  # Script para gerar TTS
│   │   ├── create-animation.mjs    # Script para criar animações
│   │   └── render-video.mjs        # Script para renderizar MP4
│   └── templates/
│       ├── composition-template.html
│       └── slideshow-template.html
├── scripts/
│   ├── setup.sh                    # Setup inicial
│   ├── validate.sh                 # Validação
│   └── build.sh                    # Build completo
├── output/
│   ├── videos/                     # Vídeos renderizados
│   ├── narrations/                 # Arquivos de narração
│   └── assets/                     # Assets processados
├── narration_skill_complete.md     # ⭐ SKILL DE NARRAÇÃO (NOVO)
├── analise_transcricoes.md         # ⭐ PADRÕES REAIS (NOVO)
├── .env.example
├── package.json
└── README.md
```

---

## 2. Configuração do Projeto Claude

### 2.1 Arquivo: `.claude/claude.json`

```json
{
  "name": "HyperFrames Video Generator",
  "description": "Gera vídeos profissionais de jornadas de usuário a partir de histórias e designs Figma",
  "version": "1.0.0",
  "author": "Angelo Rosa",
  "tools": {
    "mcp": {
      "figma": {
        "enabled": true,
        "config": "./mcp-config.json"
      }
    },
    "hyperframes": {
      "enabled": true,
      "version": "^0.7.57"
    },
    "heygen": {
      "enabled": true,
      "version": "^0.3.0"
    }
  },
  "workflows": {
    "import-figma": {
      "description": "Importar jornada do Figma",
      "script": "scripts/import-figma.mjs"
    },
    "generate-narration": {
      "description": "Gerar narração em português",
      "script": "scripts/generate-narration.mjs"
    },
    "create-animation": {
      "description": "Criar animações das telas",
      "script": "scripts/create-animation.mjs"
    },
    "render-video": {
      "description": "Renderizar vídeo final",
      "script": "scripts/render-video.mjs"
    },
    "full-pipeline": {
      "description": "Executar pipeline completo",
      "steps": [
        "import-figma",
        "generate-narration",
        "create-animation",
        "render-video"
      ]
    }
  },
  "environment": {
    "NODE_VERSION": "22.0.0",
    "HYPERFRAMES_VERSION": "0.7.57",
    "HEYGEN_VERSION": "0.3.0"
  }
}
```

### 2.2 Arquivo: `.claude/instructions.md`

```markdown
# Instruções do Projeto: HyperFrames Video Generator

## Objetivo
Transformar histórias de usuário e designs Figma em vídeos profissionais com narração em português.

## Fluxo Principal

### 1. Entrada: História de Usuário
- Ler arquivo `.md` em `docs/user-stories/`
- Extrair: contexto, objetivo, critérios de aceitação
- Identificar: jornada do usuário, estados, transições

### 2. Importação Figma
- Usar MCP Figma para acessar designs
- Importar frames/artboards como storyboard
- Extrair: assets, cores, tipografia, componentes
- Validar: fidelidade visual

### 3. Geração de Narração
- **⭐ IMPORTANTE**: Consultar `narration_skill_complete.md`
- Criar script em português seguindo a skill
- Gerar TTS via HeyGen (português brasileiro)
- Sincronizar com duração de cada tela
- Validar: qualidade de áudio, pronúncia

### 4. Criação de Animações
- Reconstruir storyboard como animação contínua
- Adicionar transições suaves entre telas
- Sincronizar com narração (áudio-visual)
- Validar: timing, sincronismo

### 5. Renderização
- Renderizar MP4 final via HyperFrames
- Validar: qualidade, duração, sincronismo
- Entregar: arquivo pronto para cliente

## Regras Importantes

1. **Sempre validar antes de renderizar**: Não renderize sem aprovação do usuário
2. **Determinismo**: Mesma entrada = mesmo vídeo
3. **Português Brasileiro**: TTS sempre em pt-BR
4. **Qualidade**: Revisar cada etapa antes de avançar
5. **Documentação**: Registrar decisões de design
6. **Narração Profissional**: Seguir `narration_skill_complete.md`

## Comandos Disponíveis

\`\`\`bash
# Setup inicial
npm run setup

# Validar ambiente
npm run validate

# Importar Figma
npm run import-figma -- --story us-001

# Gerar narração
npm run generate-narration -- --story us-001 --voice pt-BR

# Criar animação
npm run create-animation -- --story us-001

# Renderizar vídeo
npm run render-video -- --story us-001 --format mp4

# Pipeline completo
npm run pipeline -- --story us-001
\`\`\`

## Estrutura de Dados

### História de Usuário (entrada)
\`\`\`yaml
id: us-001
title: Cadastro e Assinatura
context: Como usuário visitante
objective: Me cadastrar na plataforma
benefit: Acessar conteúdos como assinante
figma_url: https://figma.com/file/...
acceptance_criteria:
  - Formulário com validação inline
  - Integração IUGU
  - Confirmação de pagamento
\`\`\`

### Projeto HyperFrames (processamento)
\`\`\`
hyperframes/projects/us-001-signup/
├── composition.html
├── .media/
│   ├── images/
│   ├── audio/
│   │   ├── voice/
│   │   ├── bgm/
│   │   └── sfx/
│   └── manifest.jsonl
├── animations/
├── scripts/
└── output/
    └── video.mp4
\`\`\`

## Referência de Narração

**⭐ SKILL COMPLETA**: Consulte `narration_skill_complete.md` para:
- Estrutura em 4 seções (Abertura → Contextualização → Demonstração → Encerramento)
- Padrões de apresentação por tipo de funcionalidade
- 5 técnicas de comunicação comprovadas
- Checklist de qualidade
- Exemplos práticos completos
- 7 passos passo-a-passo

**Padrões Reais**: Consulte `analise_transcricoes.md` para:
- Padrões extraídos de 3 apresentações reais
- Exemplos autênticos de linguagem
- Técnicas de comunicação comprovadas

## Checklist de Qualidade

- [ ] História de usuário compreendida
- [ ] Figma importado com fidelidade
- [ ] Narração em português validada (conforme skill)
- [ ] Animações sincronizadas
- [ ] Vídeo renderizado sem erros
- [ ] Duração correta
- [ ] Áudio-visual sincronizado
- [ ] Pronto para cliente

## Contato & Suporte

- Documentação: `docs/`
- Skill de Narração: `narration_skill_complete.md`
- Padrões Reais: `analise_transcricoes.md`
- Contato: Angelo Rosa
\`\`\`

### 2.3 Arquivo: `.claude/mcp-config.json`

```json
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["./mcp-servers/figma-console-mcp/index.js"],
      "env": {
        "FIGMA_TOKEN": "${FIGMA_TOKEN}",
        "FIGMA_FILE_ID": "${FIGMA_FILE_ID}"
      },
      "capabilities": {
        "read_files": true,
        "list_files": true,
        "get_file_metadata": true,
        "export_assets": true,
        "read_components": true,
        "read_frames": true
      }
    }
  },
  "figmaConsole": {
    "baseUrl": "https://api.figma.com/v1",
    "version": "v1",
    "cache": {
      "enabled": true,
      "ttl": 3600
    }
  }
}
```

---

## 3. Referência de Narração

### ⭐ SKILL COMPLETA DE NARRAÇÃO

**Arquivo**: `narration_skill_complete.md`

Esta é a **fonte única de verdade** para geração de narrações profissionais. Inclui:

#### Estrutura em 4 Seções

```
ABERTURA (5-10%)
├─ Saudação pessoal
├─ Objetivo claro
└─ Contexto breve

CONTEXTUALIZAÇÃO (5-10%)
├─ Por que está apresentando
├─ Quem pediu/aprovou
└─ Status (beta, testes, etc)

DEMONSTRAÇÃO (70-80%)
├─ Apresentar elemento
├─ Explicar função
├─ Demonstrar resultado
├─ Destacar benefício
└─ Transição para próximo

ENCERRAMENTO (5-10%)
├─ Resumo rápido
├─ Chamada à ação
└─ Disponibilidade para suporte
```

#### Padrões de Linguagem

| Situação | Padrão | Exemplo |
|----------|--------|---------|
| Apresentar | "Aqui você pode ver que..." | "Aqui você tem o formulário" |
| Explicar | "Clicando em..., você consegue..." | "Clicando aqui, você cria um período" |
| Demonstrar | "Você pode ver que..." | "Você pode ver que foi adicionado" |
| Benefício | "Para deixar..." | "Para deixar mais fácil" |
| Transição | "Então..." / "E a outra parte é..." | "Então, vamos lá" |
| Avisar | "Ainda não está..." | "Ainda não está 100% pronto" |
| Encerrar | "Estamos aqui para..." | "Estamos aqui para qualquer dúvida" |

#### Padrões de Apresentação

1. **Funcionalidade Visual** (Calendário, Dashboard)
2. **Fluxo com Estados** (Pomodoro, Checkout)
3. **Ferramenta/Recurso** (Feedback, Relatório)

#### Checklist de Qualidade

- [ ] Conteúdo completo
- [ ] Tom apropriado (profissional + acessível)
- [ ] Estilo consistente
- [ ] Estrutura clara
- [ ] Português correto
- [ ] Alinhamento com histórias

#### Como Claude Deve Usar

```
1. Ler história de usuário completa
2. Consultar narration_skill_complete.md
3. Seguir os 7 passos para gerar narração
4. Validar com checklist de qualidade
5. Gerar TTS em português brasileiro
6. Sincronizar com vídeo
```

### Análise de Padrões Reais

**Arquivo**: `analise_transcricoes.md`

Análise profunda de 3 apresentações reais, mostrando:
- Estrutura geral de apresentação
- Tom e linguagem autêntica
- Técnicas de comunicação comprovadas
- Padrões por tipo de funcionalidade
- Elementos emocionais e engajamento

---

## 4. Estrutura de Histórias de Usuário

### 4.1 Arquivo: `docs/user-stories/us-001-signup.md`

```markdown
# US-001: Cadastro e Assinatura

## Contexto
- **Como** usuário visitante
- **Quero** me cadastrar na plataforma e assinar o serviço
- **Para que** eu possa acessar os conteúdos e funcionalidades como assinante

## Descrição da Funcionalidade

Fluxo de cadastro em duas etapas: formulário de cadastro e tela de monitoramento de pagamento.

### Etapa 1: Formulário de Cadastro
- Campos: Nome, E-mail, Celular, CPF, CEP, Senha, Repetição de senha
- Validação inline (e-mail, CPF, CEP, força de senha)
- Aceite obrigatório dos termos
- Botão desabilitado até aceite

### Etapa 2: Monitoramento de Pagamento
- Checkout IUGU abre em nova aba
- Tela original entra em modo "Monitorando pagamento"
- Estados: Monitorando, Aprovado, Recusado

### Etapa 3: Confirmação
- Após pagamento: "Pagamento aprovado"
- Botão "Acessar painel"
- Alerta de e-mail não validado no painel

## Critérios de Aceitação

### UI
- [ ] Formulário com todos os campos
- [ ] Validação inline com mensagens de erro
- [ ] Estados visuais distintos
- [ ] Alerta de e-mail não validado

### Funcional
- [ ] Checkout IUGU abre em nova aba
- [ ] Monitoramento automático de status
- [ ] Senhas validadas e sincronizadas
- [ ] Alerta persiste até validação

### Técnico
- [ ] Integração IUGU
- [ ] Webhook + polling para status
- [ ] Serviço de e-mail de validação
- [ ] Armazenamento de aceite de termos

## Figma
- **URL**: https://figma.com/file/...
- **Frames**: 
  - Frame 1: Formulário vazio
  - Frame 2: Formulário com erro
  - Frame 3: Monitorando pagamento
  - Frame 4: Pagamento aprovado
  - Frame 5: Painel com alerta de e-mail

## Narração (Português)

⭐ **IMPORTANTE**: Para gerar a narração desta história, consulte:
- `narration_skill_complete.md` (skill completa)
- `analise_transcricoes.md` (padrões reais)

Siga os 7 passos definidos na skill para garantir qualidade profissional.

### Exemplo de Narração (Referência)

"Bem-vindo ao processo de cadastro. Aqui você preenche seus dados pessoais com validação em tempo real. Após confirmar os termos de uso, você é direcionado para o pagamento seguro via IUGU. Enquanto você conclui o pagamento, a plataforma monitora o status automaticamente. Assim que confirmado, você ganha acesso ao painel, onde um alerta lembrará você de validar seu e-mail."

## Notas
- Integração com IUGU é crítica
- Webhook deve ser confiável
- Fallback para polling se webhook falhar
- TTS em português brasileiro (pt-BR)
```

---

## 5. Scripts de Automação

### 5.1 Arquivo: `hyperframes/scripts/import-figma.mjs`

```javascript
#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

const args = process.argv.slice(2);
const storyId = args.find(arg => arg.startsWith('--story='))?.split('=')[1];

if (!storyId) {
  console.error('Uso: node import-figma.mjs --story=us-001');
  process.exit(1);
}

// 1. Ler história de usuário
const storyPath = `docs/user-stories/${storyId}.md`;
const storyContent = readFileSync(storyPath, 'utf-8');

console.log(`📖 Lendo história: ${storyId}`);

// 2. Extrair URL Figma
const figmaUrlMatch = storyContent.match(/\*\*URL\*\*:\s*(https:\/\/figma\.com\/file\/[^\s]+)/);
if (!figmaUrlMatch) {
  console.error('❌ URL Figma não encontrada na história');
  process.exit(1);
}

const figmaUrl = figmaUrlMatch[1];
console.log(`🎨 URL Figma: ${figmaUrl}`);

// 3. Usar MCP Figma para importar
console.log('📥 Importando assets do Figma...');
try {
  execSync(`npx hyperframes figma asset "${figmaUrl}" --project hyperframes/projects/${storyId}`, {
    stdio: 'inherit'
  });
  console.log('✅ Assets importados com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar assets:', error.message);
  process.exit(1);
}

// 4. Reconstruir storyboard
console.log('🎬 Reconstruindo storyboard...');
try {
  execSync(`npx hyperframes figma storyboard "${figmaUrl}" --project hyperframes/projects/${storyId}`, {
    stdio: 'inherit'
  });
  console.log('✅ Storyboard reconstruído');
} catch (error) {
  console.error('❌ Erro ao reconstruir storyboard:', error.message);
  process.exit(1);
}

console.log(`\n✨ Importação concluída para ${storyId}`);
console.log(`📁 Projeto criado em: hyperframes/projects/${storyId}`);
```

### 5.2 Arquivo: `hyperframes/scripts/generate-narration.mjs`

```javascript
#!/usr/bin/env node

// ⭐ IMPORTANTE: Esta script extrai narração da história de usuário
// e gera TTS em português. A narração deve ter sido criada seguindo:
// - narration_skill_complete.md (skill completa)
// - analise_transcricoes.md (padrões reais)
//
// Siga os 7 passos definidos na skill para garantir qualidade profissional.

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const storyId = args.find(arg => arg.startsWith('--story='))?.split('=')[1];
const voice = args.find(arg => arg.startsWith('--voice='))?.split('=')[1] || 'pt-BR';

if (!storyId) {
  console.error('Uso: node generate-narration.mjs --story=us-001 --voice=pt-BR');
  process.exit(1);
}

// 1. Ler história e extrair narração
const storyPath = `docs/user-stories/${storyId}.md`;
const storyContent = readFileSync(storyPath, 'utf-8');

const narrationMatch = storyContent.match(/## Narração \(Português\)\n\n"(.+?)"/s);
if (!narrationMatch) {
  console.error('❌ Narração não encontrada na história');
  console.error('💡 Dica: Crie a narração seguindo narration_skill_complete.md');
  process.exit(1);
}

const narrationText = narrationMatch[1];
console.log(`🎙️ Narração extraída (${narrationText.length} caracteres)`);

// 2. Criar arquivo de requisição de áudio
const audioRequest = {
  lang: voice,
  lines: [
    {
      id: 'narration',
      text: narrationText
    }
  ],
  bgm: {
    mode: 'retrieve',
    query: 'background music soft professional'
  }
};

const requestPath = `hyperframes/projects/${storyId}/audio_request.json`;
writeFileSync(requestPath, JSON.stringify(audioRequest, null, 2));
console.log(`📝 Arquivo de requisição criado: ${requestPath}`);

// 3. Gerar TTS via media-use
console.log('🎵 Gerando narração com TTS...');
try {
  execSync(`node skills/media-use/audio/scripts/audio.mjs --request ${requestPath} --out hyperframes/projects/${storyId}/audio_meta.json`, {
    stdio: 'inherit'
  });
  console.log('✅ Narração gerada com sucesso');
} catch (error) {
  console.error('❌ Erro ao gerar narração:', error.message);
  process.exit(1);
}

// 4. Validar resultado
const audioMeta = JSON.parse(readFileSync(`hyperframes/projects/${storyId}/audio_meta.json`, 'utf-8'));
console.log(`\n📊 Metadados de áudio:`);
console.log(`   - Duração: ${audioMeta.total_duration_s}s`);
console.log(`   - Palavras: ${audioMeta.voices[0].words.length}`);
console.log(`   - Arquivo: ${audioMeta.voices[0].path}`);

console.log(`\n✨ Narração gerada para ${storyId}`);
```

### 5.3 Arquivo: `hyperframes/scripts/create-animation.mjs`

```javascript
#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const storyId = args.find(arg => arg.startsWith('--story='))?.split('=')[1];

if (!storyId) {
  console.error('Uso: node create-animation.mjs --story=us-001');
  process.exit(1);
}

console.log(`🎬 Criando animação para ${storyId}...`);

// 1. Ler metadados de áudio
const audioMetaPath = `hyperframes/projects/${storyId}/audio_meta.json`;
const audioMeta = JSON.parse(readFileSync(audioMetaPath, 'utf-8'));
const totalDuration = audioMeta.total_duration_s;

console.log(`⏱️ Duração total: ${totalDuration}s`);

// 2. Criar composition.html com animações
const compositionTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; }
    body { width: 1920px; height: 1080px; overflow: hidden; }
    .scene { position: absolute; width: 100%; height: 100%; }
    .clip { position: absolute; width: 100%; height: 100%; }
    audio { display: none; }
  </style>
</head>
<body>
  <div class="scene" data-composition-id="main" data-start="0" data-duration="${totalDuration}">
    <audio id="narration" src="${audioMeta.voices[0].path}" data-start="0" data-duration="${totalDuration}"></audio>
    <!-- Clips serão inseridos aqui -->
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script>
    // Timeline será construída aqui
    const tl = gsap.timeline();
    // Animações sincronizadas com áudio
  </script>
</body>
</html>
`;

const compositionPath = `hyperframes/projects/${storyId}/composition.html`;
writeFileSync(compositionPath, compositionTemplate);
console.log(`📄 Composition criada: ${compositionPath}`);

// 3. Validar com hyperframes lint
console.log('🔍 Validando composition...');
try {
  execSync(`npx hyperframes lint hyperframes/projects/${storyId}`, {
    stdio: 'inherit'
  });
  console.log('✅ Composition validada');
} catch (error) {
  console.error('⚠️ Avisos de validação:', error.message);
}

console.log(`\n✨ Animação criada para ${storyId}`);
```

### 5.4 Arquivo: `hyperframes/scripts/render-video.mjs`

```javascript
#!/usr/bin/env node

import { execSync } from 'child_process';

const args = process.argv.slice(2);
const storyId = args.find(arg => arg.startsWith('--story='))?.split('=')[1];
const format = args.find(arg => arg.startsWith('--format='))?.split('=')[1] || 'mp4';

if (!storyId) {
  console.error('Uso: node render-video.mjs --story=us-001 --format=mp4');
  process.exit(1);
}

console.log(`🎥 Renderizando vídeo para ${storyId}...`);

try {
  execSync(`npx hyperframes render hyperframes/projects/${storyId} --output output/videos/${storyId}.${format}`, {
    stdio: 'inherit'
  });
  console.log(`✅ Vídeo renderizado: output/videos/${storyId}.${format}`);
} catch (error) {
  console.error('❌ Erro ao renderizar:', error.message);
  process.exit(1);
}

console.log(`\n✨ Vídeo pronto para ${storyId}`);
```

---

## 6. Package.json

```json
{
  "name": "hyperframes-video-generator",
  "version": "1.0.0",
  "description": "Gera vídeos profissionais de jornadas de usuário com HyperFrames",
  "type": "module",
  "scripts": {
    "setup": "bash scripts/setup.sh",
    "validate": "bash scripts/validate.sh",
    "import-figma": "node hyperframes/scripts/import-figma.mjs",
    "generate-narration": "node hyperframes/scripts/generate-narration.mjs",
    "create-animation": "node hyperframes/scripts/create-animation.mjs",
    "render-video": "node hyperframes/scripts/render-video.mjs",
    "pipeline": "npm run import-figma && npm run generate-narration && npm run create-animation && npm run render-video",
    "clean": "rm -rf hyperframes/projects/*/output"
  },
  "dependencies": {
    "hyperframes": "^0.7.57",
    "gsap": "^3.12.2"
  },
  "devDependencies": {},
  "engines": {
    "node": ">=22.0.0"
  }
}
```

---

## 7. Arquivo: `.env.example`

```bash
# Figma
FIGMA_TOKEN=your_figma_token_here
FIGMA_FILE_ID=your_figma_file_id_here

# HeyGen (TTS)
HEYGEN_API_KEY=your_heygen_api_key_here
HEYGEN_OAUTH_TOKEN=your_heygen_oauth_token_here

# HyperFrames
HYPERFRAMES_PROJECT_DIR=./hyperframes/projects

# Saída
OUTPUT_DIR=./output/videos

# Desenvolvimento
DEBUG=false
LOG_LEVEL=info
```

---

## 8. Fluxo de Uso

### 8.1 Setup Inicial

```bash
# 1. Clonar repositório
git clone <repo-url>
cd projeto-hyperframes-claude

# 2. Instalar dependências
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com tokens reais

# 4. Validar setup
npm run validate
```

### 8.2 Processar Uma História

```bash
# 1. Criar arquivo de história
# docs/user-stories/us-001-signup.md

# 2. Gerar narração seguindo narration_skill_complete.md
# (Adicionar seção "## Narração (Português)" com script profissional)

# 3. Executar pipeline completo
npm run pipeline -- --story=us-001

# Ou executar etapa por etapa:
npm run import-figma -- --story=us-001
npm run generate-narration -- --story=us-001 --voice=pt-BR
npm run create-animation -- --story=us-001
npm run render-video -- --story=us-001 --format=mp4
```

### 8.3 Resultado

```
output/videos/us-001.mp4  ← Vídeo pronto para cliente
```

---

## 9. Integração com Claude

### 9.1 Prompt para Claude

```markdown
# Tarefa: Gerar Vídeo de Jornada de Usuário

## Entrada
- Arquivo de história de usuário: `docs/user-stories/us-001-signup.md`
- Figma URL com storyboard: [URL]

## Referências Obrigatórias
- **Skill de Narração**: `narration_skill_complete.md`
- **Padrões Reais**: `analise_transcricoes.md`

## Processo
1. Ler história de usuário
2. Consultar `narration_skill_complete.md`
3. Gerar narração seguindo os 7 passos
4. Validar com checklist de qualidade
5. Importar jornada do Figma via MCP
6. Gerar TTS (português brasileiro)
7. Criar animações sincronizadas
8. Renderizar vídeo MP4 final

## Saída
- Vídeo profissional: `output/videos/us-001.mp4`
- Documentação: `output/us-001-report.md`

## Validação
- [ ] Figma importado com fidelidade
- [ ] Narração em português clara (conforme skill)
- [ ] Animações sincronizadas
- [ ] Vídeo renderizado sem erros
- [ ] Duração correta
```

---

## 10. Checklist de Implementação

- [ ] Criar estrutura de diretórios
- [ ] Configurar `.claude/claude.json`
- [ ] Configurar `.claude/mcp-config.json`
- [ ] Criar `.claude/instructions.md` com referências à skill
- [ ] Criar scripts de automação
- [ ] Configurar `package.json`
- [ ] Criar `.env.example`
- [ ] Adicionar `narration_skill_complete.md`
- [ ] Adicionar `analise_transcricoes.md`
- [ ] Testar com história simples
- [ ] Validar pipeline completo
- [ ] Documentar processo

---

## 11. Próximas Etapas

1. **Implementar MCP Figma**: Integrar `figma-console-mcp`
2. **Testar TTS**: Validar qualidade de voz em português
3. **Otimizar Animações**: Refinar transições e timing
4. **Criar Templates**: Reutilizar para múltiplas histórias
5. **Automação Completa**: Integrar com CI/CD

---

## 📚 Referências Principais

- **`narration_skill_complete.md`**: Skill completa de narração (OBRIGATÓRIO)
- **`analise_transcricoes.md`**: Análise de padrões reais (RECOMENDADO)
- **`installation_guide.md`**: Guia de instalação do ambiente
- **`website_to_video_discovery.md`**: Descoberta sobre website-to-video
- **`parecer_hyperframes.md`**: Análise técnica do HyperFrames
