'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { StreakProvider } from '@/components/streak/StreakContext';
import { Toaster } from 'react-hot-toast';
import { SmoothScroll } from '@/components/motion/SmoothScroll';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StreakProvider>
        <SmoothScroll>
          {children}
          <Toaster position="top-center" reverseOrder={false} />
        </SmoothScroll>
      </StreakProvider>
    </ThemeProvider>
  );
}

