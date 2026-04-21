import Link from 'next/link';
import { redirect } from 'next/navigation';

import { auth, signOut } from '@/auth';

async function signOutAction() {
  'use server';
  await signOut({ redirectTo: '/' });
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/entrar');

  return (
    <div className="bg-nox-bg min-h-screen">
      <header className="border-nox-border bg-nox-bg/80 sticky top-0 z-40 border-b backdrop-blur-[20px]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 transition-opacity hover:opacity-70"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-nox-accent">
              <path
                d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
                fillOpacity="0.12"
              />
            </svg>
            <span className="text-nox-txt text-[15px] font-medium tracking-[-0.02em]">nox</span>
          </Link>

          <nav className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="text-nox-txt2 hover:text-nox-txt rounded-pill px-4 py-2 text-[14px] transition-colors"
            >
              Dashboard
            </Link>
            <form action={signOutAction}>
              <button
                type="submit"
                className="text-nox-txt3 hover:text-nox-txt rounded-pill px-4 py-2 text-[14px] transition-colors"
              >
                Sair
              </button>
            </form>
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
}
