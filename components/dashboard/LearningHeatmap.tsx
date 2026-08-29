'use client';

import React, { useState } from 'react';
import { Calendar, Sparkles, Info } from 'lucide-react';

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
    if (count === 0) return 'bg-muted/60 border-border/40 hover:border-border';
    if (count <= 2) return 'bg-emerald-500/30 border-emerald-500/40';
    if (count <= 5) return 'bg-emerald-500/60 border-emerald-500/70';
    if (count <= 10) return 'bg-emerald-500/85 border-emerald-500';
    return 'bg-emerald-600 border-emerald-700 shadow-xs shadow-emerald-500/20';
  };

  return (
    <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-7 space-y-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Bản Đồ Hoạt Động Học Tập</h2>
            <p className="text-[11px] text-muted-foreground">
              {totalActivities} hoạt động được ghi nhận qua {activeDaysCount} ngày chăm chỉ.
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground self-start sm:self-auto">
          <span>Ít</span>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-[3px] bg-muted/60 border border-border/40" />
            <div className="h-2.5 w-2.5 rounded-[3px] bg-emerald-500/30 border border-emerald-500/40" />
            <div className="h-2.5 w-2.5 rounded-[3px] bg-emerald-500/60 border border-emerald-500/70" />
            <div className="h-2.5 w-2.5 rounded-[3px] bg-emerald-600 border border-emerald-700" />
          </div>
          <span>Nhiều</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="flex flex-wrap gap-1.5 min-w-[500px]">
          {datesList.map((item) => (
            <div
              key={item.dateStr}
              onMouseEnter={() => setHoveredDate({ date: item.dateStr, count: item.count })}
              onMouseLeave={() => setHoveredDate(null)}
              className={`h-3.5 w-3.5 rounded-[3px] border transition-all cursor-pointer ${getColorClass(item.count)}`}
              title={`${formatDateVN(item.dateStr)}: ${item.count} hoạt động`}
            />
          ))}
        </div>
      </div>

      {/* Hover Info Tooltip bar */}
      <div className="h-6 flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/40">
        {hoveredDate ? (
          <div className="flex items-center gap-2 text-foreground font-medium">
            <span className="h-2 w-2 rounded-full bg-brand" />
            <span>Ngày {formatDateVN(hoveredDate.date)}: <strong>{hoveredDate.count}</strong> bài học & hoạt động hoàn thành</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/70">
            <Info className="h-3 w-3" />
            <span>Di chuột vào từng ô vuông để xem chi tiết số bài học đã làm trong ngày.</span>
          </div>
        )}
      </div>
    </div>
  );
}
