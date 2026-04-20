# @nox/api

Backend do Nox, FastAPI + SQLAlchemy 2.0 async + Celery + Alembic.

## Pré-requisitos

- Python 3.11+
- Poetry 1.8+
- Docker (para Postgres + Redis locais via `pnpm docker:up` na raiz)

## Setup

```bash
cd apps/api
poetry install
```

Copie o `.env.example` da raiz para `.env` e preencha as chaves que for usar.

## Rodar

Com o Postgres e Redis no ar (`pnpm docker:up` na raiz):

```bash
# API
poetry run uvicorn app.main:app --reload --port 8000

# Worker Celery (outro terminal)
poetry run celery -A app.core.celery_app worker --loglevel=info

# Beat scheduler (outro terminal, só precisa em dev se você quer testar cron)
poetry run celery -A app.core.celery_app beat --loglevel=info
```

Smoke: `curl http://localhost:8000/health`

## Migrations

```bash
# Criar nova migration (após alterar models)
poetry run alembic revision --autogenerate -m "add users table"

# Aplicar
poetry run alembic upgrade head

# Rollback 1
poetry run alembic downgrade -1
```

## Estrutura

```
app/
├── main.py             FastAPI app + lifespan
├── core/
│   ├── config.py       Settings (pydantic-settings)
│   ├── database.py     Async engine + session
│   ├── security.py     AES-256-GCM para tokens bancários
│   ├── logging.py      structlog
│   └── celery_app.py   Celery + Beat schedule
├── routers/            HTTP endpoints (routers finos)
├── services/           Lógica de negócio (services grossos)
│   └── agents/         Motor dos 4 agentes (Sprint 4)
├── models/             SQLAlchemy
├── schemas/            Pydantic v2
└── tasks/              Celery tasks (heartbeats, sync, categorização)

alembic/                Migrations
tests/                  Pytest
```

## Regras inegociáveis

- async/await em tudo que for I/O
- Routers finos, services grossos
- Tokens bancários **sempre** encriptados via `core.security.encrypt_token`
- Nunca logar tokens, senhas ou PII
- Sync bancário e chamadas OpenAI **sempre** via Celery task, nunca no request

Veja `.cursorrules` e `PLANO_DESENVOLVIMENTO.md` na raiz.
