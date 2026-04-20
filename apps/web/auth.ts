import NextAuth, { type DefaultSession, type User } from 'next-auth';
import 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';

declare module 'next-auth' {
  interface Session {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      plan: string;
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    plan?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    plan?: string;
    accessToken?: string;
    refreshToken?: string;
    googleIdToken?: string;
  }
}

type LoginResponse = {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    plan: string;
  };
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'E-mail', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials): Promise<User | null> {
        const email = typeof credentials?.email === 'string' ? credentials.email : '';
        const password = typeof credentials?.password === 'string' ? credentials.password : '';
        if (!email || !password) return null;

        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });
          if (!res.ok) return null;

          const data = (await res.json()) as LoginResponse;
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            plan: data.user.plan,
            accessToken: data.access_token,
            refreshToken: data.refresh_token,
          };
        } catch {
          return null;
        }
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id ?? token.id;
        token.plan = user.plan ?? 'free';
        token.accessToken = user.accessToken ?? '';
        token.refreshToken = user.refreshToken ?? '';
      }
      if (account?.provider === 'google' && account.id_token) {
        token.googleIdToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id ?? '';
      session.user.plan = token.plan ?? 'free';
      session.accessToken = token.accessToken ?? '';
      session.refreshToken = token.refreshToken ?? '';
      return session;
    },
  },
  pages: {
    signIn: '/entrar',
    error: '/entrar',
  },
  session: { strategy: 'jwt' },
});
