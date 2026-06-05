# Fetch Real Data Instead of Mock Data

## 1. Overview

This feature replaces all mock data in the application with real data fetched from PostgreSQL through Prisma.

The application must no longer depend on hardcoded arrays or mock files for users, topics, vocabulary, courses, lessons, and learning progress.

---

## 2. Objectives

* Replace mock data with database records.
* Fetch real data for all pages.
* Keep existing UI as unchanged as possible.
* Centralize data-fetching logic in services.
* Use Server Components for initial data loading.
* Use Server Actions for create, update, delete, and progress actions.
* Use Zustand only for temporary client UI state.

---

## 3. Data Source

The database is the single source of truth.

Main tables:

```txt
users
topics
vocabulary
courses
lessons
lesson_progress
vocabulary_progress
```

The app must not import mock data like:

```ts
import { mockCourses } from "@/mock/courses";
import { mockVocabulary } from "@/mock/vocabulary";
```

Instead, pages should fetch data through services:

```ts
const courses = await getCourses();
const topics = await getTopics();
const vocabulary = await getVocabulary();
```

---

## 4. Recommended Folder Structure

```txt
src/
├── app/
├── components/
├── lib/
│   └── db.ts
├── services/
│   ├── user.service.ts
│   ├── topic.service.ts
│   ├── vocabulary.service.ts
│   ├── course.service.ts
│   ├── lesson.service.ts
│   ├── progress.service.ts
│   └── dashboard.service.ts
├── actions/
│   ├── topic.action.ts
│   ├── vocabulary.action.ts
│   ├── course.action.ts
│   ├── lesson.action.ts
│   └── progress.action.ts
├── stores/
│   └── ui.store.ts
├── types/
└── prisma/
```

---

## 5. Data Fetching Architecture

```txt
PostgreSQL
    ↓
Prisma
    ↓
Services
    ↓
Server Components / Server Actions
    ↓
Pages / Client Components
```

---

## 6. Services Layer

Services are responsible for fetching data from the database.

Pages and components should not call Prisma directly.

Allowed:

```ts
const courses = await getCourses();
```

Not allowed:

```ts
const courses = await prisma.course.findMany();
```

---

## 7. Service Methods

### User Service

```ts
getUserById(userId: string)

getUserByEmail(email: string)

updateUser(userId: string, data)
```

---

### Topic Service

```ts
getTopics()

getTopicById(topicId: string)

createTopic(data)

updateTopic(topicId: string, data)

deleteTopic(topicId: string)
```

---

### Vocabulary Service

```ts
getVocabulary()

getVocabularyById(vocabularyId: string)

getVocabularyByTopic(topicId: string)

searchVocabulary(keyword: string)

createVocabulary(data)

updateVocabulary(vocabularyId: string, data)

deleteVocabulary(vocabularyId: string)
```

---

### Course Service

```ts
getCourses()

getCourseById(courseId: string)

createCourse(data)

updateCourse(courseId: string, data)

deleteCourse(courseId: string)
```

---

### Lesson Service

```ts
getLessonsByCourse(courseId: string)

getLessonById(lessonId: string)

createLesson(data)

updateLesson(lessonId: string, data)

deleteLesson(lessonId: string)
```

---

### Progress Service

```ts
completeLesson(userId: string, lessonId: string)

masterVocabulary(userId: string, vocabularyId: string)

getLessonProgress(userId: string)

getVocabularyProgress(userId: string)

getCourseCompletion(userId: string, courseId: string)
```

---

### Dashboard Service

```ts
getDashboardStats(userId: string)

getRecentLearning(userId: string)

getLearningStreak(userId: string)
```

---

## 8. Page Data Mapping

### Home Page

Fetch:

```ts
getCourses()
getTopics()
```

---

### Topics Page

Fetch:

```ts
getTopics()
```

---

### Topic Detail Page

Fetch:

```ts
getTopicById(topicId)
getVocabularyByTopic(topicId)
```

---

### Vocabulary Page

Fetch:

```ts
getVocabulary()
```

---

### Courses Page

Fetch:

```ts
getCourses()
```

---

### Course Detail Page

Fetch:

```ts
getCourseById(courseId)
getLessonsByCourse(courseId)
getCourseCompletion(userId, courseId)
```

---

### Lesson Detail Page

Fetch:

```ts
getLessonById(lessonId)
getLessonProgress(userId)
```

---

### Profile Page

Fetch:

```ts
getUserById(userId)
```

---

### Progress Page

Fetch:

```ts
getLessonProgress(userId)
getVocabularyProgress(userId)
```

---

### Dashboard Page

Fetch:

```ts
getDashboardStats(userId)
getRecentLearning(userId)
getLearningStreak(userId)
```

---

## 9. Server Components

Use Server Components for initial page data.

Example:

```tsx
import { getCourses } from "@/services/course.service";

export default async function CoursesPage() {
  const courses = await getCourses();

  return <CourseList courses={courses} />;
}
```

---

## 10. Server Actions

Use Server Actions for actions that change data.

Examples:

```txt
create topic
update topic
delete topic
create vocabulary
update vocabulary
delete vocabulary
create course
update course
delete course
complete lesson
master vocabulary
```

Example:

```ts
"use server";

import { completeLesson } from "@/services/progress.service";
import { revalidatePath } from "next/cache";

export async function completeLessonAction(userId: string, lessonId: string) {
  await completeLesson(userId, lessonId);

  revalidatePath("/progress");
}
```

---

## 11. Zustand Usage Rule

Zustand is not required for fetching database data.

Do not use Zustand for permanent server data:

```txt
courses
lessons
topics
vocabulary
users
progress
```

Use Zustand only for temporary client UI state:

```txt
sidebar open/close
modal open/close
selected topic filter
search keyword
flashcard current index
quiz selected answers
theme toggle
```

Example:

```ts
import { create } from "zustand";

type UIStore = {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
};

export const useUIStore = create<UIStore>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: () =>
    set((state) => ({
      isSidebarOpen: !state.isSidebarOpen,
    })),
}));
```

---

## 12. Loading, Empty, and Error States

Each page must support:

```txt
loading state
empty state
error state
```

Example:

```tsx
if (!courses.length) {
  return <EmptyState message="No courses found." />;
}
```

For App Router, use:

```txt
loading.tsx
error.tsx
not-found.tsx
```

---

## 13. Mock Data Removal Rules

Remove or stop using:

```txt
mock/
data/
constants/mock-data.ts
fakeCourses
fakeVocabulary
sampleLessons
```

Before removing mock files, check whether any page still imports them.

---

## 14. Acceptance Criteria

* All pages display data from PostgreSQL.
* No page imports mock data.
* Prisma is only used inside service files.
* Server Components are used for initial data fetching.
* Server Actions are used for mutations.
* Zustand is only used for UI state.
* Empty, loading, and error states are handled.
* User progress is fetched from `lesson_progress` and `vocabulary_progress`.
* Course completion percentage is calculated from real lesson progress.
* Vocabulary mastered count is calculated from real vocabulary progress.

---

## 15. Final Result

After implementation, the app data flow should be:

```txt
Database data → Prisma → Services → Pages
Client UI state → Zustand / useState
Form actions → Server Actions → Services → Prisma
```
