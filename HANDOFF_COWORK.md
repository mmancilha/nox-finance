# Handoff — próximo Cowork (Nox)

> Cole o bloco abaixo na primeira mensagem do próximo Cowork. Ele é autossuficiente: o novo agente não precisa ler histórico nenhum — só os arquivos do repo.

---

## Prompt pra colar no próximo Cowork

```
Oi. Sou o Maycon (mancilhamaycon@gmail.com) e estou retomando o desenvolvimento do Nox num chat novo pra economizar custo (sai do Opus 4.7). Leia este briefing inteiro antes de responder.

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
- **Sprint 1 — Fundação: CONCLUÍDO ✅**
- Commit local: `70fad80 chore: scaffold monorepo (Sprint 1 — foundation)`
- Branch: `feat/sprint-1-foundation` (pode ainda não estar no remoto — confirmar com `git status` e `git log origin/main..HEAD`)
- 87 arquivos criados: monorepo pnpm, Docker Compose (Postgres 16 + Redis 7), Next.js 14 com DM Sans + tokens nox-*, FastAPI + SQLAlchemy async + Alembic, Celery + Beat com schedule dos agentes, Ruff/Black/mypy, ESLint/Prettier, husky + lint-staged, testes smoke (pytest + vitest), `.env.example` completo.

## Decisões já travadas (não revisitar)
- Monorepo direto em `nox-finance/` (sem subfolder extra)
- **Auth: NextAuth v5 + JWT** (não Supabase Auth)
- **pnpm workspaces puro** (sem Turbo/Nx por enquanto)
- Python 3.12 local / 3.11 declarado no `pyproject.toml`
- Celery com timezone `America/Sao_Paulo`
- Tokens de marca **apenas** em `apps/web/styles/tokens.css` + `tailwind.config.ts`. Cor hex fora dali é bug.
- Cores: bg `#080808`, bg2 `#101010`, bg3 `#181818`, txt `#F5F5F7`, accent `#F07854`, green `#30D158`, red `#FF453A`
- Fonte: DM Sans (weights 300/400/500/700/800) via `next/font`
- Valores em BRL sempre via `Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })` — função pronta em `apps/web/lib/format.ts`

## Pendências locais (o Maycon deve ter feito, confirme antes de abrir Sprint 2)
1. **Rotacionar 6 chaves** que vazaram no chat anterior: Anthropic, OpenAI, OpenRouter, Resend, Pluggy (CLIENT_SECRET + API_KEY), Google OAuth SECRET. Se ele ainda não rodou, **lembrar antes de qualquer outra coisa.**
2. **Google OAuth**: precisa ser cliente do tipo **"Aplicativo da Web"** (não Desktop), com redirect URI `http://localhost:3000/api/auth/callback/google`, projeto em status **Teste** e email dele como usuário de teste.
3. **n8n containers antigos**: podem estar ocupando porta 6379 (Redis). `docker ps` e `docker rm -f` se necessário.
4. **Push da branch + PR**: se `feat/sprint-1-foundation` não estiver no remoto, subir e abrir PR (descrição em pt-BR) mas **não mergear ainda** — deixar pra depois do Sprint 2 ou fazer squash no fim.
5. **Poetry via pipx** (não pip puro).

## Fluxo de trabalho (obrigatório)
- Maycon usa Cursor pra executar comandos locais. Eu (Cowork) **não rodo bash no ambiente dele** — eu entrego **prompts prontos em bloco de código** pra ele colar no Cursor.
- Sempre em branch nova: `feat/sprint-N-<slug>`. Nunca commit direto em `main`.
- Commits semânticos em inglês: `feat:`, `fix:`, `chore:`, `refactor:`, escopo opcional.
- Pergunte antes de assumir: se duas abordagens são plausíveis, traga ambas com trade-offs em pt-BR e deixe ele escolher.
- TS strict sempre. Python com type hints e `mypy --strict`. Nada de `any` / `Any` sem justificativa.
- Segurança: nunca logar token, senha ou chave. Tokens de banco **sempre** criptografados com AES-256-GCM (`apps/api/app/core/security.py`).

## Próximo sprint — Sprint 2: Auth + Landing
Entregáveis:
- **Landing completa** replicando o HTML de `nox-design/` pixel-perfect (hero, como funciona, os 4 agentes, preço, FAQ, footer), responsiva, usando só os tokens da marca.
- **NextAuth v5** com 2 providers: Email (magic link via Resend) e Google. Session JWT. Páginas `/entrar`, `/cadastro`, `/verificar-email` em pt-BR.
- **Backend `/auth/*`**: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `GET /auth/me`. JWT assinado com `JWT_SECRET`. Hash de senha com `argon2` ou `bcrypt`.
- **Middleware de rota protegida** no Next (redireciona pra `/entrar` se sem sessão).
- **Onboarding 5 passos** pós-cadastro (tela a tela, skippable na 5): boas-vindas → perfil básico → meta financeira → tolerância a risco → conectar banco (placeholder pro Sprint 3).
- **Models novos**: `User`, `Session`, `OnboardingProgress`. Migration Alembic.
- **Testes**: pytest pros endpoints, vitest pros componentes críticos.

## Como começar
1. Leia os 5 arquivos listados acima.
2. Me confirme em pt-BR num resumo curto: (a) status do git local/remoto, (b) se as chaves foram rotacionadas, (c) se o Google OAuth está como Web.
3. Faça perguntas de clarificação se algo no plano estiver ambíguo (ex.: fluxo exato do magic link, se cadastro pede CPF já no Sprint 2 etc.).
4. Só depois disso, me entregue o **primeiro prompt do Cursor** pro Sprint 2 — escopo pequeno e revisável (ex.: começar pela landing + tokens, deixar auth pra segundo prompt).

Pode começar lendo os arquivos.
```

---

## Dicas extras pra você (Maycon)

- Cole o bloco acima **inteiro** na primeira mensagem da próxima sessão do Cowork. Deixe a pasta `nox-finance` selecionada.
- Se o modelo perguntar algo que já está respondido aqui, aponte pro bloco — é sinal que ele não leu direito.
- Se quiser forçar modelo mais barato, comece a sessão com Sonnet e só troca pra Opus se a tarefa ficar complexa (design system + auth geralmente roda bem no Sonnet).
- Commits do Sprint 1 ainda estão só locais até você dar `git push`. Se quiser, abra o PR vazio agora e vai empurrando commits nele.
