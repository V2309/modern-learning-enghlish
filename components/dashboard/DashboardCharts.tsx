'use client';

import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { BarChart3, PieChart as PieIcon, TrendingUp, Sparkles, LineChart as LineIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardChartsProps {
  activityMap: Record<string, number>;
  vocabMastered: number;
  totalVocab: number;
  lessonsCompleted: number;
  totalLessons: number;
}

// Custom Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-popover/95 backdrop-blur-md border border-border/80 px-3.5 py-2 rounded-2xl shadow-xl shadow-black/20 text-xs space-y-0.5">
        <p className="text-[11px] font-bold text-muted-foreground">{label || data.payload?.dateStr}</p>
        <p className="text-sm font-black text-brand flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-brand inline-block" />
          <span>{data.value} hoạt động</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function DashboardCharts({
  activityMap,
  vocabMastered,
  totalVocab,
  lessonsCompleted,
  totalLessons,
}: DashboardChartsProps) {
  const [activeTab, setActiveTab] = useState<'line' | 'weekly' | 'distribution' | 'progress'>('line');

  // 1. 14-day Trend Data for Line & Area Chart
  const trendData = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    const offset = d.getTimezoneOffset();
    const localDate = new Date(d.getTime() - offset * 60 * 1000);
    const dateStr = localDate.toISOString().split('T')[0];
    const dayName = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
    const shortDay = d.toLocaleDateString('vi-VN', { weekday: 'short' });
    const count = activityMap[dateStr] || 0;
    return { name: dayName, shortDay, dateStr, count };
  });

  // 2. Weekly Activity Data (Last 7 Days) for Bar Chart
  const weeklyData = trendData.slice(7);

  // 3. Vocabulary Distribution Data (Donut Chart)
  const learningCount = Math.max(0, totalVocab - vocabMastered);
  const masteredPercent = totalVocab > 0 ? Math.round((vocabMastered / totalVocab) * 100) : 0;
  const pieData = [
    { name: 'Đã thuộc', value: vocabMastered, color: '#58CC02' },
    { name: 'Đang học', value: learningCount > 0 ? learningCount : (vocabMastered === 0 ? 1 : 0), color: '#3b82f6' },
  ];

  // 4. Learning Progress (Cumulative Trend)
  let cumulative = 0;
  const progressData = weeklyData.map((d) => {
    cumulative += d.count;
    return { ...d, cumulative };
  });

  const todayCount = trendData[trendData.length - 1]?.count || 0;

  return (
    <div className="card-3d-surface rounded-3xl p-6 sm:p-7 space-y-6">
      {/* Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand bg-brand/10 px-2.5 py-0.5 rounded-full border border-brand/20">
              <Sparkles className="h-3 w-3" />
              Recharts Analytics
            </span>
          </div>
          <h2 className="text-base font-bold text-foreground">Hiệu Suất & Tốc Độ Học Tập</h2>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-muted/60 p-1 rounded-2xl border border-border/80 self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'line', label: 'Xu Hướng (Line)', icon: LineIcon },
            { id: 'weekly', label: '7 Ngày (Bar)', icon: BarChart3 },
            { id: 'distribution', label: 'Tỉ Lệ Từ Vựng', icon: PieIcon },
            { id: 'progress', label: 'Tích Lũy', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
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

      {/* Chart Viewport powered by Recharts */}
      <div className="w-full h-56 sm:h-64 flex items-center justify-center">
        {/* ── TAB 1: 14-DAY SMOOTH AREA/LINE CHART ── */}
        {activeTab === 'line' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f17463" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f17463" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#f17463"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTrend)"
                dot={{ r: 3.5, fill: '#f17463', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#f17463', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* ── TAB 2: 7-DAY BAR CHART ── */}
        {activeTab === 'weekly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis
                dataKey="shortDay"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar
                dataKey="count"
                fill="#f17463"
                radius={[8, 8, 0, 0]}
                maxBarSize={42}
              >
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === weeklyData.length - 1 ? '#f17463' : '#58CC02'}
                    className="transition-opacity hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {/* ── TAB 3: VOCABULARY RATIO DONUT PIE CHART ── */}
        {activeTab === 'distribution' && (
          <div className="w-full h-full flex flex-col sm:flex-row items-center justify-around gap-6">
            <div className="relative w-40 h-40">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomChartTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-foreground">{masteredPercent}%</span>
                <span className="text-[9px] font-bold text-muted-foreground uppercase">Đã thuộc</span>
              </div>
            </div>

            <div className="space-y-3 min-w-[220px]">
              <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-[#58CC02]/10 border border-[#58CC02]/20">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#58CC02]" />
                  <span className="text-xs font-bold text-foreground">Đã ghi nhớ sâu</span>
                </div>
                <span className="text-xs font-black text-[#46A302] dark:text-[#58CC02]">{vocabMastered} từ</span>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-sky-500" />
                  <span className="text-xs font-bold text-foreground">Cần tiếp tục học</span>
                </div>
                <span className="text-xs font-black text-sky-600 dark:text-sky-400">{learningCount} từ</span>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 4: CUMULATIVE PROGRESS AREA CHART ── */}
        {activeTab === 'progress' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#58CC02" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#58CC02" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-border/40" />
              <XAxis
                dataKey="shortDay"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-muted-foreground"
              />
              <Tooltip
                formatter={(value: any) => [`${value} hoạt động`, 'Tích lũy']}
                content={<CustomChartTooltip />}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#58CC02"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCumulative)"
                dot={{ r: 4, fill: '#58CC02', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 6, fill: '#58CC02', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

      </div>

      {/* Footer Insight Note */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-3 border-t border-border/40">
        <span>Biểu đồ tương tác Recharts • Tự động cập nhật theo tiến độ học tập thực tế</span>
        <span className="font-bold text-brand">Hôm nay: {todayCount} hoạt động</span>
      </div>
    </div>
  );
}
