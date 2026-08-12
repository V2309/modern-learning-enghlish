"use client";

import React from "react";
import Link from "next/link";
import { Award, RefreshCcw, BookOpen, AlertCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface DictationCompletionProps {
  topicTitle: string;
  totalSentences: number;
  averageAccuracy: number;
  onReviewMistakes: () => void;
  onTryAgain: () => void;
  hasMistakes: boolean;
}

export default function DictationCompletion({
  topicTitle,
  totalSentences,
  averageAccuracy,
  onReviewMistakes,
  onTryAgain,
  hasMistakes,
}: DictationCompletionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, type: "spring" }}
      className="max-w-md mx-auto w-full border border-border bg-card rounded-3xl p-8 shadow-md text-center relative overflow-hidden"
    >
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 via-primary to-blue-500" />

      <div className="flex flex-col items-center mt-4">
        {/* Animated Trophy Icon */}
        <motion.div
          initial={{ rotate: -15, scale: 0.8 }}
          animate={{ rotate: 0, scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 120 }}
          className="p-5 rounded-full bg-green-500/10 text-green-500 mb-6 border border-green-500/20"
        >
          <Award size={48} className="animate-pulse" />
        </motion.div>

        <h2 className="text-2xl font-black text-foreground mb-1">
          🎉 Congratulations!
        </h2>
        <p className="text-sm font-semibold text-muted-foreground mb-6 uppercase tracking-wider">
          {topicTitle} Completed
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full mb-8">
          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Sentences
            </span>
            <span className="text-xl font-extrabold text-foreground">
              {totalSentences}/{totalSentences}
            </span>
          </div>

          <div className="p-4 bg-muted/30 border border-border/60 rounded-2xl flex flex-col items-center">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
              Avg. Accuracy
            </span>
            <span className="text-xl font-extrabold text-foreground">
              {averageAccuracy}%
            </span>
          </div>
        </div>

        {/* Actions Button List */}
        <div className="flex flex-col gap-3 w-full">
          {hasMistakes && (
            <button
              onClick={onReviewMistakes}
              className="w-full cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 font-bold text-sm text-white transition-all shadow-sm active:scale-98"
            >
              <AlertCircle size={16} />
              <span>Review Mistakes</span>
            </button>
          )}

          <button
            onClick={onTryAgain}
            className="w-full cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-border bg-card font-bold text-sm hover:bg-muted text-foreground transition-all active:scale-98"
          >
            <RefreshCcw size={16} />
            <span>Try Again</span>
          </button>

          <Link href="/dictation" className="w-full">
            <button className="w-full cursor-pointer flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-foreground text-background font-bold text-sm hover:bg-foreground/90 transition-all active:scale-98">
              <BookOpen size={16} />
              <span>Back to Topics</span>
            </button>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
