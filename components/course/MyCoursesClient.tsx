'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PlayCircle,
  Clock,
  BookOpen,
  ChevronRight,
  Star,
  TrendingUp,
  Layers,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyCoursesClientProps {
  courses: any[];
  progressMap: Record<string, { completed: number; total: number; pct: number }>;
}

const LEVEL_LABEL: Record<string, { label: string; cls: string }> = {
  Beginner: { label: 'Cơ bản', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  Intermediate: { label: 'Trung cấp', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  Advanced: { label: 'Nâng cao', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
};

export default function MyCoursesClient({ courses, progressMap }: MyCoursesClientProps) {
  if (courses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto space-y-5">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto">
            <GraduationCap className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground">Chưa có khóa học nào</h2>
          <p className="text-muted-foreground">
            Bạn chưa đăng ký khóa học nào. Khám phá và nhập mã truy cập để bắt đầu học.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
          >
            <BookOpen className="h-4 w-4" />
            Khám phá khóa học
          </Link>
        </div>
      </div>
    );
  }

  const totalCompleted = Object.values(progressMap).reduce((s, p) => s + p.completed, 0);
  const totalLessons = Object.values(progressMap).reduce((s, p) => s + p.total, 0);
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground flex items-center gap-2.5">
          <GraduationCap className="h-7 w-7 text-brand" />
          Khóa Học Của Tôi
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground">
          {courses.length} khóa học đang theo dõi · {totalCompleted}/{totalLessons} bài học đã hoàn thành
        </p>
      </div>

      {/* Overall progress */}
      {totalLessons > 0 && (
        <div className="mb-8 p-5 rounded-3xl bg-brand/5 border border-brand/20 flex items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-brand/15 flex items-center justify-center shrink-0 border border-brand/20">
            <TrendingUp className="h-6 w-6 text-brand" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Tiến độ học tập tổng thể</span>
              <span className="text-xs font-black text-brand">{overallPct}%</span>
            </div>
            <div className="h-2 w-full bg-brand/15 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-brand rounded-full"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">{totalCompleted} bài xong / {totalLessons} bài tổng</p>
          </div>
        </div>
      )}

      {/* Course grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, i) => {
          const prog = progressMap[course.id] ?? { completed: 0, total: 0, pct: 0 };
          const level = LEVEL_LABEL[course.level] ?? { label: course.level, cls: 'bg-muted text-muted-foreground' };
          const topicsCount = course.topics?.length ?? 0;

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                href={`/my-courses/${course.id}`}
                className="group flex flex-col bg-card border border-border/80 rounded-3xl overflow-hidden hover:border-brand/40 hover:shadow-xl transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  {/* Progress overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
                    <div
                      className="h-full bg-brand transition-all"
                      style={{ width: `${prog.pct}%` }}
                    />
                  </div>
                  {prog.pct === 100 && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md shadow-xs">
                      Hoàn thành
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-1 space-y-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={cn('px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase', level.cls)}>
                      {level.label}
                    </span>
                    {course.subject && (
                      <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[9px] font-bold tracking-wider uppercase border border-border/40">
                        {course.subject}
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-foreground group-hover:text-brand transition-colors line-clamp-2 flex-1">
                    {course.title}
                  </h3>

                  <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground">
                    {course.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {course.rating.toFixed(1)}
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <PlayCircle className="h-3 w-3 text-brand" />
                      {course.lessons?.length ?? 0} bài
                    </div>
                    {topicsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Layers className="h-3 w-3 text-brand" />
                        {topicsCount} chủ đề
                      </div>
                    )}
                    {course.weeks && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-brand" />
                        <span>{course.weeks} tuần</span>
                      </div>
                    )}
                  </div>

                  {/* Progress row */}
                  <div className="space-y-1.5 pt-2.5 border-t border-border/40">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground">{prog.completed}/{prog.total} bài hoàn thành</span>
                      <span className="text-brand">{prog.pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${prog.pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-bold text-brand">
                      {prog.pct === 0 ? 'Bắt đầu học' : prog.pct === 100 ? 'Ôn lại khóa học' : 'Tiếp tục học'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-brand group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
