# Handoff, próximo Cowork (Nox)

> Cole o bloco abaixo na primeira mensagem do próximo Cowork. Ele é autossuficiente: o novo agente não precisa ler histórico nenhum, só os arquivos do repo.

---

## Prompt pra colar no próximo Cowork

```
Oi. Sou o Maycon (mancilhamaycon@gmail.com) e estou retomando o desenvolvimento do Nox num chat novo pra economizar custo. Leia este briefing inteiro antes de responder.

## O que é o Nox
SaaS brasileiro de finanças pessoais com 4 agentes de IA autônomos (Sentinela, Oráculo, Norte, Companheiro). Tagline: "Enquanto você dorme, eu cuido do seu dinheiro." Tudo em pt-BR pro usuário, commits em inglês semântico.

## Onde está o código
Pasta selecionada: C:\Users\mmanc\Music\nox-finance (monorepo, raiz do git).
Repositório remoto: https://github.com/mmancilha/nox-finance

## Leituras obrigatórias ANTES de codar qualquer coisa (nessa ordem)
1. `.cursorrules` — regras inegociáveis (tokens da marca, TS strict, AES-256-GCM, pt-BR)
2. `PLANO_DESENVOLVIMENTO.md` — arquitetura, schema do banco, roadmap dos sprints
3. `COWORK_BRIEFING.md` — persona do dev, tom, definition of done
4. `nox-design/` — HTMLs de referência do design system visual (copiar pixel-perfect)
5. `README.md` — setup local e estrutura

## Status atual
- **Sprint 1 — Fundação: CONCLUÍDO ✅** (merged em main via PR #1)
- **Sprint 2 — Auth + Landing: CONCLUÍDO ✅** (merged em main via PR #1)
- **Sprint 3 — Pluggy Integration: CONCLUÍDO ✅** (PR #2 draft em `feat/sprint-3-pluggy`)
- **Sprint 4 — Agentes: CONCLUÍDO ✅** (commits na mesma branch `feat/sprint-3-pluggy`)

### O que foi entregue no Sprint 3
**Backend:**
- Models: `Category`, `BankAccount`, `Transaction` (UNIQUE em `pluggy_transaction_id`)
- `PluggyService` — auth cacheada + `asyncio.Lock`, paginação automática
- `BankService` — `save_item_accounts` (idempotente), `sync_account_transactions`
- Celery task `sync_account` com retry (max 3)
- Endpoints: `GET /banks/connect-token`, `POST /banks/items/{id}`, `GET /banks/accounts`, `GET /banks/accounts/{id}/transactions`, `POST /banks/accounts/{id}/sync`, `POST /webhook/pluggy` (HMAC-SHA256)
- Migration Alembic para as 3 tabelas

**Frontend:**
- `StepConectarBanco.tsx` — Pluggy Connect Widget via CDN (npm 404), helper `loadPluggyConnectFromCdn()`, máquina de estados `idle → loading → connecting → saving → success | error`
- `types/pluggy-connect.d.ts`, Vitest setup com jsdom + `@testing-library/jest-dom/vitest`

### O que foi entregue no Sprint 4

**Backend (apps/api):**
- `app/agents/base.py` — `NoxAgent` (ABC) + `AgentResult`; `_chat()` bifurcado (mypy strict); fallback em toda chamada OpenAI
- `app/models/agent_insight.py` — `AgentInsight` com JSONB + índice composto `(user_id, agent_type, created_at)`
- Migration `79fc5d14d405_feat_agent_insights_table.py`
- `app/agents/sentinela.py` — reativo (últimas 48h), gpt-4o-mini
- `app/agents/oraculo.py` — semanal (domingo 20h), gpt-4o, `should_run()` guarda por 6 dias
- `app/agents/norte.py` — diário (8h), gpt-4o-mini, idempotente via `func.date()`
- `app/agents/companheiro.py` — chat SSE, gpt-4o, `stream_chat()` com `AsyncIterator[str]`, persiste insight ao final
- `app/tasks/agents.py` — 3 Celery tasks (`run_sentinela`, `run_oraculo_all_users`, `run_norte_all_users`) com `asyncio.run()` + retry
- `app/core/database.py` — `get_async_session()` como `@asynccontextmanager`
- Beat schedule apontando para tasks reais (Oráculo + Norte)
- `app/routers/agents.py` — `POST /agents/chat` (SSE), `GET /agents/insights`, `GET /agents/insights/{agent_type}`, `PATCH /agents/insights/{id}/read`
- `app/schemas/agent.py` — `ChatRequest`, `ChatMessage`, `AgentInsightResponse`
- `conftest.py` — JSONB monkey-patch para SQLite, `auth_client` fixture
- **56/56 testes pytest, mypy --strict 0 issues em 45 arquivos**

**Frontend (apps/web):**
- `app/(dashboard)/dashboard/page.tsx` — Server Component; busca insights via JWT; saudação dinâmica (bom dia/tarde/noite)
- `_components/AgentCard.tsx` — Client Component; badge não-lido; `markAsRead()` via PATCH; role="button" + a11y completo
- `_components/CompanheiroChat.tsx` — Client Component; streaming via `fetch` + `ReadableStream`; `replaceLast()` helper para `noUncheckedIndexedAccess`; `void sendMessage()` em todos os handlers
- `vitest.setup.ts` — `scrollIntoView` mock global
- **11/11 testes Vitest, tsc --noEmit 0 erros, ESLint 0 warnings**

## Decisões já travadas (não revisitar)
- Monorepo direto em `nox-finance/` (sem subfolder extra)
- **Auth: NextAuth v5 + JWT** (não Supabase Auth)
- **pnpm workspaces puro** (sem Turbo/Nx por enquanto)
- Python 3.12 local / 3.11 declarado no `pyproject.toml`
- Celery com timezone `America/Sao_Paulo`
- Tokens de marca **apenas** em `apps/web/styles/tokens.css` + `tailwind.config.ts`
- Cores: bg `#080808`, bg2 `#101010`, bg3 `#181818`, txt `#F5F5F7`, accent `#F07854`, green `#30D158`, red `#FF453A`
- Fonte: DM Sans (weights 300/400/500/700/800) via `next/font`
- Pluggy Connect Widget: **CDN only** (`@pluggy/connect-sdk-js` não existe no npm)
- Vitest: `@vitejs/plugin-react@^4.3.0` (v6 exige Vite 8, incompatível com Vitest 2 + Vite 5)
- JSONB no model `AgentInsight`: monkey-patch `visit_JSONB → TEXT` isolado no conftest de testes
- `_chat()` do NoxAgent: branches explícitas `json_mode: True/False` (resolve overloads mypy do openai SDK)
- `CompanheiroChat`: `replaceLast()` helper para evitar indexação direta (`noUncheckedIndexedAccess`)

