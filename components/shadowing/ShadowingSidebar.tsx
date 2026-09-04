'use client';

import React from 'react';
import { useShadowingPlayer } from './ShadowingPlayerContext';
import { ShadowingTranscript } from './ShadowingTranscript';

export function ShadowingSidebar() {
  const { isDesktopSidebarOpen } = useShadowingPlayer();

  if (!isDesktopSidebarOpen) return null;

  return (
    <div className="hidden lg:flex lg:col-span-5 xl:col-span-4 h-full flex-col overflow-hidden p-0 m-0 bg-card/20">
      <ShadowingTranscript isMobile={false} />
    </div>
  );
}

