'use client';

import React from 'react';
import { FlashcardMode } from '@/components/topic/FlashcardMode';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';

export default function FlashcardPageClient() {
  const { words, masteredIds, flashcardIndex, setFlashcardIndex } = useTopicDetailStore();

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  const formattedWords = words.map((w) => ({
    ...w,
    mastered: masteredIds.includes(w.id),
  }));

  return (
    <FlashcardMode
      words={formattedWords}
      flashcardIndex={flashcardIndex}
      setFlashcardIndex={setFlashcardIndex}
      speak={speak}
    />
  );
}