## Fluxo de trabalho (obrigatório)
- Maycon usa Cursor pra executar comandos locais. Eu (Cowork) **não rodo bash no ambiente dele**, eu entrego **prompts prontos em bloco de código** pra ele colar no Cursor.
- Sempre em branch nova: `feat/sprint-N-<slug>`. Nunca commit direto em `main`.
- Commits semânticos em inglês: `feat:`, `fix:`, `chore:`, `refactor:`, escopo opcional.
- TS strict sempre. Python com type hints e `mypy --strict`. Nada de `any` / `Any` sem justificativa.
- Segurança: nunca logar token, senha ou chave. Tokens de banco **sempre** criptografados com AES-256-GCM.
- Docker está em `infra/` (não na raiz). Para subir: `docker compose -f infra/docker-compose.yml up -d`.
- Redis na porta `6379`, Postgres na `5432`.

## Pendências antes do Sprint 5
1. **Fazer squash/merge do PR #2** — o PR draft cobre Sprint 3 + Sprint 4 inteiro (branch `feat/sprint-3-pluggy`). Remover o draft com `gh pr ready 2`, revisar e mergear. Ou criar um PR separado para o Sprint 4.
2. **Testar o dashboard manualmente** — subir backend (`poetry run uvicorn app.main:app --reload`) + frontend (`pnpm dev`) e verificar: saudação dinâmica, cards dos agentes, chat do Companheiro com streaming real.
3. **Variável `OPENAI_API_KEY`** — confirmar que está no `.env` para os agentes funcionarem.

## Próximo sprint — Sprint 5: Polish + Deploy

Entregáveis:
1. **Animações Framer Motion** — entrada dos cards dos agentes, transição de onboarding
2. **TanStack Query** — substituir os fetches manuais nos Client Components por `useQuery`/`useMutation`
3. **Testes E2E (Playwright)** — fluxos críticos: login → onboarding → dashboard → chat
4. **Notificações por email (Resend)** — insight do Sentinela por email quando detectar anomalia
5. **Deploy**:
   - Frontend: Vercel (conectar repo GitHub, env vars)
   - Backend: Railway (FastAPI + Celery + Celery Beat)
   - Redis: Upstash
   - Postgres: Supabase (ou Railway Postgres)
6. **Sentry** — error tracking no frontend e backend

## Como começar
1. Leia os 5 arquivos listados acima.
2. Confirme: (a) PR #2 mergeado ou nova branch criada? (b) backend rodando local? (c) dashboard visível com os cards?
3. Proponha a ordem dos entregáveis do Sprint 5 com trade-offs.

Pode começar lendo os arquivos.
```

---

## Dicas extras pra você (Maycon)

- **PR #2** cobre Sprint 3 + Sprint 4. Quando quiser mergear, rode `gh pr ready 2` para remover o draft e depois revise no GitHub.
- Sprint 5 é o sprint de polish e deploy — pode ser dividido em "Deploy primeiro" (Vercel + Railway) ou "Animações + TanStack Query primeiro". Traga isso como primeira pergunta pro Cowork.
- O chat do Companheiro usa streaming real via `fetch + ReadableStream`. Para testar, o backend precisa estar rodando com `OPENAI_API_KEY` válida.
- Todos os sprints 1–4 estão na branch `feat/sprint-3-pluggy`. Após o merge, a `main` estará com o projeto completo até o Sprint 4.
