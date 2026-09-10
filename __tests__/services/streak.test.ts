import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '@/lib/db';
import { getLearningStreak } from '@/services/dashboard.service';

vi.mock('@/lib/db', () => ({
  default: {
    lessonProgress: { findMany: vi.fn() },
    vocabularyProgress: { findMany: vi.fn() },
    dictationAttempt: { findMany: vi.fn() },
    dictationTopicProgress: { findMany: vi.fn() },
    shadowingProgress: { findMany: vi.fn() },
    todoCompletion: { findMany: vi.fn() },
    pomodoroSession: { findMany: vi.fn() },
    userSentencePractice: { findMany: vi.fn() },
    srsReviewLog: { findMany: vi.fn().mockResolvedValue([]) },
    user: { findUnique: vi.fn() },
  },
}));

describe('Learning Streak Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should calculate streak including today when user visits the web', async () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const twoDaysAgo = new Date(Date.now() - 86400000 * 2);
    const threeDaysAgo = new Date(Date.now() - 86400000 * 3);

    (prisma.lessonProgress.findMany as any).mockResolvedValue([
      { completedAt: yesterday },
      { completedAt: twoDaysAgo },
    ]);
    (prisma.vocabularyProgress.findMany as any).mockResolvedValue([
      { lastReviewedAt: threeDaysAgo },
    ]);
    (prisma.dictationAttempt.findMany as any).mockResolvedValue([]);
    (prisma.dictationTopicProgress.findMany as any).mockResolvedValue([]);
    (prisma.shadowingProgress.findMany as any).mockResolvedValue([]);
    (prisma.todoCompletion.findMany as any).mockResolvedValue([]);
    (prisma.pomodoroSession.findMany as any).mockResolvedValue([]);
    (prisma.userSentencePractice.findMany as any).mockResolvedValue([]);

    const result = await getLearningStreak('user_123');

    // 3 days in the past + today visited = 4 consecutive days streak!
    expect(result.streak).toBe(4);
    expect(result.todayActive).toBe(true);
    expect(result.weeklyCalendar.length).toBe(7);
  });
});
