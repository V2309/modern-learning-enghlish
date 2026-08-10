'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, ChevronRight, Trophy } from 'lucide-react';
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
  onTypedWordChange: (val: string) => void;
  onCheck: () => void;
  onNext: () => void;
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
  onTypedWordChange,
  onCheck,
  onNext,
  onRestart,
  onBackToList,
  speak,
}: DictationModeProps) => {
  const [showMeaning, setShowMeaning] = useState(false);

  useEffect(() => {
    setShowMeaning(false);
  }, [dictationIndex, dictationQuestions]);

  return (
    <motion.div
      key="dictation-mode"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto bg-card border border-border p-8 rounded-3xl shadow-sm space-y-6"
    >
      {!isDictationFinished ? (
        dictationQuestions.length > 0 ? (
          <div className="space-y-6">
            {/* Header */}
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

            {/* Sound Button */}
            <div className="p-8 bg-muted/40 border border-border rounded-3xl flex flex-col items-center justify-center gap-4">
              <button
                onClick={() => speak(dictationQuestions[dictationIndex].word)}
                className="h-20 w-20 rounded-full bg-primary text-white flex items-center justify-center hover:scale-105 transition-all shadow-lg shadow-primary/30 cursor-pointer"
              >
                <Volume2 className="h-10 w-10" />
              </button>
              <button
                type="button"
                onClick={() => setShowMeaning((prev) => !prev)}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                {showMeaning ? 'Ẩn nghĩa' : 'Hiện nghĩa'}
              </button>
              {showMeaning && (
                <div className="text-center text-sm font-semibold text-foreground bg-background/80 border border-border rounded-3xl px-4 py-3">
                  {dictationQuestions[dictationIndex].meaning}
                </div>
              )}
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
            {isDictationChecked && (
              <div
                className={cn(
                  'p-4 rounded-3xl text-center space-y-1 border text-sm font-semibold',
                  isDictationCorrect
                    ? 'bg-green-500/10 border-green-500/20 text-green-700'
                    : 'bg-red-500/10 border-red-500/20 text-red-700'
                )}
              >
                <div>{isDictationCorrect ? 'Đúng rồi! Cực tốt.' : 'Chưa chính xác nhé!'}</div>
                {!isDictationCorrect && (
                  <div className="text-xs text-muted-foreground font-medium pt-1">
                    Đáp án chính xác:{' '}
                    <span className="text-foreground font-bold">
                      {dictationQuestions[dictationIndex].word}
                    </span>
                  </div>
                )}
                <div className="text-xs text-muted-foreground pt-1 italic font-medium">
                  Nghĩa là: {dictationQuestions[dictationIndex].meaning}
                </div>
              </div>
            )}

            {/* Controls */}
            <div className="pt-4 border-t border-border flex justify-between items-center">
              <button
                onClick={() => speak(dictationQuestions[dictationIndex].word)}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                Nghe lại phát âm
              </button>
              {!isDictationChecked ? (
                <button
                  onClick={onCheck}
                  disabled={!typedWord.trim()}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-4xl text-xs hover:bg-primary/95 disabled:opacity-50 transition-all"
                >
                  Kiểm tra kết quả
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="px-6 py-3 bg-primary text-white font-bold rounded-4xl text-xs hover:bg-primary/95 transition-all flex items-center gap-2"
                >
                  <span>
                    {dictationIndex + 1 < dictationQuestions.length ? 'Từ kế tiếp' : 'Xem điểm số'}
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-center italic">Không tìm thấy từ vựng hợp lệ.</p>
        )
      ) : (
        /* Result */
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
      )}
    </motion.div>
  );
};
