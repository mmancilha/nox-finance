'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import type { OnboardingData } from './types';

const AVATAR_OPTIONS = ['💰', '💎', '🌙', '⭐', '🦁', '🐉', '🚀', '🌿'] as const;
const DEFAULT_AVATAR = '🌙';

const perfilSchema = z.object({
  preferredName: z.string().min(1, 'Informe como prefere ser chamado').max(40),
  avatarEmoji: z.string().min(1),
});

type PerfilFormValues = z.infer<typeof perfilSchema>;

interface StepPerfilProps {
  data: OnboardingData;
  onNext: (d: Partial<OnboardingData>) => void;
}

export function StepPerfil({ data, onNext }: StepPerfilProps) {
  const { data: session } = useSession();
  const sessionFirstName = session?.user?.name?.split(' ')[0] ?? '';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      preferredName: data.preferredName ?? sessionFirstName,
      avatarEmoji: data.avatarEmoji ?? DEFAULT_AVATAR,
    },
  });

  const selectedAvatar = watch('avatarEmoji');

  useEffect(() => {
    if (!data.preferredName && sessionFirstName) {
      setValue('preferredName', sessionFirstName);
    }
  }, [data.preferredName, sessionFirstName, setValue]);

  const onSubmit = (values: PerfilFormValues) => {
    onNext({
      preferredName: values.preferredName.trim(),
      avatarEmoji: values.avatarEmoji,
    });
  };

  const handleSkip = () => onNext({});

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-label text-nox-accent uppercase">Sobre você</p>
        <h2 className="text-h3 text-nox-txt">Como prefere ser chamado?</h2>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="preferredName" className="text-label text-nox-accent uppercase">
          Nome preferido
        </label>
        <input
          id="preferredName"
          type="text"
          autoComplete="given-name"
          placeholder="ex. Maycon"
          aria-invalid={!!errors.preferredName}
          className="border-nox-border bg-nox-bg text-body text-nox-txt placeholder:text-nox-txt3 focus:border-nox-accent focus:ring-nox-accent/40 rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
          {...register('preferredName')}
        />
        {errors.preferredName ? (
          <p className="text-caption text-nox-red">{errors.preferredName.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-label text-nox-accent uppercase">Escolha um avatar</span>
        <div role="radiogroup" aria-label="Avatar" className="grid grid-cols-4 gap-2">
          {AVATAR_OPTIONS.map((emoji) => {
            const isSelected = selectedAvatar === emoji;
            return (
              <button
                key={emoji}
                type="button"
                role="radio"
                aria-checked={isSelected}
                onClick={() => setValue('avatarEmoji', emoji, { shouldValidate: true })}
                className={`flex h-14 items-center justify-center rounded-xl border text-2xl transition-all ${
                  isSelected
                    ? 'border-nox-accent bg-nox-bg3'
                    : 'border-nox-border bg-nox-bg2 hover:border-nox-txt3'
                }`}
              >
                <span aria-hidden="true">{emoji}</span>
              </button>
            );
          })}
        </div>
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
