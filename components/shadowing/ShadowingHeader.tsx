'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Menu } from 'lucide-react';
import { useShadowingPlayer } from './ShadowingPlayerContext';

export function ShadowingHeader() {
  const { isDesktopSidebarOpen, setIsDesktopSidebarOpen } = useShadowingPlayer();
  
  return (
    <div className="flex items-center justify-between mb-8">
      <Link href="/shadowing" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group font-semibold text-sm">
        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
        Back to Shadowing
      </Link>

      <div className="flex gap-2">
        <button
          onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
          className="hidden lg:flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-xl text-xs font-bold hover:bg-muted transition-all cursor-pointer"
        >
          <Menu className="h-4 w-4 text-primary" />
          <span>{isDesktopSidebarOpen ? 'Cinema View (Ẩn transcript)' : 'Hiện transcript'}</span>
        </button>
      </div>
    </div>
  );
}
