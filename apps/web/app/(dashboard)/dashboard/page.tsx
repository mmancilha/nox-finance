import { redirect } from 'next/navigation';

import { auth } from '@/auth';

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect('/entrar');

  const firstName = session.user.name?.split(' ')[0] ?? 'por aí';

  return (
    <main className="bg-nox-bg text-nox-txt min-h-screen p-8">
      <h1 className="text-h2">Olá, {firstName} 👋</h1>
      <p className="text-body text-nox-txt2 mt-2">Dashboard em construção — Sprint 3.</p>
    </main>
  );
}
