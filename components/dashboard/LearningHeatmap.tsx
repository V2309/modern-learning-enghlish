'use client';

import React, { useState } from 'react';
import { Calendar, Award, BookOpen } from 'lucide-react';

interface LearningHeatmapProps {
  userCreatedAt: string;
  activityMap: Record<string, number>;
}

export default function LearningHeatmap({ userCreatedAt, activityMap }: LearningHeatmapProps) {
  const [selectedDate, setSelectedDate] = useState<{ date: string; count: number } | null>(null);

  // Parse registration date and today
  const regDate = new Date(userCreatedAt);
  regDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Generate date list from regDate to today
  const datesList: { dateStr: string; dateObj: Date; count: number }[] = [];
  const tempDate = new Date(regDate);

  // Safety fallback if date calculation goes wrong
  let loopLimit = 1000;
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

  // Format Vietnamese date: 12/08/2026
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

  return (
    <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <Calendar className="h-5 w-5 text-emerald-500" />
          <h2 className="text-xl font-black text-foreground">Bản đồ học tập (Heatmap)</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Bắt đầu từ ngày đăng ký {formatDateVN(userCreatedAt.split('T')[0])}. Thêm 1 ô vuông mỗi ngày.
        </p>
      </div>

      {/* Grid of days */}
      <div className="flex flex-wrap gap-1.5 min-h-[40px] items-center">
        {datesList.map((item, index) => {
          let bgColor = 'bg-slate-100 dark:bg-muted border border-border/30';
          if (item.count > 0 && item.count <= 2) {
            bgColor = 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-600';
          } else if (item.count > 2 && item.count <= 5) {
            bgColor = 'bg-emerald-500/40 border border-emerald-500/50 text-white';
          } else if (item.count > 5) {
            bgColor = 'bg-emerald-600 border border-emerald-700 text-white';
          }

          const formattedDate = formatDateVN(item.dateStr);

          return (
            <div
              key={item.dateStr}
              onClick={() => setSelectedDate({ date: item.dateStr, count: item.count })}
              title={`${formattedDate}: ${item.count} hoạt động`}
              className={`w-6 h-6 rounded-md transition-all duration-200 cursor-pointer flex items-center justify-center text-[10px] font-bold hover:scale-110 active:scale-95 ${bgColor} group relative`}
            >
              {item.count > 0 && <span>{item.count}</span>}
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-[10px] font-black rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-md">
                {formattedDate} • {item.count} hoạt động
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected day details card */}
      {selectedDate ? (
        <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-center justify-between gap-4 animate-fade-in">
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Chi tiết ngày {formatDateVN(selectedDate.date)}
            </h4>
            <p className="text-sm font-semibold text-foreground">
              {selectedDate.count > 0 
                ? `Bạn đã hoàn thành ${selectedDate.count} hoạt động học tập vào ngày này.`
                : 'Bạn không có hoạt động học tập nào được ghi nhận vào ngày này.'
              }
            </p>
          </div>
          <button 
            onClick={() => setSelectedDate(null)}
            className="text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer px-2.5 py-1 rounded-lg hover:bg-muted"
          >
            Đóng
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground italic text-center">
          Nhấp vào bất kỳ ô vuông nào để xem chi tiết hoạt động của ngày đó.
        </p>
      )}
    </div>
  );
}
