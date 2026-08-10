'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-center" reverseOrder={false} />
    </ThemeProvider>
  );
}
