# Authentication with Clerk

## 1. Overview

The application uses Clerk for authentication.

Users must sign in before accessing the application. If a user visits the website for the first time or is not authenticated, they must be redirected to the sign-in page.

---

## 2. Objectives

* Enable user registration with Clerk.
* Enable user login with Clerk.
* Protect all private application pages.
* Redirect unauthenticated users to the sign-in page.
* Allow authenticated users to access the main app.
* Sync Clerk user data with the local database if needed.

---

## 3. Installation

```bash
npm install @clerk/nextjs
```

---

## 4. Environment Variables

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

---

## 5. Folder Structure

```txt
src/
├── app/
│   ├── sign-in/
│   │   └── [[...sign-in]]/
│   │       └── page.tsx
│   ├── sign-up/
│   │   └── [[...sign-up]]/
│   │       └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── middleware.ts
└── lib/
```

---

## 6. Root Layout Configuration

```tsx
// src/app/layout.tsx

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Language Learning App",
  description: "Vocabulary and course learning platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
```

---

## 7. Sign In Page

```tsx
// src/app/sign-in/[[...sign-in]]/page.tsx

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

---

## 8. Sign Up Page

```tsx
// src/app/sign-up/[[...sign-up]]/page.tsx

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

---

## 9. Middleware Protection

```ts
// src/middleware.ts

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
```

---

## 10. Get Current User in Server Component

```tsx
// src/app/page.tsx

import { currentUser } from "@clerk/nextjs/server";

export default async function HomePage() {
  const user = await currentUser();

  return (
    <main>
      <h1>Welcome, {user?.firstName || "User"}</h1>
    </main>
  );
}
```

---

## 11. User Button

```tsx
// src/components/user-button.tsx

"use client";

import { UserButton } from "@clerk/nextjs";

export function AppUserButton() {
  return <UserButton afterSignOutUrl="/sign-in" />;
}
```

---

## 12. Sync Clerk User with Database

When a user signs in or signs up, the app may create or update the user in the local `users` table.

Local users table:

```txt
users
```

Suggested fields:

```txt
uid
name
email
created_at
updated_at
```

The Clerk user ID should be stored as:

```txt
uid = clerkUser.id
```

Example service:

```ts
// src/services/user.service.ts

import { prisma } from "@/lib/db";

type SyncUserInput = {
  uid: string;
  name: string;
  email: string;
};

export async function syncUser(data: SyncUserInput) {
  return prisma.user.upsert({
    where: {
      uid: data.uid,
    },
    update: {
      name: data.name,
      email: data.email,
    },
    create: {
      uid: data.uid,
      name: data.name,
      email: data.email,
    },
  });
}
```

Example usage:

```tsx
// src/app/page.tsx

import { currentUser } from "@clerk/nextjs/server";
import { syncUser } from "@/services/user.service";

export default async function HomePage() {
  const user = await currentUser();

  if (user) {
    await syncUser({
      uid: user.id,
      name: user.fullName || "User",
      email: user.emailAddresses[0]?.emailAddress || "",
    });
  }

  return <main>Home Page</main>;
}
```

---

## 13. Authentication Rules

* Users must sign in before accessing the app.
* First-time visitors must be redirected to `/sign-in`.
* `/sign-in` and `/sign-up` are public routes.
* All other routes are protected by middleware.
* Server-side user ID should come from Clerk.
* Do not store passwords in the local database.
* Do not build a custom password login system if Clerk is used.

---

## 14. Data Fetching with Authenticated User

Example:

```tsx
import { auth } from "@clerk/nextjs/server";
import { getLessonProgress } from "@/services/progress.service";

export default async function ProgressPage() {
  const { userId } = await auth();

  const progress = await getLessonProgress(userId);

  return <ProgressView progress={progress} />;
}
```

---

## 15. Final Flow

```txt
First visit
    ↓
Middleware checks auth
    ↓
Not logged in
    ↓
Redirect to /sign-in
    ↓
User signs in or signs up with Clerk
    ↓
Redirect to app
    ↓
Fetch user data from Clerk
    ↓
Sync user with local database
    ↓
Access protected pages
```
