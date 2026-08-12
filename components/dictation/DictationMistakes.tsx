"use client";

import React from "react";
import { AlertCircle, ChevronRight, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface MistakeItem {
  index: number; // 0-based original sentence index
  sentenceId: string;
  accuracy: number;
}

interface DictationMistakesProps {
  mistakes: MistakeItem[];
  onSelectSentence: (index: number) => void;
  onBack: () => void;
}

export default function DictationMistakes({ mistakes, onSelectSentence, onBack }: DictationMistakesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto w-full border border-border bg-card rounded-3xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between border-b border-border pb-4 mb-6">
        <button
          onClick={onBack}
          className="cursor-pointer p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <AlertCircle size={18} className="text-amber-500" />
          <span>Review Mistakes</span>
        </h2>
        <div className="w-8" /> {/* spacer for balance */}
      </div>

      <div className="space-y-3 mb-6">
        {mistakes.map((mistake) => (
          <div
            key={mistake.sentenceId}
            className="flex items-center justify-between p-4 border border-border/80 rounded-2xl bg-muted/20 hover:bg-muted/40 transition-all group"
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-bold text-foreground">
                Sentence {mistake.index + 1}
              </span>
              <span className="text-xs text-muted-foreground">
                Best accuracy: <span className="font-semibold text-amber-600 dark:text-amber-400">{mistake.accuracy}%</span>
              </span>
            </div>

            <button
              onClick={() => onSelectSentence(mistake.index)}
              className="cursor-pointer flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
            >
              <span>Review</span>
              <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        className="w-full cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-all"
      >
        Back to Summary
      </button>
    </motion.div>
  );
}
