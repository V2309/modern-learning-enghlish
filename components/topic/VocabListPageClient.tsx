'use client';

import React from 'react';
import { VocabList } from '@/components/topic/VocabList';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';
import { masterVocabularyAction } from '@/actions/progress.action';
import { toast } from 'react-hot-toast';

interface VocabListPageClientProps {
  userId: string;
  topicId: string;
  isAdmin?: boolean;
}

export default function VocabListPageClient({ userId, topicId, isAdmin = false }: VocabListPageClientProps) {
  const {
    words,
    masteredIds,
    setMasteredIds,
    setShowAddWordModal,
    setEditingWord,
    setEditWordForm,
    setEditWordExamples,
    setShowEditWordModal,
    setDeletingWord,
    setShowDeleteWordModal,
  } = useTopicDetailStore();

  const handleToggleMaster = async (wordId: string) => {
    const isCurrentlyMastered = masteredIds.includes(wordId);
    setMasteredIds(
      isCurrentlyMastered
        ? masteredIds.filter((id) => id !== wordId)
        : [...masteredIds, wordId]
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
      toast.success(isCurrentlyMastered ? 'Đã bỏ đánh dấu thuộc từ!' : 'Đã thuộc từ vựng này!');
    }
  };

  const handleOpenEditWord = (word: any) => {
    setEditingWord(word);
    setEditWordForm({
      word: word.word,
      meaning: word.meaning,
      example: word.example || '',
      partOfSpeech: word.partOfSpeech,
    });
    setEditWordExamples(
      word.examples && word.examples.length > 0 ? word.examples : [word.example || '']
    );
    setShowEditWordModal(true);
  };

  const handleOpenDeleteWord = (word: any) => {
    setDeletingWord(word);
    setShowDeleteWordModal(true);
  };

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
    <VocabList
      words={formattedWords}
      speak={speak}
      onOpenAddModal={() => setShowAddWordModal(true)}
      onToggleMaster={handleToggleMaster}
      onEdit={handleOpenEditWord}
      onDelete={handleOpenDeleteWord}
      isAdmin={isAdmin}
    />
  );
}
