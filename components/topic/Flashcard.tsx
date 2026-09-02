'use client';

import React from 'react';
import { Volume2, Languages, RefreshCw, Sparkles } from 'lucide-react';
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
      className="relative w-full h-[400px] cursor-pointer group select-none"
      onClick={onFlip}
    >
      {!isFlipped ? (
        /* ── Front: Word ── */
        <div
          key="front"
          className="w-full h-full p-6 sm:p-8 rounded-3xl bg-card border-2 border-border/80 shadow-[0_8px_0_0_theme(colors.border)] hover:border-duo/60 hover:shadow-[0_10px_0_0_theme(colors.border)] flex flex-col items-center justify-center space-y-4 text-foreground overflow-hidden transition-all"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-duo/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          {word.partOfSpeech && (
            <span className="px-3.5 py-1 rounded-xl bg-duo/10 text-duo text-xs font-black uppercase tracking-wider border border-duo/25">
              {word.partOfSpeech}
            </span>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-center text-foreground px-4">
            {word.word}
          </h1>

          {word.pronunciation && (
            <span className="font-mono text-sm sm:text-base text-muted-foreground bg-muted/80 px-3.5 py-1 rounded-xl border border-border/70 font-semibold">
              {word.pronunciation}
            </span>
          )}

          <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold pt-4">
            <Sparkles className="h-4 w-4 text-duo" />
            <span>Nhấp hoặc nhấn Space để lật thẻ</span>
          </div>
        </div>
      ) : (
        /* ── Back: Meaning + Pronunciation + Example ── */
        <div
          key="back"
          className="w-full h-full p-6 sm:p-7 rounded-3xl bg-card border-2 border-border/80 shadow-[0_8px_0_0_theme(colors.border)] hover:border-duo/60 hover:shadow-[0_10px_0_0_theme(colors.border)] flex flex-col justify-between text-foreground overflow-hidden transition-all"
        >
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-duo/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

          {/* Top Bar on Card Back */}
          <div className="flex items-center justify-between shrink-0">
            <span className="text-xs font-black uppercase tracking-widest text-duo bg-duo/10 px-3 py-1 rounded-xl border border-duo/25">
              {word.partOfSpeech || 'Từ vựng'}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Nhấp để lật lại</span>
            </div>
          </div>

          {/* Center: Meaning & Pronunciation */}
          <div className="text-center space-y-2.5 py-1 my-auto">
            <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              {word.meaning}
            </p>

            {(word as any).definition && (
              <p className="text-xs sm:text-sm text-muted-foreground italic max-w-md mx-auto line-clamp-2">
                {(word as any).definition}
              </p>
            )}

            {/* Pronunciation & Audio Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-muted/70 border border-border shadow-2xs">
              <Languages className="h-4 w-4 text-duo shrink-0" />
              <span className="font-mono text-xs sm:text-sm font-bold tracking-wide text-foreground">
                {word.pronunciation || '/.../'}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  speak(word.word);
                }}
                className="p-1 rounded-xl bg-card border border-border text-duo hover:bg-duo hover:text-white transition-all active:scale-95 cursor-pointer shrink-0 ml-1 shadow-2xs"
                title="Phát âm"
              >
                <Volume2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Bottom: Example Box */}
          {(word.examples && word.examples.length > 0 ? word.examples : [word.example]).some(Boolean) && (
            <div className="p-3.5 rounded-2xl bg-muted/40 border-2 border-border/70 text-center space-y-1 shrink-0">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                Ví dụ ngữ cảnh
              </span>
              <p className="text-xs sm:text-sm italic font-semibold leading-relaxed text-foreground/90 px-2 line-clamp-3">
                &quot;{(word.examples && word.examples.length > 0 ? word.examples[0] : word.example)}&quot;
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
