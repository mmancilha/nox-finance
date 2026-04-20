'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { GoogleIcon } from '@/components/ui/GoogleIcon';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Informe seu nome completo'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não conferem',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

type ApiErrorResponse = {
  detail?: string | { msg?: string }[];
};

export default function CadastroPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setSubmitError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          password: values.password,
        }),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as ApiErrorResponse;
        const message =
          typeof data.detail === 'string'
            ? data.detail
            : 'Não foi possível criar sua conta. Tente novamente.';
        setSubmitError(message);
        return;
      }

      const signInResult = await signIn('credentials', {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (!signInResult || signInResult.error) {
        setSubmitError('Conta criada, mas falha ao iniciar sessão. Tente entrar manualmente.');
        return;
      }

      router.push('/onboarding');
      router.refresh();
    } catch {
      setSubmitError('Não foi possível conectar ao servidor. Verifique sua conexão.');
    }
  };

  const handleGoogle = async () => {
    setIsGoogleLoading(true);
    setSubmitError(null);
    try {
      await signIn('google', { callbackUrl: '/onboarding' });
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
          <h1 className="text-h3 text-nox-txt mt-6">Criar sua conta</h1>
          <p className="text-caption text-nox-txt2 mt-2">Comece a cuidar do seu dinheiro hoje</p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-label text-nox-accent uppercase">
              Nome completo
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Seu nome"
              aria-invalid={!!errors.name}
              className="border-nox-border bg-nox-bg text-body text-nox-txt placeholder:text-nox-txt3 focus:border-nox-accent focus:ring-nox-accent/40 rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
              {...register('name')}
            />
            {errors.name ? (
              <p className="text-caption text-nox-red">{errors.name.message}</p>
            ) : null}
          </div>

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
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              aria-invalid={!!errors.password}
              className="border-nox-border bg-nox-bg text-body text-nox-txt placeholder:text-nox-txt3 focus:border-nox-accent focus:ring-nox-accent/40 rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
              {...register('password')}
            />
            {errors.password ? (
              <p className="text-caption text-nox-red">{errors.password.message}</p>
            ) : null}
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="confirmPassword" className="text-label text-nox-accent uppercase">
              Confirmar senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              aria-invalid={!!errors.confirmPassword}
              className="border-nox-border bg-nox-bg text-body text-nox-txt placeholder:text-nox-txt3 focus:border-nox-accent focus:ring-nox-accent/40 rounded-2xl border px-4 py-3 focus:outline-none focus:ring-2"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? (
              <p className="text-caption text-nox-red">{errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-pill bg-nox-accent text-nox-bg mt-2 inline-flex items-center justify-center gap-2 px-6 py-3 text-[15px] font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Criando conta…' : 'Criar conta'}
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
          {isGoogleLoading ? 'Conectando…' : 'Cadastrar com Google'}
        </button>

        <p className="text-caption text-nox-txt2 mt-8 text-center">
          Já tem conta?{' '}
          <Link href="/entrar" className="text-nox-accent hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
