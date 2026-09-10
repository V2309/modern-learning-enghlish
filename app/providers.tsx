'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { StreakProvider } from '@/components/streak/StreakContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <StreakProvider>
        {children}
        <Toaster position="top-center" reverseOrder={false} />
      </StreakProvider>
    </ThemeProvider>
  );
}

