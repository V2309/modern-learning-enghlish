import React from 'react';
import { getCurrentUser } from '@/services/user.service';
import { getMasteredSrsWords } from '@/services/srs.service';
import { getTopics } from '@/services/topic.service';
import { ProfessionalWordsClient } from '@/components/srs/ProfessionalWordsClient';
import Link from 'next/link';
import { Sparkles, Award } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    search?: string;
    topicId?: string;
    sortBy?: 'masteredAt' | 'interval' | 'word' | 'reviewCount';
  }>;
}

export default async function ProfessionalWordsPage({ searchParams }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="w-full max-w-md mx-auto py-20 text-center space-y-4">
        <div className="h-16 w-16 mx-auto rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/25 flex items-center justify-center text-emerald-600">
          <Award className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-black text-foreground">Vui lòng đăng nhập</h2>
        <p className="text-xs text-muted-foreground font-medium">
          Bạn cần đăng nhập để xem danh sách từ vựng đã thành thạo trong hệ thống SRS của mình.
        </p>
        <Link
          href="/auth/sign-in"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand text-white text-xs font-black shadow-[0_3px_0_0_#d95847] active:translate-y-0.5"
        >
          <Sparkles className="h-4 w-4" />
          <span>Đăng nhập ngay</span>
        </Link>
      </div>
    );
  }

  const resolvedParams = await searchParams;
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1;
  const search = resolvedParams.search || '';
  const topicId = resolvedParams.topicId || '';
  const sortBy = resolvedParams.sortBy || 'masteredAt';

  const [masteredData, topics] = await Promise.all([
    getMasteredSrsWords(user.uid, {
      page: isNaN(page) ? 1 : page,
      limit: 20,
      search,
      topicId,
      sortBy,
    }),
    getTopics(),
  ]);

  return (
    <ProfessionalWordsClient
      initialWords={masteredData.words}
      pagination={masteredData.pagination}
      totalLearned={masteredData.totalLearned}
      topics={topics.map((t) => ({ id: t.id, name: t.name }))}
      currentSearch={search}
      currentTopicId={topicId}
      currentSortBy={sortBy}
    />
  );
}
