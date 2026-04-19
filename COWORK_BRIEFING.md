# 🌙 Nox — Briefing para Claude Cowork

> Documento a ser colado/carregado no início do projeto no Claude Cowork para que ele entenda o contexto completo e possa automatizar o desenvolvimento.

---

## 🎯 O que é o Nox

**Nox** é um SaaS brasileiro de finanças pessoais com agentes de IA autônomos que monitoram a vida financeira do usuário 24 horas por dia.

**Tagline**: "Enquanto você dorme, eu cuido do seu dinheiro."

**Diferencial vs concorrentes (Pierre, Mobills, Organizze)**: em vez de ser um app reativo, o Nox tem 4 agentes autônomos que trabalham em background (scheduled) e notificam proativamente.

---

## 👤 Persona do Desenvolvedor

Eu sou **Maycon**, desenvolvedor solo tocando o projeto. Uso Cursor + Claude Cowork. Meu stack de preferência:

- **Frontend**: React/Next.js + TypeScript + Tailwind
- **Backend**: Python/FastAPI ou Node (aberto a sugestões)
- **Desktop/dev tools**: VS Code + Cursor
- **OS**: Windows 11 (path: `C:\Users\MMANCILHA\...`)

Já desenvolvi anteriormente um assistente J.A.R.V.I.S. (Python/FastAPI + React) — tenho familiaridade com stacks modernas mas valorizo código limpo e bem organizado.

---

## 🎨 Marca — Informações Fundamentais

**Nome**: Nox
**Fonte**: DM Sans (Google Fonts, pesos 300/400/500/700/800)
**Cor principal**: `#F07854` (âmbar-coral quente)
**Fundo**: `#080808` (preto dark mode, não é `#000` nem `#0A0A0A`)
**Aesthetic**: Pierre Finance + Apple dark mode + elegância do Linear

**Paleta completa**:

```
--bg: #080808    --txt: #F5F5F7    --accent: #F07854
--bg2: #101010   --txt2: #A1A1A6   --green: #30D158
--bg3: #181818   --txt3: #6C6C70   --red: #FF453A
--border: #222   --border2: #161616
```

**Design já pronto** (feito no Claude Design): landing page, design system, tela do app e hero. Arquivos HTML gerados servem como referência visual e de copy.

---

## 🏗️ Arquitetura do Projeto

```
MONOREPO (pnpm workspaces)

apps/
├── web/         Next.js 14 (App Router) + TypeScript + Tailwind
└── api/         FastAPI + Python 3.11 + Celery + Redis

Infra externa:
- Supabase (Postgres + Auth + Storage)
- Upstash Redis (cache + queue)
- Pluggy (Open Finance Brasil)
- OpenAI (gpt-4o-mini + gpt-4o)
- Resend (email)
- Stripe (pagamentos, fase 2)
```

---

## 🤖 Os 4 Agentes (coração do produto)

Cada agente é uma classe Python que roda em Celery tasks e tem prompt system próprio.

| Agente          | Quando roda                     | Modelo IA   | O que faz                                             |
| --------------- | ------------------------------- | ----------- | ----------------------------------------------------- |
| **Sentinela**   | Webhook Pluggy (nova transação) | gpt-4o-mini | Detecta duplicatas, anomalias, assinaturas esquecidas |
| **Oráculo**     | Celery Beat — Domingo 20h       | gpt-4o      | Análise semanal, previsões, relatório mensal          |
| **Norte**       | Celery Beat — Diário 8h         | gpt-4o-mini | Monitora metas e orçamentos                           |
| **Companheiro** | On-demand (chat)                | gpt-4o      | Chat conversacional em pt-BR                          |

Cada agente tem:

- Nome
- Personalidade (prompt system em pt-BR)
- Modelo padrão
- Orçamento mensal de tokens (rate-limit por usuário)
- Método `should_run()` (checa se deve rodar agora)
- Método `run()` (executa e retorna insights)

---

## 📋 Tarefas Prioritárias para o Cowork

Quando eu iniciar o projeto no Claude Cowork, quero que ele me ajude nessa ordem:

### 🥇 Sprint 1 — Setup (prioridade máxima)

1. Criar monorepo com pnpm workspaces (`apps/web`, `apps/api`, `packages/shared-types`)
2. Configurar Docker Compose com Postgres + Redis locais
3. Configurar Next.js 14 com TypeScript strict, Tailwind com tokens Nox, DM Sans via next/font
4. Configurar FastAPI com SQLAlchemy async, Alembic, estrutura `routers/services/models/schemas`
5. Configurar Celery + Celery Beat conectado ao Redis
6. Setup de linters: ESLint + Prettier (FE), Ruff + Black (BE)
7. Criar `.env.example` completo
8. README principal com instruções de setup

### 🥈 Sprint 2 — Auth + Landing

1. Implementar landing page baseada nos HTML exportados do Claude Design
2. NextAuth v5 com Email + Google provider
3. Backend: endpoints `/auth/register`, `/auth/login`, `/auth/refresh`
4. Middleware de proteção de rotas
5. Tela de onboarding (5 passos)

