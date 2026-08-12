import React from 'react';
import { getCurrentUser } from '@/services/user.service';
import VocabListPageClient from '@/components/topic/VocabListPageClient';

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default async function TopicDetailPage(props: PageProps) {
  const params = await props.params;
  const topicId = params.topicId;

  const user = await getCurrentUser();
  if (!user) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Vui lòng đăng nhập để học từ vựng.</div>;
  }

  return (
    <VocabListPageClient
      userId={user.uid}
      topicId={topicId}
      isAdmin={user.role === 'admin'}
    />
  );
}
