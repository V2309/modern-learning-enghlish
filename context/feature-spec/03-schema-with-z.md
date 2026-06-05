# Zod Schema Validation Configuration

## 1. Overview

This feature defines validation schemas using Zod for all form inputs and server actions.

Zod will be used to validate data before creating, updating, or deleting records in the database.

---

## 2. Objectives

* Validate user input before sending data to Prisma.
* Prevent invalid data from being saved.
* Reuse schemas between forms and server actions.
* Keep validation logic centralized.
* Improve type safety with TypeScript.

---

## 3. Installation

```bash
npm install zod
```

---

## 4. Folder Structure

```txt
src/
├── schemas/
│   ├── user.schema.ts
│   ├── topic.schema.ts
│   ├── vocabulary.schema.ts
│   ├── course.schema.ts
│   ├── lesson.schema.ts
│   └── progress.schema.ts
```

---

## 5. User Schema

```ts
import { z } from "zod";

export const userSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
});

export const updateUserSchema = userSchema.pick({
  name: true,
  email: true,
});

export type UserInput = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
```

---

## 6. Topic Schema

```ts
import { z } from "zod";

export const topicSchema = z.object({
  name: z.string().min(1, "Topic name is required").max(255),
  description: z.string().optional(),
});

export const updateTopicSchema = topicSchema.partial();

export type TopicInput = z.infer<typeof topicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
```

---

## 7. Vocabulary Schema

```ts
import { z } from "zod";

export const partOfSpeechEnum = z.enum([
  "Noun",
  "Verb",
  "Adjective",
  "Adverb",
  "Phrase",
  "Other",
]);

export const vocabularySchema = z.object({
  topicId: z.string().min(1, "Topic is required"),
  word: z.string().min(1, "Word is required").max(255),
  meaning: z.string().min(1, "Meaning is required"),
  example: z.string().optional(),
  category: z.string().min(1, "Category is required").max(255),
  partOfSpeech: partOfSpeechEnum,
  pronunciation: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export const updateVocabularySchema = vocabularySchema.partial();

export type VocabularyInput = z.infer<typeof vocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;
```

---

## 8. Course Schema

```ts
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
```

---

## 9. Lesson Schema

```ts
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
```

---

## 10. Progress Schema

```ts
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
```

---

## 11. Usage in Server Actions

```ts
"use server";

import { topicSchema } from "@/schemas/topic.schema";
import { createTopic } from "@/services/topic.service";
import { revalidatePath } from "next/cache";

export async function createTopicAction(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    description: formData.get("description"),
  };

  const result = topicSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  await createTopic(result.data);

  revalidatePath("/topics");

  return {
    success: true,
    message: "Topic created successfully",
  };
}
```

---

## 12. Validation Rules

All create and update operations must validate input with Zod before calling services.

Correct:

```ts
const result = topicSchema.safeParse(rawData);
```

Wrong:

```ts
await createTopic(rawData);
```

---

## 13. Final Result

After implementation:

```txt
Form Input
    ↓
Zod Schema
    ↓
Server Action
    ↓
Service
    ↓
Prisma
    ↓
PostgreSQL
```
