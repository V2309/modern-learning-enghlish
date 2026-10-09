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
  // Calculate progress
  const actualLearned = learnedWords !== undefined ? learnedWords : (isCompleted ? totalWords : 0);
  const percentage = totalWords > 0 ? Math.min(100, Math.round((actualLearned / totalWords) * 100)) : (isCompleted ? 100 : 0);

  // Subtitle / English subtext
  const subText = description || japaneseTitle || 'Chủ đề từ vựng tiếng Anh giao tiếp và học thuật.';

  return (
    <div
      className={`relative group flex flex-col justify-between h-full bg-white dark:bg-[#0f1115] p-5 sm:p-6 hover:bg-[#fafafa] dark:hover:bg-[#14171b] transition-colors duration-200 ${
        isMenuOpen ? 'z-30 overflow-visible' : 'z-0 overflow-hidden'
      }`}
    >
      {/* Light Sweep Sheen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none" />
      </div>

      {/* Technical Crosshairs */}
      <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
      <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>

      <div>
        {/* ── Top Header Row ────────────────────────────────────────── */}
        <div className={`flex items-center justify-between gap-2 relative ${isMenuOpen ? 'z-40' : 'z-20'}`}>
          {/* Topic Number Tag */}
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? 'bg-emerald-500' : 'bg-[#f28500]'}`} />
            {listNumber || `${String(index + 1).padStart(2, '0')} · CHỦ ĐỀ`}
          </span>

          <div className="flex items-center gap-1.5">
            {/* Complete status toggle */}
            {onToggleComplete && (
              <button
                onClick={onToggleComplete}
                title={isCompleted ? 'Đã hoàn thành (Nhấp để bỏ đánh dấu)' : 'Đánh dấu đã hoàn thành'}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                  isCompleted
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20 shadow-2xs'
                    : 'bg-[#f3f4f6] dark:bg-[#1a1d21] text-muted-foreground border border-[#e5e7eb] dark:border-[#1f2937] hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500/40'
                }`}
              >
                <Check className={`h-3 w-3 ${isCompleted ? 'stroke-[3]' : 'stroke-[2]'}`} />
                <span>{isCompleted ? 'Đã xong' : 'Xong'}</span>
              </button>
            )}

            {/* Admin three-dots menu */}
            {isAdmin && (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onMenuToggle?.();
                  }}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-[#f3f4f6] dark:hover:bg-[#1f2937] hover:text-foreground transition cursor-pointer"
                  title="Tùy chọn chủ đề"
                >
                  <MoreVertical className="h-3.5 w-3.5" />
                </button>

                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      className="absolute right-0 top-8 w-40 bg-white dark:bg-[#14171b] border border-[#e5e7eb] dark:border-[#2a3038] rounded-xl shadow-2xl z-50 py-1.5 ring-1 ring-black/5 dark:ring-white/10"
                      style={{ isolation: 'isolate' }}
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onEdit?.();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-[#f3f4f6] dark:hover:bg-[#1f2937] transition cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5 text-sky-500" />
                        Sửa chủ đề
                      </button>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          onDelete?.();
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition cursor-pointer"
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

        {/* ── Topic Title & Subtext ─────────────────────────────────── */}
        <Link href={href} className="mt-4 block group/link relative z-0">
          <h3 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight leading-snug group-hover/link:text-[#f28500] dark:group-hover:text-[#f28500] transition-colors line-clamp-2">
            {title}
          </h3>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground font-normal line-clamp-2 leading-relaxed">
            {subText}
          </p>
        </Link>
      </div>

      <div className="relative z-10">
        {/* ── Progress & Word Count ─────────────────────────────────── */}
        <div className="mt-5 pt-3.5 border-t border-[#e5e7eb] dark:border-[#1f2937] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
              <BookOpen className="h-3.5 w-3.5 text-muted-foreground/70" />
              <span>{totalWords} từ</span>
            </span>
            <span className="text-muted-foreground font-medium">
              {actualLearned}/{totalWords} ·{' '}
              <span className={`font-bold ${isCompleted ? 'text-emerald-500' : 'text-[#f28500]'}`}>
                {percentage}%
              </span>
            </span>
          </div>

          {/* Slim hairline progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#f3f4f6] dark:bg-[#1a1d21]">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isCompleted ? 'bg-emerald-500' : 'bg-[#f28500]'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* ── Tactile 3D Action Button ──────────────────────────────── */}
        <Link
          href={href}
          onClick={onContinue}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 px-4 font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-150 cursor-pointer text-center shadow-xs ${
            isCompleted ? 'btn-3d-brand' : 'btn-3d-duo'
          }`}
        >
          <span>{percentage === 100 ? 'Ôn Tập Lại' : 'Học Chủ Đề'}</span>
          <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
        </Link>
      </div>
    </div>
  );
};
