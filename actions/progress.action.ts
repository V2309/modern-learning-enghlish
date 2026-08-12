"use server";

import { completeLesson, masterVocabulary, toggleTopicCompletion } from "@/services/progress.service";
import { completeLessonSchema, masterVocabularySchema } from "@/schemas/progress.schema";
import { revalidatePath } from "next/cache";

export async function completeLessonAction(userId: string, lessonId: string, courseId: string) {
  try {
    const validation = completeLessonSchema.safeParse({ userId, lessonId });
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    await completeLesson(userId, lessonId);
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/progress");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function masterVocabularyAction(userId: string, vocabularyId: string, topicId: string) {
  try {
    const validation = masterVocabularySchema.safeParse({ userId, vocabularyId });
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    await masterVocabulary(userId, vocabularyId);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleTopicCompletionAction(userId: string, topicId: string, complete: boolean) {
  try {
    if (!userId || !topicId) {
      return { success: false, error: "Missing parameters" };
    }

    await toggleTopicCompletion(userId, topicId, complete);
    revalidatePath("/vocabulary");
    revalidatePath(`/vocabulary/topic/${topicId}`);
    revalidatePath("/progress");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
