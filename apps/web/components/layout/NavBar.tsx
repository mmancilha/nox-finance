import Link from 'next/link';

import { Button } from '@/components/ui/Button';

const navLinks = [
  { href: '#como-funciona', label: 'Como funciona' },
  { href: '#agentes', label: 'Agentes' },
  { href: '#precos', label: 'Preços' },
] as const;

export function NavBar() {
  return (
    <nav
      aria-label="Navegação principal"
      style={{ background: 'var(--nav-bg)' }}
      className="rounded-pill border-nox-border shadow-nav backdrop-blur-nav fixed left-1/2 top-5 z-50 flex w-[calc(100%-48px)] max-w-[780px] -translate-x-1/2 items-center justify-between gap-4 border px-6 py-3"
    >
      <Link href="/" className="flex shrink-0 items-center gap-2">
        <svg
          width={18}
          height={18}
          viewBox="0 0 40 40"
          fill="none"
          className="text-nox-accent"
          aria-hidden
        >
          <path
            d="M20 7L31 11.5V21C31 27 27 32.5 20 34C13 32.5 9 27 9 21V11.5L20 7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            fill="none"
            strokeLinejoin="round"
          />
          <path d="M24 14A4 4 0 1 0 24 22A3.2 3.2 0 0 1 24 14Z" fill="currentColor" />
        </svg>
        <span className="text-nox-txt text-lg font-extrabold tracking-tight">nox</span>
      </Link>

      <div className="hidden flex-1 justify-center md:flex">
        <div className="flex gap-8">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-nox-txt3 hover:text-nox-txt rounded-pill px-3.5 py-1.5 text-sm font-medium transition-colors hover:bg-white/[0.05]"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="shrink-0">
        <Button href="/entrar" variant="ghost" size="sm">
          Entrar
        </Button>
      </div>
    </nav>
  );
}
