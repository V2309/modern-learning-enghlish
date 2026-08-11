import React from 'react';
import { getCourseTopicById } from '@/services/course.service';
import { getCurrentUser } from '@/services/user.service';
import { getLessonProgress } from '@/services/progress.service';
import CourseTopicClient from '@/components/course/CourseTopicClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ courseId: string; topicId: string }>;
}

export default async function CourseTopicPage(props: PageProps) {
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

  const lessonProgresses = await getLessonProgress(user.uid);
  const topicLessonIds = new Set(topic.lessons.map((l) => l.id));
  const initialCompletedLessonIds = lessonProgresses
    .filter((lp) => topicLessonIds.has(lp.lessonId))
    .map((lp) => lp.lessonId);

  return (
    <CourseTopicClient
      topic={topic}
      userId={user.uid}
      initialCompletedLessonIds={initialCompletedLessonIds}
    />
  );
}
