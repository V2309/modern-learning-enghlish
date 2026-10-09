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
import { BarChart3, PieChart as PieIcon, TrendingUp, LineChart as LineIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardChartsProps {
  activityMap: Record<string, number>;
  vocabMastered: number;
  totalVocab: number;
  lessonsCompleted: number;
  totalLessons: number;
}

// Custom Obsidian Tooltip for Recharts
const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#111827] text-white border border-[#374151] px-3 py-2 text-xs shadow-xl space-y-0.5">
        <p className="text-[10px] text-[#9ca3af] uppercase tracking-wider">{label || data.payload?.dateStr}</p>
        <p className="text-sm font-bold text-[#f28500] flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f28500] inline-block" />
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
    { name: 'Đã thuộc', value: vocabMastered, color: '#f28500' },
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
    <div className="bg-white dark:bg-[#0f1115] border border-[#e5e7eb] dark:border-[#1f2937] p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between">
      {/* Technical Crosshairs */}
      <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
      <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>

      {/* Header & Tab Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#e5e7eb] dark:border-[#1f2937]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#9ca3af] dark:text-[#6b7280] block mb-1.5 font-bold">
            Chỉ số đo lường · Phân tích AI
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-white tracking-tight">
            Hiệu suất & Tốc độ tiếp thu
          </h3>
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1 font-normal">
            Đo lường nhịp độ học tập qua các chu kỳ Dictation & Shadowing.
          </p>
        </div>

        {/* Tab Controls (Segmented Control) */}
        <div className="flex items-center p-0.5 border border-[#e5e7eb] dark:border-[#1f2937] bg-[#f8f9fa] dark:bg-[#14171b] self-start sm:self-auto overflow-x-auto max-w-full">
          {[
            { id: 'line', label: 'Xu Hướng', icon: LineIcon },
            { id: 'weekly', label: '7 Ngày', icon: BarChart3 },
            { id: 'distribution', label: 'Tỉ Lệ Từ', icon: PieIcon },
            { id: 'progress', label: 'Tích Lũy', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap font-medium',
                activeTab === tab.id
                  ? 'bg-[#111827] dark:bg-white text-white dark:text-[#111827] font-bold shadow-xs'
                  : 'text-[#6b7280] dark:text-[#9ca3af] hover:text-[#111827] dark:hover:text-white'
              )}
            >
              <tab.icon size={13} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chart Viewport powered by Recharts */}
      <div className="w-full h-56 sm:h-64 flex items-center justify-center py-4">
        {/* ── TAB 1: 14-DAY SMOOTH AREA/LINE CHART ── */}
        {activeTab === 'line' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f28500" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f28500" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-[#e5e7eb] dark:text-[#1f2937]" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-[#9ca3af]"
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-[#9ca3af]"
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#f28500"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTrend)"
                dot={{ r: 3, fill: '#f28500', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 5, fill: '#f28500', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {/* ── TAB 2: 7-DAY BAR CHART ── */}
        {activeTab === 'weekly' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-[#e5e7eb] dark:text-[#1f2937]" />
              <XAxis
                dataKey="shortDay"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-[#9ca3af]"
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-[#9ca3af]"
              />
              <Tooltip content={<CustomChartTooltip />} />
              <Bar
                dataKey="count"
                fill="#f28500"
                maxBarSize={36}
              >
                {weeklyData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === weeklyData.length - 1 ? '#f28500' : '#10b981'}
                    className="transition-opacity hover:opacity-85"
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
                    outerRadius={66}
                    paddingAngle={3}
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
                <span className="text-xl font-bold text-[#111827] dark:text-white">{masteredPercent}%</span>
                <span className="text-[9px] text-[#9ca3af] uppercase tracking-wider font-semibold">Đã thuộc</span>
              </div>
            </div>

            <div className="space-y-3 min-w-[220px]">
              <div className="flex items-center justify-between gap-4 p-3 border border-[#e5e7eb] dark:border-[#1f2937] bg-[#f8f9fa] dark:bg-[#14171b]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#f28500]" />
                  <span className="text-xs font-semibold text-[#111827] dark:text-white">Đã thuộc vĩnh viễn</span>
                </div>
                <span className="text-xs font-bold text-[#f28500]">{vocabMastered} từ</span>
              </div>

              <div className="flex items-center justify-between gap-4 p-3 border border-[#e5e7eb] dark:border-[#1f2937] bg-[#f8f9fa] dark:bg-[#14171b]">
                <div className="flex items-center gap-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#3b82f6]" />
                  <span className="text-xs font-semibold text-[#111827] dark:text-white">Đang trong chu kỳ ôn</span>
                </div>
                <span className="text-xs font-bold text-[#3b82f6]">{learningCount} từ</span>
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
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-[#e5e7eb] dark:text-[#1f2937]" />
              <XAxis
                dataKey="shortDay"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-[#9ca3af]"
              />
              <YAxis
                allowDecimals={false}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'currentColor' }}
                className="text-[#9ca3af]"
              />
              <Tooltip
                formatter={(value: any) => [`${value} hoạt động`, 'Tích lũy']}
                content={<CustomChartTooltip />}
              />
              <Area
                type="monotone"
                dataKey="cumulative"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCumulative)"
                dot={{ r: 3, fill: '#10b981', strokeWidth: 1.5, stroke: '#ffffff' }}
                activeDot={{ r: 5, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Insight Note */}
      <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#1f2937] flex items-center justify-between text-xs font-medium">
        <span className="text-[#9ca3af] dark:text-[#6b7280]">Biểu đồ Recharts • Cập nhật thời gian thực</span>
        <span className="font-bold text-[#f28500]">Hôm nay: {todayCount} hoạt động</span>
      </div>
    </div>
  );
}
