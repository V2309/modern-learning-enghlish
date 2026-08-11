import React from 'react';
import { getCourses } from '@/services/course.service';
import { getUserAccessCourseIds } from '@/services/course.service';
import { getCurrentUser } from '@/services/user.service';
import CoursesClient from '@/components/course/CoursesClient';

export const dynamic = 'force-dynamic';

export default async function CoursesPage() {
  const [courses, user] = await Promise.all([getCourses(), getCurrentUser()]);

  const userAccessCourseIds = user
    ? await getUserAccessCourseIds(user.uid)
    : [];

  return (
    <CoursesClient
      initialCourses={courses}
      userAccessCourseIds={userAccessCourseIds}
    />
  );
}
