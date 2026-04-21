# Plano de Redesign — Dashboard Nox

> Referência visual: Pierre Finance (pasta `/pierre`)
> Diferencial do Nox sobre o Pierre: os 4 agentes autônomos de IA

---

## Estado atual vs. objetivo

| O que existia                                  | O que existe agora                                          |
| ---------------------------------------------- | ----------------------------------------------------------- |
| Página `/dashboard` simples com 3 cards e chat | ✅ Dashboard com 3 abas (Visão Geral, Transações, Agentes)  |
| Onboarding com transições abruptas             | ✅ Framer Motion com AnimatePresence                        |
| Bolinhas coloridas no Step 5 (bancos)          | ✅ Logos SVG dos 6 principais bancos                        |
| Objetivo financeiro com 4 opções fixas         | ✅ Campo customizável + opção "Outro"                       |
| Sem navegação dentro do dashboard              | ✅ Tab bar horizontal com indicador coral                   |
| Google OAuth sem JWT do backend                | ✅ `POST /auth/google` troca token e preenche `accessToken` |

---

## Fase 1 — Verificar backend com JWT real (fazer ANTES do Cursor)

Antes de qualquer código, confirmar que Pluggy e OpenAI estão funcionando.

**Como obter o JWT real:**

1. Logar no app em `localhost:3000`
2. Abrir DevTools → aba Network
3. Clicar em qualquer request para `127.0.0.1:8000`
4. Copiar o header `Authorization: Bearer <TOKEN>`

**Testar:**

```bash
# Pluggy
curl -sS "http://127.0.0.1:8000/banks/connect-token" \
  -H "Authorization: Bearer TOKEN_REAL"

# Chat
curl -sS -X POST "http://127.0.0.1:8000/agents/chat" \
  -H "Authorization: Bearer TOKEN_REAL" \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"oi\",\"history\":[]}"
```

**Resultado esperado:**

- Pluggy → `{"access_token": "..."}` (se OK) ou 500 com detalhe (se credencial errada)
- Chat → stream de texto chegando (se OK) ou 500 com erro OpenAI

---

## Fase 2 — Redesign do Dashboard (principal)

### Arquitetura de rotas

```
/dashboard                    → redireciona para /dashboard/visao-geral
/dashboard/visao-geral        → Saldo + resumo do mês + últimas transações + insight do Nox
/dashboard/transacoes         → Lista paginada com busca e filtros
/dashboard/agentes            → Cards dos 4 agentes + chat Companheiro (conteúdo atual)
```

O layout compartilhado `(dashboard)/layout.tsx` (já criado) recebe a **tab bar** horizontal.

### Tab bar (atualizar layout.tsx)

```
[ Visão Geral ]  [ Transações ]  [ Agentes ]
```

