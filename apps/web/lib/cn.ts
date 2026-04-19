import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Helper padrão pra compor classes Tailwind com merge inteligente. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
