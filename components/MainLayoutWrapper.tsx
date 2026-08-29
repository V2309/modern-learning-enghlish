'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export function MainLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Full-bleed routes that manage their own section backgrounds or full-height sidebars
  const isFullBleed =
    pathname === '/' ||
    pathname?.startsWith('/vocabulary/topic/') ||
    pathname?.startsWith('/my-courses/') ||
    pathname?.startsWith('/auth') ||
    pathname?.startsWith('/dictation/') ||
    pathname?.startsWith('/shadowing/');

  if (isFullBleed) {
    return <main className="flex-1 w-full">{children}</main>;
  }

  return (
    <main className="flex-1 w-full">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8">
        {children}
      </div>
    </main>
  );
}
