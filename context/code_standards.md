# Code Standards

## General

- **Single Responsibility Principle**: Group components and utilities around cohesive objectives. Separate AI fetch endpoints, user states, and interactive user displays.
- **Incremental Refinement**: Always prioritize fixing root bugs over writing patching middleware. Maintain clean, human-readable variable declarations.
- **No Mock-Larping**: Exclusively build functional UI flows. Interface labels and buttons must execute intended behaviors or gracefully degrade rather than logging mock output.

## TypeScript

- **Strict Type Declaration**: Always supply concrete interface typings. Avoid fallback typings or arbitrary `any` configurations wherever possible.
- **Explicit Imports**: Use named imports explicitly corresponding with the target file architecture. Do not use object destructuring for core framework imports.
- **Models and Interfaces**: Always locate shared models and parameters in easily retrievable modules (e.g. `src/data/mockData.ts`). Core structures include:
  ```ts
  export interface Lesson {
    id: string;
    title: string;
    duration: string;
    videoUrl: string;
    completed: boolean;
    description?: string;
  }
  
  export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    lessons: Lesson[];
    level: 'Beginner' | 'Intermediate' | 'Advanced';
  }
  ```

## React Patterns

- **Stable render states**: Do not invoke state modification functions directly in component bodies to prevent infinite rendering loops.
- **Effect Dependability**: `useEffect` arrays must be carefully configured. Avoid using complex reference objects or dynamically instantiated arrays in dependency checklists. Rely primarily on primitives (booleans, strings, numbers).
- **LocalStorage safeguards**: Hydrate component variables inside a secure `try/catch` wrapper block verifying string structures before passing arguments to `JSON.parse()`.
  ```ts
  const [courses, setCourses] = useState(() => {
    const cached = localStorage.getItem('linguify_courses');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error("Hydration error:", e);
      }
    }
    return COURSES_DATA;
  });
  ```

## Styling

- **Tailwind Only**: Style custom component boundaries strictly with Tailwind utility classes.
- **Dynamic Classes**: Utilize the standard dynamic class helper utility `cn` from `src/lib/utils.ts` for clean structural variations:
  ```ts
  import { clsx, type ClassValue } from "clsx";
  import { twMerge } from "tailwind-merge";

  export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
  }
  ```
- **Radius consistency**: Respect radius token specifications. Align outer shells, cards, buttons, and popups with corresponding border tokens.

## AI Service Guidelines

- **Robust Key checks**: Always check `GEMINI_API_KEY` configuration safely (`if (!apiKey)`) and handle inactive states with beautiful inline fallback guides rather than breaking UI layouts.
- **JSON Validation**: When calling model payloads, always pass a structural JSON template or configuration schema. Wrap parser calls in robust `try/catch` wrappers to handle potential edge-case system disruptions gracefully.

## File Organization

- `/src/pages` — Full view pages matching specific router paths (Home, Courses, CourseDetail, Vocabulary, TopicDetail).
- `/src/components` — Extracted modular widgets utilized over multiple sheets.
- `/src/services` — AI model invocations and other background APIs.
- `/src/data` — Contains static defaults and base fallback configurations.
- `/src/lib` — System level global utilities (Tailwind merges, custom styling).
