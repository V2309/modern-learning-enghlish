'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SentencePracticeMode } from '@/components/topic/SentencePracticeMode';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';

interface SavedPracticeItem {
  id?: string;
  vocabularyId: string;
  userSentence: string;
  isCorrect: boolean;
  score: number;
  targetWordUsed: boolean;
  feedback: string;
  grammarErrors: string[];
  suggestedSentence: string;
  suggestedSentenceMeaning: string;
  updatedAt?: Date | string;
}

interface SentencePracticePageClientProps {
  topicId?: string;
  initialPractices?: SavedPracticeItem[];
}

export default function SentencePracticePageClient({
  topicId: propTopicId,
  initialPractices = [],
}: SentencePracticePageClientProps) {
  const router = useRouter();
  const params = useParams();
  const topicId = (propTopicId || params.topicId) as string;

  const { words, masteredIds } = useTopicDetailStore();

  const formattedWords = React.useMemo(() => {
    return words.map((w) => ({
      ...w,
      mastered: masteredIds.includes(w.id),
    }));
  }, [words, masteredIds]);

  return (
    <SentencePracticeMode
      words={formattedWords}
      topicId={topicId}
      initialPractices={initialPractices}
      onFinish={() => router.push(`/vocabulary/topic/${topicId}`)}
    />
  );
}
