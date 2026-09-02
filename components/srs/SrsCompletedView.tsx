'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, BookOpen, Flame, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface SrsCompletedViewProps {
  reviewedCount: number;
  goodEasyCount: number;
  durationSeconds: number;
  streakDays: number;
  onRestartSession?: () => void;
}

export function SrsCompletedView({
  reviewedCount,
  goodEasyCount,
  durationSeconds,
  streakDays,
  onRestartSession,
}: SrsCompletedViewProps) {
  const accuracy = reviewedCount > 0 ? Math.round((goodEasyCount / reviewedCount) * 100) : 100;

  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${remainingSecs}s`;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card border-2 border-border/80 rounded-3xl p-6 text-center space-y-8 shadow-[0_8px_0_0_theme(colors.border)]"
      >
        {/* Celebration Header */}
        <div className="space-y-3">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-brand/10 border-2 border-brand/25 flex items-center justify-center text-brand shadow-[0_4px_0_0_#d95847]">
            <Sparkles className="h-8 w-8 text-brand" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20 inline-block">
              Phiên Ôn Tập Hoàn Tất
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight pt-2">
              Tuyệt Vời! Bạn Đã Hoàn Thành 🎉
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium max-w-md mx-auto">
              Hệ thống đã tự động tính toán lại chu kỳ ghi nhớ cho từng từ vựng theo thuật toán Spaced Repetition.
            </p>
          </div>
        </div>

        {/* 4 Stats 3D Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-muted/40 border-2 border-border/80 text-center space-y-1 shadow-[0_3px_0_0_theme(colors.border)]">
            <span className="text-[10px] font-black text-muted-foreground uppercase">Số từ đã ôn</span>
            <div className="text-2xl sm:text-3xl font-black text-foreground">{reviewedCount}</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-center space-y-1 shadow-[0_3px_0_0_#059669]">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase">Tỷ lệ nhớ tốt</span>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">{accuracy}%</div>
          </div>

          <div className="p-4 rounded-2xl bg-muted/40 border-2 border-border/80 text-center space-y-1 shadow-[0_3px_0_0_theme(colors.border)]">
            <span className="text-[10px] font-black text-muted-foreground uppercase">Thời gian</span>
            <div className="text-2xl sm:text-3xl font-black text-foreground">{formatDuration(durationSeconds)}</div>
          </div>

          <div className="p-4 rounded-2xl bg-orange-500/10 border-2 border-orange-500/30 text-center space-y-1 shadow-[0_3px_0_0_#ea580c]">
            <span className="text-[10px] font-black text-orange-500 uppercase">Chuỗi ngày</span>
            <div className="text-2xl sm:text-3xl font-black text-orange-500 flex items-center justify-center gap-1">
              <Flame className="h-5 w-5 fill-orange-500" />
              {streakDays}
            </div>
          </div>
        </div>

        {/* 3D Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
          {onRestartSession && (
            <button
              onClick={onRestartSession}
              className="px-5 py-3.5 rounded-2xl bg-card border-2 border-border text-foreground shadow-[0_3px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Ôn tập lại từ vừa rồi</span>
            </button>
          )}

          <Link
            href="/review"
            className="btn-3d-duo px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2"
          >
            <span>Về Bảng Điều Khiển Ôn Tập</span>
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </Link>

          <Link
            href="/vocabulary"
            className="px-5 py-3.5 rounded-2xl bg-card border-2 border-border text-foreground shadow-[0_3px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-brand" />
            <span>Học thêm từ mới</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
