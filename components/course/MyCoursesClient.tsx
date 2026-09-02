'use client';

import React, { useState, useEffect } from 'react';
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
import Pagination from '@/components/Pagination';

interface MyCoursesClientProps {
  courses: any[];
  progressMap: Record<string, { completed: number; total: number; pct: number }>;
}

const LEVEL_LABEL: Record<string, { label: string; cls: string }> = {
  Beginner: { label: 'Cơ bản', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' },
  Intermediate: { label: 'Trung cấp', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25' },
  Advanced: { label: 'Nâng cao', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25' },
};

const PAGE_SIZE = 8;

export default function MyCoursesClient({ courses, progressMap }: MyCoursesClientProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(courses.length / PAGE_SIZE);

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedCourses = courses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  if (courses.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-md mx-auto space-y-5">
          <div className="h-20 w-20 rounded-3xl bg-muted border-2 border-border flex items-center justify-center mx-auto shadow-2xs">
            <GraduationCap className="h-10 w-10 text-brand" />
          </div>
          <h2 className="text-2xl font-black text-foreground">Chưa có khóa học nào</h2>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium">
            Bạn chưa đăng ký khóa học nào. Khám phá và nhập mã truy cập để bắt đầu học.
          </p>
          <Link
            href="/courses"
            className="btn-3d-duo inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-black"
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
    <div className="w-full select-none">
      {/* Header */}
      <div className="mb-8 space-y-1.5">
        <h1 className="text-2xl sm:text-3xl font-black text-foreground flex items-center gap-2.5 tracking-tight">
          <GraduationCap className="h-8 w-8 text-brand" />
          Khóa Học Của Tôi
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground font-medium">
          {courses.length} khóa học đang theo dõi · <span className="font-bold text-foreground">{totalCompleted}/{totalLessons}</span> bài học đã hoàn thành
        </p>
      </div>

      {/* Overall progress */}
      {totalLessons > 0 && (
        <div className="mb-8 p-6 rounded-3xl bg-card border-2 border-brand/20 shadow-[0_4px_0_0_theme(colors.border)] flex items-center gap-5">
          <div className="h-12 w-12 rounded-2xl bg-brand/10 flex items-center justify-center shrink-0 border-2 border-brand/20 shadow-2xs">
            <TrendingUp className="h-6 w-6 text-brand" />
          </div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-foreground">Tiến độ học tập tổng thể</span>
              <span className="text-xs font-black text-brand">{overallPct}%</span>
            </div>
            <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full bg-brand rounded-full"
              />
            </div>
            <p className="text-[11px] font-semibold text-muted-foreground">{totalCompleted} bài xong / {totalLessons} bài tổng</p>
          </div>
        </div>
      )}

      {/* Course grid: 4 columns on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {paginatedCourses.map((course, i) => {
          const prog = progressMap[course.id] ?? { completed: 0, total: 0, pct: 0 };
          const level = LEVEL_LABEL[course.level] ?? { label: course.level, cls: 'bg-muted text-muted-foreground border-border/60' };
          const topicsCount = course.topics?.length ?? 0;

          return (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link
                href={`/my-courses/${course.id}`}
                className="group flex flex-col bg-card border-2 border-border/80 rounded-3xl overflow-hidden shadow-[0_6px_0_0_theme(colors.border)] hover:border-brand/50 hover:shadow-[0_8px_0_0_theme(colors.border)] transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden bg-muted border-b-2 border-border/70">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                  />
                  {/* Progress overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
                    <div
                      className="h-full bg-brand transition-all"
                      style={{ width: `${prog.pct}%` }}
                    />
                  </div>
                  {prog.pct === 100 && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-xl shadow-xs border border-emerald-600">
                      Hoàn thành
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col flex-1 space-y-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    <span className={cn('px-2.5 py-0.5 rounded-xl text-[9px] font-black tracking-wider uppercase border', level.cls)}>
                      {level.label}
                    </span>
                    {course.subject && (
                      <span className="px-2.5 py-0.5 bg-muted text-muted-foreground rounded-xl text-[9px] font-black tracking-wider uppercase border border-border/60">
                        {course.subject}
                      </span>
                    )}
                  </div>

                  <h3 className="font-black text-foreground group-hover:text-brand transition-colors text-sm sm:text-base line-clamp-2 flex-1 leading-snug">
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
                      <PlayCircle className="h-3.5 w-3.5 text-brand" />
                      <span>{course.lessons?.length ?? 0} bài</span>
                    </div>
                    {topicsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-brand" />
                        <span>{topicsCount} chủ đề</span>
                      </div>
                    )}
                    {course.weeks && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-brand" />
                        <span>{course.weeks} tuần</span>
                      </div>
                    )}
                  </div>

                  {/* Progress row */}
                  <div className="space-y-1.5 pt-2.5 border-t border-border/50">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-muted-foreground">{prog.completed}/{prog.total} bài hoàn thành</span>
                      <span className="text-brand font-black">{prog.pct}%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/60">
                      <div className="h-full bg-brand rounded-full transition-all" style={{ width: `${prog.pct}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-black text-brand">
                      {prog.pct === 0 ? 'Bắt đầu học' : prog.pct === 100 ? 'Ôn lại khóa học' : 'Tiếp tục học'}
                    </span>
                    <ChevronRight className="h-4 w-4 text-brand stroke-[3] group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={courses.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
