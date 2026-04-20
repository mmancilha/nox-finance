'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { GoogleIcon } from '@/components/ui/GoogleIcon';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function EntrarForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setSubmitError(null);
    const result = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (!result || result.error) {
      setSubmitError('E-mail ou senha incorretos.');
      return;
    }

    router.push(callbackUrl);
    router.refresh();
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    setSubmitError(null);
    try {
      await signIn('google', { callbackUrl });
    } catch {
      setSubmitError('Não foi possível continuar com o Google. Tente novamente.');
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Link
        href="/"
        className="text-caption text-nox-txt3 hover:text-nox-txt mb-6 inline-flex items-center gap-1.5 self-start transition-colors"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 12H5M12 5l-7 7 7 7" />
        </svg>
        Voltar ao site
      </Link>

      <div className="border-nox-border bg-nox-bg2 rounded-2xl border p-8">
        <header className="mb-8 text-center">
          <p className="text-nox-txt font-sans text-2xl font-extrabold tracking-tight">nox</p>
          <h1 className="text-h3 text-nox-txt mt-6">Bem-vindo de volta</h1>
          <p className="text-caption text-nox-txt2 mt-2">Entre na sua conta Nox</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-label text-nox-accent uppercase">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="voce@email.com"
              aria-invalid={!!errors.email}
              className="border-nox-border bg-nox-bg text-body text-nox-txt placeholder:text-nox-txt3 focus:border-nox-accent focus:ring-nox-accent/40 rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
              {...register('email')}
            />
            {errors.email ? (
              <p className="text-caption text-nox-red">{errors.email.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-label text-nox-accent uppercase">
              Senha
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Sua senha"
              aria-invalid={!!errors.password}
              className="border-nox-border bg-nox-bg text-body text-nox-txt placeholder:text-nox-txt3 focus:border-nox-accent focus:ring-nox-accent/40 rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-caption text-nox-red">{errors.password.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-pill bg-nox-accent text-nox-bg mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 text-[15px] font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando…' : 'Entrar'}
          </button>

          {submitError ? (
            <p role="alert" className="text-caption text-nox-red text-center">
              {submitError}
            </p>
          ) : null}
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="bg-nox-border h-px flex-1" />
          <span className="text-caption text-nox-txt3">ou</span>
          <div className="bg-nox-border h-px flex-1" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={isGoogleLoading}
          className="rounded-pill border-nox-border text-nox-txt hover:border-nox-accent hover:text-nox-accent inline-flex w-full items-center justify-center gap-3 border bg-transparent px-6 py-3 text-[15px] font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          {isGoogleLoading ? 'Conectando…' : 'Continuar com Google'}
        </button>

        <p className="text-caption text-nox-txt2 mt-8 text-center">
          Não tem conta?{' '}
          <Link href="/cadastro" className="text-nox-accent hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col">
          <Link
            href="/"
            className="text-caption text-nox-txt3 hover:text-nox-txt mb-6 inline-flex items-center gap-1.5 self-start transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Voltar ao site
          </Link>
          <div className="border-nox-border bg-nox-bg2 rounded-2xl border p-8" />
        </div>
      }
    >
      <EntrarForm />
    </Suspense>
  );
}
