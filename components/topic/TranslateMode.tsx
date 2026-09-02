'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ChevronRight, Trophy, RotateCcw, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranslateQuestion {
  word: string;
  hint: string;
  question: string;
  fullSentence: string;
}

interface TranslateModeProps {
  translateQuestions: TranslateQuestion[];
  translateIndex: number;
  translateInput: string;
  isTranslateChecked: boolean;
  isTranslateCorrect: boolean;
  translateScore: number;
  isTranslateFinished: boolean;
  onInputChange: (val: string) => void;
  onCheck: () => void;
  onNext: () => void;
  onRestart: () => void;
  onBackToList: () => void;
}

export const TranslateMode = ({
  translateQuestions,
  translateIndex,
  translateInput,
  isTranslateChecked,
  isTranslateCorrect,
  translateScore,
  isTranslateFinished,
  onInputChange,
  onCheck,
  onNext,
  onRestart,
  onBackToList,
}: TranslateModeProps) => {
  const currentQuestion = translateQuestions[translateIndex];
  const progressPercent = translateQuestions.length > 0
    ? Math.round(((translateIndex + 1) / translateQuestions.length) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col justify-center py-2">
      <motion.div
        key="translate-mode"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-xl mx-auto w-full bg-card border-2 border-border/80 p-6 sm:p-7 rounded-3xl shadow-[0_8px_0_0_theme(colors.border)] space-y-5"
      >
        {!isTranslateFinished ? (
          translateQuestions.length > 0 ? (
            <div className="space-y-4">
              {/* ── Progress Header ─────────────────────────────────────── */}
              <div className="flex justify-between items-center text-xs font-black tracking-wider uppercase">
                <span className="text-muted-foreground">
                  Câu hỏi {translateIndex + 1} / {translateQuestions.length}
                </span>
                <span className="text-duo bg-duo/10 px-2.5 py-0.5 rounded-full border border-duo/25">
                  Điểm: {translateScore}
                </span>
              </div>

              <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5 border border-border/60">
                <div
                  className="h-full bg-duo rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* ── Question Card ──────────────────────────────────────── */}
              <div className="p-6 bg-muted/40 border-2 border-border/70 rounded-3xl text-center space-y-2.5 shadow-2xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-duo bg-duo/10 px-3 py-0.5 rounded-full border border-duo/25 inline-block">
                  Cloze Gap-Fill
                </span>
                <h2 className="text-xs font-semibold italic text-muted-foreground">
                  Điền từ vựng đúng vào chỗ trống:
                </h2>
                <h3 className="text-xl sm:text-2xl font-black text-foreground leading-relaxed">
                  &quot;{currentQuestion.question}&quot;
                </h3>
                <div className="flex justify-center items-center gap-1.5 text-xs font-bold text-duo mt-2 bg-duo/10 p-2.5 rounded-2xl border border-duo/20 max-w-sm mx-auto">
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <span>Gợi ý: {currentQuestion.hint}</span>
                </div>
              </div>

              {/* ── Input Box ──────────────────────────────────────────── */}
              <div className="space-y-2">
                <label className="text-[11px] font-black text-muted-foreground uppercase tracking-wider block">
                  Nhập từ thích hợp:
                </label>
                <input
                  type="text"
                  disabled={isTranslateChecked}
                  value={translateInput}
                  onChange={(e) => onInputChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isTranslateChecked && translateInput.trim()) {
                      onCheck();
                    }
                  }}
                  className={cn(
                    'w-full bg-muted/40 border-2 rounded-2xl px-5 py-3.5 focus:outline-none focus:border-duo transition-all text-base font-bold placeholder:text-muted-foreground/60 shadow-2xs',
                    isTranslateChecked
                      ? isTranslateCorrect
                        ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
                        : 'border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-500/10'
                      : 'border-border/80 text-foreground'
                  )}
                  placeholder="Ví dụ: apple, study, quick..."
                  autoFocus
                />
              </div>

              {/* ── Feedback Message ───────────────────────────────────── */}
              {isTranslateChecked && (
                <div
                  className={cn(
                    'p-4 rounded-2xl text-center space-y-1 border-2 text-xs font-bold',
                    isTranslateCorrect
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/15 border-rose-500/40 text-rose-600 dark:text-rose-400'
                  )}
                >
                  <div className="text-sm font-black">{isTranslateCorrect ? '🎉 Cực kì chính xác!' : '❌ Chưa chính xác!'}</div>
                  {!isTranslateCorrect && (
                    <div className="text-xs text-foreground/80 font-semibold pt-1">
                      Đáp án đúng:{' '}
                      <span className="text-foreground font-black underline">
                        {currentQuestion.word}
                      </span>
                    </div>
                  )}
                  <div className="text-xs font-semibold pt-1 text-foreground leading-relaxed italic">
                    Câu hoàn chỉnh: &quot;{currentQuestion.fullSentence}&quot;
                  </div>
                </div>
              )}

              {/* ── Action 3D Button ───────────────────────────────────── */}
              <div className="pt-3 border-t border-border/70 flex justify-end">
                {!isTranslateChecked ? (
                  <button
                    onClick={onCheck}
                    disabled={!translateInput.trim()}
                    className="btn-3d-duo w-full sm:w-auto px-7 py-3 rounded-2xl text-xs sm:text-sm font-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kiểm tra kết quả
                  </button>
                ) : (
                  <button
                    onClick={onNext}
                    className="btn-3d-duo w-full sm:w-auto px-7 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {translateIndex + 1 < translateQuestions.length ? 'Từ kế tiếp' : 'Xem kết quả'}
                    </span>
                    <ChevronRight className="h-4 w-4 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center italic py-8 font-medium">
              Không tìm thấy câu hỏi dịch nghĩa.
            </p>
          )
        ) : (
          /* ── Result View ──────────────────────────────────────────── */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-duo/10 rounded-3xl flex items-center justify-center mx-auto text-duo border-2 border-duo/30 shadow-[0_4px_0_0_var(--duo-dark)]">
              <Trophy className="h-8 w-8 text-duo" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-foreground tracking-tight">Hoàn Thành Bài Điền Từ!</h2>
              <p className="text-xs text-muted-foreground font-semibold">Kết quả số từ bạn điền đúng:</p>
              <div className="text-4xl font-black text-duo pt-1">
                {translateScore} / {translateQuestions.length}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-3">
              <button
                onClick={onRestart}
                className="flex-1 py-3 px-4 rounded-2xl bg-card border-2 border-border text-foreground shadow-[0_3px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Điền lại</span>
              </button>
              <button
                onClick={onBackToList}
                className="btn-3d-duo flex-1 py-3 px-4 rounded-2xl text-xs font-black"
              >
                Quay lại bài học
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
