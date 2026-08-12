import React from 'react';
import { getTopics } from '@/services/topic.service';
import { getCurrentUser } from '@/services/user.service';
import { getTopicProgress } from '@/services/progress.service';
import VocabularyClient from '@/components/topic/VocabularyClient';

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const user = await getCurrentUser();
  const [topics, progress] = await Promise.all([
    getTopics(),
    user ? getTopicProgress(user.uid) : Promise.resolve([])
  ]);

  const completedTopicIds = progress.map((p) => p.topicId);

  return (
    <VocabularyClient
      initialTopics={topics}
      userId={user?.uid || ""}
      completedTopicIds={completedTopicIds}
      isAdmin={user?.role === 'admin'}
    />
  );
}

