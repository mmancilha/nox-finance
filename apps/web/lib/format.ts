/**
 * Formatadores pt-BR — use SEMPRE estes (.cursorrules).
 */

export const formatBRL = (value: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR').format(d);
};

export const formatDateLong = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(d);
};

/** Saudação dinâmica em pt-BR com base na hora local do servidor. */
export const greetingFromHour = (hour: number): 'Bom dia' | 'Boa tarde' | 'Boa noite' => {
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
};
