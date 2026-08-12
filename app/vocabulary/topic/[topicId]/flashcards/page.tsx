import React from 'react';
import { getCurrentUser } from '@/services/user.service';
import FlashcardPageClient from '@/components/topic/FlashcardPageClient';

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ topicId: string }>;
}

export default async function FlashcardsPage(props: PageProps) {
  const params = await props.params;
  const topicId = params.topicId;

  const user = await getCurrentUser();
  if (!user) {
    return <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">Vui lòng đăng nhập để luyện thẻ.</div>;
  }

  return <FlashcardPageClient userId={user.uid} topicId={topicId} />;
}

