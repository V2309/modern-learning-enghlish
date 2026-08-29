import prisma from '@/lib/db';

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export interface SrsCalculationResult {
  interval: number; // in days
  easeFactor: number;
  repetitions: number;
  status: 'learning' | 'reviewing' | 'mastered';
  nextReviewAt: Date;
  lapseCountDelta: number;
}

/**
 * SuperMemo SM-2 Interval Calculation Engine
 * - Again: 10 minutes (immediate today), resets repetitions, drops ease factor
 * - Hard: 1 day, keeps slight reduction in ease factor
 * - Good: 3 days (or interval * easeFactor), standard progression
 * - Easy: 7 days (or interval * easeFactor * 1.3), boosts ease factor
 */
export function calculateSrsNextReview(
  current: {
    interval: number;
    easeFactor: number;
    repetitions: number;
    lapseCount?: number;
  },
  rating: SrsRating
): SrsCalculationResult {
  let interval = current.interval || 0;
  let easeFactor = current.easeFactor || 2.5;
  let repetitions = current.repetitions || 0;
  let lapseCountDelta = 0;
  const nextReviewAt = new Date();

  switch (rating) {
    case 'again': {
      repetitions = 0;
      interval = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      lapseCountDelta = 1;
      nextReviewAt.setMinutes(nextReviewAt.getMinutes() + 10);
      break;
    }
    case 'hard': {
      repetitions = Math.max(1, repetitions);
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      nextReviewAt.setDate(nextReviewAt.getDate() + 1);
      break;
    }
    case 'good': {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 3;
      } else {
        interval = Math.max(2, Math.round(interval * easeFactor));
      }
      repetitions += 1;
      nextReviewAt.setDate(nextReviewAt.getDate() + interval);
      break;
    }
    case 'easy': {
      if (repetitions === 0) {
        interval = 3;
      } else if (repetitions === 1) {
        interval = 7;
      } else {
        interval = Math.max(4, Math.round(interval * easeFactor * 1.3));
      }
      repetitions += 1;
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      nextReviewAt.setDate(nextReviewAt.getDate() + interval);
      break;
    }
  }

  const status: 'learning' | 'reviewing' | 'mastered' =
    interval >= 21 ? 'mastered' : interval >= 1 ? 'reviewing' : 'learning';

  return {
    interval,
    easeFactor,
    repetitions,
    status,
    nextReviewAt,
    lapseCountDelta,
  };
}

/**
 * Get comprehensive SRS Dashboard stats for a user
 */
export async function getSrsDashboardStats(userId: string) {
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 1. Fetch all user vocabulary progresses
  const progresses: any[] = await prisma.vocabularyProgress.findMany({
    where: { userId },
    include: {
      vocabulary: {
        include: {
          topic: true,
        },
      },
    },
  });

  const totalLearned = progresses.length;
  let dueTodayCount = 0;
  let learningCount = 0;
  let reviewingCount = 0;
  let masteredCount = 0;

  progresses.forEach((p: any) => {
    if (new Date(p.nextReviewAt) <= todayEnd) {
      dueTodayCount += 1;
    }
    if (p.status === 'mastered') {
      masteredCount += 1;
    } else if (p.status === 'reviewing') {
      reviewingCount += 1;
    } else {
      learningCount += 1;
    }
  });

  // 2. 7-day forecast
  const forecast: { dayName: string; dateStr: string; dueCount: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() + i);
    dayStart.setHours(0, 0, 0, 0);

    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const count = progresses.filter((p: any) => {
      const revDate = new Date(p.nextReviewAt);
      if (i === 0) {
        return revDate <= dayEnd;
      }
      return revDate >= dayStart && revDate <= dayEnd;
    }).length;

    forecast.push({
      dayName: i === 0 ? 'Hôm nay' : i === 1 ? 'Ngày mai' : `+${i} ngày`,
      dateStr: dayStart.toISOString().split('T')[0],
      dueCount: count,
    });
  }

  // 3. High lapse words (frequently forgotten)
  const highLapseWords = progresses
    .filter((p: any) => (p.lapseCount || 0) > 0)
    .sort((a: any, b: any) => (b.lapseCount || 0) - (a.lapseCount || 0))
    .slice(0, 8)
    .map((p: any) => ({
      id: p.vocabularyId,
      word: p.vocabulary?.word || '',
      meaning: p.vocabulary?.meaning || '',
      partOfSpeech: p.vocabulary?.partOfSpeech || 'Word',
      lapseCount: p.lapseCount || 0,
      interval: p.interval || 0,
      topicName: p.vocabulary?.topic?.name || 'Từ vựng',
    }));

  // 4. Recent review logs
  const recentLogs: any[] = await prisma.srsReviewLog.findMany({
    where: { userId },
    orderBy: { reviewedAt: 'desc' },
    take: 10,
    include: {
      progress: {
        include: {
          vocabulary: true,
        },
      },
    },
  });

  // 5. Total reviews completed today
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const reviewsTodayCount = await prisma.srsReviewLog.count({
    where: {
      userId,
      reviewedAt: { gte: todayStart },
    },
  });

  return {
    dueTodayCount,
    totalLearned,
    learningCount,
    reviewingCount,
    masteredCount,
    reviewsTodayCount,
    forecast,
    highLapseWords,
    recentLogs: recentLogs.map((l: any) => ({
      id: l.id,
      word: l.progress?.vocabulary?.word || '',
      meaning: l.progress?.vocabulary?.meaning || '',
      rating: l.rating,
      intervalAfter: l.intervalAfter,
      reviewedAt: l.reviewedAt,
    })),
  };
}

