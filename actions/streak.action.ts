'use server';

import { getCurrentUser } from '@/services/user.service';
import { getLearningStreak, LearningStreakData } from '@/services/dashboard.service';

export async function syncAndGetStreakAction(): Promise<{
  success: boolean;
  data?: LearningStreakData;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Unauthorized' };
    }

    const streakData = await getLearningStreak(user.uid);
    return { success: true, data: streakData };
  } catch (error: any) {
    console.error('Error syncing streak:', error);
    return { success: false, error: error?.message || 'Failed to sync streak' };
  }
}
