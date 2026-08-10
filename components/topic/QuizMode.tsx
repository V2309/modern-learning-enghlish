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
    <motion.div
      key="quiz-mode"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-md"
    >
      {!isQuizFinished ? (
        quizQuestions.length > 0 ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase tracking-wider">
              <span>Câu hỏi {currentQuizIndex + 1} / {quizQuestions.length}</span>
              <span>Điểm số: {quizScore}</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((currentQuizIndex + 1) / quizQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="p-6 rounded-3xl bg-muted/40 border border-border text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                {quizQuestions[currentQuizIndex].partOfSpeech}
              </span>
              <h2 className="text-xl font-bold italic text-muted-foreground">
                Nghĩa của từ vựng sau là gì?
              </h2>
              <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
                {quizQuestions[currentQuizIndex].word}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {quizQuestions[currentQuizIndex].options.map((opt: string, idx: number) => {
                const isSelected = selectedQuizAnswer === opt;
                const isCorrect = opt === quizQuestions[currentQuizIndex].correct;
                let btnClass = 'bg-muted/45 border-border text-foreground hover:bg-muted';
                if (isQuizAnswered) {
                  if (isCorrect) btnClass = 'bg-green-500/10 border-green-500 text-green-600 font-bold';
                  else if (isSelected) btnClass = 'bg-red-500/10 border-red-500 text-red-600 font-bold';
                  else btnClass = 'opacity-40 border-border bg-muted/10';
                } else if (isSelected) {
                  btnClass = 'bg-primary/10 border-primary text-primary font-bold';
                }
                return (
                  <button
                    key={idx}
                    disabled={isQuizAnswered}
                    onClick={() => onSelectAnswer(opt)}
                    className={cn(
                      'w-full p-4 text-left rounded-4xl border transition-all text-sm flex items-center justify-between cursor-pointer',
                      btnClass
                    )}
                  >
                    <span>{opt}</span>
                    {isQuizAnswered && isCorrect && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t border-border flex justify-end">
              {!isQuizAnswered ? (
                <button
                  onClick={onCheckAnswer}
                  disabled={!selectedQuizAnswer}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-4xl text-xs hover:bg-primary/95 disabled:opacity-50 transition-all cursor-pointer"
                >
                  Kiểm tra kết quả
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-4xl text-xs hover:bg-primary/95 transition-all flex items-center gap-2 cursor-pointer"
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
          <p className="text-muted-foreground italic text-center">
            Không đủ từ vựng để bắt đầu câu hỏi trắc nghiệm.
          </p>
        )
      ) : (
        /* Result */
        <div className="text-center py-6 space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Trophy className="h-10 w-10 animate-bounce" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-foreground tracking-tight">Hoàn thành bài Quiz!</h2>
            <p className="text-muted-foreground">Bạn đã trả lời chính xác được</p>
            <div className="text-5xl font-black text-primary">
              {quizScore} / {quizQuestions.length}
            </div>
          </div>
          <div className="flex gap-4 max-w-sm mx-auto pt-4">
            <button
              onClick={onRestart}
              className="flex-1 py-3 border border-border text-foreground hover:bg-muted font-bold rounded-4xl text-xs transition-all cursor-pointer"
            >
              Luyện tập lại
            </button>
            <button
              onClick={onBackToList}
              className="flex-1 py-3 bg-primary text-white hover:bg-primary/90 font-bold rounded-4xl text-xs transition-all cursor-pointer"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
