'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { OnboardingData } from './types';

const GOAL_OPTIONS = [
  { id: 'imovel', emoji: '🏠', label: 'Comprar imóvel' },
  { id: 'carro', emoji: '🚗', label: 'Comprar carro' },
  { id: 'viagem', emoji: '✈️', label: 'Viagem dos sonhos' },
  { id: 'reserva', emoji: '💰', label: 'Reserva de emergência' },
  { id: 'outro', emoji: '✏️', label: 'Outro' },
] as const;

type GoalId = (typeof GOAL_OPTIONS)[number]['id'];

const DEADLINE_OPTIONS = [
  { value: '6m', label: '6 meses' },
  { value: '1y', label: '1 ano' },
  { value: '2y', label: '2 anos' },
  { value: '5y', label: '5 anos' },
  { value: 'none', label: 'Sem prazo' },
] as const;

type DeadlineValue = (typeof DEADLINE_OPTIONS)[number]['value'];

const metaSchema = z.object({
  goalId: z.enum(['imovel', 'carro', 'viagem', 'reserva', 'outro']),
  goalDisplayText: z.string().trim().min(1, 'Descreva seu objetivo'),
  goalAmount: z.number({ message: 'Informe um valor' }).min(1, 'Informe um valor maior que zero'),
  goalDeadline: z.enum(['6m', '1y', '2y', '5y', 'none']),
});

type MetaFormValues = z.infer<typeof metaSchema>;

const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function deadlineToISO(value: DeadlineValue): string | undefined {
  if (value === 'none') return undefined;
  const now = new Date();
  switch (value) {
    case '6m':
      now.setMonth(now.getMonth() + 6);
      break;
    case '1y':
      now.setFullYear(now.getFullYear() + 1);
      break;
    case '2y':
      now.setFullYear(now.getFullYear() + 2);
      break;
    case '5y':
      now.setFullYear(now.getFullYear() + 5);
      break;
  }
  return now.toISOString().split('T')[0];
}

function getDefaultGoalId(data: OnboardingData): GoalId {
  if (!data.goalName) return 'imovel';
  const byLabel = GOAL_OPTIONS.find((g) => g.label === data.goalName);
  if (byLabel) return byLabel.id;
  return 'outro';
}

function getDefaultGoalDisplayText(data: OnboardingData): string {
  if (!data.goalName) {
    return GOAL_OPTIONS.find((g) => g.id === 'imovel')!.label;
  }
  const byLabel = GOAL_OPTIONS.find((g) => g.label === data.goalName);
  if (byLabel) return data.goalName;
  return data.goalName;
}

interface StepMetaProps {
  data: OnboardingData;
  onNext: (d: Partial<OnboardingData>) => void;
}

export function StepMeta({ data, onNext }: StepMetaProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<MetaFormValues>({
    resolver: zodResolver(metaSchema),
    defaultValues: {
      goalId: getDefaultGoalId(data),
      goalDisplayText: getDefaultGoalDisplayText(data),
      goalAmount: data.goalAmount ?? 0,
      goalDeadline: '1y',
    },
  });

  const selectedGoalId = watch('goalId') as GoalId | undefined;
  const goalAmount = watch('goalAmount');
  const formattedAmount = Number.isFinite(Number(goalAmount))
    ? brlFormatter.format(Number(goalAmount) || 0)
    : brlFormatter.format(0);

  const onSubmit = (values: MetaFormValues) => {
    onNext({
      goalName: values.goalDisplayText.trim(),
      goalAmount: values.goalAmount,
      goalDeadline: deadlineToISO(values.goalDeadline),
    });
  };

  const handleSkip = () => onNext({});

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-label text-nox-accent uppercase">Sua meta</p>
        <h2 className="text-h3 text-nox-txt">Qual é seu principal objetivo financeiro?</h2>
      </div>

      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Objetivo financeiro">
        {GOAL_OPTIONS.map((goal) => {
          const isSelected = selectedGoalId === goal.id;
          return (
            <button
              key={goal.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => {
                setValue('goalId', goal.id, { shouldValidate: true });
                setValue('goalDisplayText', goal.id === 'outro' ? '' : goal.label, {
                  shouldValidate: true,
                });
              }}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all ${
                isSelected
                  ? 'border-nox-accent bg-nox-bg3'
                  : 'border-nox-border bg-nox-bg2 hover:border-nox-txt3'
              }`}
            >
              <span aria-hidden="true" className="text-2xl">
                {goal.emoji}
              </span>
              <span className="text-caption text-nox-txt">{goal.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="goalDisplayText" className="text-label text-nox-accent uppercase">
          Descreva seu objetivo
        </label>
        <input
          id="goalDisplayText"
          type="text"
          autoFocus={selectedGoalId === 'outro'}
          placeholder={selectedGoalId === 'outro' ? 'Descreva seu objetivo...' : ''}
          aria-invalid={!!errors.goalDisplayText}
          className="border-nox-border bg-nox-bg text-body text-nox-txt placeholder:text-nox-txt3 focus:border-nox-accent focus:ring-nox-accent/40 mt-1 w-full rounded-xl border px-4 py-3 text-[14px] outline-none transition-colors focus:ring-2"
          {...register('goalDisplayText')}
        />
        {errors.goalDisplayText ? (
          <p className="text-caption text-nox-red">{errors.goalDisplayText.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="goalAmount" className="text-label text-nox-accent uppercase">
          Valor objetivo
        </label>
        <input
          id="goalAmount"
          type="number"
          inputMode="decimal"
          min={0}
          step={100}
          placeholder="R$ 0,00"
          aria-invalid={!!errors.goalAmount}
          className="border-nox-border bg-nox-bg text-body text-nox-txt placeholder:text-nox-txt3 focus:border-nox-accent focus:ring-nox-accent/40 rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
          {...register('goalAmount', { valueAsNumber: true })}
        />
        <p className="text-caption text-nox-txt2">{formattedAmount}</p>
        {errors.goalAmount ? (
          <p className="text-caption text-nox-red">{errors.goalAmount.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="goalDeadline" className="text-label text-nox-accent uppercase">
          Prazo
        </label>
        <select
          id="goalDeadline"
          className="border-nox-border bg-nox-bg text-body text-nox-txt focus:border-nox-accent focus:ring-nox-accent/40 rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
          {...register('goalDeadline')}
        >
          {DEADLINE_OPTIONS.map((d) => (
            <option key={d.value} value={d.value} className="bg-nox-bg2">
              {d.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-3">
        <button
          type="submit"
          className="rounded-pill bg-nox-accent text-nox-bg inline-flex items-center justify-center px-6 py-3 text-[15px] font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          Continuar
        </button>
        <button
          type="button"
          onClick={handleSkip}
          className="rounded-pill border-nox-border text-nox-txt2 hover:border-nox-txt3 hover:text-nox-txt inline-flex items-center justify-center border bg-transparent px-6 py-3 text-[15px] font-medium transition-all duration-200"
        >
          Pular
        </button>
      </div>
    </form>
  );
}
