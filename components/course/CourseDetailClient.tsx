'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Lock,
  Folder,
  FolderCheck,
  FolderOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { AccessCodeModal } from '@/components/course/AccessCodeModal';
import Pagination from '@/components/Pagination';

interface CourseDetailClientProps {
  course: any;
  userId: string;
  initialCompletedLessonIds: string[];
  basePath?: string; // e.g. '/my-courses/[courseId]' or '/courses/[courseId]'
  isUnlocked?: boolean;
}

const LEVEL_LABEL: Record<string, { label: string; cls: string }> = {
  Beginner: { label: 'Cơ bản', cls: 'bg-brand/10 text-brand border-brand/20' },
  Intermediate: { label: 'Trung cấp', cls: 'bg-muted text-foreground border-border' },
  Advanced: { label: 'Nâng cao', cls: 'bg-primary text-primary-foreground border-border' },
};

const TOPIC_PAGE_SIZE = 8;

export default function CourseDetailClient({
  course,
  userId,
  initialCompletedLessonIds,
  basePath,
  isUnlocked = true,
}: CourseDetailClientProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<'curriculum' | 'objectives' | 'info' | 'reviews'>('curriculum');
  const [showAccessModal, setShowAccessModal] = React.useState(false);
  const [topicPage, setTopicPage] = React.useState(1);

  const courseBasePath = basePath ?? `/courses/${course.id}`;
  const backPath = basePath ? '/my-courses' : '/courses';
  const completedIds = new Set(initialCompletedLessonIds);

  const objectivesList = React.useMemo(() => {
    try {
      return course.objectives ? JSON.parse(course.objectives) : [];
    } catch {
      return [];
    }
  }, [course.objectives]);

  const infoDetails = React.useMemo(() => {
    try {
      return course.info ? JSON.parse(course.info) : {};
    } catch {
      return {};
    }
  }, [course.info]);

  // All lessons
  const allLessons: any[] = course.lessons || [];

  // Topics of course
  const topics: any[] = course.topics || [];

  // General lessons not assigned to any topic
  const generalLessons = allLessons.filter(
    (l) => !l.topicId || !topics.some((t) => t.id === l.topicId)
  );

  const totalLessons = allLessons.length;
  const completedCount = allLessons.filter((l) => completedIds.has(l.id)).length;
  const progressPercent =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const level = LEVEL_LABEL[course.level] ?? { label: course.level, cls: 'bg-muted text-muted-foreground border-border/60' };

  const getTopicProgress = (topic: any) => {
    const tLessons: any[] = topic.lessons || [];
    if (tLessons.length === 0) return { completed: 0, total: 0, pct: 0 };
    const done = tLessons.filter((l) => completedIds.has(l.id)).length;
    return { completed: done, total: tLessons.length, pct: Math.round((done / tLessons.length) * 100) };
  };

  const hasTopics = topics.length > 0;
  const totalTopicPages = Math.ceil(topics.length / TOPIC_PAGE_SIZE);

  const paginatedTopics = React.useMemo(() => {
    return topics.slice((topicPage - 1) * TOPIC_PAGE_SIZE, topicPage * TOPIC_PAGE_SIZE);
  }, [topics, topicPage]);

  return (
    <div className="w-full space-y-6 select-none">
      {/* ── 1. Back Navigation Bar ── */}
      <div>
        <Link
          href={backPath}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-none bg-card border border-border text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors group shadow-2xs"
        >
          <ChevronLeft className="h-3.5 w-3.5 group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
          <span>{backPath === '/my-courses' ? 'Khóa học của tôi' : 'Tất cả khóa học'}</span>
        </Link>
      </div>

      {/* ── 2. Hero Section (Connected Bento Overview) ── */}
      <div className="grid lg:grid-cols-12 gap-px bg-border border border-border overflow-hidden rounded-none">
        {/* Left — Course Details */}
        <div className="lg:col-span-7 bg-card p-6 sm:p-8 flex flex-col justify-between space-y-5 relative overflow-hidden group">
          {/* Light Sweep Sheen */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none z-10" />
          <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none font-bold">+</span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none font-bold">+</span>

          <div className="space-y-3 relative z-10">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-brand font-bold flex items-center gap-1.5 mr-2">
                <span className="w-1.5 h-1.5 bg-brand animate-pulse" />
                01 · CHI TIẾT KHÓA HỌC
              </span>
              <span className={cn('px-2.5 py-0.5 rounded-none text-[9px] font-bold tracking-wider uppercase border', level.cls)}>
                {level.label}
              </span>
              {course.subject && (
                <span className="px-2.5 py-0.5 rounded-none text-[9px] font-bold tracking-wider uppercase bg-muted text-muted-foreground border border-border">
                  {course.subject}
                </span>
              )}
              {course.isBestSeller && (
                <span className="px-2.5 py-0.5 rounded-none text-[9px] font-bold tracking-wider uppercase bg-brand text-brand-foreground shadow-2xs">
                  Nổi Bật
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm font-normal">
              {course.description.replace(/[#*`]/g, '').slice(0, 240)}
              {course.description.length > 240 ? '…' : ''}
            </p>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-muted-foreground pt-1">
              {course.rating && (
                <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-none border border-border">
                  <Star className="h-3.5 w-3.5 fill-brand text-brand" />
                  <span className="text-foreground font-bold">{course.rating.toFixed(1)}</span>
                </div>
              )}
              <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-none border border-border">
                <PlayCircle className="h-3.5 w-3.5 text-brand" />
                <span>{totalLessons} bài giảng</span>
              </div>
              {hasTopics && (
                <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-none border border-border">
                  <Layers className="h-3.5 w-3.5 text-brand" />
                  <span>{topics.length} chủ đề</span>
                </div>
              )}
              {course.weeks && (
                <div className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-none border border-border">
                  <Clock className="h-3.5 w-3.5 text-brand" />
                  <span>{course.weeks} tuần</span>
                </div>
              )}
            </div>
          </div>

          {/* Overall Progress Box (In My Courses) */}
          {basePath && totalLessons > 0 && (
            <div className="p-4 sm:p-5 rounded-none bg-muted/40 border border-border space-y-2.5 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-brand uppercase tracking-wider">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span>Tiến độ học tập của bạn</span>
                </div>
                <span className="text-sm font-black text-brand">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-muted border border-border rounded-none overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-brand rounded-none"
                />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">
                Đã hoàn thành <span className="font-bold text-foreground">{completedCount}</span> / <span className="font-bold text-foreground">{totalLessons}</span> bài học
              </p>
            </div>
          )}

          {/* Activation Box for /courses/[id] */}
          {!basePath && (
            isUnlocked ? (
              <div className="p-4 sm:p-5 rounded-none bg-muted/30 border border-border space-y-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-none bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                    <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Khóa học đã kích hoạt</h4>
                    <p className="text-xs text-muted-foreground font-normal">Khóa học này đã sẵn sàng. Hãy bắt đầu học ngay nhé!</p>
                  </div>
                </div>

                <Link
                  href={`/my-courses/${course.id}`}
                  className="w-full py-2.5 rounded-none border border-border bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <PlayCircle className="h-4 w-4" />
                  <span>Vào học ngay</span>
                </Link>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-none bg-muted/30 border border-border space-y-3 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-none bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
                    <Lock className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Khóa học chưa kích hoạt</h4>
                    <p className="text-xs text-muted-foreground font-normal">Nhập mã kích hoạt để bắt đầu mở khóa học tập.</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowAccessModal(true)}
                  className="w-full py-2.5 rounded-none border border-border bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Lock className="h-4 w-4" />
                  <span>Kích hoạt khóa học</span>
                </button>
              </div>
            )
          )}
        </div>

        {/* Right — Thumbnail */}
        <div className="lg:col-span-5 bg-card relative overflow-hidden flex items-center justify-center min-h-[240px] group">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] flex items-center justify-center">
            <div className="h-14 w-14 rounded-none bg-background/85 backdrop-blur border border-border flex items-center justify-center shadow-lg">
              <PlayCircle className="h-8 w-8 text-foreground" />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Content Area ── */}
      {!basePath ? (
        /* Tabs layout for public course preview */
        <div className="space-y-4">
          <div className="flex flex-wrap gap-1 p-1 bg-muted border border-border rounded-none">
            {[
              { id: 'curriculum', label: 'Chương trình học' },
              { id: 'objectives', label: 'Mục tiêu khóa học' },
              { id: 'info', label: 'Thông tin khóa học' },
              { id: 'reviews', label: 'Đánh giá học viên' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  'px-3.5 py-1.5 rounded-none text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer border',
                  activeTab === tab.id
                    ? 'bg-card text-foreground border-border shadow-2xs font-extrabold'
                    : 'bg-transparent text-muted-foreground border-transparent hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'curriculum' && (
              <div className="p-6 sm:p-7 rounded-none bg-card border border-border space-y-4">
                <h3 className="text-lg font-bold text-foreground">{course.title}</h3>
                <div className="border-t border-border pt-4 space-y-3">
                  {[
                    'Mục tiêu khóa học thiết kế bài bản theo thang điểm chuẩn CEFR / TOEIC.',
                    'Bộ bài giảng hướng dẫn chi tiết cách làm từng dạng câu hỏi và bài tập tương tác.',
                    'Làm quen với các dạng đề thi thực tế có phản hồi chấm điểm thông minh.',
                    'Cải thiện phát âm, từ vựng và ngữ pháp toàn diện.',
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span className="text-brand shrink-0 text-sm font-bold">✓</span>
                      <p className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'objectives' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Bạn sẽ đạt được những gì?</h3>
                <div className="grid md:grid-cols-2 gap-px bg-border border border-border overflow-hidden rounded-none">
                  {objectivesList.map((obj: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start p-5 bg-card">
                      <CheckCircle2 className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm font-medium text-foreground leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Chi tiết thông tin khóa học</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-px bg-border border border-border overflow-hidden rounded-none">
                  {[
                    { label: 'Thời lượng tổng cộng', value: infoDetails.duration || '36 giờ học', icon: Clock },
                    { label: 'Tổng số bài giảng', value: infoDetails.lectures || `${totalLessons} bài học video`, icon: BookOpen },
                    { label: 'Dịch vụ hỗ trợ', value: infoDetails.support || 'Giảng viên hỗ trợ 24/7', icon: CheckCircle2 },
                    { label: 'Chứng chỉ kết thúc', value: infoDetails.certificate || 'Cấp chứng nhận hoàn thành', icon: Star },
                  ].map((item, idx) => (
                    <div key={idx} className="p-5 bg-card flex items-center gap-3.5">
                      <div className="p-2.5 rounded-none bg-muted border border-border shrink-0">
                        <item.icon className="h-4 w-4 text-brand" />
                      </div>
                      <div>
                        <div className="text-[11px] text-muted-foreground font-medium mb-0.5">{item.label}</div>
                        <div className="text-xs font-bold text-foreground">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {course.description && (
                  <div className="p-6 sm:p-7 rounded-none bg-card border border-border">
                    <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Mô tả chi tiết</h4>
                    <div className="prose dark:prose-invert prose-xs max-w-none text-muted-foreground">
                      <ReactMarkdown>{course.description}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-px bg-border border border-border overflow-hidden rounded-none">
                  {(course.reviews && course.reviews.length > 0) ? (
                    course.reviews.map((rev: any) => (
                      <div key={rev.id} className="p-5 bg-card flex flex-col justify-between gap-3">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-foreground">{rev.user?.name || 'Học viên ẩn danh'}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn('h-3 w-3', i < rev.rating ? 'fill-brand text-brand' : 'text-border')}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground font-normal leading-relaxed">{rev.comment}</p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground block self-end">
                          {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 bg-card text-xs text-muted-foreground font-medium">
                      Chưa có đánh giá nào cho khóa học này.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Syllabus Layout with Connected Bento Grid for /my-courses/[id] */
        <div className="space-y-4">
          <div className="p-4 sm:p-5 border border-border bg-card flex items-center justify-between rounded-none">
            <h2 className="text-xs sm:text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="h-4 w-4 text-brand" />
              <span>Chương Trình &amp; Nội Dung Khóa Học</span>
            </h2>
            <span className="text-[11px] font-bold text-brand bg-brand/10 border border-brand/20 px-2.5 py-1 rounded-none uppercase tracking-wider">
              {totalLessons} bài giảng · {topics.length} chủ đề
            </span>
          </div>

          {hasTopics && (
            <div className="space-y-4">
              {/* Connected Bento Topic Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border border border-border overflow-hidden rounded-none">
                {paginatedTopics.map((topic, idx) => {
                  const prog = getTopicProgress(topic);
                  const isComplete = prog.total > 0 && prog.completed === prog.total;
                  const topicNumber = (topicPage - 1) * TOPIC_PAGE_SIZE + idx + 1;

                  return (
                    <div key={topic.id} className="h-full bg-card">
                      <div className="relative group flex flex-col justify-between h-full bg-card p-5 sm:p-6 hover:bg-muted/40 transition-colors duration-200 rounded-none overflow-hidden">
                        {/* Light Sweep Sheen */}
                        <div className="absolute inset-0 overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none" />
                        </div>

                        {/* Technical Crosshairs */}
                        <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none font-bold">+</span>
                        <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none font-bold">+</span>

                        <div>
                          {/* Header row */}
                          <div className="flex items-center justify-between gap-2 relative z-10">
                            <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold flex items-center gap-1.5">
                              <span className={cn('w-1.5 h-1.5', isComplete ? 'bg-muted-foreground' : 'bg-brand')} />
                              Chủ đề {String(topicNumber).padStart(2, '0')}
                            </span>

                            {isComplete ? (
                              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-muted border border-border px-2 py-0.5 rounded-none">
                                Hoàn thành
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-brand uppercase tracking-wider bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-none">
                                {prog.pct}%
                              </span>
                            )}
                          </div>

                          {/* Topic Title & Description */}
                          <Link href={`${courseBasePath}/${topic.id}`} className="mt-3.5 block group/link relative z-0">
                            <h3 className="font-bold text-foreground group-hover/link:text-brand transition-colors text-base leading-snug line-clamp-2">
                              {topic.title}
                            </h3>
                            {topic.description && (
                              <p className="text-xs text-muted-foreground font-normal line-clamp-2 mt-1.5 leading-relaxed">
                                {topic.description}
                              </p>
                            )}
                          </Link>
                        </div>

                        {/* Bottom stats & action */}
                        <div className="mt-5 pt-3.5 border-t border-border space-y-3 relative z-10">
                          <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                            <span>{topic.lessons?.length || 0} bài giảng</span>
                            <span className={cn(isComplete ? 'text-foreground font-bold' : 'text-brand font-bold')}>
                              {prog.completed}/{prog.total} bài
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-1.5 w-full bg-muted rounded-none overflow-hidden border border-border">
                            <div
                              className={cn('h-full rounded-none transition-all duration-500', isComplete ? 'bg-muted-foreground' : 'bg-brand')}
                              style={{ width: `${prog.pct}%` }}
                            />
                          </div>

                          {/* Action Button */}
                          <Link
                            href={`${courseBasePath}/${topic.id}`}
                            className="w-full py-2.5 rounded-none border border-border bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs text-center"
                          >
                            <span>{isComplete ? 'Ôn lại chủ đề' : 'Vào học ngay'}</span>
                            <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Topic Pagination */}
              <Pagination
                currentPage={topicPage}
                totalPages={totalTopicPages}
                totalItems={topics.length}
                pageSize={TOPIC_PAGE_SIZE}
                onPageChange={setTopicPage}
                variant="sharp"
              />
            </div>
          )}

          {generalLessons.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <h3 className="font-bold text-foreground text-xs uppercase tracking-wider">Bài giảng chung</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border border border-border overflow-hidden rounded-none">
                {generalLessons.map((lesson) => {
                  const done = completedIds.has(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className="flex flex-col justify-between p-4 bg-card space-y-3 hover:bg-muted/40 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn('p-2 rounded-none border shrink-0', done ? 'bg-muted text-muted-foreground border-border' : 'bg-brand/10 text-brand border-brand/20')}>
                          <PlayCircle className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-xs sm:text-sm text-foreground line-clamp-2 leading-snug">{lesson.title}</p>
                          <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">{lesson.duration}</span>
                        </div>
                      </div>
                      {done && (
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-muted border border-border px-2 py-0.5 rounded-none self-start">
                          Hoàn thành
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {!hasTopics && generalLessons.length === 0 && (
            <div className="text-center py-16 border border-border bg-card text-muted-foreground text-xs sm:text-sm font-medium rounded-none">
              <BookOpen className="h-8 w-8 mx-auto mb-2 text-brand opacity-60" />
              <p className="font-bold">Chưa có nội dung trong khóa học này.</p>
            </div>
          )}
        </div>
      )}

      {showAccessModal && (
        <AccessCodeModal
          show={showAccessModal}
          course={course}
          onClose={() => setShowAccessModal(false)}
          onSuccess={(courseId) => {
            setShowAccessModal(false);
            router.push(`/my-courses/${courseId}`);
          }}
        />
      )}
    </div>
  );
}
