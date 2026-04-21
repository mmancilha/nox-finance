'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { OnboardingProgress } from './OnboardingProgress';
import { StepBemVindo } from './StepBemVindo';
import { StepConectarBanco } from './StepConectarBanco';
import { StepMeta } from './StepMeta';
import { StepPerfil } from './StepPerfil';
import { StepRisco } from './StepRisco';
import type { OnboardingData } from './types';

const TOTAL_STEPS = 5;

interface UpdateMePayload {
  preferred_name?: string;
  avatar_emoji?: string;
  risk_profile?: OnboardingData['riskProfile'];
}

export function OnboardingWizard() {
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});
  const [isFinishing, setIsFinishing] = useState(false);

  const advance = (next: number, patch: Partial<OnboardingData> = {}) => {
    if (Object.keys(patch).length > 0) {
      setData((prev) => ({ ...prev, ...patch }));
    }
    setStep(next);
  };

  const finish = async (skipBank: boolean) => {
    setIsFinishing(true);
    const finalData: OnboardingData = { ...data, skipBankConnection: skipBank };

    const accessToken = session?.accessToken;
    if (accessToken) {
      const payload: UpdateMePayload = {};
      if (finalData.preferredName) payload.preferred_name = finalData.preferredName;
      if (finalData.avatarEmoji) payload.avatar_emoji = finalData.avatarEmoji;
      if (finalData.riskProfile) payload.risk_profile = finalData.riskProfile;

      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(payload),
        });
      } catch (error) {
        console.warn('[onboarding] PATCH /auth/me falhou', error);
      }
    }

    router.push('/dashboard');
    router.refresh();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <StepBemVindo onNext={() => advance(2)} />;
      case 2:
        return <StepPerfil data={data} onNext={(patch) => advance(3, patch)} />;
      case 3:
        return <StepMeta data={data} onNext={(patch) => advance(4, patch)} />;
      case 4:
        return <StepRisco data={data} onNext={(patch) => advance(5, patch)} />;
      case 5:
        return (
          <StepConectarBanco
            accessToken={session?.accessToken ?? ''}
            onFinish={() => finish(false)}
            onSkip={() => finish(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-nox-bg flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

        <div
          aria-busy={isFinishing}
          className="border-nox-border bg-nox-bg2 rounded-2xl border p-8"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.28, 1] }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
