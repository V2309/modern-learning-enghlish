"use server";

import { createLesson, updateLesson, deleteLesson } from "@/services/lesson.service";
import { lessonSchema, updateLessonSchema } from "@/schemas/lesson.schema";
import { revalidatePath } from "next/cache";

export async function createLessonAction(data: {
  courseId: string;
  topicId?: string;
  title: string;
  duration: string;
  videoUrl: string;
  description?: string;
  practiceContent?: string;
}) {
  try {
    const validation = lessonSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const lesson = await createLesson(validation.data);
    revalidatePath(`/courses/${data.courseId}`);
    if (data.topicId) {
      revalidatePath(`/courses/${data.courseId}/${data.topicId}`);
    }
    return { success: true, lesson };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateLessonAction(lessonId: string, courseId: string, data: {
  courseId?: string;
  topicId?: string;
  title?: string;
  duration?: string;
  videoUrl?: string;
  description?: string;
  practiceContent?: string;
}, topicId?: string) {
  try {
    const validation = updateLessonSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const lesson = await updateLesson(lessonId, validation.data);
    revalidatePath(`/courses/${courseId}`);
    if (topicId) {
      revalidatePath(`/courses/${courseId}/${topicId}`);
    }
    return { success: true, lesson };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteLessonAction(lessonId: string, courseId: string, topicId?: string) {
  try {
    await deleteLesson(lessonId);
    revalidatePath(`/courses/${courseId}`);
    if (topicId) {
      revalidatePath(`/courses/${courseId}/${topicId}`);
    }
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
