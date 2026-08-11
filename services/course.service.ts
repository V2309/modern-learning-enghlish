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
      },
      topics: {
        orderBy: { createdAt: "asc" },
        include: {
          lessons: {
            orderBy: { createdAt: "asc" }
          }
        }
      }
    }
  });
}

export async function createCourse(data: {
  title: string;
  description: string;
  thumbnail: string;
  level: CourseLevel;
  accessCode?: string;
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
      accessCode: data.accessCode || null,
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
  accessCode?: string;
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

export async function getCourseTopicById(topicId: string) {
  return await prisma.courseTopic.findUnique({
    where: { id: topicId },
    include: {
      course: true,
      lessons: {
        orderBy: { createdAt: "asc" }
      }
    }
  });
}

// ── Access Code ──

/** Kiểm tra user đã có quyền vào course chưa */
export async function getCourseAccess(userId: string, courseId: string) {
  return await prisma.courseAccess.findUnique({
    where: {
      uniqueUserCourseAccess: { userId, courseId }
    }
  });
}

/** Lấy tất cả course user đã mua / có access */
export async function getUserCourses(userId: string) {
  const accesses = await prisma.courseAccess.findMany({
    where: { userId },
    include: {
      course: {
        include: { lessons: true, topics: true }
      }
    },
    orderBy: { redeemedAt: "desc" }
  });
  return accesses.map((a) => a.course);
}

/** Lấy danh sách courseId user đã có access */
export async function getUserAccessCourseIds(userId: string): Promise<string[]> {
  const accesses = await prisma.courseAccess.findMany({
    where: { userId },
    select: { courseId: true }
  });
  return accesses.map((a) => a.courseId);
}

/** Validate mã truy cập và ghi nhận quyền truy cập */
export async function redeemCourseAccess(userId: string, courseId: string, code: string) {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    select: { accessCode: true, price: true }
  });

  if (!course) return { success: false, error: "Khóa học không tồn tại." };

  // Course miễn phí — auto access
  if (!course.accessCode || (course.price ?? 0) === 0) {
    const id = `ca-${Date.now()}`;
    await prisma.courseAccess.upsert({
      where: { uniqueUserCourseAccess: { userId, courseId } },
      update: {},
      create: { id, userId, courseId }
    });
    return { success: true };
  }

  if (course.accessCode !== code.trim()) {
    return { success: false, error: "Mã truy cập không đúng. Vui lòng thử lại." };
  }

  const id = `ca-${Date.now()}`;
  await prisma.courseAccess.upsert({
    where: { uniqueUserCourseAccess: { userId, courseId } },
    update: {},
    create: { id, userId, courseId }
  });

  return { success: true };
}

/** Auto-grant access cho course miễn phí */
export async function autoGrantFreeAccess(userId: string, courseId: string) {
  const id = `ca-${Date.now()}`;
  return await prisma.courseAccess.upsert({
    where: { uniqueUserCourseAccess: { userId, courseId } },
    update: {},
    create: { id, userId, courseId }
  });
}
