# Architecture Context

## Stack

| Layer            | Technology                         | Role                                                           |
| ---------------- | ---------------------------------- | -------------------------------------------------------------- |
| Framework        | Vite + React 19 + TypeScript       | Single-page client-side application with quick static builds   |
| Router           | React Router DOM v7                | Handle client-side routing between dashboard, courses, and vocab |
| UI & Styling     | Tailwind CSS + Custom Utilities   | Utility-first CSS coupled with raw CSS 3D utility variables    |
| Motion           | Framer Motion (Framer-motion)      | High-fidelity state animations, card flips, and layout transitions |
| Icons            | Lucide React                       | Standard line icon system used consistently across layouts     |
| State persistence| LocalStorage Hydration             | Keep user-made changes (courses, vocabulary, themes) persisted   |
| AI Generation    | `@google/genai` TypeScript SDK      | Power smart word extensions, IPA lookups, definitions, and examples |
| Voice Synthesis  | Web Speech API (speechSynthesis)   | Cross-browser native text-to-speech for vocal practice         |

## System Boundaries

- `src/pages` — View layouts for specialized routes: Course lists, course players, vocabulary topics, flashcard/quiz interfaces.
- `src/services` — AI core endpoints wrapping the Google GenAI client in client-facing layers.
- `src/components` — Shared interface widgets (e.g., Global site header/nav `Navbar`).
- `src/data` (mockData.ts) — Predefined baseline configurations for courses, topics, and startup educational data.
- `src/lib/utils` — Simple helper utilities for class concatenation (`cn`).

## Storage Model

- **Metadata, Courses, Vocabulary & Progress**: Persisted directly on the client browser via standard `localStorage`.
- **LocalStorage Keys**:
  - `linguify_courses`: Custom added courses, custom uploaded lessons, completion markers, and durations.
  - `linguify_topics`: Modified or supplementary vocabulary units, and newly introduced phrases.
  - `theme`: Store dark mode status toggle (`dark` vs. `light`).
- **Static Core Data Fallback**: When no cache exits inside `localStorage`, the application hydrates lists using static objects declared inside `src/data/mockData.ts` and updates them incrementally on user mutation.

## Auth and Client Security Model

- Linguify is structured as a client-first study deck in its base tier.
- The Gemini API interface requires `process.env.GEMINI_API_KEY` to run models. 
- Component states are structured with conditional guards (`if (!apiKey)`) ensuring that AI buttons and triggers degrade gracefully rather than throwing runtime component errors in the absence of credentials.

## Dynamic Syllabus & Learning Workflows

- Users can design courses and assign custom lists of lessons.
- Individual lessons accept parameters (`title`, `duration`, `videoUrl`, `description`).
- Video files are rendered using the standard HTML5 `<video>` tag with dynamic tracking.
- Progress updates are propagated up to parent states synchronously, recalculating master progress metrics (`% percent`) on course dashboards instantly.

## AI Generation Model

Linguify uses the new `@google/genai` SDK on the client side, invoking the `gemini-3-flash-preview` core model.

### 1. Word Family Generation
- **Input**: Target vocabulary string.
- **Prompt**: Requesting related derived words, their part of speech, and translation under a strict JSON format.
- **Schema**:
  ```ts
  {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        word: { type: "STRING" },
        partOfSpeech: { type: "STRING" },
        meaning: { type: "STRING" }
      },
      required: ["word", "partOfSpeech", "meaning"]
    }
  }
  ```

### 2. Pronunciation Guide (IPA)
- **Input**: Individual word string.
- **Prompt**: Requests ONLY the International Phonetic Alphabet characters enclosed within forward-slashes.

### 3. Word Enrichment Detail
- **Input**: Target spelling/word.
- **Prompt**: Requesting the correct IPA spelling, clear Vietnamese description, simple English description, and a real-world example sentence with corresponding Vietnamese translation.
- **Schema**:
  ```json
  {
    "ipa": "string",
    "vietnameseDefinition": "string",
    "englishDefinition": "string",
    "exampleEn": "string",
    "exampleVi": "string"
  }
  ```

## Invariants

1. State hydration MUST always attempt to fetch from LocalStorage inside a `try/catch` fallback block to avoid corrupt parsing crashes.
2. AI responses MUST specify JSON formats directly through schema properties to prevent raw text parsing runtime errors.
3. Pronunciation audio MUST play back via Web Speech Synthesis, selecting suitable English locale voices, degrading dynamically with mock-logs if speech is unavailable.
4. Component state mutations MUST synchronize immediately with relevant `localStorage` keys to maintain high data reliability across unexpected browser reloads.
