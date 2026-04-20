interface StepConectarBancoProps {
  onFinish: () => void;
  onSkip: () => void;
}

const SUPPORTED_BANKS = [
  { emoji: '🟣', name: 'Nubank' },
  { emoji: '🔵', name: 'Itaú' },
  { emoji: '🔴', name: 'Santander' },
  { emoji: '🟡', name: 'Bradesco' },
  { emoji: '⬛', name: 'Banco do Brasil' },
] as const;

export function StepConectarBanco({ onFinish, onSkip }: StepConectarBancoProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <p className="text-label text-nox-accent uppercase">Conectar banco</p>
        <h2 className="text-h3 text-nox-txt">Conecte sua conta bancária</h2>
        <p className="text-body text-nox-txt2">
          Visualize seus gastos, receitas e investimentos em um só lugar. Conexão segura via Open
          Finance Brasil.
        </p>
      </div>

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

      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onFinish}
          className="rounded-pill bg-nox-accent text-nox-bg inline-flex items-center justify-center px-6 py-3 text-[15px] font-medium transition-all duration-200 hover:brightness-110 active:scale-[0.98]"
        >
          Conectar meu banco
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="rounded-pill border-nox-border text-nox-txt2 hover:border-nox-txt3 hover:text-nox-txt inline-flex items-center justify-center border bg-transparent px-6 py-3 text-[15px] font-medium transition-all duration-200"
        >
          Fazer isso depois
        </button>
      </div>

      <p className="text-caption text-nox-txt3 text-center">
        🔒 Seus dados bancários nunca são armazenados. Conexão via Open Finance.
      </p>
    </div>
  );
}
