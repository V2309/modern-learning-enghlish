'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isTopicPage = pathname?.startsWith('/vocabulary/topic');
  const isAuthPage = pathname?.startsWith('/auth') || 
                     ['/login', '/register', '/sign-in', '/sign-up'].includes(pathname ?? '');
  
  if (isTopicPage || isAuthPage) return null;

  return (
    <footer className="w-full py-8 text-on-surface-variant border-t border-border mt-4 text-xs shrink-0 select-none px-4 sm:px-6 md:px-8 lg:px-12 bg-card/40">
      <div className="w-full space-y-4">
        {/* Top layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-6 border-b border-border/50">
          {/* Logo & description */}
          <div className="text-center md:text-left space-y-2">
            <span className="text-xl font-black text-foreground tracking-wide">LinguifyPro</span>
            <p className="max-w-md text-[11px] text-muted-foreground leading-relaxed">
              Hệ thống tự học ngoại ngữ tăng cường bởi trí tuệ nhân tạo thông minh. Đột phá từ vựng, tự tin giao tiếp cùng LinguifyPro.
            </p>
          </div>

          {/* Links columns */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[11px] font-semibold text-muted-foreground">
            <Link href="/privacy" prefetch={false} className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" prefetch={false} className="hover:text-primary transition-colors">Terms of service</Link>
            <Link href="/contact" prefetch={false} className="hover:text-primary transition-colors">Contact Us</Link>
            <Link href="/help" prefetch={false} className="hover:text-primary transition-colors">Help Center</Link>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-muted-foreground pt-2">
          <span>© 2025 LinguifyPro. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <span>CEFR A1 — C2</span>
            <span>•</span>
            <span>Spaced Repetition SM-2</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
