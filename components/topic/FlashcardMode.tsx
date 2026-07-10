'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Vocabulary } from '@/data/mockData';
import { Flashcard } from './Flashcard';

interface FlashcardModeProps {
  words: Vocabulary[];
  flashcardIndex: number;
  setFlashcardIndex: (idx: number | ((prev: number) => number)) => void;
  speak: (text: string) => void;
}

export const FlashcardMode = ({
  words,
  flashcardIndex,
  setFlashcardIndex,
  speak,
}: FlashcardModeProps) => {
  const [isFlipped, setIsFlipped] = React.useState(false);

  // Reset flip state when card changes
  React.useEffect(() => {
    setIsFlipped(false);
  }, [flashcardIndex]);

  // Keyboard navigation
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
        setFlashcardIndex((prev) => Math.min(words.length - 1, prev + 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [words.length, setFlashcardIndex]);

  if (words.length === 0) {
    return (
      <p className="text-center text-muted-foreground italic">
        Chưa có từ vựng nào để luyện flashcard.
      </p>
    );
  }

  return (
    <motion.div
      key="flashcard-study"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-foreground">Phát thẻ ghi nhớ (Flashcards)</h1>
        <p className="text-sm text-muted-foreground">
          Thẻ {flashcardIndex + 1} trên tổng số {words.length}
        </p>
        <div className="w-48 h-1.5 bg-muted rounded-full mx-auto mt-4 overflow-hidden">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((flashcardIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="relative">
        <Flashcard
          word={words[flashcardIndex]}
          speak={speak}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((prev) => !prev)}
        />

        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={() => setFlashcardIndex((prev) => Math.max(0, prev - 1))}
            disabled={flashcardIndex === 0}
            title="Thẻ trước (←)"
            className="p-3.5 rounded-xl bg-muted border border-border text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>

          <button
            onClick={() => setIsFlipped((prev) => !prev)}
            title="Lật thẻ (Space)"
            className="px-5 py-2.5 rounded-xl bg-primary/10 border border-primary/30 text-primary font-semibold text-sm hover:bg-primary hover:text-white transition-all shadow-sm"
          >
            Lật thẻ
          </button>

          <button
            onClick={() => setFlashcardIndex((prev) => Math.min(words.length - 1, prev + 1))}
            disabled={flashcardIndex === words.length - 1}
            title="Thẻ tiếp theo (→)"
            className="p-3.5 rounded-xl bg-muted border border-border text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Keyboard hints */}
        <p className="text-center text-xs text-muted-foreground mt-4 opacity-70">
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-xs">←</kbd>
          {' '}Thẻ trước &nbsp;·&nbsp;{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-xs">Space</kbd>
          {' '}Lật thẻ &nbsp;·&nbsp;{' '}
          <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono text-xs">→</kbd>
          {' '}Thẻ tiếp theo
        </p>
      </div>
    </motion.div>
  );
};
