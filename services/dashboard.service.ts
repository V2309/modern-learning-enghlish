import prisma from "@/lib/db";
import { getCourseCompletion } from "./progress.service";

export async function getDashboardStats(userId: string) {
  const [
    lessonsCompleted,
    vocabMastered,
    totalLessons,
    totalVocab,
    courses,
    topics,
    completedTopicsCount,
    totalTopicsCount,
    completedShadowingCount,
    totalShadowingCount
  ] = await Promise.all([
    prisma.lessonProgress.count({ where: { userId } }),
    prisma.vocabularyProgress.count({ where: { userId } }),
    prisma.lesson.count(),
    prisma.vocabulary.count(),
    prisma.course.findMany({ select: { id: true, title: true, level: true } }),
    prisma.topic.findMany({
      include: {
        vocabularies: {
          select: { id: true }
        }
      }
    }),
    prisma.topicProgress.count({ where: { userId } }),
    prisma.topic.count(),
    prisma.shadowingProgress.count({ where: { userId } }),
    prisma.shadowingVideo.count()
  ]);

  const courseCompletionRates = await Promise.all(
    courses.map(async (c) => {
      const completion = await getCourseCompletion(userId, c.id);
      return {
        id: c.id,
        title: c.title,
        level: c.level,
        ...completion
      };
    })
  );

  const topicCompletionRates = await Promise.all(
    topics.map(async (t) => {
      const totalCount = t.vocabularies.length;
      if (totalCount === 0) return null;

      const completedCount = await prisma.vocabularyProgress.count({
        where: {
          userId,
          vocabularyId: { in: t.vocabularies.map((v) => v.id) }
        }
      });

      return {
        id: t.id,
        name: t.name,
        completedCount,
        totalCount,
        percentage: Math.round((completedCount / totalCount) * 100)
      };
    })
  );

  return {
    lessonsCompleted,
    vocabMastered,
    totalLessons,
    totalVocab,
    completedTopicsCount,
    totalTopicsCount,
    completedShadowingCount,
    totalShadowingCount,
    courseCompletionRates,
    topicCompletionRates: topicCompletionRates.filter(Boolean) as any[]
  };
}

export async function getDailyActivity(userId: string) {
  const [lessonProgress, vocabProgress] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId },
      select: { completedAt: true }
    }),
    prisma.vocabularyProgress.findMany({
      where: { userId },
      select: { masteredAt: true }
    })
  ]);

  const activityMap: Record<string, number> = {};

  const toLocalDateString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const addActivity = (date: Date) => {
    const dateStr = toLocalDateString(date);
    activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
  };

  lessonProgress.forEach(lp => addActivity(lp.completedAt));
  vocabProgress.forEach(vp => addActivity(vp.masteredAt));

  return activityMap;
}

export async function getRecentLearning(userId: string) {
  const [recentLessons, recentVocab] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: {
        lesson: {
          include: {
            course: true
          }
        }
      }
    }),
    prisma.vocabularyProgress.findMany({
      where: { userId },
      orderBy: { masteredAt: "desc" },
      take: 5,
      include: {
        vocabulary: {
          include: {
            topic: true
          }
        }
      }
    })
  ]);

  const activities = [
    ...recentLessons.map((rl) => ({
      id: rl.id,
      type: "lesson" as const,
      title: rl.lesson.title,
      subtitle: rl.lesson.course.title,
      timestamp: rl.completedAt
    })),
    ...recentVocab.map((rv) => ({
      id: rv.id,
      type: "vocabulary" as const,
      title: rv.vocabulary.word,
      subtitle: rv.vocabulary.topic.name,
      timestamp: rv.masteredAt
    }))
  ];

  // Sort activities by timestamp descending
  return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, 5);
}

export async function getLearningStreak(userId: string) {
  const [lessonDates, vocabDates] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId }, select: { completedAt: true } }),
    prisma.vocabularyProgress.findMany({ where: { userId }, select: { masteredAt: true } })
  ]);

  const toLocalDateString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const dates = [
    ...lessonDates.map((lp) => lp.completedAt),
    ...vocabDates.map((vp) => vp.masteredAt)
  ].map(toLocalDateString);

  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));
  console.log("DEBUG STREAK: uniqueDates =", uniqueDates);

  let streak = 0;
  if (uniqueDates.length > 0) {
    const todayStr = toLocalDateString(new Date());
    const yesterdayStr = toLocalDateString(new Date(Date.now() - 86400000));
    const current = uniqueDates[0];
    console.log("DEBUG STREAK: todayStr =", todayStr, "yesterdayStr =", yesterdayStr, "current =", current);

    if (current === todayStr || current === yesterdayStr) {
      streak = 1;
      const checkDate = new Date(current);
      for (let i = 1; i < uniqueDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expected = toLocalDateString(checkDate);
        if (uniqueDates[i] === expected) {
          streak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    streak,
    totalActiveDays: uniqueDates.length
  };
}
