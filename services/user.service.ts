import prisma from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function getUserById(userId: string) {
  return await prisma.user.findUnique({
    where: { uid: userId }
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email }
  });
}

export async function updateUser(userId: string, data: { name?: string; email?: string }) {
  return await prisma.user.update({
    where: { uid: userId },
    data
  });
}

export async function syncUser(data: { uid: string; name: string; email: string }) {
  const role = data.uid === "user_3DRcDBsgk0yYQLjs2JkTgQHsr9v" ? "admin" : "user";
  return await prisma.user.upsert({
    where: { uid: data.uid },
    update: {
      name: data.name,
      email: data.email,
      role: role as any
    },
    create: {
      uid: data.uid,
      name: data.name,
      email: data.email,
      role: role as any
    }
  });
}

export async function getCurrentUser() {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) return null;

    const email = clerkUser.emailAddresses[0]?.emailAddress || "";
    const name = clerkUser.fullName || `${clerkUser.firstName || ""} ${clerkUser.lastName || ""}`.trim() || "User";

    // Auto sync user with local database
    const user = await syncUser({
      uid: clerkUser.id,
      name,
      email
    });

    return user;
  } catch (error) {
    console.error("Error in getCurrentUser via Clerk:", error);
    return null;
  }
}
