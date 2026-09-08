'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function NumberedFeatures() {
  const featuredItem = {
    number: '01',
    badge: 'IELTS Band 7.5+ · Học Thuật',
    title: 'IELTS 7.5+ Intensive: Dictation & Speaking',
    description: 'Bóc tách nối âm, liên từ và ngữ điệu bài thi Speaking chuẩn Cambridge band 7.5+.',
    image: '/course_ielts.png',
    href: '/dictation',
  };

  const secondaryItems = [
    {
      number: '02',
      badge: 'B1 - B2 · Doanh Nghiệp',
      title: 'Tiếng Anh Doanh Nghiệp & Thuyết Trình',
      description: 'Làm chủ kỹ năng đàm phán, thuyết trình và giao tiếp cùng đối tác toàn cầu.',
      image: '/course_business.png',
      href: '/shadowing',
    },
    {
      number: '03',
      badge: 'A2 - B1 · Giao Tiếp Thực Chiến',
      title: 'Tiếng Anh Giao Tiếp & Phản Xạ 60 Ngày',
      description: 'Xóa bỏ phản xạ dịch ngầm, rèn phát âm chuẩn mỗi ngày với Shadowing AI.',
      image: '/course_comm.png',
      href: '/vocabulary',
    },
  ];

  return (
    <section className="w-full bg-white dark:bg-[#0f1115] border-b border-[#e5e7eb] dark:border-[#1f2937] relative flex flex-col">

      {/* ── Section Header — Compact Editorial Bar ── */}
      <div className="px-8 sm:px-12 lg:px-16 py-8 lg:py-10 border-b border-[#e5e7eb] dark:border-[#1f2937] flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] dark:text-[#6b7280] block mb-2 font-semibold"
          >
            03 · Lộ trình thực chiến
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] dark:text-white tracking-tight leading-[1.1] max-w-[16ch]"
          >
            Lộ trình luyện tập
            <br />
            <span className="text-[#f28500]">chuẩn thực chiến.</span>
          </motion.h2>
        </div>
        <div className="flex flex-col md:items-end gap-2">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed max-w-[32ch] md:text-right font-sans"
          >
            Từ bứt phá band điểm IELTS đến đàm phán và phản xạ giao tiếp tự nhiên.
          </motion.p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#f28500] hover:text-[#111827] dark:hover:text-white transition-colors group font-bold"
          >
            <span>Xem tất cả khóa học</span>
            <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* ════════════════════════════════════════
          BENTO GRID — 1px gap full-width
      ════════════════════════════════════════ */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 auto-rows-auto gap-px bg-[#e5e7eb] dark:bg-[#1f2937]">

        {/* ── ROW 1 ───────────────────────────── */}

        {/* CELL A: Featured Course (8/12) — Side-by-side horizontal layout for compact height */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-8 bg-white dark:bg-[#0f1115] grid grid-cols-1 sm:grid-cols-12 group overflow-hidden"
        >
          {/* Image Column (5/12) with Rich Visual FX */}
          <div className="sm:col-span-5 relative min-h-[220px] sm:min-h-full overflow-hidden bg-[#f3f4f6] dark:bg-[#1a1d21]">
            <Image
              src={featuredItem.image}
              alt={featuredItem.title}
              fill
              className="object-cover object-[center_20%] grayscale-[10%] group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, 35vw"
            />

            {/* Light Sweep Sheen */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/25 dark:via-white/10 to-transparent pointer-events-none z-20" />

            {/* Technical Crosshairs */}
            <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>

            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5">
              <div className="flex items-center gap-1.5 bg-white/95 dark:bg-[#0f1115]/95 backdrop-blur-sm text-[#111827] dark:text-white border border-[#e5e7eb] dark:border-[#333638] px-2.5 py-1">
                <div className="flex items-end gap-[2px] h-2.5">
                  <span className="w-[2px] h-1.5 bg-[#f28500] animate-pulse" />
                  <span className="w-[2px] h-2.5 bg-[#f28500] animate-pulse delay-75" />
                  <span className="w-[2px] h-1 bg-[#f28500] animate-pulse delay-150" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">
                  {featuredItem.badge}
                </span>
              </div>
            </div>
          </div>

          {/* Content Column (7/12) */}
          <div className="sm:col-span-7 p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#f28500] font-bold">
                  {featuredItem.number}
                </span>
                <span className="w-1 h-1 rounded-full bg-[#9ca3af]" />
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">
                  Lộ trình cấp tốc
                </span>
              </div>
              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#111827] dark:text-white tracking-tight leading-snug mb-2 group-hover:text-[#f28500] transition-colors">
                {featuredItem.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                {featuredItem.description}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-[#f3f4f6] dark:border-[#1a1d21] flex items-center justify-between">
              <Link
                href={featuredItem.href}
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#111827] dark:text-white hover:text-[#f28500] dark:hover:text-[#f28500] transition-colors group/link font-semibold"
              >
                <span>Khám phá ngay</span>
                <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
              </Link>
              <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest">
                Cambridge &amp; Oxford
              </span>
            </div>
          </div>
        </motion.div>

        {/* CELL B: Target Specs Tile (4/12) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-4 bg-[#fafafa] dark:bg-[#16191d] flex flex-col justify-between p-6 sm:p-8 text-[#111827] dark:text-white"
        >
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-[#6b7280] mb-3">
              Mục tiêu chuẩn đầu ra
            </p>
            <div className="text-5xl sm:text-6xl font-bold text-[#f28500] leading-none tracking-tight mb-2 font-mono">
              7.5+
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight mb-1.5">
              Chuẩn phản xạ học thuật
            </h3>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              Nghe bóc tách âm liên tục và phản xạ nói tự nhiên Part 2 &amp; 3.
            </p>
          </div>

          <div className="mt-6 border-t border-[#e5e7eb] dark:border-[#1f2937] pt-4 space-y-2.5">
            {[
              '350+ bài Dictation học thuật',
              'AI chấm âm vị & ngắt nhịp',
              'Rút ngắn 40% thời gian học',
            ].map((spec) => (
              <div key={spec} className="flex items-center gap-2 text-xs text-[#374151] dark:text-[#d1d5db]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f28500] shrink-0" />
                <span>{spec}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── ROW 2 ───────────────────────────── */}

        {secondaryItems.map((item, idx) => (
          <motion.div
            key={item.number}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.5, delay: (idx + 2) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-6 bg-white dark:bg-[#0f1115] flex flex-col justify-between group overflow-hidden"
          >
            {/* Image Preview with Rich Visual FX */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#f3f4f6] dark:bg-[#1a1d21]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover object-[center_20%] grayscale-[10%] group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Light Sweep Sheen */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

              {/* Technical Crosshairs */}
              <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>
              <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>

              <div className="absolute top-4 left-4 z-10">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] bg-white/90 dark:bg-[#0f1115]/90 backdrop-blur-sm text-[#111827] dark:text-white px-2.5 py-1 font-semibold border border-[#e5e7eb] dark:border-[#333638]">
                  {item.badge}
                </span>
              </div>
            </div>

            {/* Content info - compact padding */}
            <div className="p-6 sm:p-8 flex flex-col justify-between flex-1">
              <div>
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#f28500] font-bold">
                    {item.number}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#9ca3af]" />
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">
                    Giao tiếp thực tế
                  </span>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-bold text-[#111827] dark:text-white tracking-tight leading-snug mb-2 group-hover:text-[#f28500] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#f3f4f6] dark:border-[#1a1d21] flex items-center justify-between">
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-[#111827] dark:text-white hover:text-[#f28500] dark:hover:text-[#f28500] transition-colors group/link font-semibold"
                >
                  <span>Luyện tập ngay</span>
                  <ArrowRight size={12} className="group-hover/link:translate-x-1 transition-transform" />
                </Link>
                <span className="text-[10px] font-mono text-[#9ca3af] uppercase tracking-widest">
                  Chuẩn CEFR
                </span>
              </div>
            </div>
          </motion.div>
        ))}

        {/* ── ROW 3: Full-width editorial footer bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 bg-[#f8f9fa] dark:bg-[#16191d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-8 sm:px-12 lg:px-16 py-4"
        >
          <p className="text-xs sm:text-sm font-medium text-[#111827] dark:text-white max-w-[60ch]">
            Tất cả khóa học đều tích hợp đồng bộ công nghệ Dictation AI và Shadowing Real-Time.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-[#111827] dark:text-white hover:text-[#f28500] dark:hover:text-[#f28500] transition-colors group/lnk shrink-0 font-bold"
          >
            <span>Xem tất cả lộ trình</span>
            <ArrowRight size={12} className="group-hover/lnk:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}

