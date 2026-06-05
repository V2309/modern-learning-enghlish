'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, ChevronRight, Trophy } from 'lucide-react';
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
  return (
    <motion.div
      key="translate-mode"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto bg-card border border-border p-8 rounded-3xl shadow-sm space-y-6"
    >
      {!isTranslateFinished ? (
        translateQuestions.length > 0 ? (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center text-xs text-muted-foreground font-bold tracking-wider uppercase">
              <span>Câu hỏi {translateIndex + 1} / {translateQuestions.length}</span>
              <span>Điểm số: {translateScore}</span>
            </div>
            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${((translateIndex + 1) / translateQuestions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="p-6 bg-muted/40 border border-border rounded-2xl text-center space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wide text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                Cloze Gap-Fill
              </span>
              <h2 className="text-lg font-bold italic text-muted-foreground">
                Điền từ vựng đúng vào chỗ trống:
              </h2>
              <h3 className="text-xl font-bold text-foreground leading-relaxed">
                "{translateQuestions[translateIndex].question}"
              </h3>
              <div className="flex justify-center items-center gap-1.5 text-xs font-semibold text-primary/75 mt-2 bg-primary/5 p-2 rounded-xl border border-primary/10">
                <Lightbulb className="h-4 w-4" />
                <span>Gợi ý: {translateQuestions[translateIndex].hint}</span>
              </div>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">
                Nhập từ thích hợp
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
                  'w-full bg-muted border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-base font-semibold',
                  isTranslateChecked
                    ? isTranslateCorrect
                      ? 'border-green-500 text-green-700 bg-green-500/5 focus:ring-transparent'
                      : 'border-red-500 text-red-700 bg-red-500/5 focus:ring-transparent'
                    : 'border-border text-foreground'
                )}
                placeholder="e.g. apple"
                autoFocus
              />
            </div>

            {/* Feedback */}
            {isTranslateChecked && (
              <div
                className={cn(
                  'p-4 rounded-xl text-center space-y-1 border text-sm font-semibold',
                  isTranslateCorrect
                    ? 'bg-green-500/10 border-green-500/20 text-green-700'
                    : 'bg-red-500/10 border-red-500/20 text-red-700'
                )}
              >
                <div>{isTranslateCorrect ? 'Cực kì chính xác!' : 'Sai mất rồi!'}</div>
                {!isTranslateCorrect && (
                  <div className="text-xs text-muted-foreground font-medium pt-1">
                    Đáp án đúng:{' '}
                    <span className="text-foreground font-bold">
                      {translateQuestions[translateIndex].word}
                    </span>
                  </div>
                )}
                <div className="text-xs font-medium pt-1.5 text-foreground leading-relaxed italic">
                  Câu đầy đủ: "{translateQuestions[translateIndex].fullSentence}"
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="pt-4 border-t border-border flex justify-end">
              {!isTranslateChecked ? (
                <button
                  onClick={onCheck}
                  disabled={!translateInput.trim()}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/95 disabled:opacity-50 transition-all"
                >
                  Kiểm tra kết quả
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl text-xs hover:bg-primary/95 transition-all flex items-center gap-2"
                >
                  <span>
                    {translateIndex + 1 < translateQuestions.length ? 'Từ kế tiếp' : 'Xem kết quả'}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center italic">
            Không nạp được câu hỏi dịch nghĩa.
          </p>
        )
      ) : (
        /* Result */
        <div className="text-center py-6 space-y-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
            <Trophy className="h-8 w-8 animate-bounce" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-foreground font-black">Hoàn thành bài điền từ!</h2>
            <p className="text-muted-foreground text-sm">Kết quả số từ bạn điền đúng cụ thể:</p>
            <div className="text-5xl font-extrabold text-primary pt-2">
              {translateScore} / {translateQuestions.length}
            </div>
          </div>
          <div className="pt-4 flex gap-4">
            <button
              onClick={onRestart}
              className="flex-1 py-3 border border-border hover:bg-muted text-foreground text-xs font-bold rounded-xl"
            >
              Điền lại
            </button>
            <button
              onClick={onBackToList}
              className="flex-1 py-3 bg-primary text-white hover:bg-primary/95 text-xs font-bold rounded-xl"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
