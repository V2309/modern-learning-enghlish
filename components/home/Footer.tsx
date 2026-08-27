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
    <footer className="w-full py-4 bg-[#0a192f] text-white/70 border-t border-slate-800 mt-4 text-xs shrink-0 select-none">
      <div className="container mx-auto px-4 md:px-8 space-y-4">
        {/* Top layout */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 pb-8 border-b border-slate-800">
          {/* Logo & description */}
          <div className="text-center md:text-left space-y-3">
            <span className="text-xl font-black text-white tracking-wide">LinguifyPro</span>
            <p className="max-w-md text-[11px] text-slate-400 leading-relaxed">
              Hệ thống tự học ngoại ngữ tăng cường bởi trí tuệ nhân tạo thông minh. Đột phá từ vựng, tự tin giao tiếp cùng LinguifyPro.
            </p>
          </div>

          {/* Links columns */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-[11px] font-semibold text-slate-300">
            <Link href="/privacy" prefetch={false} className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" prefetch={false} className="hover:text-primary transition-colors">Terms of service</Link>
            <Link href="/contact" prefetch={false} className="hover:text-primary transition-colors">Contact Us</Link>
            <Link href="/help" prefetch={false} className="hover:text-primary transition-colors">Help Center</Link>
          </div>
        </div>

        {/* Bottom layout */}
        <div className="flex flex-col sm:flex-row items-center text-center justify-center gap-4 text-center sm:text-left text-[10px] text-slate-500 font-medium">
          <span>© 2026 Linguify Academy. Empowering global communicators.</span>
          <span>Made with ❤️ for English Learners</span>
        </div>
      </div>
    </footer>
  );
}
