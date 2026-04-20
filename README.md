# Nox

> Enquanto você dorme, eu cuido do seu dinheiro.

Assistente financeiro brasileiro com 4 agentes de IA autônomos que monitoram sua vida financeira 24 horas por dia e notificam proativamente.

## Stack

- **Frontend**: Next.js 14 (App Router) · TypeScript strict · Tailwind · DM Sans
- **Backend**: FastAPI · Python 3.11 · SQLAlchemy 2.0 async · Alembic · Celery
- **Infra local**: Docker Compose (Postgres 16 + Redis 7)
- **Infra produção**: Supabase · Upstash Redis · Vercel · Railway
- **Integrações**: Pluggy (Open Finance) · OpenAI · Resend · Stripe · Sentry

## Os 4 agentes

| Agente          | Quando roda                     | Modelo        | Papel                                         |
| --------------- | ------------------------------- | ------------- | --------------------------------------------- |
| **Sentinela**   | Webhook Pluggy (nova transação) | `gpt-4o-mini` | Duplicatas, anomalias, assinaturas esquecidas |
| **Oráculo**     | Celery Beat, domingo 20h        | `gpt-4o`      | Análise semanal, previsões, relatório mensal  |
| **Norte**       | Celery Beat, diário 8h          | `gpt-4o-mini` | Monitora metas e orçamentos                   |
| **Companheiro** | On-demand (chat)                | `gpt-4o`      | Chat conversacional em pt-BR                  |

Implementação completa no Sprint 4 (`apps/api/app/services/agents/`).

---

## Setup local

### Pré-requisitos

- **Node.js** 20+, `nvm install` (usa `.nvmrc`)
- **pnpm** 9+, `npm install -g pnpm@9`
- **Python** 3.11+
- **Poetry** 1.8+, `pipx install poetry`
- **Docker Desktop** (para Postgres + Redis)

### 1. Clone + envs

```bash
git clone <repo> nox
cd nox
cp .env.example .env
# preencha as chaves conforme o sprint (Sprint 1 não precisa de chaves externas)
```

### 2. Instala dependências

```bash
pnpm install
# Instala husky, lint-staged, Prettier e as deps de apps/web + packages/shared-types

cd apps/api && poetry install && cd ../..
# Instala deps Python do backend
```

### 3. Sobe infra local

```bash
pnpm docker:up
# Postgres em :5432 · Redis em :6379
```

### 4. Inicia os serviços

Em terminais separados:

```bash
# Terminal 1, Frontend
pnpm dev
# → http://localhost:3000

# Terminal 2, API
cd apps/api && poetry run uvicorn app.main:app --reload --port 8000
# → http://localhost:8000/docs

# Terminal 3, Celery worker (precisa só quando testar tasks)
cd apps/api && poetry run celery -A app.core.celery_app worker --loglevel=info

# Terminal 4, Celery beat (precisa só quando testar cron)
cd apps/api && poetry run celery -A app.core.celery_app beat --loglevel=info
```

### 5. Smoke

```bash
curl http://localhost:8000/            # mensagem pt-BR
curl http://localhost:8000/health      # db: "up"
```

Landing: abra http://localhost:3000.

---

## Estrutura do monorepo

```
nox-finance/
├── apps/
│   ├── web/              Next.js 14 App Router
│   └── api/              FastAPI + Celery
├── packages/
│   └── shared-types/     Tipos TS compartilhados
├── infra/
│   └── docker-compose.yml
├── docs/                 VSCode settings exemplo
├── nox-design/           HTMLs de referência do Claude Design
├── scripts/              Utilitários (setup-husky.sh)
├── .env.example
├── .cursorrules          Regras obrigatórias de código
├── COWORK_BRIEFING.md    Briefing pra agentes/colaboradores
├── PLANO_DESENVOLVIMENTO.md
└── README.md
```

---

## Scripts úteis (raiz)

```bash
pnpm dev                # frontend
pnpm dev:api            # backend (alias pra poetry uvicorn)
pnpm build              # build de todos workspaces
pnpm lint               # ESLint + Ruff em todos os apps
pnpm typecheck          # tsc --noEmit em todos os workspaces TS
pnpm test               # vitest (web) + pytest (api)
pnpm format             # Prettier write em tudo
pnpm docker:up          # sobe Postgres + Redis
pnpm docker:down        # desliga
pnpm docker:logs        # tail dos containers
```

---

## Convenções

- **Branches**: `feat/<slug>`, `fix/<slug>`, `chore/<slug>`. Nunca commit direto na main.
- **Commits**: semânticos em inglês (`feat: add pluggy connect token`, `fix(agents): handle empty insights`).
- **PR**: descrição em pt-BR, checklist do `.cursorrules`.
- **Textos ao usuário**: sempre pt-BR. Valores em `R$` com `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`.
- **Tokens de marca**: nunca hex hardcoded fora de `styles/tokens.css`. Use `bg-nox-*` via Tailwind.

---

## Sprint atual

**Sprint 1, Fundação ✅**

Monorepo pnpm, Docker, Next.js com tokens da marca + DM Sans, FastAPI com SQLAlchemy async + Alembic, Celery + Beat, linters (ESLint/Prettier/Ruff/Black), `.env.example`, README.

**Próximo, Sprint 2, Auth + Landing**

Ver `PLANO_DESENVOLVIMENTO.md` e `COWORK_BRIEFING.md`.

---

## Leituras obrigatórias antes de codar

1. **`.cursorrules`**, design tokens, regras TS/Python, segurança, pt-BR
2. **`PLANO_DESENVOLVIMENTO.md`**, arquitetura, schema do banco, roadmap
3. **`COWORK_BRIEFING.md`**, persona do dev, tom, definition of done
4. **`nox-design/`**, HTMLs com design system visual
