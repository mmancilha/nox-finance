# 🌙 Nox, Plano de Desenvolvimento

> **Enquanto você dorme, eu cuido do seu dinheiro.**
>
> Assistente financeiro inteligente com agentes que trabalham 24/7. Conexão bancária via Open Finance, categorização com IA, insights proativos. Design Apple dark mode, aesthetic Pierre-inspired, pronto para SaaS.

---

## 📐 Identidade da Marca (finalizada)

**Nome**: Nox (do latim, "noite", vigilância silenciosa enquanto você descansa)
**Tipografia**: DM Sans (300 / 400 / 500 / 700 / 800)
**Acento principal**: `#F07854` (âmbar-coral quente, o calor no preto)

### Paleta de Cores (final, use em todos os tokens)

```css
:root {
  /* Backgrounds */
  --bg: #080808; /* Preto puro, quase noite */
  --bg2: #101010; /* Cards e painéis */
  --bg3: #181818; /* Elementos elevados (modais, dropdowns) */

  /* Texto */
  --txt: #f5f5f7; /* Branco principal (Apple white) */
  --txt2: #a1a1a6; /* Secundário, sublines */
  --txt3: #6c6c70; /* Muted, placeholders */

  /* Acentos */
  --accent: #f07854; /* Âmbar-coral, CTA, destaques, brand */
  --green: #30d158; /* Receita, positivo */
  --red: #ff453a; /* Gasto, negativo, alerta */

  /* Borders */
  --border: #222222; /* Padrão */
  --border2: #161616; /* Sutil */
}
```

### Tipografia (escala final)

```css
h1 (hero):     72px, weight 800, letter-spacing -0.04em, line-height 0.95
h1 (padrão):   48px, weight 800, letter-spacing -0.03em
h2:            36px, weight 800, letter-spacing -0.03em
h3:            22px, weight 700, letter-spacing -0.02em
body:          16px, weight 300, line-height 1.65 (pesos leves = estética premium)
body strong:   weight 600
caption:       13px, weight 400
label:         11px, weight 500, uppercase, letter-spacing 0.12em, cor --accent
```

### Princípios visuais

- **Fundo `#080808`** em TUDO (não use `#0A0A0A`, nem branco)
- **Peso 300** no body como padrão (é o que dá a estética Pierre/premium)
- **Peso 800** em headings (contraste forte com o body leve)
- **Botões pill**: `border-radius: 50px`, nunca retangulares
- **Glassmorphism** na nav: `rgba(14,14,14,0.92)` + `backdrop-filter: blur(28px)`
- **Radial glow suave** com `rgba(240,120,84,0.08)` em hero sections, cria aura
- **Cards com border `#222`** de 1px, nunca sombras pesadas

---

## 🧭 Posicionamento

**Diferencial vs Pierre Finance**: enquanto o Pierre é reativo (você pergunta, ele responde), o Nox tem **agentes autônomos** que trabalham em background.

**Pitch em uma frase**: _"Um time de agentes financeiros que monitoram sua vida financeira 24 horas por dia, e te avisam só quando importa."_

### Os 4 Agentes do Nox

| Agente          | Papel                                                                 | Gatilho                                 |
| --------------- | --------------------------------------------------------------------- | --------------------------------------- |
| **Sentinela**   | Detecta gastos anômalos, cobranças duplicadas, assinaturas esquecidas | Em cada nova transação (webhook Pluggy) |
| **Oráculo**     | Análise mensal, padrões, previsão do fechamento do mês                | Cron semanal (domingo 20h)              |
| **Norte**       | Monitora metas, alerta sobre estouro de orçamento                     | Cron diário (8h)                        |
| **Companheiro** | Chat conversacional, dúvidas em linguagem natural                     | On-demand                               |

Cada agente tem prompt system próprio, personalidade própria e um orçamento mensal de tokens.

---

## 🏗️ Arquitetura Técnica

