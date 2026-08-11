'use client';

import React from 'react';
import { useShadowingPlayer } from './ShadowingPlayerContext';
import { ShadowingTranscript } from './ShadowingTranscript';

export function ShadowingSidebar() {
  const { isDesktopSidebarOpen } = useShadowingPlayer();

  if (!isDesktopSidebarOpen) return null;

  return (
    <div className="hidden lg:block lg:col-span-4 lg:h-full transition-all duration-300 overflow-hidden">
      <ShadowingTranscript isMobile={false} />
    </div>
  );
}
