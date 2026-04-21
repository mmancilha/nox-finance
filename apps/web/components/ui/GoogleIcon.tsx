type GoogleIconProps = {
  className?: string;
};

export function GoogleIcon({ className }: GoogleIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- ícone estático 18x18, next/image não agrega valor
    <img
      src="/icons/google-logo.svg"
      alt=""
      aria-hidden="true"
      className={className}
      width={18}
      height={18}
      decoding="async"
      draggable="false"
    />
  );
}