Aba ativa destacada com pill coral (#F07854), inativas em txt3.
Sticky abaixo do header com a logo/sair.

### Tela: Visão Geral

```
┌─────────────────────────────────────────────────────┐
│  Boa noite, Maycon                                   │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │  Saldo total: R$ X.XXX,XX          [ocultar] │   │
│  │  ↑ Receitas R$ X,XX  ↓ Despesas R$ X,XX     │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  🌙 INSIGHT DO NOX  ← último insight dos agentes    │
│  ┌──────────────────────────────────────────────┐   │
│  │  "Notei que você gastou R$ 187 a mais..."    │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  ÚLTIMAS TRANSAÇÕES                    Ver todas →  │
│  ┌──────────────────────────────────────────────┐   │
│  │  🏪 Mercado Extra    Alimentação  -R$ 89,90  │   │
│  │  🚗 Uber             Transporte   -R$ 23,40  │   │
│  │  ...                                         │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Dados necessários (já existem no backend):**

- `GET /banks/accounts` → saldo das contas
- `GET /banks/accounts/{id}/transactions?limit=5` → últimas transações
- `GET /agents/insights?limit=1` → insight mais recente

**Merchant logo**: usar `https://www.google.com/s2/favicons?domain={dominio}&sz=64` como fallback rápido. Para transações sem domínio: inicial do nome num círculo colorido.

### Tela: Transações

```
┌─────────────────────────────────────────────────────┐
│  [🔍 Buscar transação...]  [Este mês ▾]  [Todas ▾]  │
│                                                      │
│  HOJE                                                │
│  [logo] Uber            Transporte    -R$ 23,40     │
│  [logo] iFood           Alimentação   -R$ 67,80     │
│                                                      │
│  ONTEM                                               │
│  [logo] Mercado Extra   Alimentação   -R$ 89,90     │
│  ...                                                 │
│                          [Carregar mais]             │
└─────────────────────────────────────────────────────┘
```

**Dados**: `GET /banks/accounts/{id}/transactions` (paginado, já implementado)
**Agrupamento**: por data, no client
**Sem dados**: empty state "Conecte um banco para ver suas transações"

### Tela: Agentes

Conteúdo atual do dashboard (cards Sentinela, Oráculo, Norte + chat Companheiro).
Adicionar floating button "💬 Companheiro" fixo no canto inferior direito nas outras abas.

---

## Fase 3 — Onboarding polido

### Problema 1: Transições abruptas

**Fix**: Framer Motion `AnimatePresence` + `motion.div` com `initial/animate/exit`.
Entrada: `opacity 0 → 1` + `translateY 8px → 0`. Saída: `opacity 1 → 0` + `translateY 0 → -8px`.

### Problema 2: Step 2 — Avatar (só emojis, sem foto)

**Fix**: manter seletor de emojis (simples, funciona) + adicionar botão "Usar foto" que abre `<input type="file" accept="image/*">`. Upload → preview circular. Backend: endpoint `POST /auth/me` já aceita `avatar_url`.

### Problema 3: Step 3 — Objetivo financeiro (opções fixas)

**Fix**: manter as 4 opções como atalhos visuais + adicionar campo "Outro" que abre um `<input>` livre. Ao selecionar uma opção predefinida, o campo mostra o texto dela editável.

### Problema 4: Step 5 — Logos dos bancos

**Fix**: substituir bolinhas por logos SVG dos principais bancos:

| Banco           | Logo                   |
| --------------- | ---------------------- |
| Nubank          | SVG roxo com N         |
| Itaú            | SVG laranja            |
| Santander       | SVG vermelho com chama |
| Bradesco        | SVG vermelho           |
| Banco do Brasil | SVG azul/amarelo       |

Usar SVGs inline ou CDN público (ex: `simpleicons.org`).

### Problema 5: Background animado

**Fix**: Canvas ou CSS gradient animado no fundo do onboarding.
Opção simples (sem lib extra): dois `radial-gradient` que se movem lentamente com `@keyframes`.
Opção premium: partículas sutis com `tsparticles` (leve, ~15kb gzipped).

---

## Fase 4 — Fix crítico: accessToken no frontend

O chat do Companheiro deu "problema técnico" porque o `accessToken` provavelmente chegou vazio
no `CompanheiroChat`. O dashboard é Server Component e busca a sessão — mas precisa verificar
se `session.accessToken` está sendo preenchido corretamente pelo NextAuth.

**Fix no `page.tsx`:**

```tsx
// Adicionar log temporário para debug:
console.log('[dashboard] accessToken length:', session.accessToken?.length ?? 0);
```

Se for 0, o problema está no callback JWT do `auth.ts` (o Google OAuth não popula `accessToken`
igual ao Credentials provider).

**Fix no `auth.ts`** para Google OAuth:

```typescript
// No callback jwt, quando provider é google:
if (account?.provider === 'google') {
  // Google não tem accessToken do backend Nox
  // Precisamos fazer login no backend com o email do Google
  // ou criar o usuário automaticamente
  // Por ora, buscar/criar o usuário via endpoint:
  const backendRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: token.email, name: token.name, googleIdToken: account.id_token }),
  });
  if (backendRes.ok) {
    const data = await backendRes.json();
    token.accessToken = data.access_token;
  }
}
```

Isso requer um endpoint `POST /auth/google` no backend — ou o Google OAuth precisa redirecionar
para o cadastro normal na primeira vez.

---

## Ordem de execução (prompts Cursor)

| #   | O que                                                            | Estimativa     | Status                              |
| --- | ---------------------------------------------------------------- | -------------- | ----------------------------------- |
| 1   | Verificar JWT real nos curls (manual)                            | 10 min         | ⏳ Pendente (fazer antes do deploy) |
| 2   | Fix `accessToken` Google OAuth no auth.ts + endpoint backend     | 1 prompt       | ✅ Concluído                        |
| 3   | Atualizar `layout.tsx` com tab bar completa                      | 1 prompt       | ✅ Concluído                        |
| 4   | Criar `/dashboard/visao-geral` com saldo + transações + insight  | 1 prompt       | ✅ Concluído                        |
| 5   | Criar `/dashboard/transacoes` com lista paginada + logos         | 1 prompt       | ✅ Concluído                        |
| 6   | Mover conteúdo atual para `/dashboard/agentes` + floating button | 1 prompt       | ✅ Concluído                        |
| 7   | Onboarding: Framer Motion + logos bancos + objetivo customizável | 1 prompt       | ✅ Concluído                        |
| 8   | Background animado no onboarding                                 | 1 prompt       | ✅ Concluído                        |
| 9   | Testes e ajustes finais                                          | junto com você | ⏳ Em andamento                     |

---

## O que NÃO faremos agora (Sprint 6+)

- Parcelamentos (requer parsing específico de faturas)
- Assinaturas (Sentinela detecta, mas tela dedicada é Sprint 6)
- Categorias com donut chart (Sprint 6)
- Cartões, Investimentos, Dívidas (Sprint 6+)
- Upload de foto de avatar para storage (Supabase Storage, Sprint 6)
- WhatsApp notifications (Premium tier)

---

## Nota sobre Pierre vs. Nox

Pierre é um produto em produção há meses com time dedicado.
O Nox tem o diferencial que o Pierre não tem: **agentes autônomos que trabalham em background**.
O Pierre não te avisa proativamente — você precisa abrir o app para ver.
O Nox vai te mandar um email quando o Sentinela detectar uma anomalia.
Esse é o produto. O dashboard é só a interface.

---

## Notas de implementação

Decisões reais adotadas na execução com o Cursor:

- **Rota do onboarding:** o caminho é `(dashboard)/onboarding/`, não `(onboarding)/onboarding/`.
- **Logos dos bancos:** `bankLogos.tsx` em `app/(dashboard)/onboarding/_data/bankLogos.tsx`.
- **Floating do Companheiro:** `CompanheiroFloat.tsx` em `app/(dashboard)/dashboard/_components/`.
- **Layout do dashboard:** `layout.tsx` virou Client Component (usa `usePathname` para a tab bar).
- **Autenticação:** em cada page, `auth()` + `redirect('/entrar')` em Server Components — não no layout, porque o layout é client.
- **API de transações:** `GET /banks/accounts/{id}/transactions` retorna `{ transactions, total }`.
- **Normalização para a UI:** `lib/normalizeBankTransaction.ts` para alinhar a resposta da API à interface.
- **Logos de estabelecimentos:** tentativa com Clearbit API + fallback para inicial colorida.
- **Framer Motion:** `framer-motion` ^12.38.0 já estava no `package.json`.
