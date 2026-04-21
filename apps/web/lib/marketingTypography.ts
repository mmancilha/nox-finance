/**
 * Tipografia de lead / navegação editorial (hero home).
 * Peso leve + escala lg/xl — manter em sinc com o `<p>` do hero.
 */
export const MARKETING_LEAD = 'font-light text-lg leading-relaxed sm:text-xl' as const;

/**
 * Mesmo tom (leve), um degrau menor — cabe confortável nos pills Entrar/Começar.
 */
export const MARKETING_LEAD_NAV_CTA =
  'font-light text-base leading-normal sm:text-lg sm:leading-snug' as const;

/**
 * Rótulo de seção (uppercase / accent) — mesmo “tom” do lead do hero (peso leve, escala editorial).
 */
export const MARKETING_SECTION_EYEBROW =
  'font-light text-base uppercase leading-normal tracking-[0.14em] text-nox-accent sm:text-lg' as const;
