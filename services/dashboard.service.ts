import prisma from "@/lib/db";
import { getCourseCompletion } from "./progress.service";

export async function getDashboardStats(userId: string) {
  const [lessonsCompleted, vocabMastered, totalLessons, totalVocab, courses] = await Promise.all([
    prisma.lessonProgress.count({ where: { userId } }),
    prisma.vocabularyProgress.count({ where: { userId } }),
    prisma.lesson.count(),
    prisma.vocabulary.count(),
    prisma.course.findMany({ select: { id: true, title: true, level: true } })
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

  return {
    lessonsCompleted,
    vocabMastered,
    totalLessons,
    totalVocab,
    courseCompletionRates
  };
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

  const dates = [
    ...lessonDates.map((lp) => lp.completedAt),
    ...vocabDates.map((vp) => vp.masteredAt)
  ].map((d) => d.toISOString().split("T")[0]);

  const uniqueDates = Array.from(new Set(dates)).sort((a, b) => b.localeCompare(a));

  let streak = 0;
  if (uniqueDates.length > 0) {
    const todayStr = new Date().toISOString().split("T")[0];
    const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const current = uniqueDates[0];

    if (current === todayStr || current === yesterdayStr) {
      streak = 1;
      const checkDate = new Date(current);
      for (let i = 1; i < uniqueDates.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expected = checkDate.toISOString().split("T")[0];
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