/**
 * Get due words for a review session
 */
export async function getDueSrsWords(userId: string, topicId?: string, limit: number = 30) {
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // 1. Fetch progresses that are due
  const dueProgresses: any[] = await prisma.vocabularyProgress.findMany({
    where: {
      userId,
      nextReviewAt: { lte: todayEnd },
      ...(topicId ? { vocabulary: { topicId } } : {}),
    },
    include: {
      vocabulary: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: [
      { nextReviewAt: 'asc' },
      { interval: 'asc' },
    ],
    take: limit,
  });

  return dueProgresses.map((p: any) => ({
    id: p.vocabulary.id,
    word: p.vocabulary.word,
    meaning: p.vocabulary.meaning,
    definition: p.vocabulary.definition,
    example: p.vocabulary.example,
    category: p.vocabulary.category,
    partOfSpeech: p.vocabulary.partOfSpeech,
    pronunciation: p.vocabulary.pronunciation,
    imageUrl: p.vocabulary.imageUrl,
    topicId: p.vocabulary.topicId,
    topicName: p.vocabulary.topic?.name || 'Từ vựng',
    srs: {
      status: p.status,
      interval: p.interval,
      easeFactor: p.easeFactor,
      repetitions: p.repetitions,
      reviewCount: p.reviewCount,
      lapseCount: p.lapseCount,
      nextReviewAt: p.nextReviewAt,
    },
  }));
}

/**
 * Submit an SRS review for a word
 */
export async function submitSrsWordReview(
  userId: string,
  vocabularyId: string,
  rating: SrsRating
) {
  let progress = await prisma.vocabularyProgress.findUnique({
    where: {
      uniqueUserVocabularyProgress: {
        userId,
        vocabularyId,
      },
    },
  });

  if (!progress) {
    progress = await prisma.vocabularyProgress.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        vocabularyId,
        status: 'learning',
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: new Date(),
      },
    });
  }

  const next = calculateSrsNextReview(
    {
      interval: progress.interval,
      easeFactor: progress.easeFactor,
      repetitions: progress.repetitions,
      lapseCount: progress.lapseCount,
    },
    rating
  );

  const isNowMastered = next.status === 'mastered';

  const updatedProgress = await prisma.vocabularyProgress.update({
    where: { id: progress.id },
    data: {
      interval: next.interval,
      easeFactor: next.easeFactor,
      repetitions: next.repetitions,
      status: next.status,
      nextReviewAt: next.nextReviewAt,
      lastReviewedAt: new Date(),
      reviewCount: { increment: 1 },
      lapseCount: { increment: next.lapseCountDelta },
      masteredAt: isNowMastered ? progress.masteredAt || new Date() : null,
    },
  });

  await prisma.srsReviewLog.create({
    data: {
      id: crypto.randomUUID(),
      userId,
      progressId: progress.id,
      rating,
      intervalBefore: progress.interval,
      intervalAfter: next.interval,
      easeFactor: next.easeFactor,
    },
  });

  return {
    success: true,
    progress: updatedProgress,
    nextInterval: next.interval,
    nextReviewAt: next.nextReviewAt,
    status: next.status,
  };
}

/**
 * Initialize all words in a topic into the user's SRS queue if not present
 */
export async function enrollTopicWordsIntoSrs(userId: string, topicId: string) {
  const words = await prisma.vocabulary.findMany({
    where: { topicId },
    select: { id: true },
  });

  const existing = await prisma.vocabularyProgress.findMany({
    where: {
      userId,
      vocabularyId: { in: words.map((w: any) => w.id) },
    },
    select: { vocabularyId: true },
  });

  const existingSet = new Set(existing.map((e: any) => e.vocabularyId));
  const toCreate = words.filter((w: any) => !existingSet.has(w.id));

  if (toCreate.length > 0) {
    await prisma.vocabularyProgress.createMany({
      data: toCreate.map((w: any) => ({
        id: crypto.randomUUID(),
        userId,
        vocabularyId: w.id,
        status: 'learning',
        interval: 0,
        easeFactor: 2.5,
        repetitions: 0,
        nextReviewAt: new Date(),
      })),
      skipDuplicates: true,
    });
  }

  return { enrolledCount: toCreate.length };
}
