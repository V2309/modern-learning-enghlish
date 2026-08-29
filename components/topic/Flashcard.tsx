'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Languages, RefreshCw, Sparkles, Quote } from 'lucide-react';
import { Vocabulary } from '@/data/mockData';

export const Flashcard = ({
  word,
  speak,
  isFlipped,
  onFlip,
}: {
  word: Vocabulary & { mastered?: boolean };
  speak: (t: string) => void;
  isFlipped: boolean;
  onFlip: () => void;
}) => {
  return (
    <div
      className="relative w-full h-[390px] cursor-pointer group select-none"
      onClick={onFlip}
    >
      <AnimatePresence mode="wait">
        {!isFlipped ? (
          /* ── Front: Word ── */
          <motion.div
            key="front"
            initial={{ opacity: 0, rotateY: 180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -180 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xl flex flex-col items-center justify-center space-y-4 text-foreground backface-hidden overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

            {word.partOfSpeech && (
              <span className="px-3 py-1 rounded-full bg-brand/10 text-brand text-xs font-bold uppercase tracking-wider border border-brand/20">
                {word.partOfSpeech}
              </span>
            )}

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-center text-foreground px-4">
              {word.word}
            </h1>

            {word.pronunciation && (
              <span className="font-mono text-sm sm:text-base text-muted-foreground">
                {word.pronunciation}
              </span>
            )}

            <div className="flex items-center gap-2 text-muted-foreground/70 text-xs font-medium pt-3">
              <Sparkles className="h-3.5 w-3.5 text-brand" />
              <span>Nhấn để lật xem nghĩa &amp; ví dụ</span>
            </div>
          </motion.div>
        ) : (
          /* ── Back: Meaning + Pronunciation + Example ── */
          <motion.div
            key="back"
            initial={{ opacity: 0, rotateY: -180 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 180 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 w-full h-full p-6 rounded-3xl bg-card border border-border shadow-xl flex flex-col justify-between text-foreground backface-hidden overflow-hidden"
          >
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

            {/* Top Bar on Card Back */}
            <div className="flex items-center justify-between shrink-0">
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand bg-brand/10 px-2.5 py-0.5 rounded-full border border-brand/20">
                {word.partOfSpeech || 'Từ vựng'}
              </span>
              <div className="flex items-center gap-1 text-muted-foreground/70 text-[11px] font-semibold">
                <RefreshCw className="h-3 w-3" />
                <span>Nhấn để lật lại</span>
              </div>
            </div>

            {/* Center: Meaning & Pronunciation */}
            <div className="text-center space-y-2 py-1 my-auto">
              <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                {word.meaning}
              </p>

              {(word as any).definition && (
                <p className="text-xs sm:text-sm text-muted-foreground italic max-w-md mx-auto line-clamp-2">
                  {(word as any).definition}
                </p>
              )}

              {/* Pronunciation & Audio Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-muted/60 border border-border">
                <Languages className="h-3.5 w-3.5 text-brand shrink-0" />
                <span className="font-mono text-xs sm:text-sm tracking-wide text-foreground">
                  {word.pronunciation || '/.../'}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speak(word.word);
                  }}
                  className="p-1 rounded-full bg-brand/10 hover:bg-brand text-brand hover:text-white transition-all active:scale-95 cursor-pointer shrink-0 ml-0.5"
                  title="Phát âm"
                >
                  <Volume2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Bottom: Example Box */}
            {(word.examples && word.examples.length > 0 ? word.examples : [word.example]).some(Boolean) && (
              <div className="p-3 rounded-2xl bg-muted/40 border border-border/80 text-center space-y-1 shrink-0">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
                  Ví dụ câu mẫu
                </span>
                <p className="text-xs sm:text-sm italic font-medium leading-snug text-foreground/90 px-2 line-clamp-3">
                  &quot;{(word.examples && word.examples.length > 0 ? word.examples[0] : word.example)}&quot;
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
