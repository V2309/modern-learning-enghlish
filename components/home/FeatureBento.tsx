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
    <section className="py-10 md:py-14 bg-background border-b border-border/40">
      <div className="container mx-auto px-4 md:px-8 space-y-8 md:space-y-10">
        
        {/* Section Header */}
        <div className="space-y-2 max-w-3xl">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-3.5 py-1 rounded-full border border-brand/20">
            Hệ Sinh Thái Học Tập
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Bộ Công Cụ Toàn Diện Cho <span className="text-brand">Phản Xạ Tự Nhiên</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Kết hợp 4 trụ cột phương pháp hiện đại giúp não bộ tiếp nhận và kích hoạt ngôn ngữ nhanh gấp 3 lần cách học truyền thống.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid md:grid-cols-12 gap-6">
          
          {/* ── Bento Cell 1: Large Span 7 (AI Dictation) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="md:col-span-7 bg-card border border-border/80 rounded-3xl p-7 md:p-8 flex flex-col justify-between hover:border-brand/40 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
          >
            <div className="space-y-3 max-w-lg z-10">
              <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-xs">
                <Headphones size={22} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight group-hover:text-brand transition-colors">
                Dictation: Nghe &amp; Chép Chính Tả AI
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Tập trung nghe từng âm tiết, từ nối và trọng âm câu. AI so sánh từng ký tự trong thời gian thực, đánh dấu chính xác lỗi sai để bạn khắc phục triệt để.
              </p>
            </div>

            {/* Simulated Live UI inside Bento Card */}
            <div className="mt-8 pt-6 border-t border-border/60 bg-muted/30 -mx-7 md:-mx-9 -mb-7 md:-mb-9 p-6 md:p-8 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-muted-foreground flex items-center gap-1.5">
                  <Sparkles size={13} className="text-brand" />
                  Chế độ chấm tự động
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Chính xác</span>
              </div>
              <div className="p-3.5 rounded-xl bg-card border border-border text-xs leading-relaxed">
                <span className="text-foreground">Continuous practice leads to </span>
                <span className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold px-1 py-0.5 rounded">effortless fluency</span>
                <span className="text-foreground"> in professional communication.</span>
              </div>
            </div>

            <Link href="/dictation" className="absolute top-6 right-6 p-2.5 rounded-full bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>

          {/* ── Bento Cell 2: Span 5 (Shadowing AI) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="md:col-span-5 bg-card border border-border/80 rounded-3xl p-7 md:p-8 flex flex-col justify-between hover:border-brand/40 hover:shadow-xl transition-all duration-300 relative group overflow-hidden"
          >
            <div className="space-y-3 z-10">
              <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-xs">
                <Mic size={22} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight group-hover:text-brand transition-colors">
                Luyện Nói Shadowing
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Nhại giọng theo video thực tế từng mili-giây. Hiệu chỉnh ngữ điệu, ngữ âm nối và độ trễ phản xạ như người bản xứ.
              </p>
            </div>

            {/* Pitch & Rhythm Visual Mock */}
            <div className="mt-8 p-4 rounded-2xl bg-muted/40 border border-border/50 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground font-medium flex items-center gap-1">
                  <Activity size={12} className="text-brand" /> Ngữ điệu khớp
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

          {/* ── Bento Cell 3: Span 5 (Spaced Repetition Flashcards) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="md:col-span-5 bg-card border border-border/80 rounded-3xl p-7 md:p-8 flex flex-col justify-between hover:border-brand/40 hover:shadow-xl transition-all duration-300 relative group"
          >
            <div className="space-y-3">
              <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-xs">
                <Layers size={22} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight group-hover:text-brand transition-colors">
                Spaced Repetition (SM-2)
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Thuật toán lặp lại ngắt quãng tự động lên lịch nhắc lại từ vựng ngay trước thời điểm não bộ chuẩn bị quên.
              </p>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-brand bg-brand/10 p-3 rounded-xl border border-brand/20">
              <CheckCircle2 size={16} />
              <span>Ghi nhớ 3,000 từ vựng vĩnh viễn</span>
            </div>

            <Link href="/vocabulary" className="absolute top-6 right-6 p-2.5 rounded-full bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>

          {/* ── Bento Cell 4: Span 7 (Daily Todo & Pomodoro Flow) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:col-span-7 bg-card border border-border/80 rounded-3xl p-7 md:p-8 flex flex-col justify-between hover:border-brand/40 hover:shadow-xl transition-all duration-300 relative group"
          >
            <div className="space-y-3 max-w-lg">
              <div className="h-11 w-11 rounded-2xl bg-brand/10 text-brand flex items-center justify-center border border-brand/20 shadow-xs">
                <ListTodo size={22} />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground tracking-tight group-hover:text-brand transition-colors">
                Kế Hoạch Todo &amp; Pomodoro Focus
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Lên lộ trình học tập hàng ngày rõ ràng, chia nhỏ mục tiêu theo phiên tập trung 25 phút để duy trì chuỗi học tập bền vững mà không bị kiệt sức.
              </p>
            </div>

            {/* Mini task checklist preview */}
            <div className="mt-6 grid grid-cols-2 gap-3 pt-4 border-t border-border/60 text-xs">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 text-foreground/80 font-medium">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>15p Dictation mỗi sáng</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/40 text-foreground/80 font-medium">
                <Clock size={14} className="text-brand" />
                <span>1 Phiên Pomodoro Shadowing</span>
              </div>
            </div>

            <Link href="/todo" className="absolute top-6 right-6 p-2.5 rounded-full bg-muted/80 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
