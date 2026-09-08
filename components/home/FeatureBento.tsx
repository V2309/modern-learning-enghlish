'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function FeatureBento() {
  return (
    <section className="w-full bg-white dark:bg-[#0f1115] border-b border-[#e5e7eb] dark:border-[#1f2937] relative flex flex-col">

      {/* ── Section header — Full Width Editorial Bar with Split Reveal Animation ── */}
      <div className="px-8 sm:px-12 lg:px-16 py-12 lg:py-14 border-b border-[#e5e7eb] dark:border-[#1f2937] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] dark:text-[#6b7280] block mb-3 font-semibold"
          >
            02 · Hệ sinh thái cốt lõi
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] dark:text-white tracking-tight leading-[1.1] max-w-[16ch]"
          >
            Năm trụ cột xây
            <br />
            <span className="text-[#f28500]">phản xạ tiếng&nbsp;Anh.</span>
          </motion.h2>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed max-w-[32ch] md:text-right font-sans"
        >
          Hệ sinh thái công nghệ khoa học giúp bẻ khóa rào cản nghe nói một cách tự nhiên và bền vững.
        </motion.p>
      </div>

      {/* ════════════════════════════════════════
          BENTO GRID — 1px gap via bg-[#e5e7eb]
      ════════════════════════════════════════ */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 auto-rows-auto gap-px bg-[#e5e7eb] dark:bg-[#1f2937]">

        {/* ── ROW 1 ───────────────────────────── */}

        {/* CELL A: Dictation — wide editorial photo hero (7/12) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-7 relative overflow-hidden group bg-[#f3f4f6] dark:bg-[#1a1d21]"
        >
          <div className="relative h-[320px] md:h-[400px] w-full overflow-hidden">
            <Image
              src="/bento-dictation.jpg"
              alt="Luyện Dictation AI — nghe chép chính tả"
              fill
              className="object-cover object-center grayscale-[10%] group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, 58vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Light Sweep Sheen */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

            {/* Technical Crosshairs */}
            <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>

            {/* Top label with Live Audio Waveform */}
            <div className="absolute top-5 left-5 z-10 flex items-center gap-2">
              <div className="flex items-center gap-2 bg-[#f28500] text-white px-3 py-1.5 font-bold shadow-sm">
                <div className="flex items-end gap-[2px] h-3">
                  <span className="w-[2px] h-2 bg-white animate-pulse" />
                  <span className="w-[2px] h-3 bg-white animate-pulse delay-75" />
                  <span className="w-[2px] h-1.5 bg-white animate-pulse delay-150" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em]">
                  Luyện Nghe Chép AI
                </span>
              </div>
            </div>

            {/* Bottom copy */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 z-10">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-tight mb-3">
                Nghe chép chính tả — xây phản xạ từng âm vị
              </h3>
              <Link
                href="/dictation"
                className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-white/90 hover:text-[#f28500] transition-colors group/lnk"
              >
                Luyện tập ngay
                <ArrowRight size={12} className="group-hover/lnk:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* CELL B: Spaced Repetition — clean editorial tile (5/12) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-5 bg-[#fafafa] dark:bg-[#16191d] flex flex-col justify-between p-8 sm:p-12"
        >
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-[#6b7280] mb-6">
              Thuật toán Spaced Repetition
            </p>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] dark:text-white tracking-tight leading-[1.15] mb-4">
              Ghi nhớ vĩnh viễn — ôn đúng lúc não bộ chuẩn bị quên.
            </h3>
            <p className="text-sm sm:text-base text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              Thuật toán Spaced Repetition phân bố chu kỳ Flashcard chính xác theo điểm yếu của bạn.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-[#e5e7eb] dark:border-[#1f2937] flex items-center justify-between">
            <span className="text-sm text-[#111827] dark:text-white font-semibold">3,000+ từ Oxford cốt lõi</span>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#f28500] font-bold">Ghi nhớ 100%</span>
          </div>
        </motion.div>

        {/* ── ROW 2 ───────────────────────────── */}

        {/* CELL C: CEFR accent — accent-tinted (4/12) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-4 bg-[#fffaf5] dark:bg-[#1f1a14] flex flex-col justify-between p-8 sm:p-12"
        >
          <div>
            <div className="text-[4.5rem] lg:text-[5.5rem] font-bold text-[#f28500] leading-none tracking-[-0.04em] mb-4">
              CEFR
            </div>
            <h3 className="text-xl font-bold text-[#111827] dark:text-white tracking-tight mb-3">
              Đánh giá theo Khung Châu Âu
            </h3>
            <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              Kiểm soát sai số phát âm. Lộ trình rõ ràng từ A1 đến C2.
            </p>
          </div>
          <div className="mt-8 space-y-3">
            {[
              { label: 'A1 – A2', pct: 100 },
              { label: 'B1 – B2', pct: 72 },
              { label: 'C1 – C2', pct: 44 },
            ].map((level) => (
              <div key={level.label} className="flex items-center gap-3 text-xs font-mono">
                <span className="text-[#9ca3af] w-16 shrink-0">{level.label}</span>
                <div className="flex-1 h-[3px] bg-[#fed7aa] dark:bg-[#3d2714]">
                  <div className="h-full bg-[#f28500]" style={{ width: `${level.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CELL D: Adaptive Tech — clean light (4/12) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-4 bg-white dark:bg-[#0f1115] flex flex-col justify-between p-8 sm:p-12"
        >
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-[#6b7280] mb-6">
              Công nghệ thích ứng AI
            </p>
            <h3 className="text-2xl font-bold text-[#111827] dark:text-white tracking-tight leading-[1.15] mb-4">
              Công nghệ thích ứng theo năng lực từng người.
            </h3>
            <p className="text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              AI Speech Engine v3.4 tự động điều chỉnh tốc độ, độ khó và biểu đồ cao độ.
            </p>
          </div>
          <div className="mt-8 border-t border-[#e5e7eb] dark:border-[#1f2937]">
            {[
              'Độ trễ âm thanh <50ms',
              'Phân tích ngữ điệu real-time',
              'Mã hóa SSL đầu cuối',
            ].map((feat) => (
              <div key={feat} className="flex items-center gap-3 py-3 border-b border-[#e5e7eb] dark:border-[#1f2937]">
                <span className="w-1.5 h-1.5 bg-[#f28500] shrink-0" />
                <span className="text-xs text-[#374151] dark:text-[#d1d5db] font-medium">{feat}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CELL E: Shadowing photo tile (4/12) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-4 relative overflow-hidden group bg-[#f3f4f6] dark:bg-[#1a1d21]"
        >
          <div className="relative h-[280px] md:h-full min-h-[280px] overflow-hidden">
            <Image
              src="/bento-shadowing.jpg"
              alt="Phòng thu Shadowing AI — nhại giọng real-time"
              fill
              className="object-cover object-center grayscale-[10%] group-hover:grayscale-0 group-hover:scale-[1.05] transition-all duration-700 ease-out"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

            {/* Light Sweep Sheen */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

            {/* Technical Crosshairs */}
            <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-white/50 pointer-events-none z-10">+</span>

            <div className="absolute bottom-6 left-6 right-6 z-10">
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-end gap-[2px] h-2.5">
                  <span className="w-[2px] h-1.5 bg-[#f28500] animate-pulse" />
                  <span className="w-[2px] h-2.5 bg-[#f28500] animate-pulse delay-75" />
                  <span className="w-[2px] h-1 bg-[#f28500] animate-pulse delay-150" />
                </div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#f28500] font-bold">
                  Phòng Thu Shadowing AI
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-tight mb-3">
                Nhại giọng real-time — xoá bỏ phản xạ dịch ngầm.
              </h3>
              <Link
                href="/shadowing"
                className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-white/90 hover:text-[#f28500] transition-colors group/lnk"
              >
                Vào phòng thu ngay
                <ArrowRight size={11} className="group-hover/lnk:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ── ROW 3: Full-width editorial footer bar ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="md:col-span-12 bg-[#f8f9fa] dark:bg-[#16191d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 sm:px-12 lg:px-16 py-6"
        >
          <p className="text-sm font-medium text-[#111827] dark:text-white max-w-[60ch]">
            Kết hợp 5 phương pháp — một lộ trình hoàn chỉnh từ A1 đến C2, được cá nhân hóa bởi AI.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-[#111827] dark:text-white hover:text-[#f28500] dark:hover:text-[#f28500] transition-colors group/lnk shrink-0"
          >
            Xem toàn bộ khoá học
            <ArrowRight size={13} className="group-hover/lnk:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

      </div>
    </section>
  );
}
