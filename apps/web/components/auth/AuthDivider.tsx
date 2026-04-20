export function AuthDivider({ label = 'ou' }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3" role="separator" aria-label={label}>
      <span className="bg-nox-border h-px flex-1" />
      <span className="text-caption text-nox-txt3 uppercase tracking-widest">{label}</span>
      <span className="bg-nox-border h-px flex-1" />
    </div>
  );
}
