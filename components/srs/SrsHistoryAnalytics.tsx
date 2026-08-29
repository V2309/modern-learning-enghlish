'use client';

import React from 'react';
import { Award, AlertTriangle, Clock, RotateCcw, CheckCircle2, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SrsHistoryAnalyticsProps {
  highLapseWords: {
    id: string;
    word: string;
    meaning: string;
    partOfSpeech: string;
    lapseCount: number;
    interval: number;
    topicName: string;
  }[];
  recentLogs: {
    id: string;
    word: string;
    meaning: string;
    rating: string;
    intervalAfter: number;
    reviewedAt: Date;
  }[];
  totalLearned: number;
  masteredCount: number;
}

export function SrsHistoryAnalytics({
  highLapseWords,
  recentLogs,
  totalLearned,
  masteredCount,
}: SrsHistoryAnalyticsProps) {
  const retentionRate = totalLearned > 0 ? Math.round((masteredCount / totalLearned) * 100) : 0;

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'again':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-rose-500/10 text-rose-500 border border-rose-500/20">Again (10m)</span>;
      case 'hard':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">Hard (1d)</span>;
      case 'good':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20">Good (3d)</span>;
      case 'easy':
        return <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">Easy (7d)</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pt-2">
      {/* 2-Column Split: High Lapse Words vs Recent Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Column 1: High Lapse Words (Từ thường xuyên quên) ── */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold text-foreground">Từ Thường Xuyên Quên (Cần Chú Ý)</h3>
            </div>
            <span className="text-[11px] text-muted-foreground">{highLapseWords.length} từ</span>
          </div>

          {highLapseWords.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground italic">
              Tuyệt vời! Chưa có từ vựng nào bị quên nhiều lần.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {highLapseWords.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3 hover:border-amber-500/40 transition-all"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground truncate">{item.word}</span>
                      <span className="text-[9px] font-bold text-brand bg-brand/10 px-1.5 py-0.5 rounded border border-brand/20">
                        {item.partOfSpeech}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{item.meaning}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-500 text-[10px] font-black border border-rose-500/20 block">
                      Quên {item.lapseCount} lần
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5 block">
                      Khoảng cách: {item.interval} ngày
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Column 2: Recent Review Logs (Lịch sử ôn tập) ── */}
        <div className="p-6 rounded-3xl bg-card border border-border/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand" />
              <h3 className="text-sm font-bold text-foreground">Nhật Ký Ôn Tập Gần Đây</h3>
            </div>
            <span className="text-[11px] text-muted-foreground">10 lượt mới nhất</span>
          </div>

          {recentLogs.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground italic">
              Chưa có phiên ôn tập nào được ghi nhận.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {recentLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-muted/40 border border-border/60 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-bold text-foreground truncate block">{log.word}</span>
                    <span className="text-[11px] text-muted-foreground truncate block">{log.meaning}</span>
                  </div>

                  <div className="text-right shrink-0 space-y-1">
                    {getRatingBadge(log.rating)}
                    <span className="text-[9px] text-muted-foreground block">
                      {new Date(log.reviewedAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} •{' '}
                      {new Date(log.reviewedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
