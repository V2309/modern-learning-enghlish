'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  PlayCircle,
  BookOpen,
  Clock,
  CheckCircle2,
  ChevronRight,
  Star,
  Layers,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface CourseDetailClientProps {
  course: any;
  userId: string;
  initialCompletedLessonIds: string[];
  basePath?: string; // e.g. '/my-courses/[courseId]' or '/courses/[courseId]'
}

const LEVEL_LABEL: Record<string, { label: string; cls: string }> = {
  Beginner: { label: 'Cơ bản', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  Intermediate: { label: 'Trung cấp', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  Advanced: { label: 'Nâng cao', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
};

export default function CourseDetailClient({
  course,
  userId,
  initialCompletedLessonIds,
  basePath,
}: CourseDetailClientProps) {
  const courseBasePath = basePath ?? `/courses/${course.id}`;
  const backPath = basePath ? '/my-courses' : '/courses';
  const completedIds = new Set(initialCompletedLessonIds);

  // Tất cả lessons trong toàn course
  const allLessons: any[] = course.lessons || [];

  // Topics của course
  const topics: any[] = course.topics || [];

  // Lessons không thuộc topic nào
  const generalLessons = allLessons.filter(
    (l) => !l.topicId || !topics.some((t) => t.id === l.topicId)
  );

  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const level = LEVEL_LABEL[course.level] ?? { label: course.level, cls: 'bg-muted text-muted-foreground' };

  const getTopicProgress = (topic: any) => {
    const tLessons: any[] = topic.lessons || [];
    if (tLessons.length === 0) return { completed: 0, total: 0, pct: 0 };
    const done = tLessons.filter((l) => completedIds.has(l.id)).length;
    return { completed: done, total: tLessons.length, pct: Math.round((done / tLessons.length) * 100) };
  };

  const hasTopics = topics.length > 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* ── Back navigation ── */}
      <Link
        href={backPath}
        className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group mb-10"
      >
        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-semibold">{backPath === '/my-courses' ? 'My Courses' : 'Tất cả khóa học'}</span>
      </Link>

      {/* ── Hero section ── */}
      <div className="grid lg:grid-cols-12 gap-10 mb-14">
        {/* Left — info */}
        <div className="lg:col-span-7 space-y-5">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase', level.cls)}>
              {level.label}
            </span>
            {course.subject && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-muted text-muted-foreground">
                {course.subject}
              </span>
            )}
            {course.isBestSeller && (
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase bg-amber-500/10 text-amber-600">
                🏆 Bán chạy nhất
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-foreground leading-tight">
            {course.title}
          </h1>

          <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
            {course.description.replace(/[#*`]/g, '').slice(0, 220)}
            {course.description.length > 220 ? '…' : ''}
          </p>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-5 text-sm font-semibold text-muted-foreground">
            {course.rating && (
              <div className="flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-foreground font-bold">{course.rating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <PlayCircle className="h-4 w-4 text-primary" />
              <span>{totalLessons} bài giảng</span>
            </div>
            {hasTopics && (
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-primary" />
                <span>{topics.length} chủ đề</span>
              </div>
            )}
            {course.weeks && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" />
                <span>{course.weeks} tuần</span>
              </div>
            )}
          </div>

          {/* Overall progress */}
          {totalLessons > 0 && (
            <div className="p-5 rounded-2xl bg-primary/8 border border-primary/20 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-primary">
                  <TrendingUp className="h-4 w-4" />
                  Tiến độ của bạn
                </div>
                <span className="text-sm font-black text-primary">{progressPercent}%</span>
              </div>
              <div className="h-2.5 w-full bg-primary/15 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {completedCount} / {totalLessons} bài học đã hoàn thành
              </p>
            </div>
          )}
        </div>

        {/* Right — thumbnail */}
        <div className="lg:col-span-5">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-video bg-muted">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay play hint */}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-xl">
                <PlayCircle className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Course content ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Nội dung khóa học
          </h2>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full">
            {totalLessons} bài · {topics.length} chủ đề
          </span>
        </div>

        {/* ── Topic cards ── */}
        {hasTopics && (
          <div className="space-y-4">
            {topics.map((topic, idx) => {
              const prog = getTopicProgress(topic);
              const isComplete = prog.total > 0 && prog.completed === prog.total;
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link
                    href={`${courseBasePath}/${topic.id}`}
                    className="group flex items-center gap-5 p-5 rounded-2xl bg-card border border-border hover:border-primary/50 hover:shadow-md hover:shadow-primary/5 transition-all"
                  >
                    {/* Index badge */}
                    <div
                      className={cn(
                        'h-12 w-12 shrink-0 rounded-xl flex items-center justify-center font-black text-base shadow-sm transition-colors',
                        isComplete
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white'
                      )}
                    >
                      {isComplete ? <CheckCircle2 className="h-6 w-6" /> : idx + 1}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                        Chủ đề {idx + 1}
                      </p>
                      <h3 className="font-extrabold text-foreground group-hover:text-primary transition-colors truncate">
                        {topic.title}
                      </h3>
                      {topic.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {topic.description}
                        </p>
                      )}
                      {/* Mini progress */}
                      {prog.total > 0 && (
                        <div className="flex items-center gap-2 pt-1">
                          <div className="h-1.5 w-24 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                isComplete ? 'bg-emerald-500' : 'bg-primary'
                              )}
                              style={{ width: `${prog.pct}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">
                            {prog.completed}/{prog.total} bài
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Meta & arrow */}
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="hidden sm:flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1 text-xs font-bold text-muted-foreground">
                          <PlayCircle className="h-3.5 w-3.5 text-primary" />
                          {prog.total} bài giảng
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ── General lessons (without topic) — shown if any ── */}
        {generalLessons.length > 0 && (
          <div className="mt-6 space-y-3">
            {hasTopics && (
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest px-1">
                Bài học khác
              </h3>
            )}
            {generalLessons.map((lesson, idx) => {
              const done = completedIds.has(lesson.id);
              return (
                <motion.div
                  key={lesson.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (topics.length + idx) * 0.04 }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-2xl border bg-card transition-all',
                    done
                      ? 'border-emerald-500/30 bg-emerald-500/5'
                      : 'border-border hover:border-primary/30'
                  )}
                >
                  <div
                    className={cn(
                      'h-9 w-9 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold',
                      done ? 'bg-emerald-500/15 text-emerald-500' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {done ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{lesson.title}</p>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      <Clock className="h-3 w-3" />
                      {lesson.duration}
                    </div>
                  </div>
                  {done && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                      Hoàn thành
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!hasTopics && generalLessons.length === 0 && (
          <div className="text-center py-20 rounded-3xl border border-border bg-card text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-bold">Chưa có nội dung trong khóa học này.</p>
          </div>
        )}
      </div>

      {/* ── Syllabus description ── */}
      {course.description && course.description.length > 60 && (
        <div className="mt-14 p-8 md:p-10 rounded-[2.5rem] bg-card border border-border">
          <h2 className="text-xl font-extrabold text-foreground mb-6">Giới thiệu khóa học</h2>
          <div className="prose dark:prose-invert prose-sm md:prose-base max-w-none prose-headings:text-primary prose-strong:text-foreground/90 prose-li:text-muted-foreground prose-p:text-muted-foreground">
            <ReactMarkdown>{course.description}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
