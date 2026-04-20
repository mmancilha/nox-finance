import { redirect } from 'next/navigation';

import { auth } from '@/auth';

import { OnboardingWizard } from './_components/OnboardingWizard';

export default async function OnboardingPage() {
  const session = await auth();
  if (!session) redirect('/entrar');

  return <OnboardingWizard />;
}
