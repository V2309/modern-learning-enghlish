'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';

const HIDE_NAVBAR_PATHS = ['/login', '/register', '/sign-in', '/sign-up', '/auth/sign-in', '/auth/sign-up'];

export function NavbarWrapper() {
  const pathname = usePathname();
  const shouldHide = HIDE_NAVBAR_PATHS.includes(pathname ?? '') || pathname?.startsWith('/auth');
  if (shouldHide) return null;
  return <Navbar />;
}
