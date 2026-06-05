import { z } from "zod";

export const lessonSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  title: z.string().min(1, "Lesson title is required").max(255),
  duration: z.string().min(1, "Duration is required"),
  videoUrl: z.string().url("Invalid video URL"),
  description: z.string().optional(),
});

export const updateLessonSchema = lessonSchema.partial();

export type LessonInput = z.infer<typeof lessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
