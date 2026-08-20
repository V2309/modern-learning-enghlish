import React from 'react';
import { redirect } from 'next/navigation';
import { getCourseTopicById, getCourseAccess } from '@/services/course.service';
import { getCurrentUser } from '@/services/user.service';
import { getLessonProgress } from '@/services/progress.service';
import CourseTopicClient from '@/components/course/CourseTopicClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ courseId: string; topicId: string }>;
}

export default async function MyCourseTopicPage(props: PageProps) {
  const params = await props.params;
  const { courseId, topicId } = params;

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Vui lòng đăng nhập để xem nội dung bài học.
      </div>
    );
  }

  const topic = await getCourseTopicById(topicId);
  if (!topic || topic.courseId !== courseId) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Không tìm thấy chủ đề này.
      </div>
    );
  }

  const topicData = topic as any;
  // Access guard
  const course = topicData.course as any;
  const isFree = !course.accessCode || (course.price ?? 0) === 0;
  if (!isFree) {
    const access = await getCourseAccess(user.uid, courseId);
    if (!access) {
      redirect('/courses');
    }
  }

  const lessonProgresses = await getLessonProgress(user.uid);
  const courseLessons = [
    ...(topicData.lessons || []),
    ...(course.topics ? course.topics.flatMap((t: any) => t.lessons || []) : []),
    ...(course.lessons || [])
  ];
  const allCourseLessonIds = new Set(courseLessons.map((l: any) => l.id));
  const initialCompletedLessonIds = lessonProgresses
    .filter((lp) => allCourseLessonIds.has(lp.lessonId) || lp.lesson?.courseId === courseId)
    .map((lp) => lp.lessonId);
  const initialCompletedPracticeIds = lessonProgresses
    .filter((lp) => (allCourseLessonIds.has(lp.lessonId) || lp.lesson?.courseId === courseId) && (lp as any).practiceCompleted)
    .map((lp) => lp.lessonId);

  return (
    <CourseTopicClient
      topic={topic}
      userId={user.uid}
      initialCompletedLessonIds={initialCompletedLessonIds}
      initialCompletedPracticeIds={initialCompletedPracticeIds}
      basePath={`/my-courses/${courseId}`}
      isAdmin={user.role === 'admin'}
    />
  );
}
