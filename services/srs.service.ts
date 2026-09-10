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

export const MAX_SRS_INTERVAL = 180; // 180 days (~6 months maximum interval cap for language retention)

/**
 * SuperMemo SM-2 Interval Calculation Engine with Anti-Runaway Bounds
 * - Again: 10 minutes (immediate today), resets repetitions, drops ease factor
 * - Hard: 1.2x interval or 1 day, slight reduction in ease factor
 * - Good: Gradual progression (1 -> 3 -> 7 -> interval * EF), capped at MAX_SRS_INTERVAL
 * - Easy: Fast progression (3 -> 7 -> 14 -> interval * EF * 1.15), capped at MAX_SRS_INTERVAL
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
  let interval = Math.min(MAX_SRS_INTERVAL, Math.max(0, current.interval || 0));
  let easeFactor = Math.min(2.5, Math.max(1.3, current.easeFactor || 2.5));
  let repetitions = Math.max(0, current.repetitions || 0);
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
      if (repetitions <= 1) {
        interval = 1;
      } else {
        interval = Math.max(1, Math.min(MAX_SRS_INTERVAL, Math.round(interval * 1.2)));
      }
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      nextReviewAt.setDate(nextReviewAt.getDate() + interval);
      break;
    }
    case 'good': {
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 3;
      } else if (repetitions === 2) {
        interval = 7;
      } else {
        interval = Math.min(MAX_SRS_INTERVAL, Math.max(interval + 1, Math.round(interval * easeFactor)));
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
      } else if (repetitions === 2) {
        interval = 14;
      } else {
        interval = Math.min(MAX_SRS_INTERVAL, Math.max(interval + 2, Math.round(interval * easeFactor * 1.15)));
      }
      repetitions += 1;
      easeFactor = Math.min(2.5, easeFactor + 0.15);
      nextReviewAt.setDate(nextReviewAt.getDate() + interval);
      break;
    }
  }

  interval = Math.min(MAX_SRS_INTERVAL, interval);

  const status: 'learning' | 'reviewing' | 'mastered' =
    interval >= 21 ? 'mastered' : interval >= 1 ? 'reviewing' : 'learning';

  return {
    interval,
    easeFactor: Math.round(easeFactor * 100) / 100,
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

export interface MasteredWordsFilter {
  page?: number;
  limit?: number;
  search?: string;
  topicId?: string;
  sortBy?: 'masteredAt' | 'interval' | 'word' | 'reviewCount';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get paginated mastered vocabulary items for a user
 */
export async function getMasteredSrsWords(
  userId: string,
  filter: MasteredWordsFilter = {}
) {
  const page = Math.max(1, filter.page || 1);
  const limit = Math.max(1, Math.min(100, filter.limit || 20));
  const skip = (page - 1) * limit;
  const search = filter.search?.trim();
  const topicId = filter.topicId?.trim();
  const sortBy = filter.sortBy || 'masteredAt';
  const sortOrder = filter.sortOrder || 'desc';

  const whereClause: any = {
    userId,
    OR: [
      { status: 'mastered' },
      { interval: { gte: 21 } },
    ],
  };

  if (topicId && topicId !== 'all') {
    whereClause.vocabulary = {
      ...(whereClause.vocabulary || {}),
      topicId,
    };
  }

  if (search) {
    whereClause.vocabulary = {
      ...(whereClause.vocabulary || {}),
      OR: [
        { word: { contains: search, mode: 'insensitive' } },
        { meaning: { contains: search, mode: 'insensitive' } },
        { definition: { contains: search, mode: 'insensitive' } },
      ],
    };
  }

  // 1. Total count of mastered words matching filter
  const totalCount = await prisma.vocabularyProgress.count({
    where: whereClause,
  });

  // Automatically repair any legacy oversized intervals in DB
  await prisma.vocabularyProgress.updateMany({
    where: {
      userId,
      interval: { gt: MAX_SRS_INTERVAL },
    },
    data: {
      interval: MAX_SRS_INTERVAL,
    },
  });

  // 2. Total progress count across entire user collection
  const totalLearned = await prisma.vocabularyProgress.count({
    where: { userId },
  });

  // 3. Determine sorting
  let orderByClause: any[] = [{ masteredAt: 'desc' }, { lastReviewedAt: 'desc' }];
  if (sortBy === 'interval') {
    orderByClause = [{ interval: sortOrder }, { vocabulary: { word: 'asc' } }];
  } else if (sortBy === 'word') {
    orderByClause = [{ vocabulary: { word: sortOrder } }];
  } else if (sortBy === 'reviewCount') {
    orderByClause = [{ reviewCount: sortOrder }, { vocabulary: { word: 'asc' } }];
  } else if (sortBy === 'masteredAt') {
    orderByClause = [{ masteredAt: sortOrder }, { lastReviewedAt: 'desc' }];
  }

  const progresses = await prisma.vocabularyProgress.findMany({
    where: whereClause,
    include: {
      vocabulary: {
        include: {
          topic: true,
        },
      },
    },
    orderBy: orderByClause,
    skip,
    take: limit,
  });

  const words = progresses.map((p: any) => ({
    id: p.vocabulary?.id || p.id,
    progressId: p.id,
    word: p.vocabulary?.word || '',
    meaning: p.vocabulary?.meaning || '',
    definition: p.vocabulary?.definition || null,
    example: p.vocabulary?.example || null,
    category: p.vocabulary?.category || '',
    partOfSpeech: p.vocabulary?.partOfSpeech || 'Other',
    pronunciation: p.vocabulary?.pronunciation || null,
    imageUrl: p.vocabulary?.imageUrl || null,
    topicId: p.vocabulary?.topicId || '',
    topicName: p.vocabulary?.topic?.name || 'Từ vựng',
    interval: p.interval,
    easeFactor: p.easeFactor,
    repetitions: p.repetitions,
    reviewCount: p.reviewCount,
    lapseCount: p.lapseCount,
    masteredAt: p.masteredAt ? p.masteredAt.toISOString() : null,
    lastReviewedAt: p.lastReviewedAt ? p.lastReviewedAt.toISOString() : null,
    nextReviewAt: p.nextReviewAt ? p.nextReviewAt.toISOString() : null,
  }));

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return {
    words,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
    totalLearned,
  };
}
