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
      className="relative w-full min-h-[385px] sm:min-h-[395px] h-auto cursor-pointer group select-none"
      onClick={onFlip}
    >
      {!isFlipped ? (
        /* ── Front: Word ── */
        <div
          key="front"
          className="w-full min-h-[385px] sm:min-h-[395px] p-6 sm:p-8 rounded-3xl bg-card border-2 border-border/80 shadow-[0_6px_0_0_theme(colors.border)] hover:border-duo/60 hover:shadow-[0_8px_0_0_theme(colors.border)] flex flex-col items-center justify-center space-y-3.5 text-foreground overflow-hidden transition-all"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-duo/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

          {word.partOfSpeech && (
            <span className="px-3.5 py-1 rounded-xl bg-duo/10 text-duo text-xs font-black uppercase tracking-wider border border-duo/25">
              {word.partOfSpeech}
            </span>
          )}

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-center text-foreground px-4">
            {word.word}
          </h1>

          {word.pronunciation && (
            <span className="font-mono text-sm text-muted-foreground bg-muted/80 px-3.5 py-1 rounded-xl border border-border/70 font-semibold">
              {word.pronunciation}
            </span>
          )}

          <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold pt-3">
            <Sparkles className="h-4 w-4 text-duo" />
            <span>Nhấp hoặc nhấn Space để lật thẻ</span>
          </div>
        </div>
      ) : (
        /* ── Back: Meaning + Pronunciation + Example + Image ── */
        <div
          key="back"
          className="w-full min-h-[385px] sm:min-h-[395px] p-5  rounded-3xl bg-card border-2 border-border/80 shadow-[0_6px_0_0_theme(colors.border)] hover:border-duo/60 hover:shadow-[0_8px_0_0_theme(colors.border)] flex flex-col justify-between text-foreground overflow-hidden transition-all"
        >
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-duo/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

          {/* Top Bar on Card Back */}
          <div className="flex items-center justify-between shrink-0 pb-2 border-b border-border/50">
            <span className="text-xs font-black uppercase tracking-wider text-duo bg-duo/10 px-3 py-1 rounded-xl border border-duo/25">
              {word.partOfSpeech || 'Từ vựng'}
            </span>
            <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-bold">
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Nhấp để lật lại</span>
            </div>
          </div>

          {/* ── Main Content: 2-Column (Image Left / Text Right) or Centered ── */}
          {word.imageUrl ? (
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start flex-1 pt-2 pb-1">
              {/* Left Column: Image */}
              <div className="sm:col-span-5 flex items-start justify-center">
                <div className="w-full max-w-[280px] md:max-w-[320px] aspect-[4/3] sm:aspect-square rounded-3xl overflow-hidden border-2 border-border/80 shadow-xs bg-muted/20">
                  <img
                    src={word.imageUrl}
                    alt={word.word}
                    className="w-full h-full  object-fill"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Right Column: Text Information (aligned to top with image) */}
              <div className="sm:col-span-7 flex flex-col justify-start space-y-2.5 min-w-0 text-left">
                <div>
                  <h2 className="text-2xl sm:text-[26px] font-black text-foreground tracking-tight leading-snug">
                    {word.meaning}
                  </h2>
                  {(word as any).definition && (
                    <p className="text-xs sm:text-sm text-muted-foreground italic mt-0.5 font-medium leading-relaxed">
                      {(word as any).definition}
                    </p>
                  )}
                </div>

                {/* Pronunciation Pill & Audio */}
                <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-xl bg-muted/70 border border-border shadow-2xs">
                  <Languages className="h-3.5 w-3.5 text-duo shrink-0" />
                  <span className="font-mono text-xs sm:text-sm font-bold tracking-wide text-foreground">
                    {word.pronunciation || '/.../'}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(word.word);
                    }}
                    className="p-1 rounded-lg bg-card border border-border text-duo hover:bg-duo hover:text-white transition-all active:scale-95 cursor-pointer shrink-0 ml-0.5 shadow-2xs"
                    title="Phát âm"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Example box - full display */}
                {(word.examples && word.examples.length > 0 ? word.examples : [word.example]).some(Boolean) && (
                  <div className="p-3 rounded-2xl bg-muted/40 border border-border/70 space-y-1">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                      Ví dụ ngữ cảnh
                    </span>
                    <p className="text-xs sm:text-sm italic font-medium leading-relaxed text-foreground/90">
                      &quot;{(word.examples && word.examples.length > 0 ? word.examples[0] : word.example)}&quot;
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Centered Layout when No Image */
            <div className="text-center space-y-3 py-3 my-auto flex flex-col items-center">
              <p className="text-3xl sm:text-3xl font-black text-foreground tracking-tight">
                {word.meaning}
              </p>

              {(word as any).definition && (
                <p className="text-xs sm:text-sm text-muted-foreground italic max-w-md mx-auto line-clamp-2">
                  {(word as any).definition}
                </p>
              )}

              {/* Pronunciation & Audio Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-muted/70 border border-border shadow-2xs">
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

              {/* Example Box */}
              {(word.examples && word.examples.length > 0 ? word.examples : [word.example]).some(Boolean) && (
                <div className="p-3.5 rounded-2xl bg-muted/40 border-2 border-border/70 text-center space-y-1 max-w-lg mx-auto w-full">
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider block">
                    Ví dụ ngữ cảnh
                  </span>
                  <p className="text-xs sm:text-sm italic font-medium leading-relaxed text-foreground/90 px-1 line-clamp-2">
                    &quot;{(word.examples && word.examples.length > 0 ? word.examples[0] : word.example)}&quot;
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
