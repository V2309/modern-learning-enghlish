'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Sparkles, ChevronRight } from 'lucide-react';
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
      whileHover={{ y: -5, transition: { duration: 0.18, ease: 'easeOut' } }}
      whileTap={{ y: 2, transition: { duration: 0.08 } }}
      onClick={() => openStreakModal(true)}
      className="group relative p-6 rounded-3xl card-3d-orange transition-all cursor-pointer flex flex-col justify-between space-y-4 select-none overflow-hidden"
    >
      {/* 3D Glass Specular Reflection Highlight */}
      <div className="absolute inset-x-4 top-1 h-1.5 bg-gradient-to-r from-transparent via-white/40 to-transparent rounded-full pointer-events-none" />

      {/* Ambient background glow on hover */}
      <div className="absolute -top-10 -right-10 w-36 h-36 bg-orange-500/15 rounded-full blur-2xl group-hover:bg-orange-500/30 transition-all pointer-events-none" />

      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider drop-shadow-xs">
            Chuỗi Học Tập
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase shadow-[0_2px_0_0_#c2410c] flex items-center gap-1">
            <Sparkles size={10} className="animate-spin" />
            +1 Hôm nay
          </span>
        </div>

        {/* 3D Tactile Puffy Flame Badge */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [-4, 4, -4],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-red-500 via-orange-500 to-amber-400 p-0.5 shadow-[0_4px_0_0_#9a3412,0_8px_16px_rgba(234,88,12,0.4)] flex items-center justify-center text-white ring-2 ring-white/30"
        >
          <Flame className="h-6 w-6 fill-white text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
        </motion.div>
      </div>

      <div className="relative z-10 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl sm:text-4xl font-black text-foreground tracking-tight drop-shadow-xs group-hover:text-orange-500 transition-colors">
            {data.streak}
          </span>
          <span className="text-sm font-black text-orange-600 dark:text-orange-400">
            ngày liên tục 🔥
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-medium pt-1">
          <span>Tổng cộng {data.totalActiveDays} ngày chăm chỉ</span>
          <span className="text-orange-500 font-bold opacity-0 group-hover:opacity-100 transition-all flex items-center gap-0.5">
            Xem hiệu ứng lửa <ChevronRight size={13} />
          </span>
        </div>
      </div>
    </motion.div>
  );
}
