import Link from 'next/link';

/**
 * Landing placeholder do Sprint 1.
 * A landing completa (baseada em nox-design/Nox Landing Page v2.html) entra no Sprint 2.
 */
export default function HomePage() {
  return (
    <main className="bg-nox-bg text-nox-txt relative min-h-screen overflow-hidden">
      {/* Glow âmbar-coral central (hero) */}
      <div aria-hidden className="bg-hero-glow pointer-events-none absolute inset-0" />

      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <span className="label mb-6">Sprint 1 · Fundação pronta</span>

        <h1 className="text-hero text-nox-txt max-w-4xl">
          Enquanto você dorme,
          <br />
          eu cuido do seu dinheiro.
        </h1>

        <p className="text-body text-nox-txt2 mt-8 max-w-2xl">
          Um time de agentes financeiros monitorando sua vida financeira 24h por dia — e te avisando
          só quando importa.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <Link href="/register" className="btn-primary">
            Entrar no Nox
          </Link>
          <Link href="#agentes" className="btn-ghost">
            Conhecer os agentes
          </Link>
        </div>

        <p className="text-caption text-nox-txt3 mt-16">
          Nox · v0.1.0 · Sprint 1 · {new Date().getFullYear()}
        </p>
      </section>
    </main>
  );
}
