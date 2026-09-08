'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useStreak } from './StreakContext';

interface StreakFlameBadgeProps {
  className?: string;
  showText?: boolean;
}

export function StreakFlameBadge({ className = '', showText = true }: StreakFlameBadgeProps) {
  const { streakData, openStreakModal } = useStreak();

  if (!streakData) {
    return null;
  }

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => openStreakModal(false)}
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-extrabold text-xs transition-all cursor-pointer shadow-xs ${className}`}
      title={`Chuỗi ${streakData.streak} ngày liên tục. Nhấp để xem chi tiết!`}
    >
      {/* Fiery animated icon */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          rotate: [-2, 3, -2],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative flex items-center justify-center"
      >
        <Flame className="h-4 w-4 fill-orange-500 text-orange-500 drop-shadow-[0_2px_8px_rgba(249,115,22,0.4)]" />
      </motion.div>

      <span className="tracking-tight text-sm font-black">{streakData.streak}</span>
      {showText && <span className="hidden sm:inline text-[11px] font-bold text-muted-foreground">ngày</span>}

      {/* Sparkle indicator if active today */}
      <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500"></span>
      </span>
    </motion.button>
  );
}
