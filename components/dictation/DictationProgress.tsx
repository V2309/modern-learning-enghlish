"use client";

import React from "react";

interface DictationProgressProps {
  current: number; // 0-indexed current sentence order
  total: number;   // total sentences count
  completed: number; // number of sentences completed
}

export default function DictationProgress({ current, total, completed }: DictationProgressProps) {
  const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="w-full flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
        <span>Sentence {current + 1} of {total}</span>
        <span>{progressPercent}% Completed</span>
      </div>

      {/* Progress Bar Container */}
      <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border/40 relative">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
        
        {/* Subtle grid markers for sentences */}
        {total > 1 && total <= 15 && (
          <div className="absolute inset-0 flex justify-between pointer-events-none">
            {Array.from({ length: total - 1 }).map((_, i) => (
              <div 
                key={i} 
                className="h-full w-0.5 bg-background/20"
                style={{ marginLeft: `${((i + 1) / total) * 100}%` }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
