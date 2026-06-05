"use server";

import { createLesson, updateLesson, deleteLesson } from "@/services/lesson.service";
import { lessonSchema, updateLessonSchema } from "@/schemas/lesson.schema";
import { revalidatePath } from "next/cache";

export async function createLessonAction(data: {
  courseId: string;
  title: string;
  duration: string;
  videoUrl: string;
  description?: string;
}) {
  try {
    const validation = lessonSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const lesson = await createLesson(validation.data);
    revalidatePath(`/courses/${data.courseId}`);
    return { success: true, lesson };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLessonAction(lessonId: string, courseId: string, data: {
  courseId?: string;
  title?: string;
  duration?: string;
  videoUrl?: string;
  description?: string;
}) {
  try {
    const validation = updateLessonSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const lesson = await updateLesson(lessonId, validation.data);
    revalidatePath(`/courses/${courseId}`);
    return { success: true, lesson };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLessonAction(lessonId: string, courseId: string) {
  try {
    await deleteLesson(lessonId);
    revalidatePath(`/courses/${courseId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
