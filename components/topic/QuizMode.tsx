'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CheckCircle2, Trophy } from 'lucide-react';
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
  return (
    <div className="h-full flex flex-col justify-center py-2">
      <motion.div
        key="quiz-mode"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-lg mx-auto w-full bg-card border border-border rounded-2xl p-5 shadow-sm"
      >
        {!isQuizFinished ? (
          quizQuestions.length > 0 ? (
            <div className="space-y-3.5">
              {/* Header */}
              <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase tracking-wider">
                <span>Câu hỏi {currentQuizIndex + 1} / {quizQuestions.length}</span>
                <span className="text-brand font-bold">Điểm số: {quizScore}</span>
              </div>
              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand transition-all"
                  style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
                />
              </div>

              {/* Question */}
              <div className="p-4 rounded-xl bg-muted/40 border border-border text-center space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wide text-brand bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20">
                  {quizQuestions[currentQuizIndex].partOfSpeech}
                </span>
                <h2 className="text-xs font-medium italic text-muted-foreground">
                  Nghĩa của từ vựng sau là gì?
                </h2>
                <h3 className="text-2xl font-bold text-foreground tracking-tight">
                  {quizQuestions[currentQuizIndex].word}
                </h3>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {quizQuestions[currentQuizIndex].options.map((opt: string, idx: number) => {
                  const isSelected = selectedQuizAnswer === opt;
                  const isCorrect = opt === quizQuestions[currentQuizIndex].correct;
                  let btnClass = 'bg-muted/40 border-border text-foreground hover:bg-muted';
                  if (isQuizAnswered) {
                    if (isCorrect) btnClass = 'bg-emerald-500/15 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold';
                    else if (isSelected) btnClass = 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 font-bold';
                    else btnClass = 'opacity-40 border-border bg-muted/10';
                  } else if (isSelected) {
                    btnClass = 'bg-brand/10 border-brand text-brand font-bold ring-1 ring-brand/30';
                  }
                  return (
                    <button
                      key={idx}
                      disabled={isQuizAnswered}
                      onClick={() => onSelectAnswer(opt)}
                      className={cn(
                        'w-full px-4 py-2.5 text-left rounded-xl border transition-all text-sm flex items-center justify-between cursor-pointer',
                        btnClass
                      )}
                    >
                      <span className="truncate pr-2">{opt}</span>
                      {isQuizAnswered && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-border/60 flex justify-end">
                {!isQuizAnswered ? (
                  <button
                    onClick={onCheckAnswer}
                    disabled={!selectedQuizAnswer}
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-black/10"
                  >
                    Kiểm tra kết quả
                  </button>
                ) : (
                  <button
                    onClick={onNext}
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary/90 transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-black/10"
                  >
                    <span>
                      {currentQuizIndex + 1 < quizQuestions.length ? 'Câu kế tiếp' : 'Xem kết quả'}
                    </span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground italic text-center py-6">
              Không đủ từ vựng để bắt đầu câu hỏi trắc nghiệm.
            </p>
          )
        ) : (
          /* Result */
          <div className="text-center py-4 space-y-4">
            <div className="w-14 h-14 bg-brand/10 rounded-full flex items-center justify-center mx-auto text-brand border border-brand/20">
              <Trophy className="h-7 w-7 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground tracking-tight">Hoàn thành bài Quiz!</h2>
              <p className="text-xs text-muted-foreground">Bạn đã trả lời chính xác được</p>
              <div className="text-3xl font-black text-brand pt-1">
                {quizScore} / {quizQuestions.length}
              </div>
            </div>
            <div className="flex gap-3 max-w-xs mx-auto pt-2">
              <button
                onClick={onRestart}
                className="flex-1 py-2.5 border border-border text-foreground hover:bg-muted font-bold rounded-xl text-xs transition-all cursor-pointer"
              >
                Luyện tập lại
              </button>
              <button
                onClick={onBackToList}
                className="flex-1 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-md shadow-black/10"
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
