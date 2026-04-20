import type { ReactNode } from 'react';

export default function AuthLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="bg-nox-bg flex min-h-screen items-center justify-center px-4 py-16">
      <div className="border-nox-border bg-nox-bg2 shadow-nav w-full max-w-md rounded-2xl border p-8">
        {children}
      </div>
    </div>
  );
}
