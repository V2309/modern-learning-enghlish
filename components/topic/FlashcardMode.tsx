'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { Vocabulary } from '@/data/mockData';
import { Flashcard } from './Flashcard';

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
  const [isFlipped, setIsFlipped] = React.useState(false);
  const [shuffledWords, setShuffledWords] = React.useState(() =>
    [...words]
  );

  // Sync when words list changes
  React.useEffect(() => {
    setShuffledWords([...words]);
  }, [words]);

  // Reset flip state when card changes
  React.useEffect(() => {
    setIsFlipped(false);
  }, [flashcardIndex]);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setFlashcardIndex((prev) => Math.max(0, prev - 1));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setFlashcardIndex((prev) => Math.min(shuffledWords.length - 1, prev + 1));
      } else if (e.key === '1' && onSetMasterStatus && shuffledWords[flashcardIndex]) {
        e.preventDefault();
        onSetMasterStatus(shuffledWords[flashcardIndex].id, false);
      } else if (e.key === '2' && onSetMasterStatus && shuffledWords[flashcardIndex]) {
        e.preventDefault();
        onSetMasterStatus(shuffledWords[flashcardIndex].id, true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shuffledWords, flashcardIndex, setFlashcardIndex, onSetMasterStatus]);

  if (shuffledWords.length === 0) {
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
            Thẻ {flashcardIndex + 1} / {shuffledWords.length}
          </p>

          <div className="w-40 h-1.5 bg-muted rounded-full mx-auto overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${((flashcardIndex + 1) / shuffledWords.length) * 100}%` }}
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
                if (flashcardIndex < shuffledWords.length - 1) {
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
              word={shuffledWords[flashcardIndex]}
              speak={speak}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped((prev) => !prev)}
            />
          </motion.div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setFlashcardIndex((prev) => Math.max(0, prev - 1))}
              disabled={flashcardIndex === 0}
              title="Thẻ trước (←)"
              className="p-2.5 rounded-full bg-muted border border-border text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => setIsFlipped((prev) => !prev)}
              title="Lật thẻ (Space)"
              className="px-4 py-2 rounded-full bg-primary/10 border border-primary/30 text-primary font-semibold text-xs hover:bg-primary hover:text-white transition-all shadow-sm cursor-pointer"
            >
              Lật thẻ (Space)
            </button>

            <button
              onClick={() => setFlashcardIndex((prev) => Math.min(shuffledWords.length - 1, prev + 1))}
              disabled={flashcardIndex === shuffledWords.length - 1}
              title="Thẻ tiếp theo (→)"
              className="p-2.5 rounded-full bg-muted border border-border text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {onSetMasterStatus && (
            <div className="flex items-center justify-center gap-3 mt-3">
              <button
                onClick={() => onSetMasterStatus(shuffledWords[flashcardIndex].id, false)}
                className="px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <X className="h-3.5 w-3.5 stroke-[3]" />
                Khó (1)
              </button>
              <button
                onClick={() => onSetMasterStatus(shuffledWords[flashcardIndex].id, true)}
                className="px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
                Đã biết (2)
              </button>
            </div>
          )}

          <p className="text-center text-[11px] text-muted-foreground mt-2.5 opacity-60 flex flex-wrap justify-center items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">←</kbd>
            <span>Trước</span>
            <span className="mx-1">•</span>
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">Space</kbd>
            <span>Lật</span>
            <span className="mx-1">•</span>
            <kbd className="px-1 py-0.5 rounded bg-muted border border-border font-mono text-[10px]">→</kbd>
            <span>Sau</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

