'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Sparkles, Headphones, Mic, 
  CheckCircle2, Play, Volume2, ShieldCheck, Flame
} from 'lucide-react';

export default function Hero() {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <section className="relative pt-6 pb-10 md:pt-10 md:pb-14 overflow-hidden border-b border-border/40 bg-radial from-card/60 to-background">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* ── Left Column: Editorial Headline & Conversion Spine ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            {/* Top Eyebrow Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-brand/10 text-brand border border-brand/20 shadow-xs">
              <Sparkles size={14} className="animate-pulse" />
              <span>Phương Pháp Học Tiếng Anh Chuẩn Quốc Tế</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight leading-[1.18]">
              Luyện Phản Xạ Nghe Nói,<br />
              <span className="text-brand">Không Còn Rào Cản</span> Ngoại Ngữ.
            </h1>

            {/* Sub-headline */}
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-xl">
              Chinh phục phát âm chuẩn bản xứ và phản xạ tự nhiên thông qua bộ công cụ <strong className="text-foreground font-semibold">Dictation (Nghe chép chính tả)</strong> &amp; <strong className="text-foreground font-semibold">Shadowing AI</strong> cá nhân hóa.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                href="/courses"
                className="px-7 py-4 bg-primary text-primary-foreground rounded-xl font-bold text-sm shadow-md shadow-black/10 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Khám Phá Khóa Học</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              
              <Link
                href="/dictation"
                className="px-6 py-4 bg-card border border-border hover:bg-muted text-foreground rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <Headphones size={16} className="text-brand" />
                <span>Trải Nghiệm Dictation</span>
              </Link>
            </div>

            {/* Social Proof & Trust Metrics */}
            <div className="pt-6 border-t border-border/60 flex flex-wrap items-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2 overflow-hidden">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="inline-block h-7 w-7 rounded-full ring-2 ring-background bg-muted overflow-hidden flex items-center justify-center font-bold text-[10px] text-foreground">
                      U{i}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-amber-500 text-xs">★★★★★</div>
                  <span className="font-bold text-foreground">4.9/5</span> (50,000+ học viên)
                </div>
              </div>

              <div className="h-6 w-px bg-border hidden sm:block" />

              <div className="flex items-center gap-1.5 font-medium text-foreground/80">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span>Chuẩn khung tham chiếu Châu Âu (CEFR)</span>
              </div>
            </div>
          </motion.div>

          {/* ── Right Column: Interactive SaaS Learning Preview Widget ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 relative"
          >
            {/* Outer Container with Soft Depth & Border */}
            <div className="bg-card border border-border rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-5">
              
              {/* Header of Simulated Widget */}
              <div className="flex items-center justify-between border-b border-border/60 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-brand/10 text-brand flex items-center justify-center">
                    <Headphones size={18} />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-foreground leading-none">Dictation Pro Engine</h2>
                    <span className="text-[10px] text-muted-foreground">Bản tin học thuật · Tốc độ 1.0x</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                  <CheckCircle2 size={12} />
                  <span>Độ chính xác: 98%</span>
                </div>
              </div>

              {/* Audio Waveform Simulation */}
              <div className="bg-muted/50 rounded-2xl p-4 border border-border/50 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <button 
                    onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-[11px] hover:bg-primary/90 transition-all cursor-pointer"
                  >
                    {isPlayingAudio ? <Volume2 size={13} className="animate-pulse" /> : <Play size={13} />}
                    <span>{isPlayingAudio ? 'Đang phát...' : 'Nghe câu mẫu'}</span>
                  </button>
                  <span className="font-mono text-[11px] text-muted-foreground font-semibold">00:04 / 00:08</span>
                </div>

                {/* Animated Wave Bars */}
                <div className="h-10 flex items-center justify-between gap-1 px-2">
                  {[40, 65, 85, 30, 95, 75, 45, 90, 60, 35, 80, 100, 50, 70, 85, 40, 60, 90, 45, 65, 30].map((height, idx) => (
                    <motion.div
                      key={idx}
                      className={`w-1 rounded-full ${idx < 12 ? 'bg-brand' : 'bg-muted-foreground/30'}`}
                      animate={isPlayingAudio ? { height: [`${Math.max(15, height * 0.4)}%`, `${height}%`, `${Math.max(15, height * 0.3)}%`] } : { height: `${height}%` }}
                      transition={{ repeat: Infinity, duration: 1.2, delay: idx * 0.05 }}
                    />
                  ))}
                </div>
              </div>

              {/* Interactive Dictation Input Preview */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-muted-foreground">Người học chép lại:</span>
                  <span className="text-brand font-mono font-bold">14/14 từ khớp</span>
                </div>
                <div className="p-3.5 rounded-xl bg-background border border-border text-xs leading-relaxed text-foreground font-medium">
                  <span className="text-foreground">The architecture of </span>
                  <span className="text-brand font-bold bg-brand/10 px-1 py-0.5 rounded">modern language</span>
                  <span className="text-foreground"> acquisition relies on active recall.</span>
                </div>
              </div>

              {/* Instant Feedback Pill & Phonetic Guide */}
              <div className="p-3 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <Mic size={14} className="text-brand" />
                  <span className="font-mono text-muted-foreground">/ˈɑːrkɪtektʃər/</span>
                </div>
                <span className="font-bold text-brand">+25 EXP Bài học</span>
              </div>

              {/* Floating Streak Badge on Widget */}
              <div className="absolute -bottom-2 -right-2 bg-card border border-border p-3 rounded-2xl shadow-lg flex items-center gap-2.5 hidden sm:flex">
                <div className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                  <Flame size={18} />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground font-bold leading-none">Chuỗi học tập</p>
                  <p className="text-xs font-black text-foreground">7 ngày liên tiếp</p>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
