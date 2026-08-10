import React from 'react';
import DictationPageClient from '@/components/topic/DictationPageClient';

export const dynamic = "force-dynamic";

export default async function DictationPage() {
  return <QuizPageClientWrapper />;
}

function QuizPageClientWrapper() {
  return <DictationPageClient />;
}
