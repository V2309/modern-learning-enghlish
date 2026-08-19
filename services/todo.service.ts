import prisma from "@/lib/db";

/**
 * Get all todo lists + tasks for a user (optionally filtered by courseId)
 */
export async function getTodoLists(userId: string, courseId?: string) {
  return prisma.todoList.findMany({
    where: {
      userId,
      ...(courseId ? { courseId } : {}),
    },
    include: {
      tasks: {
        orderBy: { order: "asc" },
      },
    },
    orderBy: { order: "asc" },
  });
}

/**
 * Get completions for a user on a given date (YYYY-MM-DD)
 */
export async function getTodoCompletionsForDate(userId: string, date: string) {
  return prisma.todoCompletion.findMany({
    where: { userId, date },
    select: { taskId: true },
  });
}

/**
 * Summary for dashboard: today's tasks + how many are done
 */
export async function getTodoDashboardSummary(userId: string) {
  const today = new Date().toISOString().split("T")[0];

  // All tasks belonging to this user's todo lists
  const allTasks = await prisma.todoTask.findMany({
    where: {
      todoList: { userId },
    },
    select: { id: true },
  });

  const totalTasks = allTasks.length;
  const taskIds = allTasks.map((t) => t.id);

  const completedToday = await prisma.todoCompletion.count({
    where: {
      userId,
      date: today,
      taskId: { in: taskIds },
    },
  });

  return {
    totalTasks,
    completedToday,
    pendingToday: totalTasks - completedToday,
  };
}
