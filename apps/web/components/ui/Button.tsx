import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/cn';

const sizeClasses = {
  sm: 'px-4 py-2 text-sm min-h-[40px]',
  md: 'px-6 py-3 text-[15px] min-h-[48px]',
  lg: 'px-8 py-4 text-base min-h-[56px]',
} as const;

const variantClasses = {
  primary:
    'bg-nox-accent text-white hover:opacity-90 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-accent',
  ghost:
    'border border-nox-border bg-transparent text-nox-txt hover:bg-nox-bg2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-nox-border',
} as const;

export type ButtonProps = {
  variant?: keyof typeof variantClasses;
  size?: keyof typeof sizeClasses;
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  type?: 'button' | 'submit';
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  href,
  onClick,
  className,
  type = 'button',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-pill font-medium transition-all duration-200';

  if (href) {
    return (
      <Link href={href} className={cn(base, sizeClasses[size], variantClasses[variant], className)}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      className={cn(base, sizeClasses[size], variantClasses[variant], className)}
    >
      {children}
    </button>
  );
}