```
┌──────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
│       Next.js 14 · TypeScript · Tailwind · DM Sans       │
│           Framer Motion · shadcn/ui · Recharts           │
└─────────────────────┬────────────────────────────────────┘
                      │ REST + WebSocket
┌─────────────────────▼────────────────────────────────────┐
│                    BACKEND API                           │
│           FastAPI · Python 3.11+ · Pydantic v2           │
│    Auth · Open Finance · Agents Engine · Webhooks        │
└──┬──────────────┬───────────────┬───────────────┬────────┘
   │              │               │               │
┌──▼──────┐  ┌────▼────┐  ┌──────▼──────┐  ┌─────▼──────┐
│Postgres │  │  Redis  │  │  Celery     │  │  OpenAI    │
│Supabase │  │ Upstash │  │ (Agents +   │  │ gpt-4o-mini│
│         │  │ cache   │  │  heartbeat) │  │ + gpt-4o   │
└─────────┘  └─────────┘  └─────────────┘  └────────────┘
      │
┌─────▼──────────────────────────────────────────────────┐
│             Pluggy → Open Finance Brasil                │
│      Santander · Itaú · Bradesco · Nubank · BB etc.     │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas (monorepo)

```
nox/
├── apps/
│   ├── web/                        # Frontend Next.js 14
│   │   ├── app/
│   │   │   ├── (marketing)/        # Landing page, pricing
│   │   │   ├── (auth)/
│   │   │   │   ├── login/          # Email + Google
│   │   │   │   ├── register/
│   │   │   │   └── callback/
│   │   │   ├── (dashboard)/
│   │   │   │   ├── overview/
│   │   │   │   ├── transactions/
│   │   │   │   ├── accounts/
│   │   │   │   ├── goals/
│   │   │   │   ├── insights/
│   │   │   │   ├── agents/         # Config dos 4 agentes
│   │   │   │   ├── chat/
│   │   │   │   └── settings/
│   │   │   └── api/                # BFF routes
│   │   ├── components/
│   │   │   ├── ui/                 # shadcn customizado
│   │   │   ├── finance/            # Domínio: transações, cartões
│   │   │   ├── agents/             # Cards dos agentes, status
│   │   │   ├── charts/             # Recharts wrapped
│   │   │   └── layout/
│   │   ├── lib/
│   │   │   ├── api.ts              # Cliente HTTP
│   │   │   ├── auth.ts             # NextAuth
│   │   │   └── format.ts           # BRL, datas pt-BR
│   │   ├── store/                  # Zustand
│   │   └── styles/
│   │       └── tokens.css          # Cores Nox
│   │
│   └── api/                        # Backend FastAPI
│       ├── routers/
│       │   ├── auth.py
│       │   ├── banks.py            # Pluggy
│       │   ├── transactions.py
│       │   ├── agents.py           # Config e status dos agentes
│       │   ├── chat.py             # Endpoint do Companheiro
│       │   ├── goals.py
│       │   └── webhooks.py
│       ├── services/
│       │   ├── open_finance.py
│       │   ├── categorizer.py      # Auto-categorização IA
│       │   ├── sync_service.py
│       │   └── agents/
│       │       ├── base.py         # Classe base Agent
│       │       ├── sentinela.py
│       │       ├── oraculo.py
│       │       ├── norte.py
│       │       └── companheiro.py
│       ├── tasks/                  # Celery, heartbeats
│       │   ├── agents_heartbeat.py
│       │   └── sync_transactions.py
│       ├── models/                 # SQLAlchemy
│       ├── schemas/                # Pydantic
│       └── core/
│           ├── config.py
│           ├── database.py
│           └── security.py
│
├── packages/
│   └── shared-types/               # Types compartilhados
│
├── infra/
│   ├── docker-compose.yml
│   └── docker-compose.prod.yml
│
├── .cursorrules
├── .env.example
└── README.md
```

---

## 🗃️ Modelos de Banco de Dados

```sql
-- Usuários
users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar_url TEXT,
  plan TEXT DEFAULT 'free',
  created_at TIMESTAMP
);

-- Contas bancárias conectadas (via Pluggy)
bank_accounts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  pluggy_item_id TEXT NOT NULL,
  pluggy_account_id TEXT NOT NULL,
  institution_name TEXT,
  account_type TEXT,
  account_number_masked TEXT,
  access_token_encrypted TEXT,
  last_sync_at TIMESTAMP,
  sync_status TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP
);

