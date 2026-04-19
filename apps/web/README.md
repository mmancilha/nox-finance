# @nox/web

Frontend do Nox — Next.js 14 App Router + TypeScript strict + Tailwind com tokens da marca + DM Sans.

## Dev

```bash
pnpm --filter @nox/web dev
# http://localhost:3000
```

## Estrutura

```
app/              App Router
├── layout.tsx    Root layout com DM Sans + metadata pt-BR
├── page.tsx      Landing (placeholder Sprint 1)
└── globals.css   Tailwind + componentes base

components/       UI por domínio (Sprint 2+)
lib/              Helpers (formatBRL, cn, api client)
styles/
└── tokens.css    CSS vars da marca
```

## Regras fixas

- `bg-nox-bg` (#080808) em TUDO — nunca `bg-black` ou `bg-white`
- Botões sempre com `rounded-pill` (50px)
- DM Sans via `next/font` — nunca outra fonte
- Valores em BRL via `formatBRL()` de `lib/format.ts`
- Textos ao usuário em pt-BR
- Sem `useEffect` para fetch — usar TanStack Query (chega no Sprint 3)

Veja `.cursorrules` na raiz para a lista completa.
