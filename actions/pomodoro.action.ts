"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

/**
 * Save a completed pomodoro session (work or break).
 * `duration` is in seconds.
 */
export async function savePomodoroSessionAction(
  userId: string,
  duration: number,
  type: "work" | "break"
) {
  try {
    if (!userId || duration <= 0) {
      return { success: false, error: "Invalid parameters" };
    }

    await prisma.pomodoroSession.create({
      data: { userId, duration, type },
    });

    revalidatePath("/todo");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