-- Transações
transactions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  bank_account_id UUID REFERENCES bank_accounts(id),
  pluggy_transaction_id TEXT UNIQUE,
  amount DECIMAL(14,2) NOT NULL,
  description TEXT,
  merchant_name TEXT,
  category_id UUID REFERENCES categories(id),
  transaction_date DATE NOT NULL,
  type TEXT,
  ai_category_confidence FLOAT,
  is_recurring BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  created_at TIMESTAMP
);

CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date DESC);

-- Categorias
categories (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  type TEXT,
  parent_id UUID REFERENCES categories(id),
  monthly_budget DECIMAL(14,2),
  is_system BOOLEAN DEFAULT FALSE
);

-- Metas financeiras
goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  name TEXT NOT NULL,
  target_amount DECIMAL(14,2),
  current_amount DECIMAL(14,2) DEFAULT 0,
  deadline DATE,
  category TEXT,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP
);

-- Configuração dos agentes por usuário
agent_configs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  agent_name TEXT,
  is_enabled BOOLEAN DEFAULT TRUE,
  monthly_token_budget INT,
  tokens_used_this_month INT DEFAULT 0,
  last_run_at TIMESTAMP,
  settings JSONB
);

-- Insights gerados pelos agentes
ai_insights (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  agent_name TEXT NOT NULL,
  type TEXT,
  title TEXT NOT NULL,
  description TEXT,
  data_json JSONB,
  priority TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  generated_at TIMESTAMP
);

CREATE INDEX idx_insights_user_unread ON ai_insights(user_id, is_read, generated_at DESC);

-- Histórico de chat com o Companheiro
chat_messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  session_id UUID,
  role TEXT,
  content TEXT,
  tokens_used INT,
  created_at TIMESTAMP
);
```

---

## 🔐 Fase 1, Autenticação e Base

**Tempo estimado**: 1 semana

- **Login/Registro**: apenas 2 opções (simplificação), **Email/senha** e **Continuar com Google**
- **NextAuth v5** no frontend
- **JWT + Refresh Tokens** no backend
- Recuperação de senha via Resend
- Onboarding guiado (5 telas) após primeiro login, terminando na conexão com o primeiro banco

### Telas

```
/login            → "Entrar no Nox" | Email + Google
/register         → Nome, email, senha + aceite de termos
/forgot-password  → Reset por email
/onboarding
  ├── /welcome    → Apresentação dos 4 agentes (tela swipe)
  ├── /connect    → Conectar primeiro banco (Pluggy Connect Widget)
  ├── /agents     → Ativar/desativar cada agente
  ├── /goals      → (opcional) criar primeira meta
  └── /ready      → "Tudo pronto. Seus agentes já estão trabalhando."
```

---

## 🏦 Fase 2, Integração Bancária

**Tempo estimado**: 2 semanas

### Pluggy é o caminho

Não tentar integrar direto com o Open Finance do Bacen, usar Pluggy como middleware. Vantagens: sandbox com Santander, Itaú, Nubank simulados; documentação 100% em português; SDKs prontos (Python/Node); webhooks padronizados.

### Fluxo de conexão

```python
# services/open_finance.py

class PluggyService:
    async def create_connect_token(self, user_id: str) -> str:
        response = await self.client.post("/connect_token", {
            "clientUserId": user_id,
            "options": {"includeSandbox": settings.ENVIRONMENT == "dev"}
        })
        return response["accessToken"]

    async def handle_item_created(self, item_id: str, user_id: str):
        accounts = await self.fetch_accounts(item_id)
        for account in accounts:
            await self.save_account(account, user_id)
            await self.enqueue_initial_sync(account["id"], user_id)

    async def sync_transactions(self, account_id: str, days: int = 90):
        transactions = await self.fetch_transactions(account_id, days)
        for tx in transactions:
            await self.save_transaction(tx)
            celery_app.send_task("categorize_transaction", args=[tx["id"]])
```

### Webhook (idempotente)

```python
@router.post("/webhook/pluggy")
async def pluggy_webhook(
    payload: PluggyWebhookPayload,
    x_signature: str = Header(...)
):
    verify_signature(payload, x_signature)

    if payload.event == "item/updated":
        await celery_app.send_task("sync_account", args=[payload.itemId])
    elif payload.event == "item/error":
        await notify_user_reconnect_needed(payload.itemId)

    return {"received": True}
