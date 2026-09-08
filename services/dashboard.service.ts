import prisma from "@/lib/db";
import { getCourseCompletion } from "./progress.service";
import { getTodoDashboardSummary } from "./todo.service";

export { getTodoDashboardSummary };

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
  const [
    lessonProgress,
    vocabProgress,
    dictationAttempts,
    dictationTopicProgress,
    shadowingProgress,
    todoCompletions,
    pomodoroSessions,
    sentencePractices,
    srsReviewLogs
  ] = await Promise.all([
    prisma.lessonProgress.findMany({
      where: { userId },
      select: { completedAt: true }
    }),
    prisma.vocabularyProgress.findMany({
      where: { userId },
      select: { masteredAt: true, lastReviewedAt: true }
    }),
    prisma.dictationAttempt.findMany({
      where: { userId },
      select: { createdAt: true }
    }),
    prisma.dictationTopicProgress.findMany({
      where: { userId },
      select: { completedAt: true }
    }),
    prisma.shadowingProgress.findMany({
      where: { userId },
      select: { completedAt: true }
    }),
    prisma.todoCompletion.findMany({
      where: { userId },
      select: { completedAt: true }
    }),
    prisma.pomodoroSession.findMany({
      where: { userId },
      select: { completedAt: true }
    }),
    prisma.userSentencePractice.findMany({
      where: { userId },
      select: { createdAt: true }
    }),
    prisma.srsReviewLog.findMany({
      where: { userId },
      select: { reviewedAt: true }
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

  // Record all activity types
  lessonProgress.forEach((lp) => addActivity(lp.completedAt));
  vocabProgress.forEach((vp) => {
    if (vp.masteredAt || vp.lastReviewedAt) {
      addActivity(vp.masteredAt || vp.lastReviewedAt || new Date());
    }
  });
  dictationAttempts.forEach((da) => addActivity(da.createdAt));
  dictationTopicProgress.forEach((dtp) => addActivity(dtp.completedAt));
  shadowingProgress.forEach((sp) => addActivity(sp.completedAt));
  todoCompletions.forEach((tc) => addActivity(tc.completedAt));
  pomodoroSessions.forEach((ps) => addActivity(ps.completedAt));
  sentencePractices.forEach((sp) => addActivity(sp.createdAt));
  srsReviewLogs.forEach((srl) => addActivity(srl.reviewedAt));

  // Count today's web visit as at least 1 active point
  const todayStr = toLocalDateString(new Date());
  if (!activityMap[todayStr]) {
    activityMap[todayStr] = 1;
  }

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
      orderBy: { lastReviewedAt: "desc" },
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
      subtitle: rv.vocabulary.topic?.name || 'Từ vựng',
      timestamp: rv.lastReviewedAt || rv.masteredAt || new Date()
    }))
  ];

  // Sort activities by timestamp descending
  return activities.sort((a, b) => (b.timestamp ? b.timestamp.getTime() : 0) - (a.timestamp ? a.timestamp.getTime() : 0)).slice(0, 5);
}

export interface StreakDayInfo {
  dayLabel: string;
  dateStr: string;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export interface LearningStreakData {
  streak: number;
  totalActiveDays: number;
  todayActive: boolean;
  weeklyCalendar: StreakDayInfo[];
}

export async function getLearningStreak(userId: string): Promise<LearningStreakData> {
  const [
    lessonDates,
    vocabDates,
    dictationDates,
    dictationTopicDates,
    shadowingDates,
    todoDates,
    pomodoroDates,
    sentenceDates,
    srsLogDates
  ] = await Promise.all([
    prisma.lessonProgress.findMany({ where: { userId }, select: { completedAt: true } }),
    prisma.vocabularyProgress.findMany({ where: { userId }, select: { masteredAt: true, lastReviewedAt: true } }),
    prisma.dictationAttempt.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.dictationTopicProgress.findMany({ where: { userId }, select: { completedAt: true } }),
    prisma.shadowingProgress.findMany({ where: { userId }, select: { completedAt: true } }),
    prisma.todoCompletion.findMany({ where: { userId }, select: { completedAt: true } }),
    prisma.pomodoroSession.findMany({ where: { userId }, select: { completedAt: true } }),
    prisma.userSentencePractice.findMany({ where: { userId }, select: { createdAt: true } }),
    prisma.srsReviewLog.findMany({ where: { userId }, select: { reviewedAt: true } })
  ]);

  const toLocalDateString = (date: Date) => {
    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - (offset * 60 * 1000));
    return localDate.toISOString().split('T')[0];
  };

  const dates = [
    ...lessonDates.map((lp) => lp.completedAt),
    ...vocabDates.map((vp) => vp.lastReviewedAt || vp.masteredAt).filter(Boolean) as Date[],
    ...dictationDates.map((da) => da.createdAt),
    ...dictationTopicDates.map((dt) => dt.completedAt),
    ...shadowingDates.map((sp) => sp.completedAt),
    ...todoDates.map((td) => td.completedAt),
    ...pomodoroDates.map((ps) => ps.completedAt),
    ...sentenceDates.map((sp) => sp.createdAt),
    ...srsLogDates.map((srl) => srl.reviewedAt)
  ].map(toLocalDateString);

  // Automatically count today when user accesses the web app!
  const todayStr = toLocalDateString(new Date());
  dates.push(todayStr);

  const activeDatesSet = new Set(dates);
  const uniqueDates = Array.from(activeDatesSet).sort((a, b) => b.localeCompare(a));


  // Calculate consecutive active days counting backwards starting from today
  let streak = 0;
  const cursorDate = new Date();

  while (true) {
    const cursorDateStr = toLocalDateString(cursorDate);
    if (activeDatesSet.has(cursorDateStr)) {
      streak++;
      cursorDate.setDate(cursorDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Generate 7-day weekly calendar (Monday to Sunday) for Duolingo view
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
  const weeklyCalendar: StreakDayInfo[] = [];

  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const dStr = toLocalDateString(d);
    const isToday = dStr === todayStr;
    const isFuture = dStr > todayStr;
    const isCompleted = activeDatesSet.has(dStr) || isToday;

    weeklyCalendar.push({
      dayLabel: dayNames[i],
      dateStr: dStr,
      isCompleted,
      isToday,
      isFuture
    });
  }

  return {
    streak: Math.max(streak, 1),
    totalActiveDays: uniqueDates.length,
    todayActive: true,
    weeklyCalendar
  };
}

