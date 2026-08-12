import React from 'react';
import { redirect } from 'next/navigation';
import { getCourseById, getCourseAccess } from '@/services/course.service';
import { getCurrentUser } from '@/services/user.service';
import { getLessonProgress } from '@/services/progress.service';
import CourseDetailClient from '@/components/course/CourseDetailClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ courseId: string }>;
}

export default async function CourseDetailPage(props: PageProps) {
  const params = await props.params;
  const courseId = params.courseId;

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Vui lòng đăng nhập để xem chương trình học.
      </div>
    );
  }

  const course = await getCourseById(courseId);
  if (!course) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Course not found
      </div>
    );
  }

  const isFree = !course.accessCode || (course.price ?? 0) === 0;
  let isUnlocked = isFree;
  if (!isFree && user) {
    const access = await getCourseAccess(user.uid, courseId);
    isUnlocked = !!access;
  }

  const lessonProgresses = await getLessonProgress(user.uid);
  const initialCompletedLessonIds = lessonProgresses
    .filter((lp) => lp.lesson.courseId === courseId)
    .map((lp) => lp.lessonId);

  return (
    <CourseDetailClient
      course={course}
      userId={user.uid}
      initialCompletedLessonIds={initialCompletedLessonIds}
      isUnlocked={isUnlocked}
    />
  );
}
