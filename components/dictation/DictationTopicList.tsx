"use client";

import React from "react";
import DictationTopicCard from "./DictationTopicCard";
import { Sparkles } from "lucide-react";

interface Topic {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  level: string;
  totalSentences: number;
  progress: number;
  averageAccuracy: number;
}

interface DictationTopicListProps {
  topics: Topic[];
}

export default function DictationTopicList({ topics }: DictationTopicListProps) {
  if (!topics || topics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-2xl bg-muted/20">
        <Sparkles className="h-12 w-12 text-muted-foreground/60 mb-3" />
        <h3 className="text-lg font-bold text-foreground">No dictation topics available</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Check back later or visit the Admin dashboard to add some dictation topics.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {topics.map((topic) => (
        <DictationTopicCard key={topic.id} topic={topic} />
      ))}
    </div>
  );
}
