import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import { TransacoesClient } from './_components/TransacoesClient';

interface BankAccount {
  id: string;
  institution_name: string | null;
}

async function fetchFirstAccount(token: string): Promise<BankAccount | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/banks/accounts`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const raw = (await res.json()) as BankAccount[] | { accounts: BankAccount[] };
    const accounts = Array.isArray(raw) ? raw : (raw.accounts ?? []);
    return accounts[0] ?? null;
  } catch {
    return null;
  }
}

export default async function TransacoesPage() {
  const session = await auth();
  if (!session) redirect('/entrar');
  if (!session.accessToken) redirect('/entrar');

  const account = await fetchFirstAccount(session.accessToken);

  return (
    <main className="bg-nox-bg text-nox-txt min-h-screen">
      <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
        <h1 className="mb-6 text-[24px] font-extrabold tracking-[-0.02em]">Transações</h1>
        <TransacoesClient accountId={account?.id ?? null} accessToken={session.accessToken} />
      </div>
    </main>
  );
}
