import Link from 'next/link';

const footerLinks = [
  { href: '#', label: 'Privacidade' },
  { href: '#', label: 'Termos' },
  { href: '#', label: 'Contato' },
] as const;

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-nox-border bg-nox-bg2 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-14 md:flex-row md:items-start md:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2">
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
          <p className="text-caption text-nox-txt3 mt-3 max-w-xs">
            Enquanto você dorme, eu cuido do seu dinheiro.
          </p>
        </div>

        <nav className="flex flex-col gap-3 sm:flex-row sm:gap-10" aria-label="Rodapé">
          {footerLinks.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-caption text-nox-txt3 hover:text-nox-txt transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-nox-border border-t px-6 py-6">
        <p className="text-caption text-nox-txt3 mx-auto max-w-6xl text-center">
          © {year} Nox. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
