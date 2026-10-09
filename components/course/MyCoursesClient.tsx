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
  Beginner: { label: 'Cơ bản', cls: 'bg-brand/10 text-brand border-brand/20' },
  Intermediate: { label: 'Trung cấp', cls: 'bg-muted text-foreground border-border' },
  Advanced: { label: 'Nâng cao', cls: 'bg-primary text-primary-foreground border-border' },
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
      <div className="w-full py-16 text-center select-none">
        <div className="max-w-md mx-auto p-8 bg-card border border-border relative overflow-hidden rounded-none shadow-sm">
          <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 font-bold">+</span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 font-bold">+</span>
          <div className="h-14 w-14 bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-4 rounded-none text-2xl">
            🎓
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Chưa có khóa học nào</h2>
          <p className="text-xs text-muted-foreground mb-6 leading-relaxed">
            Bạn chưa đăng ký khóa học nào. Khám phá các khóa học trực tuyến và nhập mã truy cập để bắt đầu hành trình học tập.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-none border border-border bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground transition-colors text-xs font-bold uppercase tracking-wider"
          >
            <BookOpen className="h-4 w-4" />
            <span>Khám phá khóa học</span>
          </Link>
        </div>
      </div>
    );
  }

  const totalCompleted = Object.values(progressMap).reduce((s, p) => s + p.completed, 0);
  const totalLessons = Object.values(progressMap).reduce((s, p) => s + p.total, 0);
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;
  const completedCoursesCount = courses.filter((c) => (progressMap[c.id]?.pct ?? 0) === 100).length;

  return (
    <div className="w-full space-y-6 select-none">
      {/* ── 1. HEADER & LEARNING TELEMETRY (Connected Bento Grid) ── */}
      <div className="space-y-4">
        {/* Editorial Section Header Card */}
        <div className="p-6 sm:p-7 border border-border bg-card flex flex-col md:flex-row md:items-end justify-between gap-5 relative overflow-hidden group rounded-none">
          {/* Light Sweep Sheen */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none z-20" />

          {/* Technical Crosshairs */}
          <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>

          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] uppercase tracking-[0.18em] text-brand font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-brand animate-pulse" />
              01 · BẢNG ĐIỀU KHIỂN HỌC TẬP CỦA TÔI
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight">
              Khóa Học <span className="text-brand">Của Tôi</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-xl">
              Theo dõi tiến độ, ôn tập kiến thức định kỳ và hoàn thành các bài học tương tác để đạt chuẩn đầu ra mong muốn.
            </p>
          </div>

          {/* Quick Action Link */}
          <Link
            href="/courses"
            className="px-4 py-2.5 rounded-none border border-border bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs self-start md:self-auto relative z-10"
          >
            <BookOpen className="h-4 w-4" />
            <span>Khám Phá Thêm</span>
          </Link>
        </div>

        {/* Connected 3-Metric Hairline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border overflow-hidden rounded-none">
          {/* Metric 1: Enrolled Courses */}
          <div className="bg-card p-5 sm:p-6 relative overflow-hidden group hover:bg-muted/40 transition-colors rounded-none">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none z-20" />
            <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <div className="flex items-center justify-between text-muted-foreground mb-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-foreground">
                01 · KHÓA ĐANG HỌC
              </span>
              <div className="p-1.5 bg-muted text-foreground border border-border">
                <GraduationCap className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-0.5 relative z-10">
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {courses.length}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Khóa học bạn đã kích hoạt tham gia</p>
            </div>
          </div>

          {/* Metric 2: Lessons Completed */}
          <div className="bg-card p-5 sm:p-6 relative overflow-hidden group hover:bg-muted/40 transition-colors rounded-none">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none z-20" />
            <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <div className="flex items-center justify-between text-muted-foreground mb-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-foreground">
                02 · BÀI HỌC HOÀN THÀNH
              </span>
              <div className="p-1.5 bg-muted text-foreground border border-border">
                <PlayCircle className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-0.5 relative z-10">
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {totalCompleted} <span className="text-base font-normal text-muted-foreground">/ {totalLessons}</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">{completedCoursesCount} khóa học đã cán đích 100%</p>
            </div>
          </div>

          {/* Metric 3: Overall Completion Percentage */}
          <div className="bg-card p-5 sm:p-6 relative overflow-hidden group hover:bg-muted/40 transition-colors rounded-none">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none z-20" />
            <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <div className="flex items-center justify-between text-muted-foreground mb-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-brand">
                03 · TỔNG TIẾN ĐỘ
              </span>
              <div className="p-1.5 bg-brand/10 text-brand border border-brand/20">
                <TrendingUp className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-0.5 relative z-10">
              <div className="text-3xl font-extrabold text-brand tracking-tight">
                {overallPct}%
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Tỷ lệ hoàn thành trung bình toàn bộ khóa học</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. OVERALL PROGRESS TELEMETRY BAR ── */}
      {totalLessons > 0 && (
        <div className="p-5 sm:p-6 border border-border bg-card relative overflow-hidden rounded-none">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-brand" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wider">
                Tiến độ học tập tổng thể
              </span>
            </div>
            <div className="text-xs font-bold text-muted-foreground">
              <span className="text-foreground">{totalCompleted} bài xong</span> / {totalLessons} bài tổng ·{' '}
              <span className="text-brand font-black">{overallPct}%</span>
            </div>
          </div>
          <div className="h-2 w-full bg-muted border border-border rounded-none overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-brand rounded-none"
            />
          </div>
        </div>
      )}

      {/* ── 3. CONNECTED BENTO ENROLLED COURSE GRID ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border border border-border overflow-hidden rounded-none">
        {paginatedCourses.map((course, i) => {
          const prog = progressMap[course.id] ?? { completed: 0, total: 0, pct: 0 };
          const level = LEVEL_LABEL[course.level] ?? { label: course.level, cls: 'bg-muted text-muted-foreground border-border' };
          const topicsCount = course.topics?.length ?? 0;
          const globalIndex = (currentPage - 1) * PAGE_SIZE + i;
          const isFinished = prog.pct === 100;

          return (
            <div key={course.id} className="h-full bg-card">
              <div className="relative group flex flex-col justify-between h-full bg-card p-5 sm:p-6 hover:bg-muted/40 transition-colors duration-200 rounded-none overflow-hidden">
                {/* Light Sweep Sheen */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none" />
                </div>

                {/* Technical Crosshairs */}
                <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
                <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>

                <div>
                  {/* Top Header Row */}
                  <div className="flex items-center justify-between gap-2 relative z-20">
                    <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold flex items-center gap-1.5">
                      <span className={cn('w-1.5 h-1.5', isFinished ? 'bg-muted-foreground' : 'bg-brand')} />
                      {String(globalIndex + 1).padStart(2, '0')} · KHÓA HỌC
                    </span>

                    {/* Status badge */}
                    <span
                      className={cn(
                        'px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-none',
                        isFinished
                          ? 'bg-muted text-muted-foreground border-border'
                          : prog.pct > 0
                            ? 'bg-brand/10 text-brand border-brand/20'
                            : 'bg-muted text-muted-foreground border-border'
                      )}
                    >
                      {isFinished ? 'Hoàn thành' : prog.pct > 0 ? 'Đang học' : 'Chưa bắt đầu'}
                    </span>
                  </div>

                  {/* Thumbnail box (Sharp rectangular) */}
                  <Link
                    href={`/my-courses/${course.id}`}
                    className="mt-3.5 block aspect-video relative overflow-hidden bg-muted border border-border group/thumb"
                  >
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                    />

                    {/* Level Badge overlay */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={cn('px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-none', level.cls)}>
                        {level.label}
                      </span>
                    </div>

                    {/* Rating Badge overlay */}
                    {course.rating && (
                      <div className="absolute top-2.5 right-2.5 bg-card/95 border border-border px-2 py-0.5 text-[10px] font-bold text-foreground flex items-center gap-1 rounded-none shadow-2xs">
                        <Star className="h-3 w-3 fill-brand text-brand" />
                        <span>{course.rating.toFixed(1)}</span>
                      </div>
                    )}

                    {/* Hairline progress overlay at bottom of thumbnail */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted">
                      <div
                        className={cn('h-full transition-all', isFinished ? 'bg-muted-foreground' : 'bg-brand')}
                        style={{ width: `${prog.pct}%` }}
                      />
                    </div>
                  </Link>

                  {/* Course Title & Subject */}
                  <div className="mt-4 space-y-1.5 relative z-0">
                    {course.subject && (
                      <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                        {course.subject}
                      </span>
                    )}
                    <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug hover:text-brand transition-colors line-clamp-2">
                      <Link href={`/my-courses/${course.id}`}>{course.title}</Link>
                    </h3>
                  </div>

                  {/* Metadata telemetry */}
                  <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1">
                      <PlayCircle className="h-3.5 w-3.5 text-brand" />
                      <span>{course.lessons?.length ?? 0} bài</span>
                    </div>
                    {topicsCount > 0 && (
                      <div className="flex items-center gap-1">
                        <Layers className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>{topicsCount} chủ đề</span>
                      </div>
                    )}
                    {course.weeks && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                        <span>{course.weeks} tuần</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress tracker & Sharp CTA */}
                <div className="mt-5 pt-3.5 border-t border-border space-y-3 relative z-10">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted-foreground">
                        {prog.completed}/{prog.total} bài hoàn thành
                      </span>
                      <span className={cn('font-bold', isFinished ? 'text-muted-foreground' : 'text-brand')}>
                        {prog.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted border border-border rounded-none overflow-hidden">
                      <div
                        className={cn('h-full rounded-none transition-all duration-500', isFinished ? 'bg-muted-foreground' : 'bg-brand')}
                        style={{ width: `${prog.pct}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    href={`/my-courses/${course.id}`}
                    className="w-full px-4 py-2.5 rounded-none border border-border bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs text-center"
                  >
                    <span>
                      {prog.pct === 0 ? 'Bắt đầu học' : isFinished ? 'Ôn tập lại' : 'Tiếp tục học'}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            </div>
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
        variant="sharp"
      />
    </div>
  );
}
