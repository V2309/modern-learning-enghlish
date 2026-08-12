import React from "react";
import { getDictationTopicForPractice } from "@/actions/dictation/topic.actions";
import DictationPractice from "@/components/dictation/DictationPractice";
import { getCurrentUser } from "@/services/user.service";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface PracticePageProps {
  params: Promise<{
    topicId: string;
  }>;
}

export default async function DictationTopicPracticePage({ params }: PracticePageProps) {
  const user = await getCurrentUser();
  const { topicId } = await params;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <h1 className="text-2xl font-black text-foreground mb-2">Sign in required</h1>
        <p className="text-sm text-muted-foreground mb-6">
          You must be signed in to practice dictation exercises.
        </p>
        <Link
          href="/auth/sign-in"
          className="inline-block px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-sm text-white transition-all"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const res = await getDictationTopicForPractice(topicId);

  if (!res.success || !res.topic) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <AlertCircle className="mx-auto h-12 w-12 text-destructive mb-4 animate-bounce" />
        <h1 className="text-2xl font-black text-foreground mb-2">Topic not found</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {res.error || "The dictation topic you are looking for does not exist."}
        </p>
        <Link href="/dictation">
          <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-foreground text-background font-bold text-sm mx-auto hover:bg-foreground/90 transition-all">
            <ArrowLeft size={16} />
            <span>Back to Topics</span>
          </button>
        </Link>
      </div>
    );
  }

  const { topic, startFromIndex } = res;

  return (
    <main className="container mx-auto px-4 py-8 ">
      <DictationPractice
        topic={topic}
        sentences={topic.sentences}
        startFromIndex={startFromIndex}
      />
    </main>
  );
}
