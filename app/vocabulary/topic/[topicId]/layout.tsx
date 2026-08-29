import React from 'react';
import { getTopicById } from '@/services/topic.service';
import { getVocabularyByTopic } from '@/services/vocabulary.service';
import { getCurrentUser } from '@/services/user.service';
import { getVocabularyProgress } from '@/services/progress.service';
import TopicLayoutClient from '@/components/topic/TopicLayoutClient';

export const dynamic = "force-dynamic";

interface LayoutProps {
  params: Promise<{ topicId: string }>;
  children: React.ReactNode;
}

export default async function TopicLayout(props: LayoutProps) {
  const params = await props.params;
  const topicId = params.topicId;

  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Vui lòng đăng nhập để học từ vựng.
      </div>
    );
  }

  const topic = await getTopicById(topicId);
  if (!topic) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Chủ đề không tồn tại.
      </div>
    );
  }

  const words = await getVocabularyByTopic(topicId);
  const masteredProgresses = await getVocabularyProgress(user.uid);
  const initialMasteredWordIds = masteredProgresses
    .filter((vp) => vp.vocabulary.topicId === topicId && (vp.status === 'mastered' || vp.status === 'reviewing' || (vp.interval && vp.interval >= 1) || Boolean(vp.masteredAt)))
    .map((vp) => vp.vocabularyId);

  return (
    <TopicLayoutClient
      topic={topic}
      userId={user.uid}
      initialWords={words}
      initialMasteredWordIds={initialMasteredWordIds}
      isAdmin={user.role === 'admin'}
    >
      {props.children}
    </TopicLayoutClient>
  );
}
