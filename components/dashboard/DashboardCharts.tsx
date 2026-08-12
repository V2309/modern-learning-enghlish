'use client';

import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';

interface DashboardChartsProps {
  activityMap: Record<string, number>;
  vocabMastered: number;
  totalVocab: number;
  lessonsCompleted: number;
  totalLessons: number;
}

export default function DashboardCharts({
  activityMap,
  vocabMastered,
  totalVocab,
  lessonsCompleted,
  totalLessons
}: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<'weekly' | 'distribution' | 'progress'>('weekly');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Weekly Activity Data (Last 7 Days)
  const weeklyData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('vi-VN', { weekday: 'short' });
    const count = activityMap[dateStr] || 0;
    return { dayName, dateStr, count };
  });

  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 1);

  // 2. Vocabulary Distribution (Donut Chart)
  const masteredPercent = totalVocab > 0 ? Math.round((vocabMastered / totalVocab) * 100) : 0;
  const remainingPercent = 100 - masteredPercent;

  // 3. Learning Progress (Cumulative Trend)
  let cumulative = 0;
  const progressData = weeklyData.map(d => {
    cumulative += d.count;
    return { ...d, cumulative };
  });
  const maxCumulative = Math.max(...progressData.map(d => d.cumulative), 1);

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="space-y-1">
          <h2 className="text-xl font-black text-foreground">Trực quan hóa dữ liệu học tập</h2>
          <p className="text-xs text-muted-foreground">Theo dõi và phân tích tiến trình học tập của bạn qua các biểu đồ.</p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-muted p-1 rounded-xl border border-border/45 self-start">
          {[
            { id: 'weekly', label: 'Hàng tuần', icon: BarChart3 },
            { id: 'distribution', label: 'Tỉ lệ từ vựng', icon: PieChart },
            { id: 'progress', label: 'Xu hướng', icon: TrendingUp },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-background text-primary shadow-xs'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={13} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Charts Viewport */}
      <div className="min-h-[260px] flex items-center justify-center">
        {/* TAB 1: WEEKLY ACTIVITY BAR CHART */}
        {activeTab === 'weekly' && (
          <div className="w-full space-y-4">
            <div className="flex items-end justify-between h-48 px-4 pt-4 border-b border-border/40">
              {weeklyData.map((item, index) => {
                const barHeight = (item.count / maxWeeklyCount) * 100;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1 group"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Tooltip */}
                    <div className={`absolute mb-20 px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-md pointer-events-none transition-opacity ${
                      hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                    }`}>
                      {item.count} hoạt động
                    </div>
                    {/* Bar */}
                    <div
                      style={{ height: `${Math.max(barHeight, 6)}%` }}
                      className={`w-8 sm:w-10 rounded-t-lg transition-all duration-300 ${
                        item.count > 0 
                          ? 'bg-gradient-to-t from-primary to-primary/80 hover:brightness-110 shadow-md shadow-primary/10'
                          : 'bg-slate-100 dark:bg-muted'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
            {/* Labels */}
            <div className="flex justify-between px-4">
              {weeklyData.map((item, index) => (
                <div key={index} className="flex-1 text-center text-xs font-bold text-muted-foreground uppercase">
                  {item.dayName}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: VOCAB DISTRIBUTION DONUT CHART */}
        {activeTab === 'distribution' && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full">
            {/* Donut Chart SVG */}
            <div className="relative w-36 h-36">
              <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="var(--border)"
                  strokeWidth="3.2"
                  className="stroke-muted/30"
                />
                {/* Mastered progress circle */}
                <circle
                  cx="18"
                  cy="18"
                  r="15.915"
                  fill="transparent"
                  stroke="var(--color-emerald-500, #10b981)"
                  strokeWidth="3.2"
                  strokeDasharray={`${masteredPercent} ${remainingPercent}`}
                  strokeDashoffset="0"
                  className="stroke-emerald-500 transition-all duration-1000 ease-out"
                />
              </svg>
              {/* Inner Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-foreground">{masteredPercent}%</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Đã thuộc</span>
              </div>
            </div>

            {/* Legends */}
            <div className="space-y-3 flex-1 max-w-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-foreground">Đã thuộc</span>
                </div>
                <span className="text-xs font-black text-emerald-600">{vocabMastered} từ</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-500/5 border border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-muted" />
                  <span className="text-xs font-bold text-foreground">Chưa thuộc</span>
                </div>
                <span className="text-xs font-black text-muted-foreground">{totalVocab - vocabMastered} từ</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUMULATIVE AREA CHART */}
        {activeTab === 'progress' && (
          <div className="w-full space-y-4">
            <div className="relative h-48 border-b border-border/40">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area path */}
                <path
                  d={`
                    M 0 100
                    ${progressData.map((d, index) => {
                      const x = (index / 6) * 100;
                      const y = 100 - (d.cumulative / maxCumulative) * 80; // Scale to 80 max height
                      return `L ${x} ${y}`;
                    }).join(' ')}
                    L 100 100 Z
                  `}
                  fill="url(#areaGrad)"
                />
                {/* Line path */}
                <path
                  d={`
                    ${progressData.map((d, index) => {
                      const x = (index / 6) * 100;
                      const y = 100 - (d.cumulative / maxCumulative) * 80;
                      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                    }).join(' ')}
                  `}
                  fill="none"
                  stroke="var(--color-primary, #6366f1)"
                  strokeWidth="2.5"
                  className="stroke-primary"
                />
              </svg>

              {/* Data points */}
              <div className="absolute inset-0 flex justify-between">
                {progressData.map((item, index) => {
                  const left = `${(index / 6) * 100}%`;
                  const top = `${100 - (item.cumulative / maxCumulative) * 80}%`;
                  return (
                    <div
                      key={index}
                      style={{ left, top }}
                      className="absolute w-2 h-2 -ml-1 -mt-1 rounded-full bg-primary border-2 border-background cursor-pointer group"
                    >
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-black rounded-md pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                        Tích lũy: {item.cumulative} bài/từ
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Labels */}
            <div className="flex justify-between">
              {progressData.map((item, index) => (
                <div key={index} className="text-xs font-bold text-muted-foreground uppercase">
                  {item.dayName}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
