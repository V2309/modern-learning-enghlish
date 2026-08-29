'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

    setIsSubmitting(true);

    const isGoodRecall = rating === 'good' || rating === 'easy';
    if (onSetMasterStatus && isGoodRecall) {
      onSetMasterStatus(currentWord.id, true);
    } else if (onSetMasterStatus && rating === 'again') {
      onSetMasterStatus(currentWord.id, false);
    }

    try {
      await submitSrsReviewAction(currentWord.id, rating);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }

    // Advance to next card in the fixed topic list
    if (flashcardIndex < words.length - 1) {
      setFlashcardIndex((prev) => prev + 1);
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
      <p className="text-center text-muted-foreground italic">
        Chưa có từ vựng nào để luyện flashcard.
      </p>
    );
  }

  return (
    <div className="h-full flex flex-col justify-center py-2">
      <motion.div
        key="flashcard-study"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-2xl mx-auto w-full space-y-3"
      >
        <div className="text-center space-y-1">
          <p className="text-xs font-semibold text-muted-foreground">
            Thẻ {flashcardIndex + 1} / {words.length}
          </p>

          <div className="w-40 h-1.5 bg-muted rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${((flashcardIndex + 1) / words.length) * 100}%` }}
            />
          </div>
        </div>

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

          {/* Navigation Controls */}
          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setFlashcardIndex((prev) => Math.max(0, prev - 1))}
              disabled={flashcardIndex === 0}
              title="Thẻ trước (←)"
              className="p-2.5 rounded-full bg-muted border border-border text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => setIsFlipped((prev) => !prev)}
              title="Lật thẻ (Space)"
              className="px-5 py-2 rounded-full bg-brand/10 border border-brand/30 text-brand font-bold text-xs hover:bg-brand hover:text-white transition-all shadow-xs cursor-pointer"
            >
              Lật thẻ (Space)
            </button>

            <button
              onClick={() => setFlashcardIndex((prev) => Math.min(words.length - 1, prev + 1))}
              disabled={flashcardIndex === words.length - 1}
              title="Thẻ tiếp theo (→)"
              className="p-2.5 rounded-full bg-muted border border-border text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 4 SRS Rating Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 max-w-xl mx-auto">
            <button
              onClick={() => handleSrsRate('again')}
              disabled={isSubmitting}
              className="p-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 text-rose-500 hover:text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex flex-col items-center justify-center disabled:opacity-50 group"
            >
              <span className="uppercase tracking-wider">Again (1)</span>
              <span className="text-[10px] text-muted-foreground group-hover:text-white/80 font-medium">10 phút</span>
            </button>

            <button
              onClick={() => handleSrsRate('hard')}
              disabled={isSubmitting}
              className="p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex flex-col items-center justify-center disabled:opacity-50 group"
            >
              <span className="uppercase tracking-wider">Hard (2)</span>
              <span className="text-[10px] text-muted-foreground group-hover:text-white/80 font-medium">1 ngày</span>
            </button>

            <button
              onClick={() => handleSrsRate('good')}
              disabled={isSubmitting}
              className="p-2.5 rounded-2xl bg-sky-500/10 hover:bg-sky-500 border border-sky-500/30 text-sky-600 dark:text-sky-400 hover:text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex flex-col items-center justify-center disabled:opacity-50 group"
            >
              <span className="uppercase tracking-wider">Good (3)</span>
              <span className="text-[10px] text-muted-foreground group-hover:text-white/80 font-medium">3 ngày</span>
            </button>

            <button
              onClick={() => handleSrsRate('easy')}
              disabled={isSubmitting}
              className="p-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:text-white font-bold text-xs transition-all shadow-xs cursor-pointer flex flex-col items-center justify-center disabled:opacity-50 group"
            >
              <span className="uppercase tracking-wider">Easy (4)</span>
              <span className="text-[10px] text-muted-foreground group-hover:text-white/80 font-medium">7 ngày</span>
            </button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground mt-3 opacity-60 flex flex-wrap justify-center items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">←</kbd>
            <span>Trước</span>
            <span className="mx-1">•</span>
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Space</kbd>
            <span>Lật</span>
            <span className="mx-1">•</span>
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">→</kbd>
            <span>Sau</span>
            <span className="mx-1">•</span>
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">1-4</kbd>
            <span>Đánh giá ghi nhớ</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
