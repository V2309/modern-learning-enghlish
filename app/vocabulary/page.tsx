import React from 'react';
import { getTopics } from '@/services/topic.service';
import { getCurrentUser } from '@/services/user.service';
import VocabularyClient from '@/components/topic/VocabularyClient';

export const dynamic = "force-dynamic";

export default async function VocabularyPage() {
  const [topics, user] = await Promise.all([
    getTopics(),
    getCurrentUser()
  ]);

  return <VocabularyClient initialTopics={topics} userId={user?.uid || ""} />;
}
