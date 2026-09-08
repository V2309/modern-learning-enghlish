'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const footerLinks = [
  {
    heading: 'Nền Tảng',
    links: [
      { label: 'Dictation AI', href: '/dictation' },
      { label: 'Shadowing Studio', href: '/shadowing' },
      { label: 'Flashcard & Review', href: '/review' },
      { label: 'Khoá học', href: '/courses' },
    ],
  },
  {
    heading: 'Công Ty',
    links: [
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Lộ trình CEFR', href: '/courses' },
      { label: 'Bảng giá', href: '/#pricing' },
      { label: 'Blog học tiếng Anh', href: '/blog' },
    ],
  },
  {
    heading: 'Hỗ Trợ',
    links: [
      { label: 'Trung tâm trợ giúp', href: '/help' },
      { label: 'Liên hệ', href: '/contact' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'Điều khoản dịch vụ', href: '/terms' },
    ],
  },
];

export default function Footer() {
  const pathname = usePathname();
  const isTopicPage = pathname?.startsWith('/vocabulary/topic');
  const isAuthPage =
    pathname?.startsWith('/auth') ||
    ['/login', '/register', '/sign-in', '/sign-up'].includes(pathname ?? '');

  if (isTopicPage || isAuthPage) return null;

  return (
    <footer className="w-full bg-white dark:bg-[#0f1115] border-t border-[#e5e7eb] dark:border-[#1f2937]">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16 py-16">

        {/* 4-column grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">

          {/* Col 1: Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-lg font-bold text-[#111827] dark:text-white tracking-tight block mb-4">
              LinguifyPro
            </span>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed max-w-[220px]">
              Hệ thống luyện phản xạ tiếng Anh bằng Dictation AI và Shadowing Real-Time. Chuẩn CEFR A1 – C2.
            </p>
            <div className="mt-6 flex items-center gap-2">
              {['A1', 'B2', 'C2'].map((level) => (
                <span
                  key={level}
                  className="text-[10px] font-bold text-[#9ca3af] dark:text-[#6b7280] border border-[#e5e7eb] dark:border-[#262b32] px-2 py-0.5"
                >
                  {level}
                </span>
              ))}
            </div>
          </div>

          {/* Cols 2–4: Link groups */}
          {footerLinks.map((group) => (
            <div key={group.heading}>
              <p className="text-[11px] uppercase tracking-widest text-[#9ca3af] dark:text-[#6b7280] font-semibold mb-5 font-mono">
                {group.heading}
              </p>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      prefetch={false}
                      className="text-xs text-[#6b7280] dark:text-[#9ca3af] hover:text-[#111827] dark:hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom row */}
        <div className="mt-12 pt-6 border-t border-[#e5e7eb] dark:border-[#1f2937] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 font-mono">
          <span className="text-[11px] text-[#9ca3af] dark:text-[#6b7280]">
            © 2026 LinguifyPro. Bảo lưu mọi quyền.
          </span>
          <div className="flex items-center gap-4 text-[11px] text-[#9ca3af] dark:text-[#6b7280] flex-wrap">
            <span>Thuật toán SM-2</span>
            <span aria-hidden="true">·</span>
            <span>Chuẩn CEFR A1 – C2</span>
            <span aria-hidden="true">·</span>
            <span>Đồng bộ Cambridge &amp; Oxford</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
