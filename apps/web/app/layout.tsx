import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';

import { Providers } from '@/components/providers';

import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Nox: Enquanto você dorme, eu cuido do seu dinheiro.',
    template: '%s · Nox',
  },
  description:
    'Assistente financeiro brasileiro com agentes de IA que monitoram sua vida financeira 24h por dia.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  openGraph: {
    title: 'Nox: Enquanto você dorme, eu cuido do seu dinheiro.',
    description:
      'Um time de agentes financeiros que monitoram sua vida financeira 24h por dia, e te avisam só quando importa.',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#080808',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${dmSans.variable} scroll-smooth`}>
      <body className="bg-nox-bg text-nox-txt antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
