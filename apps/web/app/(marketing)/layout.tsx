import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import { Footer } from '@/components/layout/Footer';

const NavBar = dynamic(() => import('@/components/layout/NavBar').then((m) => m.NavBar));

export default function MarketingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
