'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import type {
  PluggyConnectConstructor,
  PluggyConnectInstance,
  PluggyConnectSuccessData,
} from '@/types/pluggy-connect';

interface StepConectarBancoProps {
  accessToken: string;
  onFinish: () => void;
  onSkip: () => void;
}

type ConnectionState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'connecting' }
  | { status: 'saving' }
  | { status: 'success'; institutionName: string }
  | { status: 'error'; message: string };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '';
const PLUGGY_CONNECT_CDN = 'https://cdn.pluggy.ai/pluggy-connect/v2/pluggy-connect.min.js';

const SUPPORTED_BANKS = [
  { emoji: '🟣', name: 'Nubank' },
  { emoji: '🔵', name: 'Itaú' },
  { emoji: '🔴', name: 'Santander' },
  { emoji: '🟡', name: 'Bradesco' },
  { emoji: '⬛', name: 'Banco do Brasil' },
] as const;

async function loadPluggyConnectFromCdn(): Promise<PluggyConnectConstructor> {
  if (typeof window === 'undefined') {
    throw new Error('Pluggy Connect só pode ser carregado no cliente');
  }

  if (window.PluggyConnect) {
    return window.PluggyConnect;
  }

  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${PLUGGY_CONNECT_CDN}"]`,
    );
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('Falha ao carregar Pluggy Connect')),
        { once: true },
      );
      return;
    }

    const script = document.createElement('script');
    script.src = PLUGGY_CONNECT_CDN;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Falha ao carregar Pluggy Connect'));
    document.head.appendChild(script);
  });

  if (!window.PluggyConnect) {
    throw new Error('Pluggy Connect não disponível após carregar o script');
  }
  return window.PluggyConnect;
}

export function StepConectarBanco({ accessToken, onFinish, onSkip }: StepConectarBancoProps) {
  const [state, setState] = useState<ConnectionState>({ status: 'idle' });
  const connectRef = useRef<PluggyConnectInstance | null>(null);

  useEffect(() => {
    return () => {
      connectRef.current?.destroy();
      connectRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (state.status !== 'success') return;
    const timer = window.setTimeout(() => onFinish(), 2000);
    return () => window.clearTimeout(timer);
  }, [state.status, onFinish]);

  const handleConnect = useCallback(async () => {
    setState({ status: 'loading' });

    try {
      const tokenRes = await fetch(`${API_URL}/banks/connect-token`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!tokenRes.ok) throw new Error('Erro ao gerar token de conexão');
      const { access_token: connectToken } = (await tokenRes.json()) as {
        access_token: string;
      };

      const PluggyConnectClass = await loadPluggyConnectFromCdn();

      setState({ status: 'connecting' });

      const instance = new PluggyConnectClass({
        connectToken,
        language: 'pt-BR',

        onSuccess: async (data: PluggyConnectSuccessData) => {
          setState({ status: 'saving' });
          const itemId = data.item.id;
          const institutionName = data.item.connector?.name ?? 'Banco';

          try {
            const saveRes = await fetch(
              `${API_URL}/banks/items/${itemId}?access_token=${encodeURIComponent(connectToken)}`,
              {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
              },
            );
            if (!saveRes.ok) throw new Error('Erro ao salvar contas bancárias');
            setState({ status: 'success', institutionName });
          } catch (err) {
            const msg = err instanceof Error ? err.message : 'Erro desconhecido';
            setState({ status: 'error', message: msg });
          }
        },

        onError: (err: Error) => {
          setState({ status: 'error', message: err?.message ?? 'Erro na conexão' });
        },

        onClose: () => {
          setState((prev) => (prev.status === 'connecting' ? { status: 'idle' } : prev));
        },
      });

      connectRef.current = instance;
      instance.init();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao iniciar conexão';
      setState({ status: 'error', message: msg });
    }
  }, [accessToken]);

  const isSuccess = state.status === 'success';
  const isLoading =
    state.status === 'loading' || state.status === 'connecting' || state.status === 'saving';

  const primaryLabel =
    state.status === 'loading'
      ? 'Preparando conexão...'
      : state.status === 'connecting'
        ? 'Aguardando...'
        : state.status === 'saving'
          ? 'Salvando contas...'
          : state.status === 'error'
            ? 'Tentar novamente'
            : 'Conectar meu banco';

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-label text-nox-accent uppercase">Conectar banco</p>
        <h2 className="text-h3 text-nox-txt">
          {isSuccess ? '✅ Banco conectado!' : 'Conecte sua conta bancária'}
        </h2>
        <p className="text-body text-nox-txt2">
          {isSuccess
            ? `${state.institutionName} conectado. Sincronizando suas transações...`
            : 'Visualize seus gastos, receitas e investimentos em um só lugar. Conexão segura via Open Finance Brasil.'}
        </p>
      </div>

      {!isSuccess ? (
        <div className="border-nox-border bg-nox-bg3 flex flex-col items-center gap-3 rounded-xl border p-4">
          <ul className="text-caption text-nox-txt2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            {SUPPORTED_BANKS.map((bank, idx) => (
              <li key={bank.name} className="flex items-center gap-2">
                <span aria-hidden="true">{bank.emoji}</span>
                <span>{bank.name}</span>
                {idx < SUPPORTED_BANKS.length - 1 ? (
                  <span aria-hidden="true" className="text-nox-txt3">
                    ·
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
          <p className="text-caption text-nox-txt3">e mais de 200 instituições</p>
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div
          role="alert"
          className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 text-center"
        >
          <p className="text-caption text-nox-red">{state.message}</p>
        </div>
      ) : null}

      {!isSuccess ? (
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleConnect}
            disabled={isLoading}
            className="rounded-pill bg-nox-accent text-nox-bg inline-flex items-center justify-center gap-2 px-6 py-3 text-[15px] font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === 'loading' ? (
              <span
                aria-hidden="true"
                className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              />
            ) : null}
            {primaryLabel}
          </button>

          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className="rounded-pill border-nox-border text-nox-txt2 hover:border-nox-txt3 hover:text-nox-txt inline-flex items-center justify-center border bg-transparent px-6 py-3 text-[15px] font-medium transition-all duration-200 disabled:opacity-40"
          >
            Fazer isso depois
          </button>
        </div>
      ) : null}

      <p className="text-caption text-nox-txt3 text-center">
        🔒 Seus dados bancários nunca são armazenados. Conexão via Open Finance.
      </p>
    </div>
  );
}
