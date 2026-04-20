'use client';

import { useState } from 'react';

import type { OnboardingData, RiskProfile } from './types';

interface RiskOption {
  id: RiskProfile;
  emoji: string;
  title: string;
  description: string;
}

const RISK_OPTIONS: readonly RiskOption[] = [
  {
    id: 'conservador',
    emoji: '🛡️',
    title: 'Conservador',
    description: 'Prefiro segurança. Evito riscos mesmo com menor retorno.',
  },
  {
    id: 'moderado',
    emoji: '⚖️',
    title: 'Moderado',
    description: 'Aceito um pouco de risco para ter resultados melhores.',
  },
  {
    id: 'arrojado',
    emoji: '🚀',
    title: 'Arrojado',
    description: 'Busco altos retornos e aceito a volatilidade.',
  },
] as const;

interface StepRiscoProps {
  data: OnboardingData;
  onNext: (d: Partial<OnboardingData>) => void;
}

export function StepRisco({ data, onNext }: StepRiscoProps) {
  const [selected, setSelected] = useState<RiskProfile>(data.riskProfile ?? 'moderado');

  const handleSubmit = () => {
    onNext({ riskProfile: selected });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-label text-nox-accent uppercase">Perfil de risco</p>
        <h2 className="text-h3 text-nox-txt">Como você lida com dinheiro?</h2>
      </div>

      <div role="radiogroup" aria-label="Perfil de risco" className="flex flex-col gap-3">
        {RISK_OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(option.id)}
              className={`flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all ${
                isSelected
                  ? 'border-nox-accent bg-nox-bg3'
                  : 'border-nox-border bg-nox-bg2 hover:border-nox-txt3'
              }`}
            >
              <span aria-hidden="true" className="text-2xl leading-none">
                {option.emoji}
              </span>
              <div className="flex flex-col gap-1">
                <span className="text-body text-nox-txt font-semibold">{option.title}</span>
                <span className="text-caption text-nox-txt2">{option.description}</span>
              </div>
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        className="rounded-pill bg-nox-accent text-nox-bg inline-flex items-center justify-center px-6 py-3 text-[15px] font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
      >
        Continuar
      </button>
    </div>
  );
}
