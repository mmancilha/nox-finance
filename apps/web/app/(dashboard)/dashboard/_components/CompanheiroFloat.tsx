'use client';

import { useState } from 'react';

import { CompanheiroChat } from './CompanheiroChat';

interface Props {
  accessToken: string;
}

export function CompanheiroFloat({ accessToken }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Fechar Companheiro' : 'Abrir Companheiro'}
        className="bg-nox-accent fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-[22px] shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? '✕' : '💬'}
      </button>

      {open && (
        <div className="bg-nox-bg2 border-nox-border fixed bottom-24 right-6 z-50 w-[360px] overflow-hidden rounded-2xl border shadow-2xl">
          <div className="border-nox-border flex items-center justify-between border-b px-4 py-3">
            <span className="text-nox-txt text-[14px] font-medium">💬 Companheiro</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-nox-txt3 hover:text-nox-txt text-[18px] leading-none"
              aria-label="Fechar"
            >
              ✕
            </button>
          </div>
          <div className="h-[420px]">
            <CompanheiroChat accessToken={accessToken} />
          </div>
        </div>
      )}
    </>
  );
}
