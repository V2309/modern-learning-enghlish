import React from 'react';
import { getCurrentUser } from '@/services/user.service';
import { getLessonProgress, getVocabularyProgress } from '@/services/progress.service';
import { BookOpen, Award, CheckCircle2, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export default async function ProgressPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
        Vui lòng đăng nhập để xem tiến trình học tập.
      </div>
    );
  }

  const [lessons, vocabularies] = await Promise.all([
    getLessonProgress(user.uid),
    getVocabularyProgress(user.uid)
  ]);

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">Thành tích học tập</h1>
        <p className="text-muted-foreground text-lg">Xem chi tiết các bài học bạn đã vượt qua và kho từ vựng bạn đã tích lũy.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Completed Lessons Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2.5 bg-primary/10 border border-primary/20 text-primary rounded-xl">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Bài học đã hoàn thành ({lessons.length})</h2>
          </div>

          <div className="space-y-4">
            {lessons.length === 0 ? (
              <div className="p-8 text-center bg-card border border-border rounded-3xl text-sm text-muted-foreground italic">
                Chưa hoàn thành bài học nào. Hãy bắt đầu học ngay!
              </div>
            ) : (
              lessons.map((lp) => (
                <div key={lp.id} className="p-5 rounded-3xl bg-card border border-border flex items-center justify-between gap-4 hover:border-primary/30 transition-colors">
                  <div className="space-y-1">
                    <h3 className="font-bold text-foreground text-base leading-tight">{lp.lesson.title}</h3>
                    <p className="text-xs text-muted-foreground">Thời lượng: {lp.lesson.duration}</p>
                    <span className="text-[10px] text-muted-foreground/60 block">
                      Hoàn thành vào: {new Date(lp.completedAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <Link 
                    href={`/courses/${lp.lesson.courseId}`} 
                    className="p-2 bg-muted hover:bg-primary hover:text-white rounded-xl transition-all text-muted-foreground shrink-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mastered Vocabulary Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl">
              <Award className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-black text-foreground">Từ vựng đã thuộc ({vocabularies.length})</h2>
          </div>

          <div className="space-y-4">
            {vocabularies.length === 0 ? (
              <div className="p-8 text-center bg-card border border-border rounded-3xl text-sm text-muted-foreground italic">
                Chưa đánh dấu thuộc từ vựng nào. Hãy ôn tập trong danh sách từ vựng!
              </div>
            ) : (
              vocabularies.map((vp) => (
                <div key={vp.id} className="p-5 rounded-3xl bg-card border border-border flex items-center justify-between gap-4 hover:border-emerald-500/30 transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-foreground text-lg leading-tight">{vp.vocabulary.word}</h3>
                      <span className="text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full uppercase">
                        {vp.vocabulary.partOfSpeech}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-normal line-clamp-1">{vp.vocabulary.meaning}</p>
                    <span className="text-[10px] text-muted-foreground/60 block">
                      Đã thuộc vào: {new Date(vp.masteredAt).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <Link 
                    href={`/vocabulary/topic/${vp.vocabulary.topicId}`} 
                    className="p-2 bg-muted hover:bg-emerald-500 hover:text-white rounded-xl transition-all text-muted-foreground shrink-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
