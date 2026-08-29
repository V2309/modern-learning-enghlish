'use client';

import React, { useState } from 'react';
import { BarChart3, PieChart, TrendingUp, Sparkles, LineChart as LineIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  totalLessons,
}: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<'line' | 'weekly' | 'distribution' | 'progress'>('line');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [hoveredLinePoint, setHoveredLinePoint] = useState<{ x: number; y: number; dateStr: string; dayName: string; count: number } | null>(null);

  // 1. 14-day Trend Data for Line Chart
  const trendData = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const shortDay = d.toLocaleDateString('vi-VN', { weekday: 'short' });
    const count = activityMap[dateStr] || 0;
    return { dayName, shortDay, dateStr, count };
  });

  const maxTrendCount = Math.max(...trendData.map((d) => d.count), 4);

  // 2. Weekly Activity Data (Last 7 Days) for Bar Chart
  const weeklyData = trendData.slice(7);
  const maxWeeklyCount = Math.max(...weeklyData.map((d) => d.count), 1);

  // 3. Vocabulary Distribution (Donut Chart)
  const masteredPercent = totalVocab > 0 ? Math.round((vocabMastered / totalVocab) * 100) : 0;

  // 4. Learning Progress (Cumulative Trend)
  let cumulative = 0;
  const progressData = weeklyData.map((d) => {
    cumulative += d.count;
    return { ...d, cumulative };
  });
  const maxCumulative = Math.max(...progressData.map((d) => d.cumulative), 1);

  // SVG Line Path Calculation for 14-day trend
  const svgWidth = 560;
  const svgHeight = 150;
  const paddingX = 25;
  const paddingY = 20;

  const points = trendData.map((d, index) => {
    const x = paddingX + (index / (trendData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.count / maxTrendCount) * (svgHeight - paddingY * 2);
    return { x, y, ...d };
  });

  // Generate smooth SVG Catmull-Rom or Cubic Bezier path
  const generateSmoothPath = (pts: typeof points) => {
    if (pts.length === 0) return '';
    return pts.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x},${pt.y}`;
      const prev = arr[i - 1];
      const cp1x = prev.x + (pt.x - prev.x) / 2;
      const cp1y = prev.y;
      const cp2x = prev.x + (pt.x - prev.x) / 2;
      const cp2y = pt.y;
      return `${acc} C ${cp1x},${cp1y} ${cp2x},${cp2y} ${pt.x},${pt.y}`;
    }, '');
  };

  const linePath = generateSmoothPath(points);
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x},${svgHeight - paddingY} L ${points[0].x},${svgHeight - paddingY} Z`
    : '';

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-0.5 rounded-full border border-brand/20">
              <Sparkles className="h-3 w-3" />
              Biểu Đồ Phân Tích
            </span>
          </div>
          <h2 className="text-base font-bold text-foreground">Hiệu Suất & Tốc Độ Học Tập</h2>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-muted/60 p-1 rounded-2xl border border-border/80 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'line', label: 'Xu Hướng (Line)', icon: LineIcon },
            { id: 'weekly', label: '7 Ngày (Bar)', icon: BarChart3 },
            { id: 'distribution', label: 'Tỉ Lệ Từ Vựng', icon: PieChart },
            { id: 'progress', label: 'Tích Lũy', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setHoveredLinePoint(null);
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                activeTab === tab.id
                  ? 'bg-background text-brand shadow-xs border border-border/80'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Viewport */}
      <div className="min-h-[200px] flex items-center justify-center">
        {/* TAB 1: INTERACTIVE LINE CHART (14 DAYS) */}
        {activeTab === 'line' && (
          <div className="w-full space-y-3">
            <div className="relative w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-44 overflow-visible select-none"
              >
                <defs>
                  <linearGradient id="lineAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f17463" stopOpacity="0.32" />
                    <stop offset="85%" stopColor="#f17463" stopOpacity="0.02" />
                    <stop offset="100%" stopColor="#f17463" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Gridlines */}
                {[0, 0.5, 1].map((ratio) => {
                  const y = paddingY + ratio * (svgHeight - paddingY * 2);
                  const val = Math.round(maxTrendCount * (1 - ratio));
                  return (
                    <g key={ratio}>
                      <line
                        x1={paddingX}
                        y1={y}
                        x2={svgWidth - paddingX}
                        y2={y}
                        stroke="currentColor"
                        strokeDasharray="3 3"
                        className="text-border/50"
                        strokeWidth="1"
                      />
                      <text
                        x={paddingX - 6}
                        y={y + 3}
                        textAnchor="end"
                        className="text-[9px] font-bold fill-muted-foreground/60"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Area under Curve */}
                <path d={areaPath} fill="url(#lineAreaGradient)" />

                {/* Smooth Curve Line */}
                <path
                  d={linePath}
                  fill="none"
                  stroke="#f17463"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="drop-shadow-xs"
                />

                {/* Interactive Data Dots */}
                {points.map((pt, idx) => {
                  const isHovered = hoveredLinePoint?.dateStr === pt.dateStr;
                  const isLast = idx === points.length - 1;
                  return (
                    <g key={pt.dateStr}>
                      {/* Invisible larger hover area */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r="12"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredLinePoint(pt)}
                      />

                      {/* Visible circle dot */}
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 6 : isLast ? 4.5 : 3.5}
                        fill={isHovered || isLast ? '#f17463' : '#111827'}
                        stroke="#ffffff"
                        strokeWidth={isHovered ? 2.5 : 1.5}
                        className="transition-all duration-200 pointer-events-none"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* X-axis date labels */}
            <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground px-2 pt-1 border-t border-border/40">
              {points
                .filter((_, i) => i % 2 === 0 || i === points.length - 1)
                .map((pt) => (
                  <span key={pt.dateStr} className={cn(pt.dateStr === points[points.length - 1].dateStr && 'text-brand')}>
                    {pt.dayName}
                  </span>
                ))}
            </div>

            {/* Bottom Insight Footer */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              {hoveredLinePoint ? (
                <span className="text-foreground font-bold flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-brand" />
                  Ngày {hoveredLinePoint.dayName}: <strong className="text-brand">{hoveredLinePoint.count}</strong> bài học hoàn thành
                </span>
              ) : (
                <span>Biểu đồ đường 14 ngày qua • Di chuột vào từng điểm để xem số bài học cụ thể</span>
              )}
              <span className="font-bold text-brand">
                Hôm nay: {points[points.length - 1]?.count || 0} bài
              </span>
            </div>
          </div>
        )}

        {/* TAB 2: WEEKLY BAR CHART */}
        {activeTab === 'weekly' && (
          <div className="w-full space-y-4">
            <div className="flex items-end justify-between gap-2 h-40 pt-6 px-2">
              {weeklyData.map((d, idx) => {
                const heightPct = Math.round((d.count / maxWeeklyCount) * 100);
                const isToday = idx === weeklyData.length - 1;
                const isHovered = hoveredIndex === idx;

                return (
                  <div
                    key={d.dateStr}
                    onMouseEnter={() => setHoveredIndex(idx)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                  >
                    <div className="w-full max-w-[38px] h-full flex items-end justify-center">
                      <div
                        className={cn(
                          'w-full rounded-xl transition-all duration-300 relative',
                          isToday
                            ? 'bg-brand'
                            : d.count > 0
                            ? 'bg-primary/80 group-hover:bg-primary'
                            : 'bg-muted/80'
                        )}
                        style={{ height: `${Math.max(heightPct, 6)}%` }}
                      >
                        {(isHovered || isToday) && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-black rounded-md shadow-sm whitespace-nowrap z-10">
                            {d.count} bài
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={cn('text-[11px] font-bold', isToday ? 'text-brand' : 'text-muted-foreground')}>
                      {d.shortDay}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
              <span>Biểu đồ cột số lượng bài học và từ vựng hoàn thành trong 7 ngày</span>
              <span className="font-bold text-foreground">Hôm nay: {weeklyData[weeklyData.length - 1]?.count || 0} bài</span>
            </div>
          </div>
        )}

        {/* TAB 3: DONUT CHART */}
        {activeTab === 'distribution' && (
          <div className="w-full flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
            <div className="relative h-32 w-32 shrink-0">
              <svg className="h-32 w-32 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  className="text-muted/60"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeDasharray={`${masteredPercent} ${100 - masteredPercent}`}
                  strokeLinecap="round"
                  className="text-emerald-500 transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-foreground">{masteredPercent}%</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Đã thuộc</span>
              </div>
            </div>

            <div className="space-y-3 min-w-[200px]">
              <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold text-foreground">Đã ghi nhớ sâu</span>
                </div>
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{vocabMastered} từ</span>
              </div>

              <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-muted/60 border border-border/60">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                  <span className="text-xs font-bold text-muted-foreground">Cần tiếp tục học</span>
                </div>
                <span className="text-xs font-black text-muted-foreground">{totalVocab - vocabMastered} từ</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CUMULATIVE TREND */}
        {activeTab === 'progress' && (
          <div className="w-full space-y-4">
            <div className="flex items-end justify-between gap-2 h-40 pt-6 px-2">
              {progressData.map((d, idx) => {
                const heightPct = Math.round((d.cumulative / maxCumulative) * 100);
                const isLast = idx === progressData.length - 1;

                return (
                  <div key={d.dateStr} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="w-full max-w-[38px] h-full flex items-end justify-center">
                      <div
                        className={cn(
                          'w-full rounded-xl transition-all duration-500 relative',
                          isLast ? 'bg-brand' : 'bg-brand/40'
                        )}
                        style={{ height: `${Math.max(heightPct, 8)}%` }}
                      >
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-foreground">
                          {d.cumulative}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-muted-foreground">{d.shortDay}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
              <span>Đường tích lũy tổng hoạt động học tập trong 7 ngày gần nhất</span>
              <span className="font-bold text-brand">Tổng 7 ngày: {cumulative} hoạt động</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
