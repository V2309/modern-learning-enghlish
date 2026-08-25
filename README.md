<div align="center">
  <br />
  <img src="public/hero_student.png" alt="Modern Learning English Banner" width="800">
  <br />

  <div>
    <img src="https://img.shields.io/badge/-Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
    <img src="https://img.shields.io/badge/-React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" />
    <img src="https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/-Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" />
    <img src="https://img.shields.io/badge/-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/-Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
    <img src="https://img.shields.io/badge/-Google_Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" />
    <img src="https://img.shields.io/badge/-Clerk_Auth-6C47FF?style=for-the-badge&logo=clerk&logoColor=white" />
  </div>

  <h3 align="center">Modern Learning English — AI-Powered English Learning Platform</h3>

  <div align="center">
    A full-stack English learning platform featuring AI-driven vocabulary, shadowing practice, structured courses, dictation exercises, and a Pomodoro-powered productivity system.
  </div>
</div>

---

## 📋 Table of Contents

1. ✨ [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🗂️ [Project Structure](#project-structure)
5. 🤸 [Quick Start](#quick-start)
6. 📌 [Environment Variables](#environment-variables)
7. 🗃️ [Database Schema](#database-schema)

---

## <a name="introduction">✨ Introduction</a>

**Modern Learning English** (branded as **Linguify**) is a modern full-stack English learning platform designed to enhance language acquisition through a suite of interactive tools:

- **AI Vocabulary Builder** — Create topic-based word lists with AI-generated definitions, examples, and word families powered by **Google Gemini AI**
- **Shadowing Practice** — YouTube transcript extraction for pronunciation training with a custom video player
- **Structured Courses** — Tiered video-based courses with lesson tracking, quizzes, and progress monitoring
- **Dictation Exercises** — Audio-based listening and transcription challenges
- **Pomodoro & Todo** — Built-in productivity tools integrated with courses
- **Role-based Access** — Admin panel for course and content management

---

## <a name="tech-stack">⚙️ Tech Stack</a>

| Technology | Purpose |
|---|---|
| **[Next.js 16](https://nextjs.org/)** | Full-stack React framework with App Router, Server Actions, and API routes |
| **[React 19](https://react.dev/)** | UI library with latest concurrent features |
| **[TypeScript](https://www.typescriptlang.org/)** | Full static typing across all layers |
| **[Tailwind CSS v4](https://tailwindcss.com/)** | Utility-first CSS framework for styling |
| **[Framer Motion](https://www.framer.com/motion/)** | Smooth animations and page transitions |
| **[Prisma](https://www.prisma.io/)** | Next-gen ORM with auto-generated, type-safe queries |
| **[PostgreSQL](https://www.postgresql.org/)** | Primary relational database (hosted on Neon) |
| **[Clerk Auth](https://clerk.com/)** | Authentication — sign-up, sign-in, user sessions, role-based access |
| **[Google Gemini AI](https://ai.google.dev/)** | AI-powered vocabulary generation, translation, and content extraction |
| **[ImageKit](https://imagekit.io/)** | Image/media storage and optimization CDN |
| **[Zustand](https://zustand-demo.pmnd.rs/)** | Lightweight global state management |
| **[Zod](https://zod.dev/)** | Schema validation for forms and API inputs |
| **[Lucide React](https://lucide.dev/)** | Icon library |
| **[Vitest](https://vitest.dev/)** | Unit testing framework with Testing Library |

---

## <a name="features">🔋 Features</a>

🧠 **AI Vocabulary Builder (`/vocabulary`)**
Create personalized topic-based vocabulary lists. AI (Gemini) auto-generates word definitions, example sentences, pronunciations, and parts of speech. Supports flashcard-style review with spaced repetition progress tracking.

🎤 **Shadowing Practice (`/shadowing`)**
Add YouTube videos and auto-extract transcripts via `youtube-transcript`. A custom video player lets learners listen, pause, and repeat segments to master natural pronunciation and intonation.

📚 **Structured Courses (`/courses`)**
Browse and enroll in structured English courses organized by topic. Each course includes ordered video lessons with descriptions, practice content, and multiple-choice quizzes. Progress is tracked per lesson and per topic.

🎧 **Dictation Exercises (`/dictation`)**
Audio-based exercises where learners transcribe spoken English. Attempts are recorded and scored to build listening comprehension skills.

✅ **Todo & Pomodoro (`/todo`)**
Course-integrated task lists with a built-in Pomodoro timer to help learners manage study sessions and maintain focus.

📊 **Progress Dashboard (`/dashboard`)**
A centralized view of learning progress across vocabulary topics, course lessons, dictation attempts, and shadowing sessions.

🔐 **Authentication (`/auth`)**
Powered by Clerk — secure sign-up, sign-in, and session management with support for user roles (`user` / `admin`).

🛡️ **Admin Panel (`/admin`)**
Admins can create and manage courses, lessons, topics, questions, and question options. Access-controlled via role-based guards.

---

## <a name="project-structure">🗂️ Project Structure</a>

```
modern-learning-english/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout — ClerkProvider, Navbar, Footer
│   ├── page.tsx                # Home / landing page
│   ├── globals.css             # Global styles
│   ├── providers.tsx           # Client-side providers (Zustand, etc.)
│   ├── api/                    # API Route Handlers
│   │   ├── dictation/          # Dictation API endpoints
│   │   └── shadowing/          # Shadowing transcript extraction
│   ├── auth/                   # Sign-in / sign-up pages
│   ├── courses/                # Course listing & detail pages
│   ├── dashboard/              # User progress dashboard
│   ├── dictation/              # Dictation exercise pages
│   ├── my-courses/             # Enrolled courses view
│   ├── profile/                # User profile page
│   ├── progress/               # Learning progress pages
│   ├── shadowing/              # Shadowing practice pages
│   ├── todo/                   # Todo & Pomodoro pages
│   └── vocabulary/             # Vocabulary builder pages
│
├── components/                 # Reusable UI components
│   ├── Navbar.tsx              # Main navigation bar
│   ├── CustomVideoPlayer.tsx   # Feature-rich custom video player
│   ├── MarkdownEditor.tsx      # Rich markdown content editor
│   ├── Pagination.tsx          # Pagination component
│   ├── course/                 # Course-specific components
│   ├── dashboard/              # Dashboard widgets
│   ├── dictation/              # Dictation UI components
│   ├── home/                   # Landing page sections & Footer
│   ├── shadowing/              # Shadowing UI components
│   ├── todo/                   # Todo & Pomodoro components
│   ├── topic/                  # Topic management components
│   └── vocabulary/             # Vocabulary & flashcard components
│
├── actions/                    # Next.js Server Actions
├── lib/                        # Shared utilities & DB client (Prisma)
├── services/                   # Business logic services
├── stores/                     # Zustand global state stores
├── schemas/                    # Zod validation schemas
├── context/                    # React context providers
├── scripts/                    # Database seed scripts
│   ├── seed.ts                 # Main seed script
│   └── seed_preposition.ts     # Preposition vocabulary seed
├── prisma/
│   └── schema.prisma           # Database schema (15+ models)
├── public/                     # Static assets (images, audio)
└── __tests__/                  # Vitest unit tests
```

---

## <a name="quick-start">🤸 Quick Start</a>

### Prerequisites

Make sure you have the following installed:

- **[Node.js](https://nodejs.org/)** v18 or higher
- **[npm](https://www.npmjs.com/)** or **[Yarn](https://yarnpkg.com/)**
- **[PostgreSQL](https://www.postgresql.org/)** — running locally or via a cloud provider (Neon, Supabase, Railway)

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/V2309/modern-learning-english.git
cd modern-learning-english
```

**2. Install dependencies**

```bash
npm install
```

**3. Set up environment variables**

```bash
cp .env.example .env
```

Fill in your real values (see [Environment Variables](#environment-variables) below).

**4. Push the database schema**

```bash
npx prisma db push
```

**5. Seed the database**

```bash
npm run seed
```

**6. Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to experience the app.

### Useful Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Generate Prisma client & build for production |
| `npm run start` | Start the production server |
| `npm run seed` | Seed the database with initial data |
| `npm run lint` | Run ESLint |
| `npm test` | Run Vitest unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npx prisma studio` | Open Prisma Studio GUI |

---

## <a name="environment-variables">📌 Environment Variables</a>

Create a `.env` file at the project root and fill in the following values:

```env
# Database (PostgreSQL — Neon recommended)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/auth/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/auth/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Google Gemini AI
GEMINI_API_KEY="AIza..."

# ImageKit (Media Storage)
IMAGEKIT_PUBLIC_KEY="public_..."
IMAGEKIT_PRIVATE_KEY="private_..."
IMAGEKIT_URL_ENDPOINT="https://ik.imagekit.io/your-id"
```

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ | Clerk public key for frontend |
| `CLERK_SECRET_KEY` | ✅ | Clerk secret key for server-side auth |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | ✅ | Sign-in page route |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | ✅ | Sign-up page route |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for AI features |
| `IMAGEKIT_PUBLIC_KEY` | ✅ | ImageKit public key |
| `IMAGEKIT_PRIVATE_KEY` | ✅ | ImageKit private key |
| `IMAGEKIT_URL_ENDPOINT` | ✅ | ImageKit CDN endpoint URL |

---

## <a name="database-schema">🗃️ Database Schema</a>

The database is managed via Prisma ORM with the following core models:

| Model | Description |
|---|---|
| `User` | Learner profiles synced from Clerk, with role (`user` / `admin`) |
| `Topic` | Vocabulary topics created by users |
| `Vocabulary` | Individual words with meaning, definition, example, pronunciation |
| `VocabularyProgress` | Per-user flashcard progress per vocabulary item |
| `Course` | English courses with level, pricing, and metadata |
| `CourseTopic` | Chapter/topic groupings within a course |
| `Lesson` | Individual video lessons with practice content |
| `Question` & `QuestionOption` | Multiple-choice quiz items per lesson |
| `LessonProgress` | Tracks lesson completion per user |
| `TopicProgress` | Tracks topic completion per user |
| `ShadowingVideo` | YouTube videos added for shadowing practice |
| `ShadowingProgress` | Per-user shadowing attempt tracking |
| `DictationAttempt` | Recorded dictation submissions and scores |
| `TodoList` & `TodoCompletion` | Course-linked tasks and completion state |
| `PomodoroSession` | Pomodoro timer sessions for study tracking |

---

<div align="center">
  <p>Built with ❤️ using Next.js 16 & Google Gemini AI</p>
</div>
