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
  autoNextDelay: number; // ms
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
  // Countdown for auto-next: 0–100 (percentage remaining)
  const [countdownPct, setCountdownPct] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset per-question state when question changes
  useEffect(() => {
    setShowMeaning(false);
    setShowAnswer(false);
    setCountdownPct(0);
    if (countdownRef.current) { clearInterval(countdownRef.current); countdownRef.current = null; }
    // Focus input on new question
    setTimeout(() => inputRef.current?.focus(), 80);
  }, [dictationIndex, dictationQuestions]);

  // Start countdown when correct answer submitted
  useEffect(() => {
    if (isDictationChecked && isDictationCorrect) {
      setCountdownPct(100);
      const step = 100 / (autoNextDelay / 100); // decrement per 100ms tick
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

  // Focus input when retry
  const handleRetry = () => {
    setShowAnswer(false);
    onRetry();
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  if (isDictationFinished) {
    return (
      <motion.div
        key="dictation-mode"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-md mx-auto bg-card border border-border p-8 rounded-3xl shadow-sm"
      >
        <div className="text-center py-6 space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Trophy className="h-8 w-8 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground">Đã đạt chứng nhận kiểm tra!</h2>
            <p className="text-muted-foreground text-sm">Điểm số nghe chính tả của bạn:</p>
            <div className="text-5xl font-extrabold text-primary pt-2">
              {dictationScore} / {dictationQuestions.length}
            </div>
          </div>
          <div className="pt-4 flex gap-4">
            <button
              onClick={onRestart}
              className="flex-1 py-3 border border-border hover:bg-muted text-foreground text-xs font-bold rounded-4xl"
            >
              Học lại dictation
            </button>
            <button
              onClick={onBackToList}
              className="flex-1 py-3 bg-primary text-white hover:bg-primary/95 text-xs font-bold rounded-4xl"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (dictationQuestions.length === 0) {
    return (
      <p className="text-muted-foreground text-center italic">Không tìm thấy từ vựng hợp lệ.</p>
    );
  }

  const currentWord = dictationQuestions[dictationIndex];

  return (
    <motion.div
      key="dictation-mode"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto bg-card border border-border p-8 rounded-3xl shadow-sm space-y-6"
    >
      {/* Progress header */}
      <div className="flex justify-between items-center text-xs text-muted-foreground font-bold tracking-wider uppercase">
        <span>Từ vựng {dictationIndex + 1} / {dictationQuestions.length}</span>
        <span>Điểm: {dictationScore}</span>
      </div>
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${((dictationIndex + 1) / dictationQuestions.length) * 100}%` }}
        />
      </div>

      {/* Sound + toggles */}
      <div className="p-8 bg-muted/40 border border-border rounded-3xl flex flex-col items-center justify-center gap-4">
        <button
          onClick={() => speak(currentWord.word)}
          className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-primary/30 cursor-pointer"
        >
          <Volume2 className="h-10 w-10" />
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowMeaning((prev) => !prev)}
            className="text-xs font-bold text-primary hover:underline cursor-pointer flex items-center gap-1"
          >
            {showMeaning ? <EyeOff size={12} /> : <Eye size={12} />}
            {showMeaning ? 'Ẩn nghĩa' : 'Hiện nghĩa'}
          </button>

          {/* Hiện đáp án — always visible */}
          <span className="text-muted-foreground/40">·</span>
          <button
            type="button"
            onClick={() => setShowAnswer((prev) => !prev)}
            className={cn(
              'text-xs font-bold cursor-pointer flex items-center gap-1 transition-colors',
              showAnswer ? 'text-amber-600 hover:text-amber-700' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {showAnswer ? <EyeOff size={12} /> : <Eye size={12} />}
            {showAnswer ? 'Ẩn đáp án' : 'Hiện đáp án'}
          </button>
        </div>

        <AnimatePresence>
          {showMeaning && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden w-full"
            >
              <div className="text-center text-sm font-semibold text-foreground bg-background/80 border border-border rounded-3xl px-4 py-3">
                {currentWord.meaning}
              </div>
            </motion.div>
          )}
          {showAnswer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden w-full"
            >
              <div className="text-center text-sm font-bold text-amber-700 bg-amber-500/10 border border-amber-500/20 rounded-3xl px-4 py-3 tracking-wide">
                📖 {currentWord.word}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
          Đang nghe phát âm (Bản xứ)
        </span>
      </div>

      {/* Input */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
          Nhập từ tiếng Anh bạn nghe được
        </label>
        <input
          ref={inputRef}
          type="text"
          disabled={isDictationChecked}
          value={typedWord}
          onChange={(e) => onTypedWordChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isDictationChecked && typedWord.trim()) {
              onCheck();
            }
          }}
          className={cn(
            'w-full bg-muted border rounded-4xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base font-semibold',
            isDictationChecked
              ? isDictationCorrect
                ? 'border-green-500 text-green-700 bg-green-500/5 focus:ring-transparent'
                : 'border-red-500 text-red-700 bg-red-500/5 focus:ring-transparent'
              : 'border-border text-foreground'
          )}
          placeholder="Nhập từ..."
          autoFocus
        />
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {isDictationChecked && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className={cn(
              'p-4 rounded-3xl text-center space-y-1 border text-sm font-semibold',
              isDictationCorrect
                ? 'bg-green-500/10 border-green-500/20 text-green-700'
                : 'bg-red-500/10 border-red-500/20 text-red-700'
            )}
          >
            <div>{isDictationCorrect ? '✅ Đúng rồi! Cực tốt.' : '❌ Chưa chính xác nhé!'}</div>
            {!isDictationCorrect && (
              <div className="text-xs text-muted-foreground font-medium pt-1">
                Đáp án chính xác:{' '}
                <span className="text-foreground font-bold">{currentWord.word}</span>
              </div>
            )}
            <div className="text-xs text-muted-foreground pt-1 italic font-medium">
              Nghĩa là: {currentWord.meaning}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="pt-4 border-t border-border flex justify-between items-center gap-3">
        <button
          onClick={() => speak(currentWord.word)}
          className="text-xs font-bold text-primary hover:underline flex items-center gap-1 shrink-0"
        >
          <Volume2 size={12} /> Nghe lại
        </button>

        {!isDictationChecked ? (
          /* CHECK button */
          <button
            onClick={onCheck}
            disabled={!typedWord.trim()}
            className="px-6 py-3 bg-primary text-white font-bold rounded-4xl text-xs hover:bg-primary/95 disabled:opacity-50 transition-all"
          >
            Kiểm tra kết quả
          </button>
        ) : isDictationCorrect ? (
          /* CORRECT → countdown + manual skip */
          <div className="flex items-center gap-3">
            {/* Countdown ring */}
            <div className="relative h-8 w-8 shrink-0" title={`Tự động sang câu tiếp theo sau ${autoNextDelay / 1000}s`}>
              <svg className="h-8 w-8 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="3" className="text-green-500/20" />
                <circle
                  cx="18" cy="18" r="15.9"
                  fill="none" stroke="currentColor" strokeWidth="3"
                  strokeDasharray={`${countdownPct} ${100 - countdownPct}`}
                  strokeLinecap="round"
                  className="text-green-500 transition-none"
                />
              </svg>
            </div>
            <button
              onClick={onNext}
              className="px-5 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-4xl text-xs transition-all flex items-center gap-1.5"
            >
              {dictationIndex + 1 < dictationQuestions.length ? 'Tiếp theo' : 'Xem điểm số'}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          /* WRONG → Thử lại */
          <button
            onClick={handleRetry}
            className="px-5 py-3 border border-red-400/40 bg-red-500/8 hover:bg-red-500/15 text-red-600 font-bold rounded-4xl text-xs transition-all flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            Nhập lại
          </button>
        )}
      </div>
    </motion.div>
  );
};
