import type { ReactNode } from 'react';

interface AuthCardProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="border-nox-border bg-nox-bg2 rounded-2xl border p-8">
      <div className="mb-6 flex flex-col items-center text-center">
        <span className="text-nox-txt font-sans text-2xl font-extrabold tracking-tight">nox</span>
        <h1 className="text-h3 text-nox-txt mt-4">{title}</h1>
        <p className="text-caption text-nox-txt2 mt-1">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