### 🥉 Sprint 3 — Pluggy Integration

1. Service `PluggyService` com métodos `create_connect_token`, `sync_accounts`, `sync_transactions`
2. Webhook endpoint `/webhook/pluggy` idempotente
3. Modelos SQLAlchemy: `BankAccount`, `Transaction`, `Category`
4. Migration inicial com Alembic
5. Celery task `sync_account` que roda em background
6. Encriptação AES-256 dos tokens bancários

### Sprint 4 — Agentes

1. Classe base `NoxAgent`
2. Implementação das 4 classes: `Sentinela`, `Oraculo`, `Norte`, `Companheiro`
3. Prompts system em pt-BR para cada agente
4. Celery Beat schedule para Oráculo e Norte
5. Endpoint `/chat` para o Companheiro com streaming
6. Dashboard com cards dos insights recentes

### Sprint 5 — Polish

1. Animações Framer Motion
2. Testes E2E críticos (Playwright)
3. Notificações por email (Resend)
4. Deploy Vercel + Railway
5. Monitoramento Sentry

---

## 📂 Arquivos de Referência

Ao iniciar o Cowork, já tenho prontos:

1. **`PLANO_DESENVOLVIMENTO.md`** — plano completo com toda arquitetura
2. **`.cursorrules`** — regras de código (Cursor também deve seguir)
3. **Pasta `Nox_design/`** — 4 arquivos HTML exportados do Claude Design com design system, landing page, app mockup
4. **Este briefing** (`COWORK_BRIEFING.md`)

Instrução para o Cowork: **antes de começar a codar, leia os 3 primeiros arquivos e a pasta de design**. Eles contêm 100% do contexto necessário.

---

## 🗣️ Como Quero Conversar com o Cowork

**Sempre em português brasileiro**.

Tom: direto, pragmático. Pode ser técnico. Prefiro que o Cowork:

- Faça perguntas quando há ambiguidade, em vez de chutar
- Proponha melhorias quando achar que tenho um approach pior
- Commita em branches, nunca direto na main
- Escreva commits semânticos em inglês (`feat:`, `fix:`, `chore:`)
- Ao terminar uma tarefa, faça um resumo curto do que foi feito
- Me avise se o que eu pedi conflita com as regras do `.cursorrules`

---

## 🎯 Definition of Done

Uma tarefa só está "pronta" quando:

- [ ] Código passa nos linters (ESLint/Prettier/Ruff/Black)
- [ ] TypeScript sem erros (strict mode)
- [ ] Testes mínimos escritos (pelo menos smoke test)
- [ ] Segue todas as regras do `.cursorrules`
- [ ] Textos ao usuário em pt-BR, valores em R$ formatados
- [ ] Sem dados sensíveis em logs
- [ ] Componentes usam tokens da marca (não cores hardcoded)
- [ ] DM Sans aplicada
- [ ] README/docs atualizados se houver nova feature

---

## 💡 Inspirações (para referenciar quando necessário)

- **Pierre Finance** (`lp.pierre.finance`) — aesthetic, tom brasileiro, landing page
- **Linear** (`linear.app`) — polish, motion, dark mode
- **Apple HIG** — tipografia, espaçamento, hierarquia
- **Paperclip** (`github.com/paperclipai/paperclip`) — arquitetura de agentes, heartbeats, orçamentos de tokens

---

## 🔑 Secrets e Credenciais

Todas vão em `.env` local e nunca commitadas. Serviços que precisam de conta:

- [ ] Supabase (projeto Nox)
- [ ] Upstash Redis
- [ ] Pluggy (sandbox primeiro, produção depois)
- [ ] OpenAI API
- [ ] Resend
- [ ] Google Cloud (OAuth)
- [ ] Sentry
- [ ] Vercel + Railway (deploy)
- [ ] Stripe (fase 2, monetização)

---

## 🚦 Regras de Ouro

1. **Segurança first**: tokens bancários SEMPRE encriptados, LGPD sempre em mente
2. **Performance**: lista > 50 items = paginar + virtualizar
3. **UX**: toda operação demorada = skeleton + loading state
4. **pt-BR**: toda interface ao usuário é em português, com formatação brasileira
5. **Tokens da marca**: nenhum hex color fora do arquivo `tokens.css`
6. **Agentes com fallback**: se a IA falhar, o sistema continua funcionando
7. **Celery para tudo lento**: sync bancário, IA, emails — nunca no request direto

---

## 📞 Primeira mensagem ao Cowork

Quando eu abrir o projeto no Cowork pela primeira vez, vou mandar:

> "Vamos começar o projeto Nox. Por favor leia `PLANO_DESENVOLVIMENTO.md`, `.cursorrules` e `COWORK_BRIEFING.md` antes de qualquer coisa. Depois me diga o que você entendeu do projeto e qual a primeira tarefa que devemos atacar. Siga o Sprint 1 do briefing."

A partir daí, a gente toca o projeto em sprints curtos, uma feature por vez.

---

**Vamos construir o Nox. 🌙**
