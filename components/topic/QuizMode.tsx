'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, XCircle, Trophy, Sparkles, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizQuestion {
  word: string;
  correct: string;
  options: string[];
  partOfSpeech: string;
}

interface QuizModeProps {
  quizQuestions: QuizQuestion[];
  currentQuizIndex: number;
  selectedQuizAnswer: string | null;
  isQuizAnswered: boolean;
  quizScore: number;
  isQuizFinished: boolean;
  onSelectAnswer: (answer: string) => void;
  onCheckAnswer: () => void;
  onNext: () => void;
  onRestart: () => void;
  onBackToList: () => void;
}

export const QuizMode = ({
  quizQuestions,
  currentQuizIndex,
  selectedQuizAnswer,
  isQuizAnswered,
  quizScore,
  isQuizFinished,
  onSelectAnswer,
  onCheckAnswer,
  onNext,
  onRestart,
  onBackToList,
}: QuizModeProps) => {
  const currentQuestion = quizQuestions[currentQuizIndex];
  const progressPercent = quizQuestions.length > 0
    ? Math.round(((currentQuizIndex + 1) / quizQuestions.length) * 100)
    : 0;

  return (
    <div className="h-full flex flex-col justify-center py-2">
      <motion.div
        key="quiz-mode"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-xl mx-auto w-full bg-card border-2 border-border/80 rounded-3xl p-6 sm:p-7 shadow-[0_8px_0_0_theme(colors.border)] space-y-5"
      >
        {!isQuizFinished ? (
          quizQuestions.length > 0 ? (
            <div className="space-y-4">
              {/* ── Progress Header & Score ─────────────────────────────── */}
              <div className="flex justify-between items-center text-xs font-black uppercase tracking-wider">
                <span className="text-muted-foreground">
                  Câu hỏi {currentQuizIndex + 1} / {quizQuestions.length}
                </span>
                <span className="text-duo bg-duo/10 px-2.5 py-0.5 rounded-full border border-duo/25">
                  Điểm số: {quizScore}
                </span>
              </div>

              <div className="w-full h-3 bg-muted rounded-full overflow-hidden p-0.5 border border-border/60">
                <div
                  className="h-full bg-duo rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              {/* ── Question Card ──────────────────────────────────────── */}
              <div className="p-5 rounded-2xl bg-muted/40 border-2 border-border/70 text-center space-y-1.5 shadow-2xs">
                {currentQuestion.partOfSpeech && (
                  <span className="text-[10px] font-black uppercase tracking-wide text-duo bg-duo/10 px-3 py-0.5 rounded-full border border-duo/25 inline-block">
                    {currentQuestion.partOfSpeech}
                  </span>
                )}
                <h2 className="text-xs font-semibold italic text-muted-foreground">
                  Nghĩa của từ vựng sau là gì?
                </h2>
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {currentQuestion.word}
                </h3>
              </div>

              {/* ── 3D Option Buttons ──────────────────────────────────── */}
              <div className="space-y-2.5">
                {currentQuestion.options.map((opt: string, idx: number) => {
                  const isSelected = selectedQuizAnswer === opt;
                  const isCorrect = opt === currentQuestion.correct;
                  
                  let btnClass = 'bg-card border-2 border-border text-foreground shadow-[0_3px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted/70';
                  
                  if (isQuizAnswered) {
                    if (isCorrect) {
                      btnClass = 'bg-emerald-500/15 border-2 border-emerald-500 shadow-[0_3px_0_0_#059669] text-emerald-600 dark:text-emerald-400 font-bold';
                    } else if (isSelected) {
                      btnClass = 'bg-rose-500/15 border-2 border-rose-500 shadow-[0_3px_0_0_#e11d48] text-rose-600 dark:text-rose-400 font-bold';
                    } else {
                      btnClass = 'opacity-40 border-2 border-border bg-muted/10 shadow-none';
                    }
                  } else if (isSelected) {
                    btnClass = 'bg-brand/10 border-2 border-brand shadow-[0_3px_0_0_#d95847] text-foreground font-bold';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isQuizAnswered}
                      onClick={() => onSelectAnswer(opt)}
                      className={cn(
                        'w-full px-4 py-3 text-left rounded-2xl transition-all text-sm font-semibold flex items-center justify-between cursor-pointer select-none',
                        btnClass
                      )}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      {isQuizAnswered && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                      )}
                      {isQuizAnswered && isSelected && !isCorrect && (
                        <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── Action 3D Button ───────────────────────────────────── */}
              <div className="pt-3 border-t border-border/60 flex justify-end">
                {!isQuizAnswered ? (
                  <button
                    onClick={onCheckAnswer}
                    disabled={!selectedQuizAnswer}
                    className="btn-3d-primary w-full sm:w-auto px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Kiểm tra kết quả
                  </button>
                ) : (
                  <button
                    onClick={onNext}
                    className="btn-3d-primary w-full sm:w-auto px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5"
                  >
                    <span>
                      {currentQuizIndex + 1 < quizQuestions.length ? 'Câu kế tiếp' : 'Xem kết quả'}
                    </span>
                    <ChevronRight className="h-4 w-4 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground italic text-center py-8 font-medium">
              Không đủ từ vựng để bắt đầu câu hỏi trắc nghiệm.
            </p>
          )
        ) : (
          /* ── Result View ──────────────────────────────────────────── */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 bg-brand/10 rounded-3xl flex items-center justify-center mx-auto text-brand border-2 border-brand/30 shadow-[0_4px_0_0_#d95847]">
              <Trophy className="h-8 w-8 text-brand" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Hoàn Thành Bài Quiz!</h2>
              <p className="text-xs text-muted-foreground font-semibold">Bạn đã trả lời chính xác được</p>
              <div className="text-4xl font-black text-brand pt-1">
                {quizScore} / {quizQuestions.length}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto pt-3">
              <button
                onClick={onRestart}
                className="flex-1 py-3 px-4 rounded-2xl bg-card border-2 border-border text-foreground shadow-[0_3px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Luyện tập lại</span>
              </button>
              <button
                onClick={onBackToList}
                className="btn-3d-primary flex-1 py-3 px-4 rounded-2xl text-xs font-bold"
              >
                Về danh sách
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