```

### Segurança obrigatória

- Tokens bancários sempre encriptados (AES-256) antes de salvar
- Refresh proativo do token 24h antes de expirar
- Rate limiting no endpoint de conexão (máx 3 tentativas/hora)

---

## 🤖 Fase 3, Motor de Agentes (o diferencial)

**Tempo estimado**: 3 semanas

### Classe Base

```python
# services/agents/base.py

from abc import ABC, abstractmethod

class NoxAgent(ABC):
    name: str
    personality: str
    monthly_token_budget: int = 50_000
    model: str = "gpt-4o-mini"

    @abstractmethod
    async def should_run(self, user_id: str) -> bool:
        pass

    @abstractmethod
    async def run(self, user_id: str) -> list[Insight]:
        pass

    async def check_budget(self, user_id: str) -> bool:
        config = await get_agent_config(user_id, self.name)
        return config.tokens_used_this_month < self.monthly_token_budget

    async def track_tokens(self, user_id: str, tokens: int):
        await increment_agent_tokens(user_id, self.name, tokens)
```

### Sentinela (tempo real)

```python
class Sentinela(NoxAgent):
    name = "sentinela"
    personality = """
    Você é o Sentinela do Nox. Detecta anomalias financeiras em tempo real.
    Tom: atento, direto, como um amigo que reparou em algo. Sempre em pt-BR.
    Nunca alarmista. Prefira "notei que" a "ATENÇÃO!".
    """

    async def on_new_transaction(self, tx: Transaction):
        if await self.is_duplicate_charge(tx):
            return self.create_alert(
                title=f"{tx.merchant_name} cobrou duas vezes?",
                description=f"Identifiquei 2 cobranças de R$ {tx.amount} em 3 dias."
            )
        if await self.is_anomaly(tx):
            return self.create_alert(
                title=f"Gasto fora do padrão em {tx.category}",
                description=f"Este R$ {tx.amount} em {tx.merchant_name} está 2x acima da média."
            )
```

### Heartbeat (Celery Beat)

```python
# tasks/agents_heartbeat.py

@celery_app.task
def run_oraculo_weekly():
    """Roda todo domingo às 20h para todos os usuários ativos"""
    users = get_active_users()
    for user in users:
        oraculo = Oraculo()
        if asyncio.run(oraculo.should_run(user.id)):
            insights = asyncio.run(oraculo.run(user.id))
            save_insights(user.id, insights)
            if user.notification_email:
                send_weekly_summary(user, insights)

@celery_app.task
def run_norte_daily():
    """Roda diariamente às 8h, verifica metas e orçamentos"""
    users = get_users_with_goals()
    for user in users:
        norte = Norte()
        insights = asyncio.run(norte.run(user.id))
        save_insights(user.id, insights)

CELERY_BEAT_SCHEDULE = {
    "oraculo-sunday-20h": {
        "task": "tasks.agents_heartbeat.run_oraculo_weekly",
        "schedule": crontab(hour=20, minute=0, day_of_week=0),
    },
    "norte-daily-8h": {
        "task": "tasks.agents_heartbeat.run_norte_daily",
        "schedule": crontab(hour=8, minute=0),
    },
}
```

### Companheiro (chat)

```python
class Companheiro(NoxAgent):
    name = "companheiro"
    model = "gpt-4o"
    personality = """
    Você é o Companheiro do Nox. Chat conversacional sobre finanças.
    Tom: um amigo esperto, em pt-BR, que conhece os dados do usuário.
    Respostas curtas e diretas. Use R$ com formatação pt-BR.
    Nunca julgue os gastos. Sempre construtivo.
    """

    async def chat(self, user_id: str, message: str, history: list) -> str:
        context = await self.build_financial_context(user_id)

        response = await openai.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": f"{self.personality}\n\nContexto:\n{context}"},
                *history,
                {"role": "user", "content": message}
            ]
        )

        await self.track_tokens(user_id, response.usage.total_tokens)
        return response.choices[0].message.content
