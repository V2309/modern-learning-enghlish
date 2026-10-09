'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, ArrowUpRight } from 'lucide-react';
import { useStreak } from './StreakContext';
import { LearningStreakData } from '@/services/dashboard.service';

interface DashboardStreakCardProps {
  initialStreakData: LearningStreakData;
}

export function DashboardStreakCard({ initialStreakData }: DashboardStreakCardProps) {
  const { streakData: contextStreak, openStreakModal } = useStreak();
  const data = contextStreak || initialStreakData;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.18, ease: 'easeOut' } }}
      whileTap={{ scale: 0.99, transition: { duration: 0.08 } }}
      onClick={() => openStreakModal(true)}
      className="group relative bg-white dark:bg-[#0f1115] hover:bg-[#fafafa] dark:hover:bg-[#14171b] p-6 sm:p-7 flex flex-col justify-between cursor-pointer transition-colors select-none overflow-hidden"
    >
      {/* Light Sweep Sheen */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

      {/* Technical Crosshairs */}
      <span className="absolute top-2.5 left-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>
      <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-muted-foreground/30 pointer-events-none z-10">+</span>

      {/* Card Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-[#6b7280] font-semibold">
              01 · Chuỗi học tập
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#f28500] animate-pulse" />
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#fff5eb] dark:bg-[#2a170b] border border-[#fbd38d]/40 dark:border-[#f28500]/30 text-[#f28500] text-[10px] font-mono font-bold uppercase tracking-wider">
            <Flame className="h-3 w-3 fill-current" />
            <span>Active</span>
          </div>
        </div>

        {/* Big Number & Flame */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-3xl sm:text-4xl font-bold font-mono text-[#111827] dark:text-white tracking-tight group-hover:text-[#f28500] transition-colors">
            {data.streak}
          </span>
          <span className="text-xs font-mono uppercase tracking-wider text-[#6b7280] dark:text-[#9ca3af] font-semibold">
            ngày liên tiếp
          </span>
        </div>

        <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
          Duy trì phong độ học tập mỗi ngày để củng cố phản xạ tự nhiên.
        </p>
      </div>

      {/* Footer / Sub-metrics */}
      <div className="mt-6 pt-4 border-t border-[#e5e7eb] dark:border-[#1f2937] flex items-center justify-between text-xs font-mono">
        <span className="text-[#6b7280] dark:text-[#9ca3af]">
          Tổng <strong className="text-[#111827] dark:text-white font-semibold">{data.totalActiveDays}</strong> ngày hoạt động
        </span>
        <span className="btn-3d-brand px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
          Chi tiết
          <ArrowUpRight size={11} />
        </span>
      </div>
    </motion.div>
  );
}
