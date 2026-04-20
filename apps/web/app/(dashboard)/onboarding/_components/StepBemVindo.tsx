interface StepBemVindoProps {
  onNext: () => void;
}

const AGENTS = [
  { emoji: '🛡️', name: 'Sentinela', tagline: 'Detecta cobranças erradas' },
  { emoji: '🔮', name: 'Oráculo', tagline: 'Analisa seus padrões' },
  { emoji: '🧭', name: 'Norte', tagline: 'Monitora suas metas' },
  { emoji: '💬', name: 'Companheiro', tagline: 'Responde suas dúvidas' },
] as const;

export function StepBemVindo({ onNext }: StepBemVindoProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-label text-nox-accent uppercase">Bem-vindo ao Nox</p>
        <h2 className="text-h3 text-nox-txt">Seu time financeiro está pronto</h2>
        <p className="text-body text-nox-txt2">
          Enquanto você dorme, 4 agentes trabalham para cuidar do seu dinheiro.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {AGENTS.map((agent) => (
          <div
            key={agent.name}
            className="border-nox-border bg-nox-bg3 flex flex-col items-center gap-2 rounded-xl border p-4 text-center"
          >
            <span aria-hidden="true" className="text-2xl">
              {agent.emoji}
            </span>
            <p className="text-body text-nox-txt font-semibold">{agent.name}</p>
            <p className="text-caption text-nox-txt2">{agent.tagline}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onNext}
        className="rounded-pill bg-nox-accent text-nox-bg mt-2 inline-flex items-center justify-center px-6 py-3 text-[15px] font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
      >
        Começar
      </button>
    </div>
  );
}
