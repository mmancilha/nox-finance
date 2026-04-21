import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth } from '@/auth';
import { greetingFromHour } from '@/lib/format';
import type { BankTransactionApi, NormalizedTransaction } from '@/lib/normalizeBankTransaction';
import { normalizeBankTransaction } from '@/lib/normalizeBankTransaction';

// ── tipos ──────────────────────────────────────────────────────────────────
interface BankAccount {
  id: string;
  institution_name: string | null;
  account_type: string | null;
  balance: number;
}

interface AgentInsight {
  id: string;
  agent_type: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

// ── fetchers ───────────────────────────────────────────────────────────────
async function fetchAccounts(token: string): Promise<BankAccount[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banks/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const raw = (await res.json()) as BankAccount[] | { accounts: BankAccount[] };
    const list = Array.isArray(raw) ? raw : (raw.accounts ?? []);
    return list.map((a) => ({
      ...a,
      balance: typeof a.balance === 'string' ? parseFloat(a.balance) : Number(a.balance),
    }));
  } catch {
    return [];
  }
}

async function fetchRecentTransactions(
  token: string,
  accountId: string,
): Promise<NormalizedTransaction[]> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/banks/accounts/${accountId}/transactions?limit=5`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 60 } },
    );
    if (!res.ok) return [];
    const raw = (await res.json()) as { transactions: unknown[]; total?: number } | unknown[];
    const rows = Array.isArray(raw) ? raw : (raw.transactions ?? []);
    return rows.map((row) => normalizeBankTransaction(row as BankTransactionApi));
  } catch {
    return [];
  }
}

async function fetchLatestInsight(token: string): Promise<AgentInsight | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agents/insights?limit=1`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as AgentInsight[];
    return data[0] ?? null;
  } catch {
    return null;
  }
}

// ── helpers ────────────────────────────────────────────────────────────────
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function merchantInitial(name: string): string {
  return (name[0] ?? '?').toUpperCase();
}

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-teal-500',
  'bg-amber-500',
  'bg-rose-500',
];

function avatarColor(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx] ?? 'bg-violet-500';
}

// ── componente ─────────────────────────────────────────────────────────────
export default async function VisaoGeralPage() {
  const session = await auth();
  if (!session) redirect('/entrar');
  if (!session.accessToken) redirect('/entrar');

  const hour = new Date().getHours();
  const greeting = greetingFromHour(hour);
  const firstName =
    session.user.name?.split(' ')[0] ?? session.user.email?.split('@')[0] ?? 'por aí';

  const accounts = await fetchAccounts(session.accessToken);
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  const primaryAccount = accounts[0];
  const transactions = primaryAccount
    ? await fetchRecentTransactions(session.accessToken, primaryAccount.id)
    : [];

  const now = new Date();
  const monthTxs = transactions.filter((tx) => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const income = monthTxs.filter((tx) => tx.type === 'CREDIT').reduce((s, tx) => s + tx.amount, 0);
  const expenses = monthTxs.filter((tx) => tx.type === 'DEBIT').reduce((s, tx) => s + tx.amount, 0);

  const insight = await fetchLatestInsight(session.accessToken);

  const AGENT_ICON: Record<string, string> = {
    sentinela: '🔰',
    oraculo: '🔮',
    norte: '🧭',
    companheiro: '💬',
  };

  return (
    <main className="bg-nox-bg text-nox-txt min-h-screen">
      <div className="mx-auto max-w-5xl space-y-6 px-6 py-8 md:px-10">
        <div>
          <p className="text-nox-txt3 mb-1 text-[12px] font-medium uppercase tracking-widest">
            {greeting}
          </p>
          <h1 className="text-[30px] font-extrabold leading-tight tracking-[-0.03em]">
            {firstName} 👋
          </h1>
        </div>

        {accounts.length > 0 ? (
          <div className="bg-nox-bg2 border-nox-border rounded-2xl border p-6">
            <p className="text-nox-txt3 mb-1 text-[12px] uppercase tracking-widest">Saldo total</p>
            <p className="text-[36px] font-extrabold leading-none tracking-[-0.03em]">
              {formatBRL(totalBalance)}
            </p>
            <div className="mt-4 flex gap-6">
              <div>
                <p className="text-nox-txt3 text-[11px] uppercase tracking-widest">↑ Receitas</p>
                <p className="text-nox-green mt-0.5 text-[18px] font-semibold">
                  {formatBRL(income)}
                </p>
              </div>
              <div>
                <p className="text-nox-txt3 text-[11px] uppercase tracking-widest">↓ Despesas</p>
                <p className="text-nox-red mt-0.5 text-[18px] font-semibold">
                  {formatBRL(expenses)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-nox-bg2 border-nox-border rounded-2xl border p-6 text-center">
            <p className="text-nox-txt3 text-[14px]">Nenhuma conta bancária conectada.</p>
            <Link
              href="/onboarding"
              className="text-nox-accent mt-2 inline-block text-[14px] font-medium underline"
            >
              Conectar banco →
            </Link>
          </div>
        )}

        {insight && (
          <div className="bg-nox-bg2 border-nox-border rounded-2xl border p-5">
            <p className="text-nox-txt3 mb-2 text-[11px] uppercase tracking-widest">
              {AGENT_ICON[insight.agent_type] ?? '🌙'} Insight do Nox
            </p>
            <p className="text-nox-txt2 text-[15px] leading-relaxed">{insight.content}</p>
          </div>
        )}

        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-nox-txt3 text-[11px] uppercase tracking-widest">
              Últimas transações
            </p>
            <Link
              href="/dashboard/transacoes"
              className="text-nox-accent text-[13px] font-medium transition-opacity hover:opacity-70"
            >
              Ver todas →
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="bg-nox-bg2 border-nox-border rounded-2xl border p-6 text-center">
              <p className="text-nox-txt3 text-[14px]">Nenhuma transação encontrada.</p>
            </div>
          ) : (
            <ul className="bg-nox-bg2 border-nox-border divide-nox-border divide-y rounded-2xl border">
              {transactions.map((tx) => (
                <li key={tx.id} className="flex items-center gap-4 px-5 py-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white ${avatarColor(tx.description)}`}
                  >
                    {merchantInitial(tx.description)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-nox-txt truncate text-[14px] font-medium">
                      {tx.description}
                    </p>
                    <p className="text-nox-txt3 text-[12px]">
                      {tx.category_name ?? 'Sem categoria'}
                    </p>
                  </div>

                  <p
                    className={`shrink-0 text-[14px] font-semibold tabular-nums ${
                      tx.type === 'CREDIT' ? 'text-nox-green' : 'text-nox-txt'
                    }`}
                  >
                    {tx.type === 'CREDIT' ? '+' : '-'}
                    {formatBRL(tx.amount)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
