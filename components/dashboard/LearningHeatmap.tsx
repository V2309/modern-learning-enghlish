'use client';

import React, { useState } from 'react';
import { Calendar, Info } from 'lucide-react';

interface LearningHeatmapProps {
  userCreatedAt: string;
  activityMap: Record<string, number>;
}

export default function LearningHeatmap({ userCreatedAt, activityMap }: LearningHeatmapProps) {
  const [hoveredDate, setHoveredDate] = useState<{ date: string; count: number } | null>(null);

  // Parse registration date and today
  const regDate = new Date(userCreatedAt);
  regDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate date list for last ~12 weeks (84 days)
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 83);
  if (regDate < startDate) {
    startDate.setTime(regDate.getTime());
  }

  const datesList: { dateStr: string; dateObj: Date; count: number }[] = [];
  const tempDate = new Date(startDate);

  let loopLimit = 365;
  while (tempDate <= today && loopLimit > 0) {
    const dateStr = tempDate.toISOString().split('T')[0];
    datesList.push({
      dateStr,
      dateObj: new Date(tempDate),
      count: activityMap[dateStr] || 0,
    });
    tempDate.setDate(tempDate.getDate() + 1);
    loopLimit--;
  }

  const totalActivities = Object.values(activityMap).reduce((a, b) => a + b, 0);
  const activeDaysCount = Object.values(activityMap).filter((v) => v > 0).length;

  const formatDateVN = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-[#f3f4f6] dark:bg-[#1a1d22] border-transparent hover:border-[#d1d5db] dark:hover:border-[#374151]';
    if (count <= 2) return 'bg-[#a7f3d0] dark:bg-[#064e3b] border-transparent hover:border-[#34d399]';
    if (count <= 5) return 'bg-[#34d399] dark:bg-[#059669] border-transparent hover:border-[#10b981]';
    if (count <= 10) return 'bg-[#10b981] dark:bg-[#10b981] border-transparent';
    return 'bg-[#059669] dark:bg-[#34d399] border-transparent';
  };

  return (
    <div className="bg-white dark:bg-[#0f1115] border border-[#e5e7eb] dark:border-[#1f2937] p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between">
      {/* Technical Crosshairs */}
      <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
      <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#e5e7eb] dark:border-[#1f2937]">
        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#9ca3af] dark:text-[#6b7280] block mb-1.5 font-bold">
            Chỉ số hoạt động · 12 Tuần
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-white tracking-tight flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[#f28500]" />
            Bản đồ hoạt động học tập
          </h3>
          <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1 font-normal">
            {totalActivities} bài học & từ vựng hoàn thành trong {activeDaysCount} ngày chăm chỉ.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-[#9ca3af] dark:text-[#6b7280] self-start sm:self-auto font-medium">
          <span>Ít</span>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded-[2px] bg-[#f3f4f6] dark:bg-[#1a1d22] border border-[#e5e7eb] dark:border-[#1f2937]" />
            <div className="h-3 w-3 rounded-[2px] bg-[#a7f3d0] dark:bg-[#064e3b]" />
            <div className="h-3 w-3 rounded-[2px] bg-[#34d399] dark:bg-[#059669]" />
            <div className="h-3 w-3 rounded-[2px] bg-[#059669] dark:bg-[#34d399]" />
          </div>
          <span>Nhiều</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto py-5">
        <div className="flex flex-wrap gap-1.5 min-w-[500px]">
          {datesList.map((item) => (
            <div
              key={item.dateStr}
              onMouseEnter={() => setHoveredDate({ date: item.dateStr, count: item.count })}
              onMouseLeave={() => setHoveredDate(null)}
              className={`h-3.5 w-3.5 rounded-[2px] border transition-all cursor-pointer ${getColorClass(item.count)}`}
              title={`${formatDateVN(item.dateStr)}: ${item.count} hoạt động`}
            />
          ))}
        </div>
      </div>

      {/* Hover Info Tooltip Bar */}
      <div className="pt-3 border-t border-[#e5e7eb] dark:border-[#1f2937] min-h-[32px] flex items-center justify-between text-xs font-medium">
        {hoveredDate ? (
          <div className="flex items-center gap-2 text-[#111827] dark:text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f28500] animate-pulse" />
            <span>Ngày {formatDateVN(hoveredDate.date)}: <strong>{hoveredDate.count}</strong> bài học hoàn thành</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-[#9ca3af] dark:text-[#6b7280]">
            <Info className="h-3 w-3" />
            <span>Di chuột vào từng ô vuông để xem chi tiết bài học đã hoàn thành theo ngày.</span>
          </div>
        )}
      </div>
    </div>
  );
}
