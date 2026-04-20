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
- **Sprint 1 — Fundação: CONCLUÍDO ✅** (commit `70fad80`, merged em main via PR #1)
- **Sprint 2 — Auth + Landing: CONCLUÍDO ✅** (commit `180be57`, merged em main via PR #1 junto com Sprint 1)
- **Sprint 3 — Pluggy Integration: CONCLUÍDO ✅** (commit `c4920c8`, branch `feat/sprint-3-pluggy`)

### O que foi entregue no Sprint 3 (commit c4920c8)
**Backend (apps/api):**
- Models SQLAlchemy: `Category`, `BankAccount`, `Transaction` (UNIQUE em `pluggy_transaction_id`)
- `PluggyService` — autenticação cacheada com `asyncio.Lock`, paginação automática, `fetch_accounts`, `fetch_transactions`, `fetch_item`
- `BankService` — `save_item_accounts` (idempotente), `sync_account_transactions`, `mark_needs_reconnect`
- Celery task `sync_account` com retry (max 3, delay 60s)
- Router `POST /webhook/pluggy` com HMAC-SHA256 (idempotente), `GET /banks/connect-token`, `POST /banks/items/{item_id}`, `GET /banks/accounts`, `GET /banks/accounts/{id}/transactions`, `POST /banks/accounts/{id}/sync`
- Migration Alembic para as 3 novas tabelas
- Schemas Pydantic: `ConnectTokenResponse`, `BankAccountResponse`, `TransactionResponse`
- 27 testes passando (`test_auth`, `test_banks`, `test_pluggy_service`, `test_smoke`), mypy --strict 0 issues

**Frontend (apps/web):**
- `StepConectarBanco.tsx` — integração real do Pluggy Connect Widget via CDN (`https://cdn.pluggy.ai/pluggy-connect/v2/pluggy-connect.min.js`), helper `loadPluggyConnectFromCdn()` (carrega uma vez, reutiliza `window.PluggyConnect`), máquina de estados `idle → loading → connecting → saving → success | error`
- Fluxo: busca connect token → abre widget → onSuccess recebe `itemId` → POST `/banks/items/{itemId}?access_token={connectToken}` → 2s de feedback visual → `onFinish()`
- `types/pluggy-connect.d.ts` — tipos para `window.PluggyConnect`, `PluggyConnectConfig`, `PluggyConnectSuccessData`
- `OnboardingWizard.tsx` — passa `accessToken` via prop para `StepConectarBanco`
- `vitest.config.ts` + `vitest.setup.ts` com jsdom + `@testing-library/jest-dom/vitest`
- 4/4 testes Vitest passando

## Decisões já travadas (não revisitar)
- Monorepo direto em `nox-finance/` (sem subfolder extra)
- **Auth: NextAuth v5 + JWT** (não Supabase Auth)
- **pnpm workspaces puro** (sem Turbo/Nx por enquanto)
- Python 3.12 local / 3.11 declarado no `pyproject.toml`
- Celery com timezone `America/Sao_Paulo`
- Tokens de marca **apenas** em `apps/web/styles/tokens.css` + `tailwind.config.ts`. Cor hex fora dali é bug.
- Cores: bg `#080808`, bg2 `#101010`, bg3 `#181818`, txt `#F5F5F7`, accent `#F07854`, green `#30D158`, red `#FF453A`
- Fonte: DM Sans (weights 300/400/500/700/800) via `next/font`
- Valores em BRL sempre via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })`, função pronta em `apps/web/lib/format.ts`
- Pluggy Connect Widget: **CDN only** (`@pluggy/connect-sdk-js` não existe no npm — 404)
- `access_token` no `POST /banks/items/{item_id}`: recebe o `connectToken` reutilizado (Pluggy não emite token por-item no widget; backend usa API key global)
- Vitest pinado em `@vitejs/plugin-react@^4.3.0` (v6 exige Vite 8, incompatível com Vitest 2 + Vite 5)

## Fluxo de trabalho (obrigatório)
- Maycon usa Cursor pra executar comandos locais. Eu (Cowork) **não rodo bash no ambiente dele**, eu entrego **prompts prontos em bloco de código** pra ele colar no Cursor.
- Sempre em branch nova: `feat/sprint-N-<slug>`. Nunca commit direto em `main`.
- Commits semânticos em inglês: `feat:`, `fix:`, `chore:`, `refactor:`, escopo opcional.
- Pergunte antes de assumir: se duas abordagens são plausíveis, traga ambas com trade-offs em pt-BR e deixe ele escolher.
- TS strict sempre. Python com type hints e `mypy --strict`. Nada de `any` / `Any` sem justificativa.
- Segurança: nunca logar token, senha ou chave. Tokens de banco **sempre** criptografados com AES-256-GCM (`apps/api/app/core/security.py`).

## Próximo sprint — Sprint 4: Agentes

Entregáveis:
1. **Classe base `NoxAgent`** (`apps/api/app/agents/base.py`) — interface comum: `should_run()`, `run()`, `track_tokens()`, `monthly_token_budget`
2. **`AgentInsight` model** (SQLAlchemy) — armazena insights gerados (agent_type, content, tokens_used, created_at, user_id)
3. **4 agentes implementados**:
   - `Sentinela` (reativo, gpt-4o-mini) — detecta anomalias, duplicatas, assinaturas esquecidas em novas transações
   - `Oráculo` (semanal, gpt-4o) — análise de padrões, previsões, relatório mensal
   - `Norte` (diário, gpt-4o-mini) — monitora metas e orçamentos do usuário
   - `Companheiro` (on-demand, gpt-4o) — chat conversacional em pt-BR
4. **Celery Beat schedule** para Oráculo (domingo 20h) e Norte (diário 8h)
5. **Endpoint `/chat`** com streaming SSE para o Companheiro
6. **Dashboard frontend** com cards dos insights recentes de cada agente
7. **Migration Alembic** para `AgentInsight`
8. **Testes** para cada agente (mock OpenAI) + endpoint `/chat`

Referência de personalidade dos agentes (`.cursorrules`):
- Sentinela: direto, atento. "Notei que..."
- Oráculo: analítico, previsões. "A tendência esse mês é..."
- Norte: coach de metas. "Faltam X para sua meta."
- Companheiro: amigo esperto, nunca julga, sempre construtivo.

Todos os agentes: respostas em pt-BR, `response_format: { type: 'json_object' }` quando esperar JSON, fallback se IA falhar (não quebra o sistema), respeitar `monthly_token_budget`.

## Como começar
1. Leia os 5 arquivos listados acima.
2. Confirme em pt-BR: (a) status do git (Sprint 3 PR aberto/merged?), (b) Docker rodando (Postgres + Redis), (c) `.env` com `OPENAI_API_KEY` preenchida.
3. Faça perguntas de clarificação se necessário (ex.: formato do insight, como o dashboard deve exibir, se quer streaming real ou fake no MVP).
4. Entregue o primeiro prompt do Cursor focado na base: classe `NoxAgent` + model `AgentInsight` + migration.

Pode começar lendo os arquivos.
```

---

## Dicas extras pra você (Maycon)

- Cole o bloco acima **inteiro** na primeira mensagem da próxima sessão do Cowork. Deixe a pasta `nox-finance` selecionada.
- Sprint 3 branch: `feat/sprint-3-pluggy` — fazer push e abrir PR antes de iniciar Sprint 4.
- Se o modelo perguntar algo que já está respondido aqui, aponte pro bloco, é sinal que ele não leu direito.
- Sprint 4 (agentes) é o coração do produto — vale subir pro Opus se a conversa ficar complexa.
