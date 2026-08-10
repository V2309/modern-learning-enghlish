'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { SentencePracticeMode } from '@/components/topic/SentencePracticeMode';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';

export default function SentencePracticePageClient() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const { words, masteredIds } = useTopicDetailStore();

  const formattedWords = words.map((w) => ({
    ...w,
    mastered: masteredIds.includes(w.id),
  }));

  return (
    <SentencePracticeMode
      words={formattedWords}
      onFinish={() => router.push(`/vocabulary/topic/${topicId}`)}
    />
  );
}
