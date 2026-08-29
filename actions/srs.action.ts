'use server';

import { getCurrentUser } from '@/services/user.service';
import {
  submitSrsWordReview,
  getDueSrsWords,
  getSrsDashboardStats,
  enrollTopicWordsIntoSrs,
  SrsRating,
} from '@/services/srs.service';
import { revalidatePath } from 'next/cache';

export async function submitSrsReviewAction(vocabularyId: string, rating: SrsRating) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const result = await submitSrsWordReview(user.uid, vocabularyId, rating);
    revalidatePath('/review');
    revalidatePath('/dashboard');
    revalidatePath('/vocabulary');
    return { ...result };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi lưu kết quả ôn tập' };
  }
}

export async function getDueSrsWordsAction(topicId?: string, limit?: number) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized', words: [] };
  }

  try {
    const words = await getDueSrsWords(user.uid, topicId, limit);
    return { success: true, words };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi tải từ vựng', words: [] };
  }
}

export async function enrollTopicWordsAction(topicId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const res = await enrollTopicWordsIntoSrs(user.uid, topicId);
    revalidatePath('/review');
    revalidatePath('/vocabulary');
    return { success: true, enrolledCount: res.enrolledCount };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi thêm từ vào hàng đợi ôn tập' };
  }
}
