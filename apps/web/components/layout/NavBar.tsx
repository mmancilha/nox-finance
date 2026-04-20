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
      style={{
        background:
          'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.08) 28%, rgba(12, 12, 12, 0.42) 72%, rgba(12, 12, 12, 0.32) 100%)',
        boxShadow: '0 14px 36px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.16)',
      }}
      className="rounded-pill backdrop-blur-nav backdrop-saturate-180 fixed left-1/2 top-5 isolate z-50 flex w-[calc(100%-48px)] max-w-[780px] -translate-x-1/2 items-center justify-between gap-4 overflow-hidden px-6 py-3"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(130%_90%_at_4%_-30%,rgba(255,255,255,0.32)_0%,transparent_42%),radial-gradient(80%_100%_at_100%_0%,rgba(240,120,84,0.12)_0%,transparent_55%)]"
      />

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
