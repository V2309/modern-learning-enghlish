# Testing Specification

## 1. Overview

This feature defines the testing strategy for the application.

Testing ensures that authentication, database fetching, validation, UI rendering, and user actions work correctly after replacing mock data with real database data.

---

## 2. Objectives

* Verify pages fetch real data from PostgreSQL.
* Ensure no page depends on mock data.
* Validate Clerk authentication flow.
* Test Zod schema validation.
* Test Server Actions.
* Test Services.
* Ensure loading, empty, and error states work correctly.

---

## 3. Testing Scope

The following modules must be tested:

```txt
Authentication
Users
Topics
Vocabulary
Courses
Lessons
Lesson Progress
Vocabulary Progress
Dashboard
Forms
Server Actions
Zod Schemas
AI Service Integration (Google GenAI)
```

---

## 4. Recommended Tools

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom vitest-mock-extended vite-tsconfig-paths
```

Optional (for End-to-End browser tests):

```bash
npm install -D @playwright/test
npx playwright install
```

Use:

```txt
Vitest                → Unit & Integration testing framework
React Testing Library → Component rendering & interaction testing
jsdom                 → Browser API simulation environment
vitest-mock-extended  → Type-safe mock generation for Prisma Client
vite-tsconfig-paths   → Support for TypeScript "@/*" path aliases in Vitest
Playwright            → E2E user-flow testing in real browsers
```

---

## 5. Test Folder Structure

```txt
src/ (or root of project)
├── __tests__/
│   ├── schemas/       # Zod schemas validation tests
│   ├── services/      # Service function tests with mocked database
│   ├── actions/       # Server Action behavior and validation tests
│   ├── components/    # Client & presentation component tests
│   ├── integration/   # Database-connected services tests
│   └── e2e/           # Playwright UI flows and route protection
├── vitest.config.ts   # Vitest runtime configurations
└── setup-tests.ts     # Global test environment mocks and setups
```

---

## 6. Test Configuration Files

### `vitest.config.ts`

Set up Vitest config in the root directory. Ensure that it maps path aliases matching `tsconfig.json` and loads `setup-tests.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./setup-tests.ts",
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./"),
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/**",
        ".next/**",
        "vitest.config.ts",
        "setup-tests.ts",
        "prisma/**",
      ],
    },
  },
});
```

### `setup-tests.ts`

Configure global mocks for external APIs, Next.js navigation hooks, and DOM capabilities:

```ts
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Next.js Navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/test-route",
  useSearchParams: () => new URLSearchParams(),
  redirect: (url: string) => {
    throw new Error(`Redirected to: ${url}`);
  },
  revalidatePath: vi.fn(),
}));

// Mock Clerk Auth React hooks
vi.mock("@clerk/nextjs", () => {
  const React = require("react");
  return {
    ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
    SignInButton: () => React.createElement("button", null, "Sign In"),
    SignUpButton: () => React.createElement("button", null, "Sign Up"),
    UserButton: () => React.createElement("div", { "data-testid": "user-button" }, "User Button"),
    useUser: () => ({
      isSignedIn: true,
      user: {
        id: "test-clerk-uid",
        fullName: "Test User",
        primaryEmailAddress: { emailAddress: "test@example.com" },
      },
      isLoaded: true,
    }),
  };
});

// Mock Clerk Server-side SDK functions
vi.mock("@clerk/nextjs/server", () => ({
  auth: () => ({
    userId: "test-clerk-uid",
    orgId: null,
  }),
  currentUser: () => Promise.resolve({
    id: "test-clerk-uid",
    firstName: "Test",
    lastName: "User",
    fullName: "Test User",
    emailAddresses: [{ emailAddress: "test@example.com" }],
  }),
}));

// Clean up mocks after every test suite
afterEach(() => {
  vi.clearAllMocks();
});
```

---

## 7. Service Testing

### A. Mocking Prisma (Unit Testing)

Use `vitest-mock-extended` to deep mock the database client instance. This ensures that you don't call the real PostgreSQL DB during local unit tests.

Create `__tests__/services/course.service.test.ts`:

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/db";
import { getCourses, getCourseById } from "@/services/course.service";

// Tell Vitest to mock the global prisma client file
vi.mock("@/lib/db", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Course Service", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe("getCourses", () => {
    it("should return a list of courses from the database", async () => {
      const mockCourses = [
        {
          id: "course-123",
          title: "Intermediate Speaking",
          description: "Speaking practice",
          thumbnail: "https://example.com/speaking.png",
          level: "Intermediate" as const,
          createdAt: new Date(),
        },
      ];

      // Setup mock return value for nested course query
      prismaMock.course.findMany.mockResolvedValue(mockCourses as any);

      const result = await getCourses();

      expect(prismaMock.course.findMany).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Intermediate Speaking");
    });
  });

  describe("getCourseById", () => {
    it("should return a specific course or null if not found", async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      const result = await getCourseById("non-existent-id");

      expect(result).toBeNull();
      expect(prismaMock.course.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-id" },
        include: { lessons: { orderBy: { createdAt: "asc" } } },
      });
    });
  });
});
```

### B. Integration Testing (Real PostgreSQL Database)

For critical services, test them against a dedicated test database (e.g., in Docker or local testing schema) to verify SQL constraints, indexes, and complex cascade rules.

1. Create a `.env.test` file with:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/learning_english_test"
   NODE_ENV="test"
   ```
2. Create global hooks to migrate and clean the database:
   ```ts
   // __tests__/integration/setup.ts
   import { execSync } from "child_process";
   import prisma from "@/lib/db";

   beforeAll(async () => {
     // Apply migrations on test database
     execSync("npx prisma db push --accept-data-loss", { env: { ...process.env, DATABASE_URL: process.env.DATABASE_URL } });
   });

   afterEach(async () => {
     // Truncate tables to ensure isolated environments
     const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
       SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename NOT LIKE '_prisma_migrations';
     `;

     for (const { tablename } of tablenames) {
       await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
     }
   });
   ```

---

## 8. Mocking Recipes for AI Integrations

When testing modules integrated with Google GenAI (`@google/genai`), avoid triggering remote network requests.

### Recipe: Mocking `GoogleGenAI`

```ts
import { describe, expect, it, vi } from "vitest";
import { generateWordFamilies } from "@/services/aiService";

// Mock the entire @google/genai module
vi.mock("@google/genai", () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify([
            {
              word: "analyst",
              partOfSpeech: "noun",
              meaning: "nhà phân tích",
            },
          ]),
        }),
      },
    })),
    Type: {
      OBJECT: "OBJECT",
      ARRAY: "ARRAY",
      STRING: "STRING",
    },
  };
});

describe("aiService - generateWordFamilies", () => {
  it("should parse Gemini JSON results correctly", async () => {
    // Temporarily set API key
    process.env.GEMINI_API_KEY = "dummy-api-key";

    const wordFamilies = await generateWordFamilies("analyze");

    expect(wordFamilies).toHaveLength(1);
    expect(wordFamilies[0].word).toBe("analyst");
  });
});
```

---

## 9. Server Action Testing

Server actions act as entry points executing validation and authentication checks before committing DB modifications.

Example: `__tests__/actions/topic.action.test.ts`

```ts
import { describe, expect, it, vi, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/db";
import { createTopicAction } from "@/actions/topic.action";

vi.mock("@/lib/db", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Topic Actions", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  it("should fail validation if topic name is empty", async () => {
    const formData = new FormData();
    formData.append("name", "");
    formData.append("description", "A valid description");

    const result = await createTopicAction(formData);

    expect(result.success).toBe(false);
    expect(result.error).toContain("name");
    expect(prismaMock.topic.create).not.toHaveBeenCalled();
  });

  it("should succeed and create record for valid data", async () => {
    const formData = new FormData();
    formData.append("name", "Travel English");
    formData.append("description", "Words used during airport checks");

    prismaMock.topic.create.mockResolvedValue({
      id: "topic-1",
      name: "Travel English",
      description: "Words used during airport checks",
      createdAt: new Date(),
    } as any);

    const result = await createTopicAction(formData);

    expect(result.success).toBe(true);
    expect(prismaMock.topic.create).toHaveBeenCalledWith({
      data: {
        name: "Travel English",
        description: "Words used during airport checks",
      },
    });
  });
});
```

---

## 10. Component Testing

Check that client components handle state changes, render empty screens correctly, display lists, and accept input.

Example: testing a custom course creator component using React Testing Library and User Event.

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CourseList } from "@/components/CourseList";

describe("<CourseList />", () => {
  const dummyCourses = [
    {
      id: "course-1",
      title: "Business Correspondence",
      description: "Learn to write business emails",
      thumbnail: "https://example.com/thumb.png",
      level: "Advanced" as const,
      createdAt: new Date(),
      lessons: [],
    },
  ];

  it("should render list elements correctly", () => {
    render(<CourseList courses={dummyCourses} />);
    expect(screen.getByText("Business Correspondence")).toBeInTheDocument();
    expect(screen.getByText("Learn to write business emails")).toBeInTheDocument();
  });

  it("should display empty state message when course count is zero", () => {
    render(<CourseList courses={[]} />);
    expect(screen.getByText(/no courses found/i)).toBeInTheDocument();
  });
});
```

---

## 11. Authentication Testing

Route and access control rules must block unauthorized access.

### Route Matcher Tests
Ensure Clerk's middleware is protecting the expected private endpoints, such as:
- Dashboard: `/dashboard`
- Vocabulary Progress: `/progress`
- Course Manager: `/admin` (if applicable)

---

## 12. E2E Testing (Playwright)

Use Playwright to run real browser integrations.

### Clerk Auth E2E Bypass Recipe

Because entering emails and passwords on actual form fields during automated CI runs triggers Clerk security captchas, we use dynamic JWT injection or custom auth mock handlers during E2E.

For local/CI E2E runs:
1. Enable a development mode bypass cookie.
2. In the Playwright configuration (`playwright.config.ts`), initialize authenticated state before tests run.

`__tests__/e2e/auth.setup.ts`:

```ts
import { test as setup, expect } from "@playwright/test";

setup("authenticate user", async ({ page }) => {
  // Option A: Log in using a pre-configured Test Clerk Account bypass token
  await page.goto("http://localhost:3000/sign-in");
  
  // Set clerk active session cookie directly (if testing keys are available)
  // or simulate input if running in dedicated staging with captchas disabled.
  await page.fill('input[name="identifier"]', "test-e2e-user@example.com");
  await page.click('button[type="submit"]');
  await page.fill('input[name="password"]', "TestE2EPassword123!");
  await page.click('button[type="submit"]');
  
  await page.waitForURL("http://localhost:3000/");
  
  // Save credentials state to file so individual E2E tests don't log in again
  await page.context().storageState({ path: "playwright/.auth/user.json" });
});
```

`__tests__/e2e/lessons.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.use({ storageState: "playwright/.auth/user.json" });

test.describe("Lesson Progression", () => {
  test("allows authenticated user to complete a lesson", async ({ page }) => {
    await page.goto("http://localhost:3000/courses");
    
    // Open a course
    await page.click("text=Beginner English");
    
    // Choose Lesson 1
    await page.click("text=Start Lesson");
    
    // Check video renders
    await expect(page.locator("video")).toBeVisible();
    
    // Mark Lesson completed
    await page.click("button:has-text('Complete Lesson')");
    
    // Expect success redirect and updated status
    await expect(page.locator("text=Lesson completed!")).toBeVisible();
    await expect(page).toHaveURL(/.*courses/);
  });
});
```

---

## 13. Mock Data Removal Testing

Verify that production pages retrieve dynamic database records. No production page (`app/**/page.tsx`, `components/*.tsx`) should import static mock assets from `data/mockData.ts` (except for seed operations inside `lib/db.ts`).

### Static Code Check Script

We execute a regex pattern check in pre-commit hooks to identify imports:

```bash
# Returns an exit code of 1 if mock imports are detected in production directories
grep -r "import.*from.*mockData" app/ components/
```

---

## 14. Testing Commands

Add the following tasks to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:e2e": "playwright test"
  }
}
```

---

## 15. CI/CD Integration

To ensure full build integrity on every Pull Request or push to the `main` branch, use a GitHub Actions workflow:

`.github/workflows/test.yml`:

```yaml
name: Test Suite

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test_user
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: learning_english_test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - name: Checkout repository
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-size: 18
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Verify Prisma Schema and migrate
        run: npx prisma db push
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/learning_english_test

      - name: Run Unit & Integration Tests
        run: npm run test:coverage
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/learning_english_test
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_dummy
          CLERK_SECRET_KEY: sk_test_dummy
          GEMINI_API_KEY: dummy-key

      - name: Install Playwright Browsers
        run: npx playwright install --with-deps

      - name: Run E2E Tests
        run: npm run test:e2e
        env:
          DATABASE_URL: postgresql://test_user:test_password@localhost:5432/learning_english_test
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_test_dummy
          CLERK_SECRET_KEY: sk_test_dummy
          GEMINI_API_KEY: dummy-key
```

---

## 16. Acceptance Criteria

* **Schema Rules:** Zod schemas must successfully reject incorrect or partial request inputs.
* **Isolation:** Database tests mock dynamic database handlers or run inside an auto-rolled back context.
* **Clerk Protection:** Middleware blocks page rendering when the authentication token cookie is absent.
* **Component Rendering:** Interface components must render empty list UI templates when empty arrays are returned.
* **Production Integrity:** Mock imports must not be found inside production route layouts.

---

## 17. Final Testing Flow

```txt
   Zod Schema Validation Tests
               ↓
     Database Services Mocks
               ↓
    Server Actions Logic Checks
               ↓
     Component Behavior Tests
               ↓
  Integration Tests (Real Test DB)
               ↓
      Playwright E2E Tests
```
