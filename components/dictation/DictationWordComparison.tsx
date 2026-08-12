"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ComparisonWord {
  text: string;
  type: "correct" | "wrong" | "missing" | "extra";
}

interface DictationWordComparisonProps {
  words: ComparisonWord[];
}

export default function DictationWordComparison({ words }: DictationWordComparisonProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {/* Visual Alignment Box */}
      <div className="flex flex-wrap gap-2.5 p-5 border border-border bg-muted/30 rounded-2xl min-h-[80px] items-center leading-relaxed">
        {words.map((word, idx) => {
          let styleClass = "";
          
          switch (word.type) {
            case "correct":
              styleClass = "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 font-medium px-2 py-0.5 rounded-lg";
              break;
            case "wrong":
              styleClass = "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 font-medium px-2 py-0.5 rounded-lg decoration-wavy";
              break;
            case "missing":
              styleClass = "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border border-yellow-500/20 border-dashed font-medium px-2 py-0.5 rounded-lg italic";
              break;
            case "extra":
              styleClass = "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 line-through font-medium px-2 py-0.5 rounded-lg";
              break;
          }

          return (
            <span key={idx} className={cn("text-base tracking-wide transition-all", styleClass)}>
              {word.text}
            </span>
          );
        })}
      </div>

      {/* Dynamic Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-muted-foreground justify-center pt-2">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40 inline-block" />
          <span>Correct</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40 inline-block" />
          <span>Wrong</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40 inline-block" />
          <span>Missing</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/40 inline-block" />
          <span>Extra</span>
        </span>
      </div>
    </div>
  );
}
