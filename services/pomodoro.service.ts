import prisma from "@/lib/db";

/**
 * Get cumulative pomodoro stats for a user.
 * Returns today's stats + all-time total.
 */
export async function getPomodoroStats(userId: string) {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [todaySessions, allTimeSessions] = await Promise.all([
    prisma.pomodoroSession.findMany({
      where: { userId, type: "work", completedAt: { gte: todayStart } },
      select: { duration: true },
    }),
    prisma.pomodoroSession.findMany({
      where: { userId, type: "work" },
      select: { duration: true },
    }),
  ]);

  const todaySeconds = todaySessions.reduce((acc, s) => acc + s.duration, 0);
  const allTimeSeconds = allTimeSessions.reduce((acc, s) => acc + s.duration, 0);

  return {
    todaySessions: todaySessions.length,
    todaySeconds,
    todayMinutes: Math.floor(todaySeconds / 60),
    allTimeSessions: allTimeSessions.length,
    allTimeSeconds,
    allTimeMinutes: Math.floor(allTimeSeconds / 60),
  };
}
