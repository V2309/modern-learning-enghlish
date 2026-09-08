'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, Star, ArrowRight } from 'lucide-react';

export default function Hero() {
  const studentAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=120&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=120&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=120&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=120&auto=format&fit=crop',
  ];

  const trustedCompanies = [
    { name: 'Google', color: 'text-[#4285F4]' },
    { name: 'Zoom', color: 'text-[#2D8CFF]' },
    { name: 'Slack', color: 'text-[#E01E5A]' },
    { name: 'Coursera', color: 'text-[#0056D2]' },
    { name: 'Cambridge', color: 'text-[#111827] dark:text-white' },
    { name: 'Oxford', color: 'text-[#111827] dark:text-white' },
    { name: 'Dropbox', color: 'text-[#0061FF]' },
  ];

  return (
    <section className="w-full bg-white dark:bg-[#0f1115] border-b border-[#e5e7eb] dark:border-[#1f2937] relative flex flex-col">
      
      {/* ── Top Header Strip — Continuous grid line ── */}
      <div className="border-b border-[#e5e7eb] dark:border-[#1f2937] px-8 sm:px-12 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] dark:text-[#6b7280]">
            00 · Nền tảng học tiếng Anh phản xạ AI
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#f28500] animate-pulse" />
        </div>

        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] dark:text-[#6b7280] hidden sm:block">
          Chuẩn CEFR A1–C2 · Công nghệ AI nhận diện âm vị
        </span>
      </div>

      {/* ════════════════════════════════════════
          BENTO GRID — 1px hairline border grid
      ════════════════════════════════════════ */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-px bg-[#e5e7eb] dark:bg-[#1f2937]">

        {/* ── LEFT COLUMN (7/12): Main Forest Green Card + 2 Bottom Mini Cards ── */}
        <div className="lg:col-span-7 flex flex-col gap-px bg-[#e5e7eb] dark:bg-[#1f2937]">
          
          {/* Top Main Hero Card (Forest Green) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="bg-[#1b4332] dark:bg-[#143527] text-white p-8 sm:p-12 lg:p-14 flex flex-col justify-between relative overflow-hidden flex-1 min-h-[360px]"
          >
            {/* Top Tag — macOS Traffic Light Dots Style */}
            <div className="flex items-center gap-2 mb-6">
              <span className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-mono uppercase tracking-widest text-[#a3e5c9] border border-white/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff5f56]" />
                  <span className="w-2 h-2 rounded-full bg-[#ffbd2e]" />
                  <span className="w-2 h-2 rounded-full bg-[#27c93f]" />
                </div>
                <span>Nền tảng trực tuyến · Phản xạ AI</span>
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4 mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white tracking-tight leading-[1.08] max-w-xl">
                Bắt đầu hành trình
                <br />
                chinh phục tiếng Anh
              </h1>
              <p className="text-sm sm:text-base text-[#bde3d3] leading-relaxed max-w-lg font-sans">
                Tham gia cộng đồng 400,000+ học viên và bứt phá phản xạ nghe nói tiếng Anh tự nhiên với công nghệ Dictation AI &amp; Shadowing.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/courses"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#f28500] hover:bg-[#e07500] active:scale-95 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md group cursor-pointer"
              >
                <span>Bắt đầu ngay</span>
                <div className="w-6 h-6 rounded-full bg-white/25 flex items-center justify-center group-hover:bg-white group-hover:text-[#f28500] transition-colors">
                  <ArrowUpRight size={14} />
                </div>
              </Link>

              <Link
                href="/dictation"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                <span>Luyện Dictation</span>
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Subtle background glow */}
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-[#2d6a4f]/40 rounded-full blur-3xl pointer-events-none" />
          </motion.div>

          {/* Bottom 2 Mini-Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e5e7eb] dark:bg-[#1f2937]">
            
            {/* Mini Card 1: 3-Metric Stats */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="bg-white dark:bg-[#0f1115] p-6 sm:p-7 flex items-center justify-between"
            >
              <div className="text-left">
                <p className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white font-mono leading-none">20+</p>
                <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-1.5 font-medium">Đối tác</p>
              </div>
              <div className="w-px h-8 bg-[#e5e7eb] dark:bg-[#1f2937]" />
              <div className="text-left">
                <p className="text-2xl sm:text-3xl font-bold text-[#f28500] font-mono leading-none">400k+</p>
                <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-1.5 font-medium">Học viên</p>
              </div>
              <div className="w-px h-8 bg-[#e5e7eb] dark:bg-[#1f2937]" />
              <div className="text-left">
                <p className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white font-mono leading-none">720+</p>
                <p className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] mt-1.5 font-medium">Bài học</p>
              </div>
            </motion.div>

            {/* Mini Card 2: Rating & Avatars */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#fafafa] dark:bg-[#14171b] p-6 sm:p-7 flex items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-[#111827] dark:text-white font-mono">4.9</span>
                  <div className="flex items-center gap-0.5 text-[#f59e0b]">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={14} className="fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Đánh giá chất lượng</p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <div className="flex -space-x-2 overflow-hidden">
                  {studentAvatars.map((src, i) => (
                    <div key={i} className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-[#14171b] overflow-hidden relative">
                      <Image src={src} alt="Student review" fill unoptimized className="object-cover" sizes="28px" />
                    </div>
                  ))}
                </div>
                <span className="text-[11px] font-bold text-[#111827] dark:text-white">
                  100k+ Đánh giá
                </span>
              </div>
            </motion.div>

          </div>

        </div>

        {/* ── RIGHT COLUMN (5/12): Tall Student Portrait Card with Rich Visual FX ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="lg:col-span-5 bg-white dark:bg-[#0f1115] relative overflow-hidden flex flex-col justify-end min-h-[460px] lg:min-h-full group"
        >
          {/* Soft striped diagonal background */}
          <div
            className="absolute inset-0 opacity-40 dark:opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #e5e7eb 0, #e5e7eb 1px, transparent 0, transparent 20px)',
            }}
          />

          {/* Student Photo with Optical Zoom */}
          <div className="relative w-full h-[420px] sm:h-[480px] lg:h-full min-h-[420px] overflow-hidden">
            <Image
              src="/hero-bento-student.jpg"
              alt="Học viên luyện tiếng Anh phản xạ"
              fill
              priority
              className="object-cover object-top group-hover:scale-[1.04] transition-transform duration-700 ease-out"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />

            {/* Light Sweep Sheen */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/25 dark:via-white/10 to-transparent pointer-events-none z-20" />

            {/* Technical Crosshairs */}
            <span className="absolute top-3 left-3 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>
            <span className="absolute top-3 right-3 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>
          </div>

          {/* Floating badge */}
          <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between pointer-events-none z-20">
            <div className="bg-white/95 dark:bg-[#111614]/95 backdrop-blur-md px-4 py-2.5 rounded-full border border-[#e5e7eb] dark:border-[#222b26] flex items-center gap-2.5 shadow-md">
              <div className="flex items-end gap-[2px] h-3">
                <span className="w-[2px] h-2 bg-emerald-500 animate-pulse" />
                <span className="w-[2px] h-3 bg-emerald-500 animate-pulse delay-75" />
                <span className="w-[2px] h-1.5 bg-emerald-500 animate-pulse delay-150" />
              </div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#111827] dark:text-white font-bold">
                400K+ Học Viên Đang Học
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── ROW 3: TRUSTED COMPANY SECTION (12/12) — Automatic Infinite Sliding Marquee ── */}
        <div className="lg:col-span-12 bg-[#f8f9fa] dark:bg-[#16191d] py-9 flex flex-col items-center justify-center text-center gap-5 overflow-hidden relative">
          <div className="flex items-center gap-3 px-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f28500]" />
            <h2 className="text-xs sm:text-sm font-mono uppercase tracking-[0.2em] text-[#6b7280] dark:text-[#9ca3af]">
              Được tin dùng bởi các tổ chức &amp; đối tác quốc tế
            </h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f28500]" />
          </div>

          {/* Infinite Sliding Marquee Track */}
          <div className="w-full relative overflow-hidden flex items-center py-1">
            {/* Left & Right Gradient Fade Masks */}
            <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-36 bg-gradient-to-r from-[#f8f9fa] dark:from-[#16191d] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-36 bg-gradient-to-l from-[#f8f9fa] dark:from-[#16191d] to-transparent z-10 pointer-events-none" />

            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ repeat: Infinity, ease: 'linear', duration: 24 }}
              className="flex items-center gap-12 sm:gap-16 whitespace-nowrap will-change-transform"
            >
              {[...trustedCompanies, ...trustedCompanies].map((company, idx) => (
                <div
                  key={`${company.name}-${idx}`}
                  className="flex items-center gap-4 shrink-0 opacity-75 hover:opacity-100 transition-opacity cursor-default select-none group"
                >
                  <span className={`text-base sm:text-xl font-bold tracking-tight ${company.color}`}>
                    {company.name}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#9ca3af]/40" />
                </div>
              ))}
            </motion.div>
          </div>
        </div>

      </div>

    </section>
  );
}


