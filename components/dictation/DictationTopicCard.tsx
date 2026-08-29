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
      className="group relative overflow-hidden rounded-3xl border border-border/80 bg-card p-6 shadow-xs hover:shadow-xl hover:border-brand/40 transition-all flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-brand/10 text-brand border border-brand/20">
            {level}
          </span>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Đã xong
              </span>
            )}
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
              <BookOpen size={13} className="text-brand" />
              {totalSentences} câu
            </span>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-bold text-foreground mb-2 group-hover:text-brand transition-colors">
          {title}
        </h3>

        {description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-3.5 pt-4 border-t border-border/60">
        {/* Extra stats */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Độ chính xác</span>
          <span className="font-bold text-brand flex items-center gap-1">
            <Sparkles size={13} />
            {progress > 0 ? `${averageAccuracy}%` : "Chưa làm"}
          </span>
        </div>

        {/* Action Button */}
        <Link href={`/dictation/${id}`} className="block w-full">
          <button className="w-full cursor-pointer flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-black/10">
            <Headphones size={14} />
            <span>{progress > 0 ? "Tiếp tục luyện" : "Bắt đầu làm bài"}</span>
            <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
