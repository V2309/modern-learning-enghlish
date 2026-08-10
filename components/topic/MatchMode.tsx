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
    <motion.div
      key="match-mode"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto space-y-6"
    >
      {/* Banner */}
      <div className="flex justify-between items-center bg-card border border-border p-4 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 text-sm text-foreground font-semibold">
          <Timer className="h-4 w-4 text-primary" />
          <span>Thời gian học: {matchSeconds} giây</span>
        </div>
        <button
          onClick={onRestart}
          className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
        >
          <RefreshCw className="h-3 w-3" /> Làm mới game
        </button>
      </div>

      {!isMatchFinished ? (
        matchingCards.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground space-y-3">
            <p className="text-lg font-semibold">Chủ đề chưa có từ vựng nào.</p>
            <p className="text-sm">Hãy thêm từ vựng trước khi chơi tìm cặp.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <AnimatePresence>
              {matchingCards.map((card) => {
                let cardClass =
                  'bg-card border-border text-foreground hover:bg-muted/40 cursor-pointer';
                if (card.isMatched) cardClass = 'bg-green-500/15 border-green-500 text-green-700 opacity-60 cursor-not-allowed';
                else if (card.isFailed) cardClass = 'bg-red-500/15 border-red-500 text-red-700';
                else if (card.isSelected) cardClass = 'bg-primary border-primary text-white scale-95 shadow-md shadow-primary/20';

                return (
                  <motion.button
                    key={card.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85, y: -8 }}
                    transition={{ duration: 0.2 }}
                    disabled={card.isMatched}
                    onClick={() => onCardClick(card)}
                    className={cn(
                      'h-28 rounded-3xl border p-4 flex items-center justify-center text-center font-semibold text-sm transition-all duration-200 shadow-sm cursor-pointer',
                      cardClass
                    )}
                  >
                    <span className="line-clamp-3">{card.content}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )
      ) : (
        <div className="bg-card border border-border rounded-3xl p-8 py-12 text-center space-y-6 max-w-md mx-auto shadow-md">
          <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-500">
            <Award className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Tuyệt vời!</h2>
            <p className="text-muted-foreground">
              Bạn đã ghép chính xác tất cả các cặp trong
            </p>
            <div className="text-4xl font-extrabold text-primary">{matchSeconds} giây</div>
          </div>
          <div className="flex gap-4 pt-4">
            <button
              onClick={onRestart}
              className="flex-1 py-3.5 border border-border text-foreground hover:bg-muted rounded-4xl text-xs font-bold transition-all cursor-pointer"
            >
              Chơi lại
            </button>
            <button
              onClick={onBackToList}
              className="flex-1 py-3.5 bg-primary text-white hover:bg-primary/95 rounded-4xl text-xs font-bold transition-all cursor-pointer"
            >
              Thoát ra học từ
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};
