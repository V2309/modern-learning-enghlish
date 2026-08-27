'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Timer, RefreshCw, Award } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface MatchingCard {
  id: string;
  wordId: string;
  type: 'word' | 'meaning';
  content: string;
  isMatched: boolean;
  isSelected: boolean;
  isFailed: boolean;
}

interface MatchModeProps {
  matchingCards: MatchingCard[];
  matchSeconds: number;
  isMatchFinished: boolean;
  onCardClick: (card: MatchingCard) => void;
  onRestart: () => void;
  onBackToList: () => void;
}

export const MatchMode = ({
  matchingCards,
  matchSeconds,
  isMatchFinished,
  onCardClick,
  onRestart,
  onBackToList,
}: MatchModeProps) => {
  return (
    <div className="h-full flex flex-col justify-center py-2">
      <motion.div
        key="match-mode"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="max-w-2xl mx-auto w-full space-y-3.5"
      >
        {/* Banner */}
        <div className="flex justify-between items-center bg-card border border-border px-4 py-2.5 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-xs text-foreground font-semibold">
            <Timer className="h-4 w-4 text-primary" />
            <span>Thời gian: {matchSeconds}s</span>
          </div>
          <button
            onClick={onRestart}
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Làm mới game
          </button>
        </div>

        {!isMatchFinished ? (
          matchingCards.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground space-y-2">
              <p className="text-base font-semibold">Chủ đề chưa có từ vựng nào.</p>
              <p className="text-xs">Hãy thêm từ vựng trước khi chơi tìm cặp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {matchingCards.map((card) => {
                if (card.isMatched) {
                  return (
                    <div
                      key={card.id}
                      className="h-20 sm:h-24 rounded-2xl border border-transparent pointer-events-none invisible opacity-0 select-none"
                      aria-hidden="true"
                    />
                  );
                }

                let cardClass =
                  'bg-card border-border text-foreground hover:bg-muted/50 hover:border-primary/40 cursor-pointer';
                if (card.isFailed) {
                  cardClass = 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400';
                } else if (card.isSelected) {
                  cardClass = 'bg-primary border-primary text-white scale-98 shadow-md shadow-primary/20';
                }

                return (
                  <motion.button
                    key={card.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                    disabled={card.isMatched}
                    onClick={() => onCardClick(card)}
                    className={cn(
                      'h-20 sm:h-24 rounded-2xl border p-3.5 flex items-center justify-center text-center font-semibold text-xs sm:text-sm transition-all duration-150 shadow-xs cursor-pointer',
                      cardClass
                    )}
                  >
                    <span className="line-clamp-3 leading-snug">{card.content}</span>
                  </motion.button>
                );
              })}
            </div>
          )
        ) : (
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 text-center space-y-4 max-w-sm mx-auto shadow-sm">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto text-emerald-500">
              <Award className="h-7 w-7" />
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-bold text-foreground">Tuyệt vời!</h2>
              <p className="text-xs text-muted-foreground">
                Bạn đã ghép chính xác tất cả các cặp trong
              </p>
              <div className="text-3xl font-black text-primary">{matchSeconds} giây</div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={onRestart}
                className="flex-1 py-2.5 border border-border text-foreground hover:bg-muted rounded-full text-xs font-semibold transition-all cursor-pointer"
              >
                Chơi lại
              </button>
              <button
                onClick={onBackToList}
                className="flex-1 py-2.5 bg-primary text-white hover:bg-primary/95 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-xs"
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
