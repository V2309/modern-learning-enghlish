import { z } from "zod";

export const completeLessonSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  lessonId: z.string().min(1, "Lesson ID is required"),
});

export const masterVocabularySchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  vocabularyId: z.string().min(1, "Vocabulary ID is required"),
});

export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;
export type MasterVocabularyInput = z.infer<typeof masterVocabularySchema>;
