'use client';

import React from 'react';
import { FlashcardMode } from '@/components/topic/FlashcardMode';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';
import { masterVocabularyAction } from '@/actions/progress.action';
import { toast } from 'react-hot-toast';

interface FlashcardPageClientProps {
  userId: string;
  topicId: string;
}

export default function FlashcardPageClient({ userId, topicId }: FlashcardPageClientProps) {
  const { words, masteredIds, setMasteredIds, flashcardIndex, setFlashcardIndex } = useTopicDetailStore();

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  const handleSetMasterStatus = async (wordId: string, wantMastered: boolean) => {
    const isCurrentlyMastered = masteredIds.includes(wordId);
    if (isCurrentlyMastered === wantMastered) {
      // If already in the target state, just go to the next card
      setFlashcardIndex((prev) => Math.min(words.length - 1, prev + 1));
      return;
    }

    setMasteredIds(
      wantMastered
        ? [...masteredIds, wordId]
        : masteredIds.filter((id) => id !== wordId)
    );

    const res = await masterVocabularyAction(userId, wordId, topicId);
    if (!res.success) {
      // Revert if failed
      setMasteredIds(
        isCurrentlyMastered
          ? [...masteredIds, wordId]
          : masteredIds.filter((id) => id !== wordId)
      );
      toast.error('Không thể cập nhật tiến trình từ vựng: ' + (res.error || 'Có lỗi xảy ra'));
    } else {
      // Go to next card automatically after rating
      setFlashcardIndex((prev) => Math.min(words.length - 1, prev + 1));
    }
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
      onSetMasterStatus={handleSetMasterStatus}
    />
  );
}

