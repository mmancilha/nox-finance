import { NextResponse } from 'next/server';

import { auth } from '@/auth';

const PROTECTED_PREFIXES = ['/dashboard', '/onboarding'];
const AUTH_ONLY_PATHS = new Set(['/entrar', '/cadastro']);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL('/entrar', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && AUTH_ONLY_PATHS.has(pathname)) {
    return NextResponse.redirect(new URL('/dashboard/visao-geral', req.url));
  }

  return NextResponse.next();
});

/** Dashboard/onboarding: proteção + abas. /entrar e /cadastro: redirect se já logado. */
export const config = {
  matcher: [
    '/dashboard',
    '/dashboard/:path*',
    '/onboarding',
    '/onboarding/:path*',
    '/entrar',
    '/cadastro',
  ],
};
