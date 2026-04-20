import { redirect } from 'next/navigation';

import { auth } from '@/auth';

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect('/entrar');

  return (
    <main className="bg-nox-bg text-nox-txt min-h-screen p-8">
      <h1 className="text-h2">Bem-vindo ao Nox</h1>
      <p className="text-body text-nox-txt2 mt-2">Onboarding em construção — Sprint 2 Prompt 4.</p>
    </main>
  );
}
