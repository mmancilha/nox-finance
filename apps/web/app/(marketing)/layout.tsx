import type { ReactNode } from 'react';

import { Footer } from '@/components/layout/Footer';
import { NavBar } from '@/components/layout/NavBar';

export default function MarketingLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <>
      <NavBar />
      {children}
      <Footer />
    </>
  );
}
