import prisma from "@/lib/db";

export async function getLessonsByCourse(courseId: string) {
  return await prisma.lesson.findMany({
    where: { courseId },
    orderBy: { createdAt: "asc" }
  });
}

export async function getLessonById(lessonId: string) {
  return await prisma.lesson.findUnique({
    where: { id: lessonId }
  });
}

export async function createLesson(data: {
  courseId: string;
  title: string;
  duration: string;
  videoUrl: string;
  description?: string;
}) {
  const id = `lesson-${Date.now()}`;
  return await prisma.lesson.create({
    data: {
      id,
      courseId: data.courseId,
      title: data.title,
      duration: data.duration,
      videoUrl: data.videoUrl,
      description: data.description
    }
  });
}

export async function updateLesson(lessonId: string, data: {
  courseId?: string;
  title?: string;
  duration?: string;
  videoUrl?: string;
  description?: string;
}) {
  return await prisma.lesson.update({
    where: { id: lessonId },
    data
  });
}

export async function deleteLesson(lessonId: string) {
  return await prisma.lesson.delete({
    where: { id: lessonId }
  });
}
