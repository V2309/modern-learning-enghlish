'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronRight, Trophy, Eye, EyeOff, RefreshCw, RotateCcw, Sparkles } from 'lucide-react';
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
        className="max-w-xl mx-auto bg-card border-2 border-border/80 p-8 rounded-3xl shadow-[0_8px_0_0_theme(colors.border)] text-center space-y-5"
      >
        <div className="w-16 h-16 bg-duo/10 rounded-3xl flex items-center justify-center mx-auto text-duo border-2 border-duo/30 shadow-[0_4px_0_0_var(--duo-dark)]">
          <Trophy className="h-8 w-8 text-duo" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-foreground tracking-tight">Hoàn Thành Bài Nghe!</h2>
          <p className="text-xs text-muted-foreground font-semibold">Điểm số nghe chính tả của bạn:</p>
          <div className="text-4xl font-black text-duo pt-1">
            {dictationScore} / {dictationQuestions.length}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-3 max-w-sm mx-auto">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-2xl bg-card border-2 border-border text-foreground shadow-[0_3px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Luyện tập lại</span>
          </button>
          <button
            onClick={onBackToList}
            className="btn-3d-duo flex-1 py-3 px-4 rounded-2xl text-xs font-black"
          >
            Quay lại bài học
          </button>
        </div>
      </motion.div>
    );
  }

  if (dictationQuestions.length === 0) {
    return (
      <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl bg-card max-w-md mx-auto space-y-3">
        <p className="text-base font-black text-foreground">Không tìm thấy từ vựng</p>
        <p className="text-xs text-muted-foreground">Vui lòng thêm từ vựng để bắt đầu bài nghe chính tả.</p>
      </div>
    );
  }

  const currentWord = dictationQuestions[dictationIndex];
  const progressPercent = Math.round(((dictationIndex + 1) / dictationQuestions.length) * 100);

  // ── Practice screen ───────────────────────────────────────────────────────
  return (
    <motion.div
      key="dictation-mode"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="max-w-2xl mx-auto w-full"
    >
      <div className="bg-card border-2 border-border/80 rounded-3xl shadow-[0_8px_0_0_theme(colors.border)] overflow-hidden flex flex-col p-6 sm:p-7 space-y-5">

        {/* ── Progress bar ───────────────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-black tracking-wider uppercase">
            <span className="text-muted-foreground">
              Câu {dictationIndex + 1} / {dictationQuestions.length}
            </span>
            <span className="text-duo bg-duo/10 px-2.5 py-0.5 rounded-full border border-duo/25">
              Điểm: {dictationScore}
            </span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5 border border-border/60">
            <div
              className="h-full bg-duo rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* ── Sound & Audio Area ─────────────────────────────────── */}
        <div className="p-5 flex flex-col sm:flex-row items-center gap-5 bg-muted/40 rounded-2xl border-2 border-border/70 shadow-2xs">
          {/* Big 3D Duolingo speaker button */}
          <button
            onClick={() => speak(currentWord.word)}
            className="h-16 w-16 rounded-3xl bg-duo hover:brightness-105 text-duo-foreground flex items-center justify-center shadow-[0_4px_0_0_var(--duo-dark)] active:translate-y-1 active:shadow-none transition-all cursor-pointer shrink-0"
            title="Nghe phát âm chuẩn"
          >
            <Volume2 className="h-7 w-7" />
          </button>

          {/* Toggles + hints */}
          <div className="flex flex-col gap-2 flex-1 min-w-0 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setShowMeaning((v) => !v)}
                className="px-3 py-1 rounded-xl bg-card border-2 border-border shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none text-xs font-bold text-foreground hover:bg-muted cursor-pointer flex items-center gap-1.5 transition-all"
              >
                {showMeaning ? <EyeOff size={13} className="text-duo" /> : <Eye size={13} className="text-duo" />}
                <span>{showMeaning ? 'Ẩn nghĩa' : 'Hiện nghĩa'}</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAnswer((v) => !v)}
                className={cn(
                  'px-3 py-1 rounded-xl border-2 shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all',
                  showAnswer
                    ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400'
                    : 'bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {showAnswer ? <EyeOff size={13} /> : <Eye size={13} />}
                <span>{showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}</span>
              </button>
            </div>

            <AnimatePresence>
              {showMeaning && (
                <motion.p
                  key="meaning"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden text-xs font-bold text-foreground leading-tight bg-card border border-border/80 px-3 py-1.5 rounded-xl mt-1"
                >
                  💡 {currentWord.meaning}
                </motion.p>
              )}
              {showAnswer && (
                <motion.p
                  key="answer"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden text-xs font-black text-amber-600 dark:text-amber-400 tracking-wide bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl mt-1"
                >
                  📖 Đáp án: {currentWord.word}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Input Box ──────────────────────────────────────────── */}
        <div className="space-y-2">
          <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block">
            Nhập từ vựng nghe được:
          </label>
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
              'w-full bg-muted/40 border-2 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-duo transition-all text-base font-bold placeholder:text-muted-foreground/60 shadow-2xs',
              isDictationChecked
                ? isDictationCorrect
                  ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                  : 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/10'
                : 'border-border/80 text-foreground'
            )}
            placeholder="Gõ từ bạn nghe được và nhấn Enter..."
            autoFocus
          />
        </div>

        {/* ── Feedback Message ───────────────────────────────────── */}
        <div className="min-h-[44px]">
          <AnimatePresence>
            {isDictationChecked && (
              <motion.div
                key="feedback"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={cn(
                  'p-3.5 rounded-2xl text-xs font-bold flex flex-col gap-1 border-2',
                  isDictationCorrect
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                )}
              >
                <span className="text-sm font-black">
                  {isDictationCorrect ? '🎉 Chính xác! Bạn nghe rất tốt.' : '❌ Chưa chính xác!'}
                </span>
                {!isDictationCorrect && (
                  <span className="text-foreground/80 font-medium">
                    Đáp án đúng là: <strong className="text-foreground font-black underline">{currentWord.word}</strong>
                    {' '}— {currentWord.meaning}
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Action 3D Controls ─────────────────────────────────── */}
        <div className="pt-3 border-t border-border/70 flex justify-between items-center gap-3">
          <button
            onClick={() => speak(currentWord.word)}
            className="px-3.5 py-2 rounded-2xl bg-card border-2 border-border shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted text-xs font-bold text-foreground flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Volume2 size={14} className="text-duo" />
            <span>Nghe lại</span>
          </button>

          {!isDictationChecked ? (
            <button
              onClick={onCheck}
              disabled={!typedWord.trim()}
              className="btn-3d-duo px-7 py-3 rounded-2xl text-xs sm:text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kiểm tra
            </button>
          ) : isDictationCorrect ? (
            <div className="flex items-center gap-2.5">
              {/* Mini countdown ring */}
              <div className="relative h-7 w-7 shrink-0" title="Tự động chuyển câu tiếp theo...">
                <svg className="h-7 w-7 -rotate-90" viewBox="0 0 36 36">
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
                className="btn-3d-duo px-6 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-1.5"
              >
                <span>{dictationIndex + 1 < dictationQuestions.length ? 'Tiếp theo' : 'Xem kết quả'}</span>
                <ChevronRight className="h-4 w-4 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleRetry}
              className="p-3 px-6 rounded-2xl bg-rose-500 hover:brightness-105 text-white font-black text-xs shadow-[0_3px_0_0_#9f1239] active:translate-y-0.5 active:shadow-none transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw size={12} className="stroke-[3]" />
              <span>Nhập lại</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