```

---

## 🎨 Fase 4, Frontend e UX

**Tempo estimado**: 4 semanas (paralelo com Fase 3)

### Landing Page (já desenhada no Claude Design)

Estrutura exportada para usar como base:

1. Nav pill flutuante no topo com blur
2. Hero: "Enquanto você dorme, eu cuido do seu dinheiro." + mockup com 3 cards flutuantes
3. Features em 5-6 seções alternadas (imagem + texto)
4. Pricing com toggle Mensal/Anual
5. FAQ em accordion
6. Footer compacto

### App (dashboard)

```
Layout principal:
┌─────────────────────────────────────────────────────────┐
│ [nox]        Overview  Transações  Agentes    [avatar]  │ ← Top bar glassmorphism
├─────────────────────────────────────────────────────────┤
│   Boa noite, Maycon                                     │
│   Domingo, 19 Abr                                       │
│                                                         │
│   ┌─────────────────────────────────────┐               │
│   │ R$ 12.430,60                        │               │
│   │ ↑ R$ 7.250 receitas ↓ R$ 2.468      │               │
│   └─────────────────────────────────────┘               │
│                                                         │
│   🌙 Seus agentes notaram:                              │
│   ┌─────────────────┐ ┌─────────────────┐               │
│   │ Sentinela       │ │ Oráculo         │               │
│   │ Netflix cobrou  │ │ Você pode econo │               │
│   │ duas vezes...   │ │ mizar R$ 320... │               │
│   └─────────────────┘ └─────────────────┘               │
│                                                         │
│   [Gráfico de gastos mensais - Recharts]                │
│                                                         │
│   Últimas transações                                    │
└─────────────────────────────────────────────────────────┘
```

### Componentes-chave (shadcn/ui customizado)

| Componente         | Função                                                 |
| ------------------ | ------------------------------------------------------ |
| `<BalanceCard>`    | Saldo principal com receitas/gastos inline             |
| `<AgentCard>`      | Card de insight do agente com nome + descrição + ação  |
| `<TransactionRow>` | Linha de transação (ícone, merchant, categoria, valor) |
| `<CategoryDonut>`  | Gráfico donut de gastos por categoria                  |
| `<SpendingBars>`   | Gráfico de barras de gastos mensais                    |
| `<GoalProgress>`   | Barra de progresso de meta                             |
| `<ChatBubble>`     | Mensagem no chat do Companheiro                        |
| `<BankConnector>`  | Modal com lista de bancos (Pluggy Widget)              |
| `<AgentToggle>`    | Toggle para ativar/desativar cada agente               |

### Animações (Framer Motion)

```typescript
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }
  }
};

const AnimatedBalance = ({ value }: { value: number }) => (
  <motion.span
    key={value}
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35 }}
  >
    {formatBRL(value)}
  </motion.span>
);
```

---

## 🚀 Fase 5, Deploy e Infraestrutura

**Tempo estimado**: 1 semana

| Camada       | Serviço       | Justificativa                                    |
| ------------ | ------------- | ------------------------------------------------ |
| Frontend     | Vercel        | Deploy automático, Edge, free tier generoso      |
| Backend      | Railway       | Docker simples, workers Celery, $5/mês inicial   |
| Database     | Supabase      | Postgres + Auth + Storage + RLS                  |
| Cache/Queue  | Upstash Redis | Serverless, pay-per-request                      |
| IA           | OpenAI        | gpt-4o-mini para categorização, gpt-4o para chat |
| Open Finance | Pluggy        | Middleware BR, sandbox grátis                    |
| Email        | Resend        | React Email, 100 emails/dia grátis               |
| Pagamentos   | Stripe        | Cobrança recorrente, suporte Pix                 |
| Erros        | Sentry        | Free tier até 5k events/mês                      |
| Analytics    | PostHog       | Self-hostável, feature flags inclusos            |

### `.env.example`

```env
# App
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/nox
REDIS_URL=redis://localhost:6379

# Auth
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Encryption
ENCRYPTION_KEY=generate-32-byte-key

# Pluggy
PLUGGY_CLIENT_ID=
PLUGGY_CLIENT_SECRET=
PLUGGY_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY=

# Resend
RESEND_API_KEY=

# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=

