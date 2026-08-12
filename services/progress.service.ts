import prisma from "@/lib/db";

export async function completeLesson(userId: string, lessonId: string) {
  const existing = await prisma.lessonProgress.findUnique({
    where: {
      uniqueUserLessonProgress: { userId, lessonId }
    }
  });

  if (existing) {
    return await prisma.lessonProgress.delete({
      where: { id: existing.id }
    });
  } else {
    const id = `lp-${Date.now()}`;
    return await prisma.lessonProgress.create({
      data: {
        id,
        userId,
        lessonId
      }
    });
  }
}

export async function masterVocabulary(userId: string, vocabularyId: string) {
  const existing = await prisma.vocabularyProgress.findUnique({
    where: {
      uniqueUserVocabularyProgress: { userId, vocabularyId }
    }
  });

  if (existing) {
    return await prisma.vocabularyProgress.delete({
      where: { id: existing.id }
    });
  } else {
    const id = `vp-${Date.now()}`;
    return await prisma.vocabularyProgress.create({
      data: {
        id,
        userId,
        vocabularyId
      }
    });
  }
}

export async function getLessonProgress(userId: string) {
  return await prisma.lessonProgress.findMany({
    where: { userId },
    include: {
      lesson: true
    }
  });
}

export async function getVocabularyProgress(userId: string) {
  return await prisma.vocabularyProgress.findMany({
    where: { userId },
    include: {
      vocabulary: true
    }
  });
}

export async function getCourseCompletion(userId: string, courseId: string) {
  const topics = await prisma.courseTopic.findMany({
    where: { courseId },
    include: {
      lessons: {
        select: { id: true }
      }
    }
  });

  if (topics.length === 0) {
    return {
      completedCount: 0,
      totalCount: 0,
      percentage: 0,
      completedTopicsCount: 0,
      totalTopicsCount: 0
    };
  }

  const completedLessonIds = (await prisma.lessonProgress.findMany({
    where: {
      userId,
      lesson: { courseId }
    },
    select: { lessonId: true }
  })).map(lp => lp.lessonId);

  const completedLessonSet = new Set(completedLessonIds);

  let completedTopicsCount = 0;
  let totalLessonsCount = 0;
  let completedLessonsCount = 0;

  topics.forEach(t => {
    const topicLessons = t.lessons;
    if (topicLessons.length > 0) {
      totalLessonsCount += topicLessons.length;
      const isTopicCompleted = topicLessons.every(l => completedLessonSet.has(l.id));
      if (isTopicCompleted) {
        completedTopicsCount++;
      }
      completedLessonsCount += topicLessons.filter(l => completedLessonSet.has(l.id)).length;
    }
  });

  return {
    completedCount: completedLessonsCount,
    totalCount: totalLessonsCount,
    percentage: totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0,
    completedTopicsCount,
    totalTopicsCount: topics.length
  };
}

export async function toggleTopicCompletion(userId: string, topicId: string, complete: boolean) {
  const existing = await prisma.topicProgress.findUnique({
    where: {
      uniqueUserTopicProgress: { userId, topicId }
    }
  });

  if (complete) {
    if (!existing) {
      const id = `tp-${Date.now()}`;
      await prisma.topicProgress.create({
        data: {
          id,
          userId,
          topicId
        }
      });
    }
  } else {
    if (existing) {
      await prisma.topicProgress.delete({
        where: { id: existing.id }
      });
    }
  }
}

export async function getTopicProgress(userId: string) {
  return await prisma.topicProgress.findMany({
    where: { userId }
  });
}

