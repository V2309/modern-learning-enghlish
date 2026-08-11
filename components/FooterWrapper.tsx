'use client';

import { usePathname } from 'next/navigation';

const HIDE_FOOTER_PATHS = ['/login', '/register', '/sign-in', '/sign-up', '/auth/sign-in', '/auth/sign-up'];

export function FooterWrapper() {
  const pathname = usePathname();
  const isShadowingPlayer = pathname?.startsWith('/shadowing/') && pathname !== '/shadowing';
  const shouldHide = HIDE_FOOTER_PATHS.includes(pathname ?? '') || pathname?.startsWith('/auth') || isShadowingPlayer || pathname === '/';
  
  if (shouldHide) return null;
  
  return (
    <footer className="w-full py-8 border-t border-border mt-20 bg-card text-center text-xs text-muted-foreground">
      <div className="container mx-auto px-4">
        <p className="font-semibold mb-2">Linguify © 2026</p>
        <p>Hệ thống tự học ngoại ngữ tăng cường bởi AI thông minh.</p>
      </div>
    </footer>
  );
}
