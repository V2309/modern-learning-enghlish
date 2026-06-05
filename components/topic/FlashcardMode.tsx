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
        <Flashcard word={words[flashcardIndex]} speak={speak} />

        <div className="flex items-center justify-center gap-6 mt-8">
          <button
            onClick={() => setFlashcardIndex((prev) => Math.max(0, prev - 1))}
            disabled={flashcardIndex === 0}
            className="p-3.5 rounded-xl bg-muted border border-border text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setFlashcardIndex((prev) => Math.min(words.length - 1, prev + 1))}
            disabled={flashcardIndex === words.length - 1}
            className="p-3.5 rounded-xl bg-muted border border-border text-foreground hover:bg-accent disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};
