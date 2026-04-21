import { redirect } from 'next/navigation';

import { auth } from '@/auth';

export default async function VisaoGeralPage() {
  const session = await auth();
  if (!session) redirect('/entrar');

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      <p className="text-nox-txt3">Carregando...</p>
    </main>
  );
}
