import React from 'react';
import SentencePracticePageClient from '@/components/topic/SentencePracticePageClient';
import { getCurrentUser } from '@/services/user.service';
import { hasPaidCourseAccess } from '@/services/course.service';
import Link from 'next/link';
import { Lock, ArrowRight } from 'lucide-react';

import { getUserSentencePracticesByTopic } from '@/services/sentencePractice.service';

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default async function SentencePracticePage(props: PageProps) {
  const params = await props.params;
  const topicId = params.topicId;

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Vui lòng đăng nhập để sử dụng tính năng.
      </div>
    );
  }

  const hasAccess = await hasPaidCourseAccess(user.uid);

  if (!hasAccess) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex flex-col items-center justify-center p-8 text-center bg-card border border-border rounded-3xl max-w-lg mx-auto shadow-xl space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-md">
            <Lock className="h-8 w-8" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-black text-foreground">Tính năng bị giới hạn</h2>
            <p className="text-sm font-semibold text-muted-foreground leading-relaxed">
              Phần <strong>Luyện viết câu (Sentence Practice)</strong> chỉ dành riêng cho các thành viên đã kích hoạt ít nhất một khóa học trả phí.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/95 text-white font-extrabold text-sm rounded-xl transition-all shadow-md shadow-primary/25 cursor-pointer"
            >
              Xem danh sách khóa học
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rawSaved = await getUserSentencePracticesByTopic(user.uid, topicId);
  const initialPractices = rawSaved.map((p) => ({
    id: p.id,
    vocabularyId: p.vocabularyId,
    userSentence: p.userSentence,
    isCorrect: p.isCorrect,
    score: p.score,
    targetWordUsed: p.targetWordUsed,
    feedback: p.feedback,
    grammarErrors: p.grammarErrors,
    suggestedSentence: p.suggestedSentence,
    suggestedSentenceMeaning: p.suggestedSentenceMeaning,
    updatedAt: p.updatedAt,
  }));

  return (
    <SentencePracticePageClient
      topicId={topicId}
      initialPractices={initialPractices}
    />
  );
}
