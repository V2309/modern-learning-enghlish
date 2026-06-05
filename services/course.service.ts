import prisma from "@/lib/db";
import { CourseLevel } from "@prisma/client";

export async function getCourses() {
  return await prisma.course.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      lessons: true
    }
  });
}

export async function getCourseById(courseId: string) {
  return await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      lessons: {
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

export async function createCourse(data: {
  title: string;
  description: string;
  thumbnail: string;
  level: CourseLevel;
  lessons?: { title: string; duration: string; videoUrl: string; description?: string }[];
}) {
  const id = `course-${Date.now()}`;
  return await prisma.course.create({
    data: {
      id,
      title: data.title,
      description: data.description,
      thumbnail: data.thumbnail,
      level: data.level,
      lessons: data.lessons ? {
        create: data.lessons.map((l, index) => ({
          id: `lesson-${Date.now()}-${index}`,
          title: l.title,
          duration: l.duration,
          videoUrl: l.videoUrl,
          description: l.description || ""
        }))
      } : undefined
    },
    include: {
      lessons: true
    }
  });
}

export async function updateCourse(courseId: string, data: {
  title?: string;
  description?: string;
  thumbnail?: string;
  level?: CourseLevel;
}) {
  return await prisma.course.update({
    where: { id: courseId },
    data,
    include: {
      lessons: true
    }
  });
}

export async function deleteCourse(courseId: string) {
  return await prisma.course.delete({
    where: { id: courseId }
  });
}
