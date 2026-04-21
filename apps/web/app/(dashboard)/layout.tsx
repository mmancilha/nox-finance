'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { signOut } from 'next-auth/react';

const TABS = [
  { href: '/dashboard/visao-geral', label: 'Visão Geral' },
  { href: '/dashboard/transacoes', label: 'Transações' },
  { href: '/dashboard/agentes', label: 'Agentes' },
] as const;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isOnboarding = pathname.startsWith('/onboarding');

  return (
    <div className="bg-nox-bg min-h-screen">
      <header className="border-nox-border bg-nox-bg/80 sticky top-0 z-40 border-b backdrop-blur-[20px]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href={isOnboarding ? '/onboarding' : '/dashboard/visao-geral'}
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-nox-accent">
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity="0.12"
              />
            </svg>
            <span className="text-nox-txt text-[15px] font-medium tracking-[-0.02em]">nox</span>
          </Link>

          <button
            type="button"
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-nox-txt3 hover:text-nox-txt rounded-pill px-4 py-2 text-[14px] transition-colors"
          >
            Sair
          </button>
        </div>

        {!isOnboarding && (
          <div className="border-nox-border mx-auto flex max-w-5xl gap-1 border-t px-6">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={[
                    'relative px-4 py-3 text-[14px] font-medium transition-colors',
                    active ? 'text-nox-txt' : 'text-nox-txt3 hover:text-nox-txt2',
                  ].join(' ')}
                >
                  {tab.label}
                  {active && (
                    <span className="bg-nox-accent absolute bottom-0 left-4 right-4 h-[2px] rounded-full" />
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {children}
    </div>
  );
}
