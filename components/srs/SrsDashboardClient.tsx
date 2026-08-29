'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Brain,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  AlertTriangle,
  RotateCcw,
  BookOpen,
  Award,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { SrsHistoryAnalytics } from './SrsHistoryAnalytics';
import { cn } from '@/lib/utils';

interface SrsDashboardClientProps {
  stats: {
    dueTodayCount: number;
    totalLearned: number;
    learningCount: number;
    reviewingCount: number;
    masteredCount: number;
    reviewsTodayCount: number;
    forecast: { dayName: string; dateStr: string; dueCount: number }[];
    highLapseWords: any[];
    recentLogs: any[];
  };
  streakDays?: number;
}

export function SrsDashboardClient({ stats, streakDays = 0 }: SrsDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'history'>('overview');

  const {
    dueTodayCount,
    totalLearned,
    learningCount,
    reviewingCount,
    masteredCount,
    reviewsTodayCount,
    forecast,
    highLapseWords,
    recentLogs,
  } = stats;

  const isAllCaughtUp = dueTodayCount === 0 && totalLearned > 0;
  const isEmpty = totalLearned === 0;

  return (
    <div className="w-full space-y-8">
      {/* ── 1. HERO COMMAND HUB BANNER ── */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-0.5 rounded-md border border-brand/20">
              <Brain className="h-3.5 w-3.5" />
              Spaced Repetition System (SRS)
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Ôn Tập Ngắt Quãng Thông Minh
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Hệ thống tự động tính toán thời điểm vàng bạn sắp quên từ vựng để nhắc bạn ôn lại, giúp ghi nhớ sâu với ít thời gian nhất.
          </p>
        </div>

        {/* Action Button & Status Pill */}
        <div className="shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {isEmpty ? (
            <Link
              href="/vocabulary"
              className="px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-black/10 flex items-center justify-center gap-2"
            >
              <BookOpen className="h-4 w-4 text-brand" />
              <span>Khám phá Thư Viện Từ Vựng</span>
            </Link>
          ) : isAllCaughtUp ? (
            <div className="flex items-center gap-3">
              <div className="px-4 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>Hôm nay đã hoàn thành xong!</span>
              </div>
              <Link
                href="/vocabulary"
                className="px-5 py-3 rounded-2xl bg-muted/60 hover:bg-muted text-foreground border border-border/60 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Học từ mới</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <Link
              href="/review/session"
              className="px-7 py-3.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-black/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-brand" />
              <span>Bắt Đầu Ôn {dueTodayCount} Từ Hôm Nay</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>

      {/* ── 2. CALIBRATED 4 BENTO METRIC CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Due Today */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-brand/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Cần Ôn Hôm Nay</span>
            <div className="h-8 w-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {dueTodayCount} <span className="text-xs font-bold text-muted-foreground">từ</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Đã hoàn thành {reviewsTodayCount} lượt ôn trong ngày
            </p>
          </div>
        </div>

        {/* Card 2: Learning 🔴 */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-rose-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Cần Ôn Ngay
            </span>
            <div className="h-8 w-8 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {learningCount} <span className="text-xs font-bold text-muted-foreground">từ</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Khoảng cách &lt; 1 ngày (mới nạp / vừa quên)
            </p>
          </div>
        </div>

        {/* Card 3: Reviewing 🟡 */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-amber-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Đang Củng Cố
            </span>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {reviewingCount} <span className="text-xs font-bold text-muted-foreground">từ</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Khoảng cách 1 - 20 ngày (đang chuyển vào trí nhớ dài hạn)
            </p>
          </div>
        </div>

        {/* Card 4: Mastered 🟢 */}
        <div className="p-5 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col justify-between hover:border-emerald-500/40 transition-all space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Đã Thành Thạo
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Award className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              {masteredCount} <span className="text-xs font-bold text-muted-foreground">/ {totalLearned} từ</span>
            </div>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Khoảng cách &ge; 21 ngày (đã ghi nhớ vững chắc)
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. TABS SWITCH (Tổng Quan Lịch Ôn / Lịch Sử & Phân Tích) ── */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex bg-muted/60 p-1 rounded-2xl border border-border/80">
          <button
            onClick={() => setActiveTab('overview')}
            className={cn(
              'px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeTab === 'overview'
                ? 'bg-background text-brand shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Lịch Ôn Dự Báo 7 Ngày
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={cn(
              'px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer',
              activeTab === 'history'
                ? 'bg-background text-brand shadow-xs border border-border/80'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Lịch Sử & Phân Tích Trí Nhớ
          </button>
        </div>
      </div>

      {/* ── TAB 1: 7-DAY FORECAST & QUEUE INSIGHTS ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-bold text-foreground">Dự Báo Số Từ Đến Hạn Trong 7 Ngày Tới</h3>
              </div>
              <span className="text-[11px] text-muted-foreground">Tự động cập nhật theo tiến độ</span>
            </div>

            {/* 7 Days Timeline Columns */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {forecast.map((d, idx) => {
                const isToday = idx === 0;
                return (
                  <div
                    key={d.dateStr}
                    className={cn(
                      'p-3.5 rounded-2xl border text-center transition-all flex flex-col justify-between gap-2',
                      isToday
                        ? 'bg-brand/10 border-brand/30 ring-1 ring-brand/20'
                        : 'bg-muted/40 border-border/60 hover:bg-muted/70'
                    )}
                  >
                    <span className={cn('text-[11px] font-bold', isToday ? 'text-brand' : 'text-muted-foreground')}>
                      {d.dayName}
                    </span>
                    <div className={cn('text-xl font-extrabold', isToday ? 'text-brand' : 'text-foreground')}>
                      {d.dueCount}
                    </div>
                    <span className="text-[9px] text-muted-foreground/70 font-medium">từ đến hạn</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* High Lapse Words Quick Widget */}
          <SrsHistoryAnalytics
            highLapseWords={highLapseWords}
            recentLogs={recentLogs}
            totalLearned={totalLearned}
            masteredCount={masteredCount}
          />
        </div>
      )}

      {/* ── TAB 2: DETAILED ANALYTICS ── */}
      {activeTab === 'history' && (
        <SrsHistoryAnalytics
          highLapseWords={highLapseWords}
          recentLogs={recentLogs}
          totalLearned={totalLearned}
          masteredCount={masteredCount}
        />
      )}
    </div>
  );
}
