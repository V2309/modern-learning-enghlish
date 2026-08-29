'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronRight, Trophy, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Vocabulary } from '@/data/mockData';

interface DictationModeProps {
  dictationQuestions: Vocabulary[];
  dictationIndex: number;
  typedWord: string;
  isDictationChecked: boolean;
  isDictationCorrect: boolean;
  dictationScore: number;
  isDictationFinished: boolean;
  autoNextDelay: number;
  onTypedWordChange: (val: string) => void;
  onCheck: () => void;
  onNext: () => void;
  onRetry: () => void;
  onRestart: () => void;
  onBackToList: () => void;
  speak: (text: string) => void;
}

export const DictationMode = ({
  dictationQuestions,
  dictationIndex,
  typedWord,
  isDictationChecked,
  isDictationCorrect,
  dictationScore,
  isDictationFinished,
  autoNextDelay,
  onTypedWordChange,
  onCheck,
  onNext,
  onRetry,
  onRestart,
  onBackToList,
  speak,
}: DictationModeProps) => {
  const [showMeaning, setShowMeaning] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [countdownPct, setCountdownPct] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setShowMeaning(false);
    setShowAnswer(false);
    setCountdownPct(0);
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [dictationIndex, dictationQuestions]);

  useEffect(() => {
    if (isDictationChecked && isDictationCorrect) {
      setCountdownPct(100);
      const step = 100 / (autoNextDelay / 100);
      countdownRef.current = setInterval(() => {
        setCountdownPct((prev) => {
          const next = prev - step;
          if (next <= 0) {
            if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      setCountdownPct(0);
      if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    }
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [isDictationChecked, isDictationCorrect, autoNextDelay]);

  const handleRetry = () => {
    setShowAnswer(false);
    onRetry();
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  // ── Finished screen ───────────────────────────────────────────────────────
  if (isDictationFinished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-card border border-border p-7 rounded-3xl shadow-sm text-center space-y-5"
      >
        <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center mx-auto text-brand border border-brand/20">
          <Trophy className="h-7 w-7 animate-bounce" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Hoàn thành bài nghe!</h2>
          <p className="text-muted-foreground text-xs mt-1">Điểm số nghe chính tả:</p>
          <div className="text-3xl font-black text-brand mt-2">
            {dictationScore} / {dictationQuestions.length}
          </div>
        </div>
        <div className="flex gap-3 pt-2 max-w-xs mx-auto">
          <button onClick={onRestart} className="flex-1 py-2.5 border border-border hover:bg-muted text-foreground text-xs font-bold rounded-xl transition-all cursor-pointer">
            Học lại
          </button>
          <button onClick={onBackToList} className="flex-1 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl transition-all shadow-md shadow-black/10 cursor-pointer">
            Quay lại
          </button>
        </div>
      </motion.div>
    );
  }

  if (dictationQuestions.length === 0) {
    return <p className="text-muted-foreground text-center italic">Không tìm thấy từ vựng hợp lệ.</p>;
  }

  const currentWord = dictationQuestions[dictationIndex];

  // ── Practice screen ───────────────────────────────────────────────────────
  return (
    <motion.div
      key="dictation-mode"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="max-w-2xl mx-auto w-full"
    >
      <div className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden flex flex-col">

        {/* ── Progress bar ───────────────────────────────────────── */}
        <div className="px-5 pt-4 pb-0 space-y-1.5">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold tracking-widest uppercase">
            <span>{dictationIndex + 1} / {dictationQuestions.length}</span>
            <span className="text-brand font-bold">Điểm: {dictationScore}</span>
          </div>
          <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-brand transition-all duration-300"
              style={{ width: `${((dictationIndex + 1) / dictationQuestions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Sound area ─────────────────────────────────────────── */}
        <div className="px-5 py-4 flex items-center gap-4 bg-muted/30 mx-4 mt-3 rounded-2xl border border-border/60">
          {/* Small speaker button */}
          <button
            onClick={() => speak(currentWord.word)}
            className="h-12 w-12 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-md shadow-black/10 cursor-pointer shrink-0"
            title="Nghe phát âm"
          >
            <Volume2 className="h-5 w-5" />
          </button>

          {/* Toggles + hints */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setShowMeaning((v) => !v)}
                className="text-xs font-bold text-brand hover:underline cursor-pointer flex items-center gap-1"
              >
                {showMeaning ? <EyeOff size={12} /> : <Eye size={12} />}
                {showMeaning ? 'Ẩn nghĩa' : 'Hiện nghĩa'}
              </button>
              <span className="text-muted-foreground/40 text-xs">·</span>
              <button
                type="button"
                onClick={() => setShowAnswer((v) => !v)}
                className={cn(
                  'text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors',
                  showAnswer ? 'text-amber-600' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {showAnswer ? <EyeOff size={12} /> : <Eye size={12} />}
                {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
              </button>
            </div>

            <AnimatePresence>
              {showMeaning && (
                <motion.p
                  key="meaning"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden text-xs font-semibold text-foreground leading-tight"
                >
                  {currentWord.meaning}
                </motion.p>
              )}
              {showAnswer && (
                <motion.p
                  key="answer"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden text-xs font-bold text-amber-600 tracking-wide"
                >
                  📖 {currentWord.word}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Input ──────────────────────────────────────────────── */}
        <div className="px-5 pt-3 pb-1">
          <input
            ref={inputRef}
            type="text"
            disabled={isDictationChecked}
            value={typedWord}
            onChange={(e) => onTypedWordChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !isDictationChecked && typedWord.trim()) onCheck();
            }}
            className={cn(
              'w-full bg-muted/50 border rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm font-semibold placeholder:text-muted-foreground/50',
              isDictationChecked
                ? isDictationCorrect
                  ? 'border-emerald-500 text-emerald-600 bg-emerald-500/5'
                  : 'border-rose-500 text-rose-600 bg-rose-500/5'
                : 'border-border text-foreground'
            )}
            placeholder="Nhập từ bạn nghe được..."
            autoFocus
          />
        </div>

        {/* ── Feedback ───────────────────────────────────────────── */}
        <div className="px-5 min-h-[40px]">
          <AnimatePresence>
            {isDictationChecked && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'py-2 px-3 rounded-xl text-xs font-semibold flex flex-col gap-0.5',
                  isDictationCorrect
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                )}
              >
                <span>{isDictationCorrect ? '✅ Đúng rồi! Cực tốt.' : '❌ Chưa chính xác nhé!'}</span>
                {!isDictationCorrect && (
                  <span className="text-foreground/70 font-medium">
                    Đáp án: <strong className="text-foreground">{currentWord.word}</strong>
                    {' '}— {currentWord.meaning}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Controls ───────────────────────────────────────────── */}
        <div className="px-5 py-3.5 border-t border-border/60 flex justify-between items-center gap-3">
          <button
            onClick={() => speak(currentWord.word)}
            className="text-xs font-bold text-brand hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Volume2 size={13} /> Nghe lại
          </button>

          {!isDictationChecked ? (
            <button
              onClick={onCheck}
              disabled={!typedWord.trim()}
              className="px-5 py-2 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 disabled:opacity-40 transition-all cursor-pointer shadow-md shadow-black/10"
            >
              Kiểm tra
            </button>
          ) : isDictationCorrect ? (
            <div className="flex items-center gap-2">
              {/* Mini countdown ring */}
              <div className="relative h-6 w-6 shrink-0" title="Tự động tiếp theo...">
                <svg className="h-6 w-6 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="4" className="text-emerald-500/20" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="4"
                    strokeDasharray={`${countdownPct} ${100 - countdownPct}`}
                    strokeLinecap="round"
                    className="text-emerald-500"
                  />
                </svg>
              </div>
              <button
                onClick={onNext}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                {dictationIndex + 1 < dictationQuestions.length ? 'Tiếp theo' : 'Xem kết quả'}
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleRetry}
              className="px-5 py-2 border border-rose-400/40 bg-rose-500/8 hover:bg-rose-500/15 text-rose-600 font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={11} />
              Nhập lại
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
