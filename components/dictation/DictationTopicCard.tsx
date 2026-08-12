"use client";

import React from "react";
import Link from "next/link";
import { Headphones, BookOpen, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface DictationTopicCardProps {
  topic: {
    id: string;
    title: string;
    description: string | null;
    thumbnail: string | null;
    level: string;
    totalSentences: number;
    progress: number;
    averageAccuracy: number;
    isCompleted?: boolean;
  };
}

export default function DictationTopicCard({ topic }: DictationTopicCardProps) {
  const { id, title, description, level, totalSentences, progress, averageAccuracy, isCompleted } = topic;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all flex flex-col justify-between"
    >
      {/* Glow highlight for completed or in-progress cards */}
      {progress > 0 && (
        <div 
          className="absolute -right-12 -top-12 h-24 w-24 rounded-full bg-primary/10 blur-xl group-hover:bg-primary/20 transition-all"
          style={{ transform: `scale(${1 + progress / 100})` }}
        />
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            {level}
          </span>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/10 text-green-600 border border-green-500/20">
                Completed
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
              <BookOpen size={14} />
              {totalSentences} sentences
            </span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>

        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-6">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-4 pt-4 border-t border-border/60">
        {/* Topic Status */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground font-semibold">Status</span>
          <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${
            isCompleted
              ? "bg-green-500/10 text-green-600 border-green-500/20"
              : "bg-muted text-muted-foreground border-border"
          }`}>
            {isCompleted ? "Completed" : "Uncompleted"}
          </span>
        </div>

        {/* Extra stats */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Average Accuracy</span>
          <span className="font-semibold text-foreground flex items-center gap-1">
            <Sparkles size={13} className="text-yellow-500" />
            {progress > 0 ? `${averageAccuracy}%` : "N/A"}
          </span>
        </div>

        {/* Action Button */}
        <Link href={`/dictation/${id}`} className="block w-full">
          <button className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border bg-foreground text-background hover:bg-foreground/90 active:scale-98">
            <Headphones size={15} />
            <span>{progress > 0 ? "Continue" : "Start Practice"}</span>
            <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
