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
  const lessons = await prisma.lesson.findMany({
    where: { courseId },
    select: { id: true }
  });

  if (lessons.length === 0) {
    return {
      completedCount: 0,
      totalCount: 0,
      percentage: 0
    };
  }

  const completedCount = await prisma.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: lessons.map(l => l.id) }
    }
  });

  return {
    completedCount,
    totalCount: lessons.length,
    percentage: Math.round((completedCount / lessons.length) * 100)
  };
}
