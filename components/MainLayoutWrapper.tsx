'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Full-bleed routes that manage their own full-screen layouts or custom sidebar viewports
  const isFullBleed =
    pathname === '/' ||
    pathname?.startsWith('/vocabulary/topic/') ||
    pathname?.startsWith('/auth');

  if (isFullBleed) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <main className="flex-1 w-full">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 py-6 md:py-8">
        {children}
      </div>
    </main>
  );
}
