import React from "react";
import { getDictationTopics } from "@/actions/dictation/topic.actions";
import DictationTopicList from "@/components/dictation/DictationTopicList";
import { Headphones, Sparkles, BookOpen } from "lucide-react";
import { getCurrentUser } from "@/services/user.service";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dictation - Nghe và chép chính tả",
  description: "Improve your English listening and writing skills with our dictation exercises.",
};

export default async function DictationPage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <Headphones className="mx-auto h-12 w-12 text-primary mb-4 animate-bounce" />
        <h1 className="text-2xl font-black text-foreground mb-2">Sign in required</h1>
        <p className="text-sm text-muted-foreground mb-6">
          You must be signed in to access dictation topics and track your progress.
        </p>
        <Link
          href="/auth/sign-in"
          className="inline-block px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 font-bold text-sm text-white transition-all shadow-md shadow-primary/20"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  const res = await getDictationTopics();
  const topics = res.success && res.topics ? res.topics : [];

  // Calculate high-level stats for user summary banner
  const attemptedTopicsCount = topics.filter((t) => t.progress > 0).length;
  const completedTopicsCount = topics.filter((t) => t.progress === 100).length;
  
  const totalAccuracySum = topics
    .filter((t) => t.progress > 0)
    .reduce((sum, t) => sum + t.averageAccuracy, 0);
  const overallAvgAccuracy = attemptedTopicsCount > 0 
    ? Math.round(totalAccuracySum / attemptedTopicsCount) 
    : 0;

  return (
    <div className="w-full space-y-8">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-card border border-border/80 p-6 md:p-8 rounded-3xl">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 px-3.5 py-1 rounded-full border border-brand/20">
            <Headphones size={13} />
            Luyện Nghe Chép Chính Tả AI
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Luyện Nghe <span className="text-brand">Dictation</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg leading-relaxed">
            Lắng nghe ngữ điệu bản xứ và ghi lại chính xác từng câu. Rèn luyện phản xạ nghe, nối âm, từ vựng và ngữ pháp toàn diện.
          </p>
        </div>

        {/* User Stats Card in Header */}
        {attemptedTopicsCount > 0 && (
          <div className="flex items-center gap-4 bg-muted/40 border border-border/60 p-4 rounded-2xl shadow-xs self-start md:self-auto min-w-[200px] justify-around">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Đã hoàn thành</span>
              <span className="text-base font-black text-foreground">{completedTopicsCount}/{topics.length}</span>
            </div>
            <div className="h-8 w-px bg-border/60" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Độ chính xác</span>
              <span className="text-base font-black text-brand flex items-center gap-0.5">
                <Sparkles size={13} className="text-brand" />
                {overallAvgAccuracy}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Topics Grid */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen size={18} className="text-brand" />
            <span>Chủ Đề Luyện Nghe</span>
          </h2>
          {user.role === "admin" && (
            <Link
              href="/admin/dictation"
              className="text-xs font-bold text-brand hover:underline"
            >
              Trang Quản Trị &rarr;
            </Link>
          )}
        </div>
        <DictationTopicList topics={topics} />
      </div>
    </div>
  );
}
