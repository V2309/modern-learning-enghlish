"use server";

import { createCourse, updateCourse, deleteCourse } from "@/services/course.service";
import { courseSchema, updateCourseSchema } from "@/schemas/course.schema";
import { CourseLevel } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createCourseAction(data: {
  title: string;
  description: string;
  thumbnail: string;
  level: CourseLevel;
  accessCode?: string;
  topics?: { title: string; description?: string }[];
  lessons?: { title: string; duration: string; videoUrl: string; description?: string }[];
}) {
  try {
    const validation = courseSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const course = await createCourse({
      ...validation.data,
      topics: data.topics,
      lessons: data.lessons
    });
    revalidatePath("/courses");
    return { success: true, course };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateCourseAction(courseId: string, data: {
  title?: string;
  description?: string;
  thumbnail?: string;
  level?: CourseLevel;
  accessCode?: string;
}) {
  try {
    const validation = updateCourseSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const course = await updateCourse(courseId, validation.data);
    revalidatePath("/courses");
    revalidatePath(`/courses/${courseId}`);
    return { success: true, course };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCourseAction(courseId: string) {
  try {
    await deleteCourse(courseId);
    revalidatePath("/courses");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
