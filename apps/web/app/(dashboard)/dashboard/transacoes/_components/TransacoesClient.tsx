'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { BankTransactionApi, NormalizedTransaction } from '@/lib/normalizeBankTransaction';
import { normalizeBankTransaction } from '@/lib/normalizeBankTransaction';

interface Props {
  accountId: string | null;
  accessToken: string;
}

const PAGE_SIZE = 20;

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function avatarColor(name: string): string {
  const colors = ['bg-violet-500', 'bg-blue-500', 'bg-teal-500', 'bg-amber-500', 'bg-rose-500'];
  return colors[name.charCodeAt(0) % colors.length] ?? 'bg-violet-500';
}

/** Domínio simples (ex.: nubank.com.br) para favicon / logo Clearbit. */
function merchantDomain(merchantName: string | null | undefined): string | null {
  if (!merchantName?.trim()) return null;
  const t = merchantName.trim();
  if (/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z]{2,})+$/i.test(t)) {
    return t.toLowerCase();
  }
  return null;
}

function groupByDate(txs: NormalizedTransaction[]): [string, NormalizedTransaction[]][] {
  const map = new Map<string, NormalizedTransaction[]>();
  for (const tx of txs) {
    const key = tx.date.slice(0, 10);
    const arr = map.get(key) ?? [];
    arr.push(tx);
    map.set(key, arr);
  }
  return [...map.entries()].sort(([a], [b]) => b.localeCompare(a));
}

function formatDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr.slice(0, 10)}T12:00:00`);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return 'Hoje';
  if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function parseTransactionsPayload(json: unknown): { rows: unknown[]; total?: number } {
  if (Array.isArray(json)) return { rows: json };
  if (json && typeof json === 'object' && 'transactions' in json) {
    const o = json as { transactions?: unknown[]; total?: number };
    return {
      rows: Array.isArray(o.transactions) ? o.transactions : [],
      total: typeof o.total === 'number' ? o.total : undefined,
    };
  }
  return { rows: [] };
}

function MerchantAvatar({
  description,
  merchantName,
}: {
  description: string;
  merchantName: string | null;
}) {
  const [logoFailed, setLogoFailed] = useState(false);
  const domain = merchantDomain(merchantName);
  const initial = (description[0] ?? '?').toUpperCase();

  if (domain && !logoFailed) {
    const logoUrl = `https://logo.clearbit.com/${encodeURIComponent(domain)}`;
    return (
      <div className="bg-nox-bg3 relative h-9 w-9 shrink-0 overflow-hidden rounded-full">
        {/* eslint-disable-next-line @next/next/no-img-element -- logos externos (Clearbit) */}
        <img
          src={logoUrl}
          alt=""
          className="h-9 w-9 object-contain"
          onError={() => setLogoFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold text-white ${avatarColor(description)}`}
    >
      {initial}
    </div>
  );
}

export function TransacoesClient({ accountId, accessToken }: Props) {
  const [transactions, setTransactions] = useState<NormalizedTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const offsetRef = useRef(0);

  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (!accountId) return;
      setLoading(true);
      const startOffset = reset ? 0 : offsetRef.current;
      try {
        const res = await fetch(
          `${API_BASE}/banks/accounts/${accountId}/transactions?limit=${PAGE_SIZE}&offset=${startOffset}`,
          { headers: { Authorization: `Bearer ${accessToken}` } },
        );
        if (!res.ok) return;
        const json: unknown = await res.json();
        const { rows, total: totalFromApi } = parseTransactionsPayload(json);
        const newTxs = rows.map((row) => normalizeBankTransaction(row as BankTransactionApi));

        if (reset) {
          setTransactions(newTxs);
          offsetRef.current = newTxs.length;
        } else {
          setTransactions((prev) => [...prev, ...newTxs]);
          offsetRef.current = startOffset + newTxs.length;
        }

        if (typeof totalFromApi === 'number') {
          setHasMore(offsetRef.current < totalFromApi);
        } else {
          setHasMore(newTxs.length === PAGE_SIZE);
        }
      } finally {
        setLoading(false);
      }
    },
    [accountId, accessToken],
  );

  useEffect(() => {
    offsetRef.current = 0;
    setHasMore(true);
    void fetchPage(true);
  }, [accountId, fetchPage]);

  const filtered = useMemo(() => {
    if (!search.trim()) return transactions;
    const q = search.toLowerCase();
    return transactions.filter(
      (tx) =>
        tx.description.toLowerCase().includes(q) ||
        (tx.category_name ?? '').toLowerCase().includes(q),
    );
  }, [transactions, search]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  if (!accountId) {
    return (
      <div className="bg-nox-bg2 border-nox-border rounded-2xl border p-8 text-center">
        <p className="text-nox-txt3 text-[14px]">Conecte um banco para ver suas transações.</p>
        <Link
          href="/onboarding"
          className="text-nox-accent mt-2 inline-block text-[14px] underline"
        >
          Conectar banco →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <input
        type="search"
        placeholder="Buscar transação..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="bg-nox-bg2 border-nox-border text-nox-txt placeholder:text-nox-txt3 focus:border-nox-accent w-full rounded-xl border px-4 py-3 text-[14px] outline-none transition-colors"
      />

      {grouped.length === 0 && !loading && (
        <p className="text-nox-txt3 text-center text-[14px]">Nenhuma transação encontrada.</p>
      )}

      {grouped.map(([date, txs]) => (
        <div key={date}>
          <p className="text-nox-txt3 mb-2 text-[11px] font-medium uppercase tracking-widest">
            {formatDateLabel(date)}
          </p>
          <ul className="bg-nox-bg2 border-nox-border divide-nox-border divide-y rounded-2xl border">
            {txs.map((tx) => (
              <li key={tx.id} className="flex items-center gap-4 px-5 py-4">
                <MerchantAvatar description={tx.description} merchantName={tx.merchant_name} />

                <div className="min-w-0 flex-1">
                  <p className="text-nox-txt truncate text-[14px] font-medium">{tx.description}</p>
                  <p className="text-nox-txt3 text-[12px]">{tx.category_name ?? 'Sem categoria'}</p>
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
        </div>
      ))}

      {hasMore && !search && (
        <button
          type="button"
          onClick={() => void fetchPage(false)}
          disabled={loading}
          className="bg-nox-bg2 border-nox-border text-nox-txt2 hover:text-nox-txt w-full rounded-xl border py-3 text-[14px] transition-colors disabled:opacity-50"
        >
          {loading ? 'Carregando...' : 'Carregar mais'}
        </button>
      )}
    </div>
  );
}
