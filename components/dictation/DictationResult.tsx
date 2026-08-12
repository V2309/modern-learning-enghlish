"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, XCircle, PlusCircle, ArrowRight, Volume2 } from "lucide-react";
import DictationWordComparison from "./DictationWordComparison";
import { motion } from "framer-motion";

interface ComparisonWord {
  text: string;
  type: "correct" | "wrong" | "missing" | "extra";
}

interface DictationResultProps {
  accuracy: number;
  correctWords: number;
  wrongWords: number;
  missingWords: number;
  extraWords: number;
  words: ComparisonWord[];
  transcript: string;
  userAnswer: string;
  onNext: () => void;
  onReplayAudio: () => void;
  isLastSentence: boolean;
}

export default function DictationResult({
  accuracy,
  correctWords,
  wrongWords,
  missingWords,
  extraWords,
  words,
  transcript,
  userAnswer,
  onNext,
  onReplayAudio,
  isLastSentence,
}: DictationResultProps) {
  // Select positive encouragement text based on score
  const getEncouragement = (score: number) => {
    if (score === 100) return { title: "Perfect!", color: "text-green-500 bg-green-500/10" };
    if (score >= 85) return { title: "Excellent job!", color: "text-green-500 bg-green-500/10" };
    if (score >= 70) return { title: "Good effort!", color: "text-blue-500 bg-blue-500/10" };
    if (score >= 50) return { title: "Keep practicing!", color: "text-yellow-500 bg-yellow-500/10" };
    return { title: "Don't give up!", color: "text-red-500 bg-red-500/10" };
  };

  const praise = getEncouragement(accuracy);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="w-full flex flex-col border border-border bg-card rounded-2xl overflow-hidden shadow-sm mt-6"
    >
      {/* Accuracy Header Banner */}
      <div className="flex flex-col items-center justify-center p-6 bg-muted/40 border-b border-border/80 text-center">
        <span className="text-4xl font-extrabold tracking-tight text-foreground">
          {accuracy}%
        </span>
        <span className={`mt-2.5 px-3 py-1 rounded-full text-xs font-bold ${praise.color}`}>
          {praise.title}
        </span>
      </div>

      <div className="p-6 space-y-6">
        {/* Alignment Comparison */}
        <div>
          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
            Detailed Comparison
          </h4>
          <DictationWordComparison words={words} />
        </div>

        {/* Cased Displays */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-border/60 bg-muted/20">
            <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Your Answer
            </h5>
            <p className="text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed">
              {userAnswer || <span className="text-muted-foreground italic">(Blank)</span>}
            </p>
          </div>

          <div className="p-4 rounded-xl border border-border/60 bg-muted/20">
            <h5 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
              Correct Sentence
            </h5>
            <p className="text-sm font-bold text-foreground whitespace-pre-wrap leading-relaxed">
              {transcript}
            </p>
          </div>
        </div>

        {/* Quantities Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-muted/30 p-4 rounded-2xl border border-border/50 text-center">
          <div className="flex flex-col items-center gap-1">
            <CheckCircle2 size={16} className="text-green-500" />
            <span className="text-xs font-bold text-muted-foreground">Correct</span>
            <span className="text-sm font-extrabold text-foreground">{correctWords}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <XCircle size={16} className="text-red-500" />
            <span className="text-xs font-bold text-muted-foreground">Wrong</span>
            <span className="text-sm font-extrabold text-foreground">{wrongWords}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <AlertTriangle size={16} className="text-yellow-500" />
            <span className="text-xs font-bold text-muted-foreground">Missing</span>
            <span className="text-sm font-extrabold text-foreground">{missingWords}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <PlusCircle size={16} className="text-orange-500" />
            <span className="text-xs font-bold text-muted-foreground">Extra</span>
            <span className="text-sm font-extrabold text-foreground">{extraWords}</span>
          </div>
        </div>
      </div>

      {/* Actions Footer */}
      <div className="flex items-center justify-between gap-3 p-4 bg-muted/40 border-t border-border/80">
        <button
          onClick={onReplayAudio}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card font-semibold text-sm hover:bg-muted text-foreground transition-all"
        >
          <Volume2 size={16} />
          <span>Listen Again</span>
        </button>

        <button
          onClick={onNext}
          className="cursor-pointer flex items-center gap-2 px-5 py-2.5 rounded-xl bg-foreground hover:bg-foreground/90 font-semibold text-sm text-background transition-all active:scale-98"
        >
          <span>{isLastSentence ? "View Results" : "Next Sentence"}</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </motion.div>
  );
}
