'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, BookOpen, Pencil, Trash2, Check, ArrowRight } from 'lucide-react';

export interface VocabTopicCardProps {
  id?: string;
  index?: number;
  listNumber?: string;
  title: string;
  japaneseTitle?: string;
  description?: string;
  totalWords?: number;
  learnedWords?: number;
  isCompleted?: boolean;
  icon?: string;
  iconBg?: string;
  href?: string;
  isAdmin?: boolean;
  isMenuOpen?: boolean;
  onMenuToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleComplete?: (e: React.MouseEvent) => void;
  onContinue?: () => void;
}

const TOPIC_ICONS = ['📚', '🎯', '🚀', '💡', '🌍', '✈️', '💬', '🏆', '🎨', '💼', '🎧', '⭐'];
const ICON_BG_COLORS = [
  'bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
  'bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400',
  'bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
  'bg-sky-500/15 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400',
  'bg-purple-500/15 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400',
  'bg-teal-500/15 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400',
];

export const VocabTopicCard: React.FC<VocabTopicCardProps> = ({
  id,
  index = 0,
  listNumber,
  title,
  japaneseTitle,
  description,
  totalWords = 0,
  learnedWords,
  isCompleted = false,
  icon,
  iconBg,
  href = id ? `/vocabulary/topic/${id}` : '#',
  isAdmin = false,
  isMenuOpen = false,
  onMenuToggle,
  onEdit,
  onDelete,
  onToggleComplete,
  onContinue,
}) => {
  const displayListNumber =
    listNumber || `LIST ${String(index + 1).padStart(2, '0')}`;

  // Choose icon & palette deterministically if not provided
  const displayIcon = icon || TOPIC_ICONS[index % TOPIC_ICONS.length];
  const displayIconBg = iconBg || ICON_BG_COLORS[index % ICON_BG_COLORS.length];

  // Calculate progress
  const actualLearned = learnedWords !== undefined ? learnedWords : (isCompleted ? totalWords : 0);
  const percentage = totalWords > 0 ? Math.min(100, Math.round((actualLearned / totalWords) * 100)) : (isCompleted ? 100 : 0);

  // Subtitle / English subtext
  const subText = description || japaneseTitle || 'Chủ đề từ vựng tiếng Anh';

  return (
    <div className="relative group flex flex-col h-full rounded-3xl border border-border/80 bg-card text-card-foreground p-5 shadow-xs hover:shadow-lg hover:border-emerald-500/40 dark:hover:border-emerald-500/30 transition-all duration-300">

      {/* ── Top Header Row ────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {/* Topic Icon Container */}
          <div className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl ${displayIconBg} text-xl sm:text-2xl select-none shadow-xs`}>
            <span>{displayIcon}</span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-extrabold tracking-wider text-muted-foreground uppercase">
              {displayListNumber}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Complete checkmark pill button */}
          {onToggleComplete && (
            <button
              onClick={onToggleComplete}
              title={isCompleted ? 'Đã hoàn thành (Nhấp để bỏ đánh dấu)' : 'Đánh dấu đã hoàn thành'}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${isCompleted
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 shadow-2xs'
                  : 'bg-muted/60 text-muted-foreground border border-border hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40 hover:bg-emerald-500/10'
                }`}
            >
              <Check className={`h-3.5 w-3.5 ${isCompleted ? 'stroke-[3]' : 'stroke-[2]'}`} />
              <span>{isCompleted ? 'Đã xong' : 'Xong'}</span>
            </button>
          )}

          {/* Three-dots Menu (Admin actions) */}
          {isAdmin && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMenuToggle?.();
                }}
                className="flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                title="Tùy chọn chủ đề"
              >
                <MoreVertical className="h-4 w-4" />
              </button>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -4 }}
                    className="absolute right-0 top-9 w-40 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50 py-1"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onEdit?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-foreground hover:bg-muted transition cursor-pointer"
                    >
                      <Pencil className="h-3.5 w-3.5 text-sky-500" />
                      Sửa chủ đề
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        onDelete?.();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/10 transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xoá chủ đề
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* ── Topic Titles ──────────────────────────────────────────── */}
      <Link href={href} className="mt-4 flex-1 block group/link">
        <h3 className="text-base sm:text-lg font-extrabold text-foreground tracking-tight leading-snug group-hover/link:text-duo transition-colors line-clamp-2">
          {title}
        </h3>
        <p className="mt-1 text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1">
          {subText}
        </p>
      </Link>

      {/* ── Progress & Word Count ─────────────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-border/70 space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground/80" />
            {totalWords} words
          </span>
          <span className="text-muted-foreground">
            {actualLearned} learned <span className="text-border">•</span>{' '}
            <span className="text-duo font-extrabold">{percentage}%</span>
          </span>
        </div>

        {/* Thin horizontal progress bar */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted p-0.5">
          <div
            className="h-full rounded-full bg-duo transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* ── Duolingo 3D Tactile Primary Button ────── */}
      <Link
        href={href}
        onClick={onContinue}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-duo hover:brightness-105 text-duo-foreground py-3 px-4 font-bold text-xs sm:text-sm tracking-wide border-b-4 border-duo-dark active:border-b-0 active:translate-y-1 transition-all duration-150 cursor-pointer text-center"
      >
        <span>{percentage === 100 ? 'Review Topic' : 'Continue Learning'}</span>
        <ArrowRight className="h-4 w-4 stroke-[2.5]" />
      </Link>
    </div>
  );
};
