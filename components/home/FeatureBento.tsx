'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Headphones, Mic, Layers, ListTodo, 
  ArrowUpRight, CheckCircle2, Sparkles, Activity, Clock
} from 'lucide-react';
import Link from 'next/link';

export default function FeatureBento() {
  return (
    <section className="w-full bg-background border-b border-border relative overflow-hidden">
      
      {/* Full-Width Centered Section Header Bar */}
      <div className="w-full border-b border-border px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 bg-card/20 text-center">
        <div className="space-y-2 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-3.5 py-1 rounded-full border border-brand/20">
            Hệ Sinh Thái Học Tập
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            Bộ Công Cụ Toàn Diện Cho <span className="text-brand">Phản Xạ Tự Nhiên</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            4 trụ cột phương pháp hiện đại giúp não bộ tiếp nhận và kích hoạt ngôn ngữ nhanh gấp 3 lần cách học truyền thống.
          </p>
        </div>
      </div>

      {/* ── Row 1: AI Dictation (7 cols) + Shadowing AI (5 cols) ── */}
      <div className="w-full grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border border-b border-border">
        
        {/* Cell 1: Dictation AI (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="md:col-span-7 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between space-y-6 hover:bg-card/40 transition-colors relative group bg-background"
        >
          {/* Intersection crosshairs */}
          <span className="absolute -top-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>
          <span className="absolute -top-2 -right-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none hidden md:block">+</span>
          <span className="absolute -bottom-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>

          <div className="space-y-4 max-w-xl">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-xs">
                <Headphones size={22} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Phần 01</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight group-hover:text-brand transition-colors">
                Dictation: Nghe &amp; Chép Chính Tả AI
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Tập trung nghe từng âm tiết, từ nối và trọng âm câu. AI so sánh từng ký tự trong thời gian thực, đánh dấu chính xác lỗi sai để bạn khắc phục triệt để.
              </p>
            </div>
          </div>

          {/* Simulated Live UI inside Bento Card */}
          <div className="p-5 sm:p-6 rounded-2xl bg-muted/30 border border-border space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                <Sparkles size={13} className="text-brand" />
                Chế độ chấm tự động
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Chính xác</span>
            </div>
            <div className="p-3.5 rounded-xl bg-background border border-border text-xs leading-relaxed">
              <span className="text-foreground">Continuous practice leads to </span>
              <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded border border-emerald-500/20">effortless fluency</span>
              <span className="text-foreground"> in professional communication.</span>
            </div>
          </div>

          <Link href="/dictation" className="absolute top-6 right-6 p-2.5 rounded-full bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowUpRight size={18} />
          </Link>
        </motion.div>

        {/* Cell 2: Shadowing AI (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-5 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between space-y-6 hover:bg-card/40 transition-colors relative group bg-card/10"
        >
          {/* Intersection crosshairs */}
          <span className="absolute -top-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>
          <span className="absolute -top-2 -right-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none hidden md:block">+</span>
          <span className="absolute -bottom-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-xs">
                <Mic size={22} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Phần 02</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight group-hover:text-brand transition-colors">
                Luyện Nói Shadowing
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Nhại giọng theo video thực tế từng mili-giây. Hiệu chỉnh ngữ điệu, ngữ âm nối và độ trễ phản xạ như người bản xứ.
              </p>
            </div>
          </div>

          {/* Pitch & Rhythm Visual Mock */}
          <div className="p-5 rounded-2xl bg-background border border-border space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-medium flex items-center gap-1.5">
                <Activity size={14} className="text-brand" /> Ngữ điệu khớp
              </span>
              <span className="text-brand font-black">96.4%</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-brand rounded-full w-[96.4%]" />
            </div>
          </div>

          <Link href="/shadowing" className="absolute top-6 right-6 p-2.5 rounded-full bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowUpRight size={18} />
          </Link>
        </motion.div>

      </div>

      {/* ── Row 2: Spaced Repetition (5 cols) + Todo & Pomodoro (7 cols) ── */}
      <div className="w-full grid md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
        
        {/* Cell 3: Spaced Repetition (5 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="md:col-span-5 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between space-y-6 hover:bg-card/40 transition-colors relative group bg-card/10"
        >
          {/* Intersection crosshairs */}
          <span className="absolute -top-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>
          <span className="absolute -top-2 -right-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none hidden md:block">+</span>
          <span className="absolute -bottom-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-xs">
                <Layers size={22} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Phần 03</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight group-hover:text-brand transition-colors">
                Spaced Repetition (SM-2)
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Thuật toán lặp lại ngắt quãng tự động lên lịch nhắc lại từ vựng ngay trước thời điểm não bộ chuẩn bị quên.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs font-bold text-brand bg-brand/10 p-3.5 rounded-xl border border-brand/20">
            <CheckCircle2 size={16} />
            <span>Ghi nhớ 3,000 từ vựng vĩnh viễn</span>
          </div>

          <Link href="/vocabulary" className="absolute top-6 right-6 p-2.5 rounded-full bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowUpRight size={18} />
          </Link>
        </motion.div>

        {/* Cell 4: Daily Todo & Pomodoro (7 cols) */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="md:col-span-7 p-6 sm:p-8 md:p-10 lg:p-12 flex flex-col justify-between space-y-6 hover:bg-card/40 transition-colors relative group bg-background"
        >
          {/* Intersection crosshairs */}
          <span className="absolute -top-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>
          <span className="absolute -top-2 -right-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none hidden md:block">+</span>
          <span className="absolute -bottom-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>

          <div className="space-y-4 max-w-xl">
            <div className="flex items-center justify-between">
              <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-xs">
                <ListTodo size={22} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground">Phần 04</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight group-hover:text-brand transition-colors">
                Kế Hoạch Todo &amp; Pomodoro Focus
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Lên lộ trình học tập hàng ngày rõ ràng, chia nhỏ mục tiêu theo phiên tập trung 25 phút để duy trì chuỗi học tập bền vững mà không bị kiệt sức.
              </p>
            </div>
          </div>

          {/* Mini task checklist preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-border/60 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 text-foreground/80 font-medium">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>15p Dictation mỗi sáng</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/40 text-foreground/80 font-medium">
              <Clock size={15} className="text-brand" />
              <span>1 Phiên Pomodoro Shadowing</span>
            </div>
          </div>

          <Link href="/todo" className="absolute top-6 right-6 p-2.5 rounded-full bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <ArrowUpRight size={18} />
          </Link>
        </motion.div>

      </div>

    </section>
  );
}
