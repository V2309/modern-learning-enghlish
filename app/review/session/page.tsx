import React from 'react';
import { getCurrentUser } from '@/services/user.service';
import { getDueSrsWords } from '@/services/srs.service';
import { getLearningStreak } from '@/services/dashboard.service';
import { SrsReviewSessionClient } from '@/components/srs/SrsReviewSessionClient';
import prisma from '@/lib/db';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SrsReviewSessionPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="w-full py-16 text-center text-muted-foreground">
        Vui lòng đăng nhập để bắt đầu phiên ôn tập.
      </div>
    );
  }

  let words = await getDueSrsWords(user.uid, undefined, 30);
  const streakData = await getLearningStreak(user.uid);

  // If no words are strictly due, provide early review words (up to 20 words) from their library
  if (words.length === 0) {
    const allProgresses: any[] = await prisma.vocabularyProgress.findMany({
      where: { userId: user.uid },
      include: {
        vocabulary: {
          include: { topic: true },
        },
      },
      orderBy: { nextReviewAt: 'asc' },
      take: 20,
    });

    words = allProgresses.map((p: any) => ({
      id: p.vocabulary.id,
      word: p.vocabulary.word,
      meaning: p.vocabulary.meaning,
      definition: p.vocabulary.definition,
      example: p.vocabulary.example,
      category: p.vocabulary.category,
      partOfSpeech: p.vocabulary.partOfSpeech,
      pronunciation: p.vocabulary.pronunciation,
      imageUrl: p.vocabulary.imageUrl,
      topicId: p.vocabulary.topicId,
      topicName: p.vocabulary.topic?.name || 'Từ vựng',
      srs: {
        status: p.status,
        interval: p.interval,
        easeFactor: p.easeFactor,
        repetitions: p.repetitions,
        reviewCount: p.reviewCount,
        lapseCount: p.lapseCount,
        nextReviewAt: p.nextReviewAt,
      },
    }));
  }

  if (words.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <div className="h-14 w-14 rounded-3xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mx-auto">
          <BookOpen className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-foreground">Chưa Có Từ Vựng Nào</h2>
          <p className="text-xs text-muted-foreground">
            Hãy khám phá các chủ đề từ vựng và lưu từ để bắt đầu chu kỳ ôn tập ngắt quãng (SRS).
          </p>
        </div>
        <Link
          href="/vocabulary"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-black/10"
        >
          <BookOpen className="h-4 w-4 text-brand" />
          <span>Đến Thư Viện Từ Vựng</span>
        </Link>
      </div>
    );
  }

  return <SrsReviewSessionClient initialWords={words} streakDays={streakData.streak} />;
}
