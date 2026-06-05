import React from 'react';
import { getCourses } from '@/services/course.service';
import CoursesClient from '@/components/course/CoursesClient';

export default async function CoursesPage() {
  const courses = await getCourses();
  
  return <CoursesClient initialCourses={courses} />;
}
