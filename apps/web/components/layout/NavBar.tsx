'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';
import { MARKETING_LEAD, MARKETING_LEAD_NAV_CTA } from '@/lib/marketingTypography';

const navLinks = [
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#agentes', label: 'Agentes' },
  { href: '/#precos', label: 'Preços' },
] as const;

const SCROLL_THRESHOLD_PX = 12;

export function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [ctaPill, setCtaPill] = useState<'entrar' | 'comecar'>('comecar');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      aria-label="Navegação principal"
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-[background-color,backdrop-filter,box-shadow,border-color] duration-300',
        /* Vidro mais transparente: fundo com alpha menor + blur forte para a leitura continuar ok */
        scrolled
          ? 'border-nox-border/70 bg-nox-bg/68 shadow-[0_4px_28px_rgba(0,0,0,0.22)] backdrop-blur-[32px] backdrop-saturate-150'
          : 'bg-nox-bg/52 border-transparent backdrop-blur-[18px] backdrop-saturate-150',
      )}
    >
      <div className="mx-auto flex h-14 min-h-[56px] w-full max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:min-h-[60px] sm:px-6 md:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
            className="text-nox-accent"
          >
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
          <span className={cn(MARKETING_LEAD, 'text-nox-txt tracking-[-0.04em]')}>nox</span>
        </Link>

        <div className="hidden flex-1 justify-center md:flex">
          <div className="flex items-center gap-0.5 lg:gap-1">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  MARKETING_LEAD,
                  'text-nox-txt2 hover:text-nox-txt rounded-pill px-3 py-2 transition-colors duration-150 lg:px-4',
                )}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div
          className={cn(
            'rounded-pill border p-1',
            scrolled ? 'border-nox-border bg-nox-bg2/70' : 'border-nox-border/90 bg-nox-bg2/55',
          )}
          onMouseLeave={() => setCtaPill('comecar')}
        >
          {/* Sem gap: metades exatas 50/50; pílula w-1/2 + translate-x-full alinha com cada botão */}
          <div className="rounded-pill relative flex min-w-[15rem] shrink-0 overflow-hidden sm:min-w-[16.25rem]">
            <span
              aria-hidden
              className={cn(
                'rounded-pill bg-nox-txt pointer-events-none absolute inset-y-0 left-0 z-0 w-1/2',
                'shadow-[inset_0_1px_0_rgba(255,255,255,0.45),inset_0_-1px_0_rgba(0,0,0,0.07)]',
                'transition-transform duration-[640ms] ease-[cubic-bezier(0.22,1,0.28,1)] will-change-transform',
                'motion-reduce:duration-150 motion-reduce:ease-linear',
                ctaPill === 'comecar' && 'translate-x-full',
              )}
            />
            <Link
              href="/entrar"
              className={cn(
                MARKETING_LEAD_NAV_CTA,
                'relative z-10 flex min-h-[46px] min-w-0 flex-1 basis-0 items-center justify-center px-5 py-2.5 transition-colors duration-[640ms] ease-[cubic-bezier(0.22,1,0.28,1)] motion-reduce:duration-150 motion-reduce:ease-linear sm:min-h-[50px] sm:px-6',
                ctaPill === 'entrar' ? 'text-nox-bg' : 'text-nox-txt2',
                'focus-visible:outline-nox-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
              )}
              onMouseEnter={() => setCtaPill('entrar')}
              onFocus={() => setCtaPill('entrar')}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className={cn(
                MARKETING_LEAD_NAV_CTA,
                'relative z-10 flex min-h-[46px] min-w-0 flex-1 basis-0 items-center justify-center px-5 py-2.5 transition-colors duration-[640ms] ease-[cubic-bezier(0.22,1,0.28,1)] motion-reduce:duration-150 motion-reduce:ease-linear sm:min-h-[50px] sm:px-6',
                ctaPill === 'comecar' ? 'text-nox-bg' : 'text-nox-txt2',
                'focus-visible:outline-nox-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
                'active:scale-[0.98]',
              )}
              onMouseEnter={() => setCtaPill('comecar')}
              onFocus={() => setCtaPill('comecar')}
            >
              Começar
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