# Stripe (fase SaaS)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Sentry
SENTRY_DSN=
```

---

## 💎 Fase 6, SaaS e Monetização

### Pricing (inspirado no Pierre, mas reposicionado)

| Feature               | Grátis          | Pro R$29/mês | Premium R$89/mês |
| --------------------- | --------------- | ------------ | ---------------- |
| Bancos conectados     | 1               | 5            | Ilimitado        |
| Agentes ativos        | 1 (Companheiro) | 3            | 4 + customização |
| Histórico             | 3 meses         | 24 meses     | Ilimitado        |
| Chat com Companheiro  | 30 msgs/mês     | Ilimitado    | Ilimitado        |
| Insights proativos    | Semanal         | Diário       | Tempo real       |
| Metas                 | 3               | Ilimitado    | Ilimitado        |
| Exportação PDF/CSV    | ❌              | ✅           | ✅               |
| Relatório mensal IA   | ❌              | ✅           | ✅ premium       |
| Notificações WhatsApp | ❌              | ❌           | ✅               |
| Suporte               | Comunidade      | Email 24h    | Prioritário      |

### Métricas para acompanhar

- **MRR** (Monthly Recurring Revenue)
- **Churn Rate** (meta: < 5%/mês)
- **LTV/CAC** ratio (meta: > 3)
- **Ativação**: % de usuários que conectam banco no onboarding
- **Engajamento**: % que abre insights dos agentes

---

## 🔒 Segurança e LGPD

### Obrigatório

- Tokens bancários: AES-256 em repouso
- HTTPS: obrigatório em produção
- Rate limiting: 100 req/min por usuário
- Row Level Security (RLS) no Supabase: todos os dados isolados por `user_id`
- Audit log: todas as ações sensíveis (conexão de banco, exclusão)
- LGPD: política de privacidade, exclusão de dados sob demanda, portabilidade

### Compliance

- Conectar um banco via Open Finance é permitido apenas com consentimento explícito
- Dados do Pluggy só podem ser lidos, nunca usados para transações
- Usuário pode revogar acesso a qualquer momento (botão no `/settings`)
- Notificação por email quando novo dispositivo faz login

---

## 📋 Roadmap Visual

### Sprint 1-2: Fundação (2 semanas)

- [ ] Setup monorepo (Turborepo ou pnpm workspaces)
- [ ] Docker + Supabase local
- [ ] Design tokens da marca Nox
- [ ] Landing page estática (já temos!)
- [ ] Sistema de auth (email + Google)

### Sprint 3-4: Banco (2 semanas)

- [ ] Integração Pluggy (sandbox)
- [ ] Fluxo de conexão de banco
- [ ] Sync de transações
- [ ] Categorização automática com IA
- [ ] Dashboard básico

### Sprint 5-7: Agentes (3 semanas)

- [ ] Classe base de Agent
- [ ] Sentinela (tempo real)
- [ ] Norte (diário)
- [ ] Oráculo (semanal)
- [ ] Companheiro (chat)
- [ ] Celery Beat para heartbeats

### Sprint 8-9: Polish + Lançamento (2 semanas)

- [ ] Tela de metas
- [ ] Configuração de agentes
- [ ] Notificações email
- [ ] Testes E2E críticos
- [ ] Onboarding completo
- [ ] Deploy produção

### Pós-MVP (V2)

- [ ] Stripe + planos pagos
- [ ] Exportação PDF/CSV
- [ ] Relatório mensal IA
- [ ] App mobile (React Native/Expo)
- [ ] Integração WhatsApp (Premium)

---

## 📚 Referências

- [Pluggy Docs](https://docs.pluggy.ai), Open Finance Brasil
- [Open Finance Brasil](https://openfinancebrasil.org.br), Doc oficial Bacen
- [Next.js 14 App Router](https://nextjs.org/docs)
- [FastAPI](https://fastapi.tiangolo.com)
- [Supabase Docs](https://supabase.com/docs)
- [Stripe Brasil](https://stripe.com/br), Pagamentos com Pix
- [DM Sans on Google Fonts](https://fonts.google.com/specimen/DM+Sans)
- [Pierre Finance](https://lp.pierre.finance), inspiração principal de aesthetic
- [Paperclip](https://github.com/paperclipai/paperclip), inspiração de arquitetura de agentes
