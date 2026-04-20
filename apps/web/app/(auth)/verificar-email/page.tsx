import Link from 'next/link';

export default function VerificarEmailPage() {
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
        Voltar para o início
      </Link>

      <div className="border-nox-border bg-nox-bg2 rounded-2xl border p-8 text-center">
        <div className="border-nox-border bg-nox-bg3 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="32"
            height="32"
            aria-hidden="true"
            className="text-nox-accent"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m3 7 9 6 9-6" />
          </svg>
        </div>

        <h2 className="text-h3 text-nox-txt">Verifique seu e-mail</h2>
        <p className="text-body text-nox-txt2 mx-auto mt-3 max-w-sm">
          Enviamos um link de acesso para o seu e-mail. Clique no link para entrar no Nox.
        </p>

        <Link
          href="/entrar"
          className="rounded-pill border-nox-border text-nox-txt hover:border-nox-accent hover:text-nox-accent mt-8 inline-flex items-center justify-center gap-2 border bg-transparent px-6 py-3 text-[15px] font-medium transition-all duration-200"
        >
          Voltar para o login
        </Link>
      </div>
    </div>
  );
}
