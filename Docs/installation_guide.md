# Guia Completo de Instalação e Configuração do Ambiente

**Objetivo**: Fornecer instruções passo-a-passo para Claude instalar e configurar todo o ambiente necessário para rodar o projeto HyperFrames Video Generator.

**Público**: Claude (agente IA) e desenvolvedores que desejam replicar o setup.

---

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Visão Geral da Arquitetura](#visão-geral-da-arquitetura)
3. [Instalação Passo-a-Passo](#instalação-passo-a-passo)
4. [Configuração de Credenciais](#configuração-de-credenciais)
5. [Validação do Setup](#validação-do-setup)
6. [Troubleshooting](#troubleshooting)
7. [Próximos Passos](#próximos-passos)

---

## Pré-requisitos

Antes de começar, certifique-se de que você tem acesso a:

### 1. **Sistema Operacional**
- macOS (recomendado) ou Linux (Ubuntu 20.04+)
- Windows com WSL2 (Windows Subsystem for Linux)

### 2. **Software Base Instalado**
- **Git**: Para clonar repositórios
- **Node.js 22+**: Runtime JavaScript
- **npm ou pnpm**: Gerenciador de pacotes
- **FFmpeg**: Processamento de vídeo e áudio

### 3. **Contas e Credenciais Necessárias**
- **Figma**: Acesso a um projeto com designs
- **HeyGen**: Conta para TTS (Text-to-Speech)
- **GitHub**: Para clonar repositórios (opcional)

### 4. **Espaço em Disco**
- Mínimo: 5GB (para dependências e projetos)
- Recomendado: 20GB (para vídeos renderizados)

---

## Visão Geral da Arquitetura

Antes de instalar, entenda o que você está instalando:

```
┌─────────────────────────────────────────────────────────┐
│                    PROJETO CLAUDE                        │
│  (Orquestração de todo o fluxo de geração de vídeos)    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┬──────────────┐
        │            │            │              │
        ▼            ▼            ▼              ▼
    ┌────────┐  ┌────────┐  ┌────────┐    ┌──────────┐
    │ FIGMA  │  │HEYGEN  │  │HYPER   │    │ NODE.JS  │
    │  MCP   │  │  TTS   │  │FRAMES  │    │ + NPM    │
    │        │  │        │  │        │    │          │
    └────────┘  └────────┘  └────────┘    └──────────┘
    (Designs)  (Narração)  (Vídeos)    (Automação)
```

### Componentes Principais

| Componente | Função | Instalação |
|-----------|--------|-----------|
| **Node.js 22+** | Runtime para scripts | Sistema operacional |
| **npm/pnpm** | Gerenciador de pacotes | Com Node.js |
| **HyperFrames CLI** | Renderização de vídeos | npm install |
| **HeyGen CLI** | Geração de TTS | npm install |
| **Figma MCP** | Leitura de designs | npm install |
| **FFmpeg** | Processamento de mídia | Sistema operacional |
| **GSAP** | Animações | npm install |

---

## Instalação Passo-a-Passo

### Passo 1: Verificar Pré-requisitos

Abra seu terminal e verifique se você tem tudo instalado:

```bash
# Verificar Node.js
node --version
# Esperado: v22.0.0 ou superior

# Verificar npm
npm --version
# Esperado: 10.0.0 ou superior

# Verificar Git
git --version
# Esperado: git version 2.x.x ou superior

# Verificar FFmpeg
ffmpeg -version
# Esperado: ffmpeg version 4.x.x ou superior
```

**Se algum comando não funcionar**, veja a seção [Instalação de Dependências do Sistema](#instalação-de-dependências-do-sistema).

### Passo 2: Criar Estrutura de Diretórios

Crie a estrutura base do projeto:

```bash
# Criar diretório principal
mkdir -p ~/projetos/hyperframes-video-generator
cd ~/projetos/hyperframes-video-generator

# Criar subdiretorios
mkdir -p .claude
mkdir -p docs/user-stories
mkdir -p docs/design-specs
mkdir -p figma/imported-assets
mkdir -p hyperframes/projects
mkdir -p hyperframes/scripts
mkdir -p hyperframes/templates
mkdir -p scripts
mkdir -p output/videos
mkdir -p output/narrations
mkdir -p output/assets

# Verificar estrutura criada
tree -L 2
# Ou, se tree não estiver instalado:
find . -type d | head -20
```

**Resultado esperado**: Você deve ver todos os diretórios listados.

### Passo 3: Inicializar Projeto Node.js

Crie um arquivo `package.json` para gerenciar dependências:

```bash
# Entrar no diretório do projeto
cd ~/projetos/hyperframes-video-generator

# Inicializar npm
npm init -y

# Você verá:
# {
#   "name": "hyperframes-video-generator",
#   "version": "1.0.0",
#   ...
# }
```

### Passo 4: Instalar Dependências Node.js

Instale as bibliotecas necessárias:

```bash
# Instalar HyperFrames
npm install hyperframes@latest

# Instalar GSAP (para animações)
npm install gsap

# Instalar HeyGen CLI
npm install -g heygen@latest

# Instalar Figma MCP
npm install figma-console-mcp

# Instalar dotenv (para variáveis de ambiente)
npm install dotenv

# Verificar instalação
npm list
```

**O que está sendo instalado**:
- **hyperframes**: Framework para renderizar vídeos
- **gsap**: Biblioteca de animações JavaScript
- **heygen**: CLI para geração de TTS
- **figma-console-mcp**: MCP para acessar Figma
- **dotenv**: Gerenciador de variáveis de ambiente

### Passo 5: Instalar HyperFrames CLI Globalmente

O HyperFrames CLI é necessário para comandos de linha de comando:

```bash
# Instalar globalmente
npm install -g hyperframes

# Verificar instalação
hyperframes --version
# Esperado: 0.7.57 ou superior

# Testar comando básico
hyperframes --help
# Deve listar todos os comandos disponíveis
```

### Passo 6: Instalar HeyGen CLI

O HeyGen CLI é necessário para gerar narração em português:

```bash
# Instalar HeyGen CLI
npm install -g heygen

# Verificar instalação
heygen --version
# Esperado: 0.3.0 ou superior

# Testar comando básico
heygen --help
```

### Passo 7: Verificar FFmpeg

FFmpeg é necessário para processamento de áudio e vídeo:

```bash
# Verificar se FFmpeg está instalado
ffmpeg -version

# Se não estiver instalado, instale:
# macOS (com Homebrew)
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get update
sudo apt-get install ffmpeg

# Verificar novamente
ffmpeg -version
```

### Passo 8: Criar Arquivos de Configuração

Crie os arquivos de configuração do projeto:

#### 8.1 Arquivo: `.claude/claude.json`

```bash
cat > .claude/claude.json << 'EOF'
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
    }
  }
}
EOF
```

#### 8.2 Arquivo: `.claude/mcp-config.json`

```bash
cat > .claude/mcp-config.json << 'EOF'
{
  "mcpServers": {
    "figma": {
      "command": "node",
      "args": ["./node_modules/figma-console-mcp/index.js"],
      "env": {
        "FIGMA_TOKEN": "${FIGMA_TOKEN}",
        "FIGMA_FILE_ID": "${FIGMA_FILE_ID}"
      }
    }
  }
}
EOF
```

#### 8.3 Arquivo: `.claude/instructions.md`

Copie o conteúdo do arquivo `instructions.md` fornecido anteriormente para `.claude/instructions.md`.

### Passo 9: Criar Arquivo `.env`

Crie um arquivo para armazenar suas credenciais:

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo (use seu editor favorito)
nano .env
# ou
vim .env
# ou
code .env  # Se usar VS Code
```

**Conteúdo do `.env`**:

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

### Passo 10: Criar Scripts de Automação

Crie os scripts que automatizam o fluxo:

#### 10.1 Script: `hyperframes/scripts/import-figma.mjs`

```bash
cat > hyperframes/scripts/import-figma.mjs << 'EOF'
#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const storyId = args.find(arg => arg.startsWith('--story='))?.split('=')[1];

if (!storyId) {
  console.error('Uso: node import-figma.mjs --story=us-001');
  process.exit(1);
}

const storyPath = `docs/user-stories/${storyId}.md`;
const storyContent = readFileSync(storyPath, 'utf-8');

console.log(`📖 Lendo história: ${storyId}`);

const figmaUrlMatch = storyContent.match(/\*\*URL\*\*:\s*(https:\/\/figma\.com\/file\/[^\s]+)/);
if (!figmaUrlMatch) {
  console.error('❌ URL Figma não encontrada na história');
  process.exit(1);
}

const figmaUrl = figmaUrlMatch[1];
console.log(`🎨 URL Figma: ${figmaUrl}`);

console.log('📥 Importando assets do Figma...');
try {
  execSync(`npx hyperframes figma asset "${figmaUrl}" --project hyperframes/projects/${storyId}`, {
    stdio: 'inherit'
  });
  console.log('✅ Assets importados com sucesso');
} catch (error) {
  console.error('❌ Erro ao importar assets:', error.message);
}

console.log(`\n✨ Importação concluída para ${storyId}`);
EOF

chmod +x hyperframes/scripts/import-figma.mjs
```

#### 10.2 Script: `hyperframes/scripts/generate-narration.mjs`

```bash
cat > hyperframes/scripts/generate-narration.mjs << 'EOF'
#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const storyId = args.find(arg => arg.startsWith('--story='))?.split('=')[1];
const voice = args.find(arg => arg.startsWith('--voice='))?.split('=')[1] || 'pt-BR';

if (!storyId) {
  console.error('Uso: node generate-narration.mjs --story=us-001 --voice=pt-BR');
  process.exit(1);
}

const storyPath = `docs/user-stories/${storyId}.md`;
const storyContent = readFileSync(storyPath, 'utf-8');

const narrationMatch = storyContent.match(/## Narração \(Português\)\n\n"(.+?)"/s);
if (!narrationMatch) {
  console.error('❌ Narração não encontrada na história');
  process.exit(1);
}

const narrationText = narrationMatch[1];
console.log(`🎙️ Narração extraída (${narrationText.length} caracteres)`);

const audioRequest = {
  lang: voice,
  lines: [{ id: 'narration', text: narrationText }],
  bgm: { mode: 'retrieve', query: 'background music soft professional' }
};

const requestPath = `hyperframes/projects/${storyId}/audio_request.json`;
writeFileSync(requestPath, JSON.stringify(audioRequest, null, 2));

console.log('🎵 Gerando narração com TTS...');
try {
  execSync(`node skills/media-use/audio/scripts/audio.mjs --request ${requestPath} --out hyperframes/projects/${storyId}/audio_meta.json`, {
    stdio: 'inherit'
  });
  console.log('✅ Narração gerada com sucesso');
} catch (error) {
  console.error('❌ Erro ao gerar narração:', error.message);
}

console.log(`\n✨ Narração gerada para ${storyId}`);
EOF

chmod +x hyperframes/scripts/generate-narration.mjs
```

#### 10.3 Script: `hyperframes/scripts/create-animation.mjs`

```bash
cat > hyperframes/scripts/create-animation.mjs << 'EOF'
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

const audioMetaPath = `hyperframes/projects/${storyId}/audio_meta.json`;
const audioMeta = JSON.parse(readFileSync(audioMetaPath, 'utf-8'));
const totalDuration = audioMeta.total_duration_s;

console.log(`⏱️ Duração total: ${totalDuration}s`);

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
  </div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
</body>
</html>
`;

const compositionPath = `hyperframes/projects/${storyId}/composition.html`;
writeFileSync(compositionPath, compositionTemplate);
console.log(`📄 Composition criada: ${compositionPath}`);

console.log(`\n✨ Animação criada para ${storyId}`);
EOF

chmod +x hyperframes/scripts/create-animation.mjs
```

#### 10.4 Script: `hyperframes/scripts/render-video.mjs`

```bash
cat > hyperframes/scripts/render-video.mjs << 'EOF'
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
}

console.log(`\n✨ Vídeo pronto para ${storyId}`);
EOF

chmod +x hyperframes/scripts/render-video.mjs
```

### Passo 11: Atualizar `package.json` com Scripts

Atualize o arquivo `package.json` para adicionar scripts de conveniência:

```bash
cat > package.json << 'EOF'
{
  "name": "hyperframes-video-generator",
  "version": "1.0.0",
  "description": "Gera vídeos profissionais de jornadas de usuário com HyperFrames",
  "type": "module",
  "scripts": {
    "import-figma": "node hyperframes/scripts/import-figma.mjs",
    "generate-narration": "node hyperframes/scripts/generate-narration.mjs",
    "create-animation": "node hyperframes/scripts/create-animation.mjs",
    "render-video": "node hyperframes/scripts/render-video.mjs",
    "pipeline": "npm run import-figma && npm run generate-narration && npm run create-animation && npm run render-video",
    "clean": "rm -rf hyperframes/projects/*/output"
  },
  "dependencies": {
    "hyperframes": "^0.7.57",
    "gsap": "^3.12.2",
    "heygen": "^0.3.0",
    "figma-console-mcp": "^1.0.0",
    "dotenv": "^16.0.0"
  },
  "engines": {
    "node": ">=22.0.0"
  }
}
EOF
```

---

## Configuração de Credenciais

### Passo 1: Obter Token Figma

1. Acesse [figma.com](https://figma.com)
2. Faça login em sua conta
3. Vá para **Settings** → **Personal access tokens**
4. Clique em **Generate a new token**
5. Copie o token gerado
6. Cole no arquivo `.env`:

```bash
FIGMA_TOKEN=seu_token_aqui
```

### Passo 2: Obter File ID Figma

1. Abra o arquivo Figma que contém seus designs
2. Na URL, procure por: `https://figma.com/file/[FILE_ID]/...`
3. Copie o `[FILE_ID]`
4. Cole no arquivo `.env`:

```bash
FIGMA_FILE_ID=seu_file_id_aqui
```

### Passo 3: Configurar HeyGen para TTS

1. Acesse [heygen.com](https://heygen.com)
2. Faça login ou crie uma conta
3. Vá para **Settings** → **API Keys**
4. Gere uma nova chave de API
5. Copie a chave
6. Cole no arquivo `.env`:

```bash
HEYGEN_API_KEY=sua_api_key_aqui
```

### Passo 4: Autenticar HeyGen CLI

Execute o comando de autenticação:

```bash
# Autenticar com OAuth (recomendado - acesso gratuito)
heygen auth login --oauth

# Ou com API Key
heygen auth login --api-key sua_api_key_aqui

# Verificar status
heygen auth status
```

---

## Validação do Setup

### Teste 1: Verificar Instalações

```bash
# Verificar Node.js
node --version

# Verificar npm
npm --version

# Verificar HyperFrames CLI
hyperframes --version

# Verificar HeyGen CLI
heygen --version

# Verificar FFmpeg
ffmpeg -version

# Verificar Git
git --version
```

**Esperado**: Todos os comandos devem retornar versões.

### Teste 2: Verificar Estrutura de Diretórios

```bash
# Listar estrutura
tree -L 2

# Ou verificar manualmente
ls -la
ls -la .claude/
ls -la hyperframes/
ls -la output/
```

**Esperado**: Todos os diretórios devem estar presentes.

### Teste 3: Verificar Configurações

```bash
# Verificar se .env existe
cat .env

# Verificar se claude.json existe
cat .claude/claude.json

# Verificar se mcp-config.json existe
cat .claude/mcp-config.json
```

**Esperado**: Todos os arquivos devem existir e conter as configurações corretas.

### Teste 4: Testar HyperFrames

```bash
# Testar comando básico
hyperframes --help

# Testar lint (validação)
hyperframes lint .

# Esperado: Deve listar todos os comandos disponíveis
```

### Teste 5: Testar HeyGen TTS

```bash
# Testar geração de TTS simples
heygen tts --text "Olá, este é um teste de narração em português" --lang pt-BR --output test-voice.mp3

# Verificar se arquivo foi criado
ls -lh test-voice.mp3

# Limpar arquivo de teste
rm test-voice.mp3
```

**Esperado**: Arquivo de áudio deve ser criado com sucesso.

### Teste 6: Testar Figma MCP

```bash
# Verificar se Figma MCP foi instalado
npm list figma-console-mcp

# Esperado: Deve listar a versão instalada
```

---

## Troubleshooting

### Problema 1: Node.js não encontrado

**Sintoma**: `command not found: node`

**Solução**:
```bash
# Instalar Node.js via Homebrew (macOS)
brew install node@22

# Ou via apt (Ubuntu)
sudo apt-get install nodejs npm

# Verificar instalação
node --version
```

### Problema 2: FFmpeg não encontrado

**Sintoma**: `command not found: ffmpeg`

**Solução**:
```bash
# macOS
brew install ffmpeg

# Ubuntu
sudo apt-get install ffmpeg

# Verificar
ffmpeg -version
```

### Problema 3: HeyGen CLI não funciona

**Sintoma**: `command not found: heygen`

**Solução**:
```bash
# Reinstalar globalmente
npm install -g heygen@latest

# Verificar
heygen --version

# Se ainda não funcionar, use npx
npx heygen --version
```

### Problema 4: Credenciais não funcionam

**Sintoma**: Erro ao tentar usar Figma ou HeyGen

**Solução**:
```bash
# Verificar se .env está carregado
cat .env

# Verificar se tokens são válidos
# Figma
curl -H "X-Figma-Token: $FIGMA_TOKEN" https://api.figma.com/v1/me

# HeyGen
heygen auth status
```

### Problema 5: Permissão negada em scripts

**Sintoma**: `Permission denied: ./hyperframes/scripts/import-figma.mjs`

**Solução**:
```bash
# Dar permissão de execução
chmod +x hyperframes/scripts/*.mjs

# Verificar
ls -l hyperframes/scripts/
```

### Problema 6: Espaço em disco insuficiente

**Sintoma**: Erro ao renderizar vídeos

**Solução**:
```bash
# Verificar espaço disponível
df -h

# Limpar cache
npm cache clean --force

# Limpar projetos antigos
rm -rf hyperframes/projects/*/output
```

---

## Próximos Passos

Após completar a instalação e validação:

### 1. Criar Primeira História de Usuário

```bash
# Criar arquivo de história
cat > docs/user-stories/us-001-signup.md << 'EOF'
# US-001: Cadastro e Assinatura

## Contexto
- **Como** usuário visitante
- **Quero** me cadastrar na plataforma
- **Para que** eu possa acessar conteúdos

## Figma
**URL**: https://figma.com/file/...

## Narração (Português)
"Bem-vindo ao processo de cadastro. Aqui você preenche seus dados..."

## Critérios de Aceitação
- [ ] Formulário com validação
- [ ] Integração IUGU
EOF
```

### 2. Testar Pipeline Completo

```bash
# Executar pipeline para primeira história
npm run pipeline -- --story=us-001

# Verificar resultado
ls -lh output/videos/us-001.mp4
```

### 3. Revisar Documentação

- Leia `Guia de Tom e Estilo de Narração` para entender como gerar scripts
- Leia `claude_project_setup.md` para detalhes de arquitetura
- Consulte exemplos em `docs/user-stories/`

### 4. Integrar com Claude

Configure Claude para usar este projeto:

```bash
# Copiar instruções para Claude
cat .claude/instructions.md

# Claude pode agora:
# - Ler histórias de usuário
# - Importar designs do Figma
# - Gerar narrações em português
# - Criar animações
# - Renderizar vídeos
```

---

## Resumo de Comandos Úteis

```bash
# Setup
npm install
heygen auth login --oauth

# Desenvolvimento
npm run import-figma -- --story=us-001
npm run generate-narration -- --story=us-001
npm run create-animation -- --story=us-001
npm run render-video -- --story=us-001

# Pipeline completo
npm run pipeline -- --story=us-001

# Limpeza
npm run clean
npm cache clean --force

# Validação
hyperframes lint .
heygen auth status
```

---

## Conclusão

Você agora tem um ambiente completo e funcional para gerar vídeos profissionais de jornadas de usuário! 

**Próximo passo**: Crie sua primeira história de usuário e execute o pipeline para gerar seu primeiro vídeo.

Para suporte, consulte:
- [HyperFrames Docs](https://github.com/heygen-com/hyperframes)
- [HeyGen Docs](https://help.heygen.com)
- [Figma API Docs](https://www.figma.com/developers/api)
