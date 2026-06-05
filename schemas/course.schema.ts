import { z } from "zod";

export const courseLevelEnum = z.enum([
  "Beginner",
  "Intermediate",
  "Advanced",
]);

export const courseSchema = z.object({
  title: z.string().min(1, "Course title is required").max(255),
  description: z.string().min(1, "Description is required"),
  thumbnail: z.string().url("Invalid thumbnail URL"),
  level: courseLevelEnum,
});

export const updateCourseSchema = courseSchema.partial();

export type CourseInput = z.infer<typeof courseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
