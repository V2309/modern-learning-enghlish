import React from 'react';
import { getCurrentUser } from '@/services/user.service';
import { getSrsDashboardStats } from '@/services/srs.service';
import { getLearningStreak } from '@/services/dashboard.service';
import { SrsDashboardClient } from '@/components/srs/SrsDashboardClient';

export const dynamic = 'force-dynamic';

export default async function SrsReviewPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="w-full py-16 text-center text-muted-foreground">
        Vui lòng đăng nhập để sử dụng tính năng Ôn tập ngắt quãng (SRS).
      </div>
    );
  }

  const [stats, streakData] = await Promise.all([
    getSrsDashboardStats(user.uid),
    getLearningStreak(user.uid),
  ]);

  return <SrsDashboardClient stats={stats} streakDays={streakData.streak} />;
}
