'use server';

import { getCurrentUser } from '@/services/user.service';
import {
  saveUserSentencePractice,
  getUserSentencePracticesByTopic,
  SaveSentencePracticeInput,
} from '@/services/sentencePractice.service';
import { revalidatePath } from 'next/cache';

export async function saveSentencePracticeAction(
  vocabularyId: string,
  topicId: string,
  data: SaveSentencePracticeInput
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Vui lòng đăng nhập để lưu bài đặt câu.' };
    }

    if (!vocabularyId) {
      return { success: false, error: 'Thiếu mã từ vựng.' };
    }

    const saved = await saveUserSentencePractice(user.uid, vocabularyId, data);
    revalidatePath(`/vocabulary/topic/${topicId}/sentence-practice`);

    return {
      success: true,
      practice: {
        id: saved.id,
        vocabularyId: saved.vocabularyId,
        userSentence: saved.userSentence,
        isCorrect: saved.isCorrect,
        score: saved.score,
        targetWordUsed: saved.targetWordUsed,
        feedback: saved.feedback,
        grammarErrors: saved.grammarErrors,
        suggestedSentence: saved.suggestedSentence,
        suggestedSentenceMeaning: saved.suggestedSentenceMeaning,
        updatedAt: saved.updatedAt,
      },
    };
  } catch (error: any) {
    console.error('Error saving sentence practice:', error);
    return { success: false, error: error?.message || 'Có lỗi xảy ra khi lưu bài đặt câu.' };
  }
}

export async function getTopicSentencePracticesAction(topicId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, practices: [] };
    }

    const list = await getUserSentencePracticesByTopic(user.uid, topicId);
    return {
      success: true,
      practices: list.map((item) => ({
        id: item.id,
        vocabularyId: item.vocabularyId,
        userSentence: item.userSentence,
        isCorrect: item.isCorrect,
        score: item.score,
        targetWordUsed: item.targetWordUsed,
        feedback: item.feedback,
        grammarErrors: item.grammarErrors,
        suggestedSentence: item.suggestedSentence,
        suggestedSentenceMeaning: item.suggestedSentenceMeaning,
        updatedAt: item.updatedAt,
      })),
    };
  } catch (error: any) {
    console.error('Error getting topic sentence practices:', error);
    return { success: false, practices: [] };
  }
}
