import React from 'react';
import Link from 'next/link';
import { getUserCourses } from '@/services/course.service';
import { getCurrentUser } from '@/services/user.service';
import { getLessonProgress } from '@/services/progress.service';
import MyCoursesClient from '@/components/course/MyCoursesClient';

export const dynamic = 'force-dynamic';

export default async function MyCoursesPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        <p className="mb-4">Vui lòng đăng nhập để xem khóa học của bạn.</p>
        <Link href="/auth/sign-in" className="px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all">
          Đăng nhập
        </Link>
      </div>
    );
  }

  const [courses, lessonProgresses] = await Promise.all([
    getUserCourses(user.uid),
    getLessonProgress(user.uid),
  ]);

  // Build progress map: courseId → { completed, total, pct }
  const progressMap: Record<string, { completed: number; total: number; pct: number }> = {};
  for (const course of courses) {
    const courseLessons: any[] = course.lessons || [];
    const total = courseLessons.length;
    const completed = lessonProgresses.filter(
      (lp) => lp.lesson.courseId === course.id
    ).length;
    progressMap[course.id] = {
      completed,
      total,
      pct: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  return <MyCoursesClient courses={courses} progressMap={progressMap} />;
}
