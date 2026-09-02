'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';
import { Vocabulary } from '@/data/mockData';
import { Flashcard } from './Flashcard';
import { submitSrsReviewAction } from '@/actions/srs.action';
import { SrsRating } from '@/services/srs.service';

interface FlashcardModeProps {
  words: (Vocabulary & { mastered?: boolean })[];
  flashcardIndex: number;
  setFlashcardIndex: (idx: number | ((prev: number) => number)) => void;
  speak: (text: string) => void;
  onSetMasterStatus?: (wordId: string, wantMastered: boolean) => void;
}

export const FlashcardMode = ({
  words,
  flashcardIndex,
  setFlashcardIndex,
  speak,
  onSetMasterStatus,
}: FlashcardModeProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset flip state when card changes
  useEffect(() => {
    setIsFlipped(false);
  }, [flashcardIndex]);

  const currentWord = words[flashcardIndex];

  const handleSrsRate = async (rating: SrsRating) => {
    if (!currentWord || isSubmitting) return;

    const targetWord = currentWord;
    setIsSubmitting(true);

    const isGoodRecall = rating === 'good' || rating === 'easy';
    if (onSetMasterStatus && isGoodRecall) {
      onSetMasterStatus(targetWord.id, true);
    } else if (onSetMasterStatus && (rating === 'again' || rating === 'hard')) {
      onSetMasterStatus(targetWord.id, false);
    }

    // Advance to next card immediately
    if (flashcardIndex < words.length - 1) {
      setFlashcardIndex((prev) => prev + 1);
    }

    try {
      await submitSrsReviewAction(targetWord.id, rating);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setFlashcardIndex((prev) => Math.max(0, prev - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setFlashcardIndex((prev) => Math.min(words.length - 1, prev + 1));
      } else if (e.key === '1') {
        e.preventDefault();
        handleSrsRate('again');
      } else if (e.key === '2') {
        e.preventDefault();
        handleSrsRate('hard');
      } else if (e.key === '3') {
        e.preventDefault();
        handleSrsRate('good');
      } else if (e.key === '4') {
        e.preventDefault();
        handleSrsRate('easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [words, flashcardIndex]);

  if (words.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl bg-card max-w-md mx-auto space-y-3">
        <p className="text-base font-black text-foreground">Chưa có từ vựng nào</p>
        <p className="text-xs text-muted-foreground">
          Vui lòng thêm từ vựng vào chủ đề này để bắt đầu học Flashcard.
        </p>
      </div>
    );
  }

  const progressPercent = Math.round(((flashcardIndex + 1) / words.length) * 100);

  return (
    <div className="h-full flex flex-col justify-center py-2">  
      <motion.div
        key="flashcard-study"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-3xl mx-auto w-full space-y-4"
      >
        {/* ── Progress Counter & Bar ─────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 px-1">
          <span className="text-xs font-black text-muted-foreground uppercase tracking-wider">
            Thẻ {flashcardIndex + 1} / {words.length}
          </span>
          <div className="flex-1 max-w-[240px] h-2.5 bg-muted rounded-full overflow-hidden p-0.5 border border-border/60">
            <div
              className="h-full bg-duo rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs font-black text-duo">
            {progressPercent}%
          </span>
        </div>

        {/* ── Flashcard ────────────────────────────────────────── */}
        <div className="relative">
          <motion.div
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={(e, info) => {
              const swipeThreshold = 60;
              if (info.offset.x < -swipeThreshold) {
                if (flashcardIndex < words.length - 1) {
                  setFlashcardIndex((prev) => prev + 1);
                }
              } else if (info.offset.x > swipeThreshold) {
                if (flashcardIndex > 0) {
                  setFlashcardIndex((prev) => prev - 1);
                }
              }
            }}
            className="cursor-grab active:cursor-grabbing touch-pan-y"
          >
            <Flashcard
              word={currentWord}
              speak={speak}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped((prev) => !prev)}
            />
          </motion.div>

          {/* ── Navigation 3D Controls ─────────────────────────── */}
          <div className="flex items-center justify-center gap-3 mt-3.5">
            <button
              onClick={() => setFlashcardIndex((prev) => Math.max(0, prev - 1))}
              disabled={flashcardIndex === 0}
              title="Thẻ trước (Phím ←)"
              className="p-3 rounded-2xl bg-card border-2 border-border text-foreground shadow-[0_3px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </button>

            <button
              onClick={() => setIsFlipped((prev) => !prev)}
              title="Lật thẻ (Phím Space)"
              className="btn-3d-duo px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2"
            >
              <RotateCw className="h-4 w-4 stroke-[2.5]" />
              <span>Lật Thẻ (Space)</span>
            </button>

            <button
              onClick={() => setFlashcardIndex((prev) => Math.min(words.length - 1, prev + 1))}
              disabled={flashcardIndex === words.length - 1}
              title="Thẻ tiếp theo (Phím →)"
              className="p-3 rounded-2xl bg-card border-2 border-border text-foreground shadow-[0_3px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </div>

          {/* ── 4 SRS Rating 3D Buttons ─────────────────────────── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3.5 max-w-xl mx-auto">
            {/* Again (1) */}
            <button
              onClick={() => handleSrsRate('again')}
              disabled={isSubmitting}
              className="py-2.5 px-3 rounded-2xl bg-rose-500 hover:brightness-105 text-white font-black text-xs shadow-[0_3px_0_0_#9f1239] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
            >
              <span className="uppercase tracking-wider">Again (1)</span>
              <span className="text-[10px] text-white/80 font-bold mt-0.5">10 phút</span>
            </button>

            {/* Hard (2) */}
            <button
              onClick={() => handleSrsRate('hard')}
              disabled={isSubmitting}
              className="py-2.5 px-3 rounded-2xl bg-amber-500 hover:brightness-105 text-white font-black text-xs shadow-[0_3px_0_0_#b45309] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
            >
              <span className="uppercase tracking-wider">Hard (2)</span>
              <span className="text-[10px] text-white/80 font-bold mt-0.5">1 ngày</span>
            </button>

            {/* Good (3) */}
            <button
              onClick={() => handleSrsRate('good')}
              disabled={isSubmitting}
              className="py-2.5 px-3 rounded-2xl bg-sky-500 hover:brightness-105 text-white font-black text-xs shadow-[0_3px_0_0_#0369a1] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
            >
              <span className="uppercase tracking-wider">Good (3)</span>
              <span className="text-[10px] text-white/80 font-bold mt-0.5">3 ngày</span>
            </button>

            {/* Easy (4) */}
            <button
              onClick={() => handleSrsRate('easy')}
              disabled={isSubmitting}
              className="py-2.5 px-3 rounded-2xl bg-duo hover:brightness-105 text-duo-foreground font-black text-xs shadow-[0_3px_0_0_var(--duo-dark)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
            >
              <span className="uppercase tracking-wider">Easy (4)</span>
              <span className="text-[10px] text-white/80 font-bold mt-0.5">7 ngày</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
