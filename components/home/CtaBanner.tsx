'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function CtaBanner() {
  const showcaseItems = [
    {
      year: '2026',
      title: 'PHÒNG LUYỆN NGHE CHÉP DICTATION AI',
      subtitle: 'Nghe chép chính tả & Chuẩn hóa từng âm vị',
      image: '/bento-dictation.jpg',
      href: '/dictation',
    },
    {
      year: '2026',
      title: 'PHÒNG THU NHẠI GIỌNG SHADOWING AI',
      subtitle: 'Nhại giọng tức thì & Xóa bỏ phản xạ dịch ngầm',
      image: '/bento-shadowing.jpg',
      href: '/shadowing',
    },
  ];

  return (
    <section className="w-full bg-white dark:bg-[#0f1115] border-b border-[#e5e7eb] dark:border-[#1f2937] relative flex flex-col">

      {/* ── Top Header Strip — 2 Column Split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] xl:grid-cols-[1fr_420px] border-b border-[#e5e7eb] dark:border-[#1f2937]">

        {/* Left: Main Headline */}
        <div className="px-8 sm:px-12 lg:px-16 py-12 lg:py-16 border-b lg:border-b-0 lg:border-r border-[#e5e7eb] dark:border-[#1f2937] flex flex-col justify-center">
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] dark:text-[#6b7280] block mb-3 font-semibold"
          >
            07 · Bắt đầu hành trình
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] dark:text-white tracking-tight leading-[1.1]"
          >
            Sẵn sàng làm chủ
            <br />
            <span className="text-[#f28500]">phản xạ tiếng Anh?</span>
          </motion.h2>
        </div>

        {/* Right: Action link */}
        <div className="px-8 sm:px-12 lg:px-16 py-12 lg:py-16 flex items-center justify-start lg:justify-end bg-white dark:bg-[#0f1115]">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2.5 text-xs font-mono uppercase tracking-[0.22em] text-[#111827] dark:text-white hover:text-[#f28500] dark:hover:text-[#f28500] transition-colors group cursor-pointer font-bold"
          >
            <span>Khám phá toàn bộ khóa học</span>
            <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
          </Link>
        </div>

      </div>

      {/* ── Bottom 2-Column Showcase Photos with Rich Visual FX ── */}
      <div className="grid grid-cols-1 md:grid-cols-2">
        {showcaseItems.map((item, index) => (
          <Link
            key={item.title}
            href={item.href}
            className={`
              p-8 sm:px-12 lg:px-16 py-10 lg:py-14 flex flex-col justify-between group cursor-pointer
              ${index === 0 ? 'border-b md:border-b-0 md:border-r border-[#e5e7eb] dark:border-[#1f2937]' : ''}
              hover:bg-[#fafafa] dark:hover:bg-[#14171c] transition-colors relative overflow-hidden
            `}
          >
            {/* Image Box with Rich Visual FX */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-[16/10] w-full overflow-hidden bg-[#f3f4f6] dark:bg-[#1a1d21] mb-5 border border-[#e5e7eb]/80 dark:border-[#1f2937] shadow-xs group-hover:border-[#f28500]/60 transition-colors"
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover object-center grayscale-[10%] group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700 ease-out"
                sizes="(max-width: 768px) 100vw, 50vw"
              />

              {/* Light Sweep Sheen */}
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/25 dark:via-white/10 to-transparent pointer-events-none z-20" />

              {/* Technical Crosshairs */}
              <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>
              <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>

              {/* Live Audio Equalizer badge */}
              <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-black/75 backdrop-blur-md border border-white/10 text-white">
                <div className="flex items-end gap-[2px] h-2.5">
                  <span className="w-[2px] h-1.5 bg-[#f28500] animate-pulse" />
                  <span className="w-[2px] h-2.5 bg-[#f28500] animate-pulse delay-75" />
                  <span className="w-[2px] h-1 bg-[#f28500] animate-pulse delay-150" />
                </div>
                <span className="text-[9px] font-mono uppercase tracking-widest font-bold">Studio AI</span>
              </div>

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
            </motion.div>

            {/* Bottom Metadata Bar — Left Year, Right Title */}
            <div className="flex items-center justify-between text-[11px] font-mono tracking-widest pt-1">
              <span className="text-[#9ca3af] dark:text-[#6b7280]">
                {item.year}
              </span>
              <span className="font-bold uppercase text-[#111827] dark:text-white group-hover:text-[#f28500] transition-colors text-right truncate max-w-[280px] sm:max-w-none">
                {item.title}
              </span>
            </div>
          </Link>
        ))}
      </div>

    </section>
  );
}

