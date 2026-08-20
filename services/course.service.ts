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
  let course = await prisma.course.findUnique({
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
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true }
          }
        }
      }
    }
  });

  if (!course) return null;

  const finalCourse = course as any;

  let needsUpdate = false;
  const updateData: any = {};

  if (!finalCourse.objectives) {
    needsUpdate = true;
    if (finalCourse.title.toLowerCase().includes("speaking") || finalCourse.title.toLowerCase().includes("sw")) {
      updateData.objectives = JSON.stringify([
        `Dành cho các bạn với mục tiêu đạt điểm TOEIC Speaking - Writing tại các mức đầu ra 240-300+`,
        `Bài giảng hướng dẫn chi tiết cách làm từng dạng câu hỏi TOEIC Speaking - Writing`,
        `Làm quen với các dạng câu hỏi, chủ đề thường gặp trong TOEIC Speaking - Writing với hàng trăm bài samples mẫu từ giáo viên chuyên môn cao`,
        `Cải thiện phát âm - ngữ điệu - ngắt nghỉ - trọng âm, đồng thời nằm lòng từ vựng - cấu trúc diễn đạt cho từng part trong TOEIC Speaking`,
        `Bổ sung cấp tốc từ vựng, làm chủ kỹ năng viết câu, email, bài luận hiệu quả`
      ]);
    } else {
      updateData.objectives = JSON.stringify([
        `Dành cho các bạn với mục tiêu đạt điểm TOEIC tại các mức đầu ra 450 - 650 - 800+`,
        `Bộ 1200 từ vựng TOEIC 99% sẽ xuất hiện trong bài thi TOEIC và 17 chủ đề ngữ pháp quan trọng nhất`,
        `Bài giảng ngữ pháp và phương pháp làm tất cả các dạng câu hỏi TOEIC Reading và Listening`,
        `Hơn 20.000 câu hỏi trắc nghiệm chuẩn format thi thật TOEIC form 2024, có giải thích chi tiết`,
        `Giải quyết triệt để các vấn đề thường gặp khi nghe bằng phương pháp nghe chép chính tả`,
        `Tặng kèm khoá Luyện nghe nói tiếng Anh cùng Ted Talks trị giá 599k`
      ]);
    }
  }

  if (!finalCourse.info) {
    needsUpdate = true;
    const isSW = finalCourse.title.toLowerCase().includes("speaking") || finalCourse.title.toLowerCase().includes("sw");
    updateData.info = JSON.stringify({
      duration: isSW ? "24 giờ học" : "48 giờ học",
      lectures: `${finalCourse.lessons.length} bài giảng video`,
      support: "Giáo viên hỗ trợ giải đáp 24/7",
      certificate: "Có chứng nhận hoàn thành khóa học"
    });
  }

  if (needsUpdate) {
    await prisma.course.update({
      where: { id: courseId },
      data: updateData
    });
    // refresh course object
    Object.assign(finalCourse, updateData);
  }

  // Seed sample reviews if empty
  if (finalCourse.reviews.length === 0) {
    const existingUsers = await prisma.user.findMany({ take: 3 });
    if (existingUsers.length > 0) {
      const sampleReviews = [
        { comment: "Khóa học rất chi tiết và dễ hiểu, phương pháp dạy học sinh động và có lộ trình rõ ràng.", rating: 5 },
        { comment: "Học từ vựng qua flashcard rất hiệu quả, bài tập phong phú giúp nhanh tiến bộ.", rating: 4 },
        { comment: "Rất đáng tiền học! Giảng viên hỗ trợ nhiệt tình, giải đáp thắc mắc siêu nhanh.", rating: 5 }
      ];

      await prisma.courseReview.createMany({
        data: sampleReviews.map((sr, idx) => {
          const userIdx = idx % existingUsers.length;
          return {
            id: `review-${Date.now()}-${idx}`,
            courseId,
            userId: existingUsers[userIdx].uid,
            rating: sr.rating,
            comment: sr.comment
          };
        })
      });

      // Refetch reviews
      const updatedReviews = await prisma.courseReview.findMany({
        where: { courseId },
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { name: true }
          }
        }
      });
      finalCourse.reviews = updatedReviews;
    }
  }

  return finalCourse;
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
      course: {
        include: {
          topics: {
            orderBy: { createdAt: "asc" },
            include: {
              lessons: {
                orderBy: { createdAt: "asc" },
                include: {
                  questions: {
                    include: { options: true },
                    orderBy: { orderIndex: "asc" }
                  }
                }
              }
            }
          },
          lessons: {
            orderBy: { createdAt: "asc" },
            include: {
              questions: {
                include: { options: true },
                orderBy: { orderIndex: "asc" }
              }
            }
          }
        }
      },
      lessons: {
        orderBy: { createdAt: "asc" },
        include: {
          questions: {
            include: { options: true },
            orderBy: { orderIndex: "asc" }
          }
        }
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

/** Check if user has access to at least one paid course */
export async function hasPaidCourseAccess(userId: string): Promise<boolean> {
  const count = await prisma.courseAccess.count({
    where: {
      userId,
      course: {
        OR: [
          { price: { gt: 0 } },
          { accessCode: { not: null } }
        ]
      }
    }
  });
  return count > 0;
}
