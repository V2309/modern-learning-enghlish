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
  Beginner: { label: 'Cơ bản', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' },
  Intermediate: { label: 'Trung cấp', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25' },
  Advanced: { label: 'Nâng cao', cls: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25' },
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
    <div className="w-full space-y-8 select-none">
      {/* ── Back Navigation ── */}
      <div>
        <Link
          href={backPath}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border-2 border-border shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none text-muted-foreground hover:text-brand transition-all group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
          <span className="text-xs sm:text-sm font-black">{backPath === '/my-courses' ? 'Khóa học của tôi' : 'Tất cả khóa học'}</span>
        </Link>
      </div>

      {/* ── Hero Section ── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* Left — Course Details */}
        <div className="lg:col-span-7 space-y-4">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('px-3 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase border', level.cls)}>
              {level.label}
            </span>
            {course.subject && (
              <span className="px-3 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase bg-muted text-muted-foreground border border-border/60">
                {course.subject}
              </span>
            )}
            {course.isBestSeller && (
              <span className="px-3 py-1 rounded-xl text-[10px] font-black tracking-wider uppercase bg-brand text-brand-foreground shadow-xs">
                Nổi Bật
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight">
            {course.title}
          </h1>

          <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm font-medium">
            {course.description.replace(/[#*`]/g, '').slice(0, 240)}
            {course.description.length > 240 ? '…' : ''}
          </p>

          {/* Stats Row */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted-foreground pt-1">
            {course.rating && (
              <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-xl border border-border/60">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="text-foreground font-black">{course.rating.toFixed(1)}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-xl border border-border/60">
              <PlayCircle className="h-4 w-4 text-brand" />
              <span>{totalLessons} bài giảng</span>
            </div>
            {hasTopics && (
              <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-xl border border-border/60">
                <Layers className="h-4 w-4 text-brand" />
                <span>{topics.length} chủ đề</span>
              </div>
            )}
            {course.weeks && (
              <div className="flex items-center gap-1.5 bg-muted/60 px-3 py-1 rounded-xl border border-border/60">
                <Clock className="h-4 w-4 text-brand" />
                <span>{course.weeks} tuần</span>
              </div>
            )}
          </div>

          {/* Overall Progress Box (In My Courses) */}
          {basePath && totalLessons > 0 && (
            <div className="p-6 rounded-3xl bg-card border-2 border-brand/20 shadow-[0_5px_0_0_theme(colors.border)] space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-black text-brand uppercase tracking-wider">
                  <TrendingUp className="h-4 w-4" />
                  Tiến độ học tập của bạn
                </div>
                <span className="text-sm font-black text-brand">{progressPercent}%</span>
              </div>
              <div className="h-3 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-brand rounded-full"
                />
              </div>
              <p className="text-xs text-muted-foreground font-semibold">
                Đã hoàn thành <span className="font-black text-foreground">{completedCount}</span> / <span className="font-black text-foreground">{totalLessons}</span> bài học
              </p>
            </div>
          )}

          {/* Activation/Vào học Box for /courses/[id] */}
          {!basePath && (
            isUnlocked ? (
              <div className="p-6 rounded-3xl bg-card border-2 border-emerald-500/30 space-y-4 shadow-[0_4px_0_0_#059669] mt-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground">Khóa học đã kích hoạt</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Khóa học này đã sẵn sàng. Hãy bắt đầu học ngay nhé!</p>
                  </div>
                </div>
                
                <Link
                  href={`/my-courses/${course.id}`}
                  className="btn-3d-duo w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Vào học ngay
                </Link>
              </div>
            ) : (
              <div className="p-6 rounded-3xl bg-card border-2 border-amber-500/30 space-y-4 shadow-[0_4px_0_0_#b45309] mt-5">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border-2 border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                    <Lock className="h-5 w-5 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-foreground">Khóa học chưa kích hoạt</h4>
                    <p className="text-xs text-muted-foreground font-medium mt-0.5">Nhập mã kích hoạt để bắt đầu mở khóa học tập.</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setShowAccessModal(true)}
                  className="btn-3d-brand w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="h-4 w-4" />
                  Kích hoạt khóa học
                </button>
              </div>
            )
          )}
        </div>

        {/* Right — Thumbnail */}
        <div className="lg:col-span-5">
          <div className="relative rounded-3xl overflow-hidden border-2 border-border/80 shadow-[0_8px_0_0_theme(colors.border)] aspect-video bg-muted">
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center shadow-xl">
                <PlayCircle className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Area ── */}
      {!basePath ? (
        /* Tabs layout for public course preview */
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2.5 border-b border-border/60 pb-4">
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
                  'px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold border-2 transition-all cursor-pointer',
                  activeTab === tab.id
                    ? 'btn-3d-duo'
                    : 'bg-card border-border shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[200px]">
            {activeTab === 'curriculum' && (
              <div className="p-6 sm:p-8 rounded-3xl bg-card border-2 border-border/80 shadow-[0_5px_0_0_theme(colors.border)] space-y-4">
                <h3 className="text-xl font-black text-foreground">{course.title}</h3>
                <div className="border-t-2 border-border/60 pt-4 space-y-3">
                  {[
                    "Mục tiêu khóa học thiết kế bài bản theo thang điểm chuẩn CEFR / TOEIC.",
                    "Bộ bài giảng hướng dẫn chi tiết cách làm từng dạng câu hỏi và bài tập tương tác.",
                    "Làm quen với các dạng đề thi thực tế có phản hồi chấm điểm thông minh.",
                    "Cải thiện phát âm, từ vựng và ngữ pháp toàn diện.",
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-2.5 items-start">
                      <span className="text-emerald-500 shrink-0 text-base">✅</span>
                      <p className="text-sm font-bold text-foreground leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'objectives' && (
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-black text-foreground">Bạn sẽ đạt được những gì?</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {objectivesList.map((obj: string, i: number) => (
                    <div key={i} className="flex gap-3 items-start p-5 rounded-2xl bg-card border-2 border-border/80 shadow-[0_3px_0_0_theme(colors.border)]">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm font-bold text-foreground leading-relaxed">{obj}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'info' && (
              <div className="space-y-6">
                <h3 className="text-base sm:text-lg font-black text-foreground">Chi tiết thông tin khóa học</h3>
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Thời lượng tổng cộng', value: infoDetails.duration || '36 giờ học', icon: Clock, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                    { label: 'Tổng số bài giảng', value: infoDetails.lectures || `${totalLessons} bài học video`, icon: BookOpen, color: 'text-duo bg-duo/10 border-duo/20' },
                    { label: 'Dịch vụ hỗ trợ', value: infoDetails.support || 'Giảng viên hỗ trợ 24/7', icon: CheckCircle2, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                    { label: 'Chứng chỉ kết thúc', value: infoDetails.certificate || 'Cấp chứng nhận hoàn thành', icon: Star, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                  ].map((item, idx) => (
                    <div key={idx} className="p-5 rounded-3xl bg-card border-2 border-border/80 shadow-[0_4px_0_0_theme(colors.border)] flex items-center gap-4">
                      <div className={cn("p-3 rounded-2xl border-2 shrink-0", item.color)}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground font-semibold mb-0.5">{item.label}</div>
                        <div className="text-sm font-black text-foreground">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {course.description && (
                  <div className="p-8 rounded-3xl bg-muted/40 border-2 border-border/80 shadow-[0_4px_0_0_theme(colors.border)] mt-6">
                    <h4 className="text-base font-black text-foreground mb-4">Mô tả chi tiết</h4>
                    <div className="prose dark:prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{course.description}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  {(course.reviews && course.reviews.length > 0) ? (
                    course.reviews.map((rev: any) => (
                      <div key={rev.id} className="p-5 rounded-2xl bg-card border-2 border-border/80 shadow-[0_3px_0_0_theme(colors.border)] flex flex-col justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-black text-foreground">{rev.user?.name || 'Học viên ẩn danh'}</span>
                            <div className="flex items-center gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                  key={i}
                                  className={cn("h-3.5 w-3.5", i < rev.rating ? "fill-amber-400 text-amber-400" : "text-border")}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{rev.comment}</p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/70 block self-end">
                          {new Date(rev.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 text-center py-12 bg-card border-2 border-border/80 rounded-3xl text-sm text-muted-foreground font-medium shadow-[0_4px_0_0_theme(colors.border)]">
                      Chưa có đánh giá nào cho khóa học này.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Syllabus Layout with 3D Folder Cards for /my-courses/[id] */
        <div className="space-y-8">
          <div className="flex items-center justify-between border-b-2 border-border/70 pb-3.5 mb-6">
            <h2 className="text-base sm:text-xl font-black text-foreground flex items-center gap-2.5 tracking-tight">
              <FolderOpen className="h-5 w-5 text-brand" />
              <span>Chương Trình &amp; Nội Dung Khóa Học</span>
            </h2>
            <span className="text-xs font-black text-brand bg-brand/10 border-2 border-brand/20 px-3.5 py-1 rounded-2xl">
              {totalLessons} bài giảng · {topics.length} chủ đề
            </span>
          </div>

          {hasTopics && (
            <div className="space-y-6">
              {/* 3D Folder Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {paginatedTopics.map((topic, idx) => {
                  const prog = getTopicProgress(topic);
                  const isComplete = prog.total > 0 && prog.completed === prog.total;
                  const topicNumber = (topicPage - 1) * TOPIC_PAGE_SIZE + idx + 1;

                  return (
                    <motion.div
                      key={topic.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="flex flex-col"
                    >
                      {/* 3D Folder Tab Header */}
                      <div className="flex items-center">
                        <div
                          className={cn(
                            'inline-flex items-center gap-1.5 px-4 py-1.5 rounded-t-2xl border-2 border-b-0 text-[11px] font-black tracking-wider uppercase -mb-[2px] z-10 transition-all shadow-2xs',
                            isComplete
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                              : 'bg-brand/10 border-brand/25 text-brand'
                          )}
                        >
                          {isComplete ? (
                            <FolderCheck className="h-3.5 w-3.5 stroke-[2.5]" />
                          ) : (
                            <FolderOpen className="h-3.5 w-3.5 stroke-[2.5]" />
                          )}
                          <span>Chủ đề {String(topicNumber).padStart(2, '0')}</span>
                        </div>
                      </div>

                      {/* 3D Folder Body */}
                      <Link
                        href={`${courseBasePath}/${topic.id}`}
                        className="group flex-1 flex flex-col justify-between p-5 sm:p-6 rounded-3xl rounded-tl-none bg-card border-2 border-border/80 hover:border-brand/50 shadow-[0_6px_0_0_theme(colors.border)] hover:shadow-[0_8px_0_0_theme(colors.border)] hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="space-y-3.5">
                          {/* Top row inside card */}
                          <div className="flex items-start justify-between gap-3">
                            <div
                              className={cn(
                                'h-11 w-11 rounded-2xl flex items-center justify-center font-black text-sm sm:text-base shrink-0 border-2 transition-all shadow-2xs',
                                isComplete
                                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                  : 'bg-brand/10 text-brand border-brand/20 group-hover:bg-brand group-hover:text-white'
                              )}
                            >
                              {isComplete ? <CheckCircle2 className="h-5 w-5 stroke-[3]" /> : String(topicNumber).padStart(2, '0')}
                            </div>

                            {isComplete ? (
                              <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border-2 border-emerald-500/25 px-2.5 py-0.5 rounded-xl">
                                Hoàn thành
                              </span>
                            ) : (
                              <span className="text-[10px] font-black text-brand uppercase tracking-wider bg-brand/10 border-2 border-brand/20 px-2.5 py-0.5 rounded-xl">
                                {prog.pct}%
                              </span>
                            )}
                          </div>

                          {/* Topic Title & Description */}
                          <div>
                            <h3 className="font-black text-foreground group-hover:text-brand transition-colors text-base leading-snug line-clamp-2">
                              {topic.title}
                            </h3>
                            {topic.description && (
                              <p className="text-xs text-muted-foreground font-medium line-clamp-2 mt-1.5 leading-relaxed">
                                {topic.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bottom stats & action */}
                        <div className="pt-4 mt-4 border-t-2 border-border/60 space-y-3">
                          <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
                            <span>{topic.lessons?.length || 0} bài giảng</span>
                            <span className={cn(isComplete ? 'text-emerald-600 dark:text-emerald-400 font-black' : 'text-foreground font-black')}>
                              {prog.completed}/{prog.total} bài
                            </span>
                          </div>

                          {/* Progress Bar */}
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden p-0.5 border border-border/50">
                            <div
                              className={cn('h-full rounded-full transition-all', isComplete ? 'bg-emerald-500' : 'bg-brand')}
                              style={{ width: `${prog.pct}%` }}
                            />
                          </div>

                          {/* Action Button */}
                          <div className="pt-1">
                            <span className="btn-3d-duo w-full py-2.5 rounded-2xl text-xs font-black inline-flex items-center justify-center gap-1.5">
                              <span>{isComplete ? 'Ôn lại chủ đề' : 'Vào học ngay'}</span>
                              <ChevronRight className="h-3.5 w-3.5 stroke-[3]" />
                            </span>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
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
              />
            </div>
          )}

          {generalLessons.length > 0 && (
            <div className="space-y-3 pt-6 border-t-2 border-border/60">
              <h3 className="font-black text-foreground text-xs uppercase tracking-wider mb-2">Bài giảng chung</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {generalLessons.map((lesson) => {
                  const done = completedIds.has(lesson.id);
                  return (
                    <motion.div
                      key={lesson.id}
                      className="flex flex-col justify-between p-5 bg-card border-2 border-border/80 rounded-3xl shadow-[0_4px_0_0_theme(colors.border)] space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn("p-2.5 rounded-2xl border-2 shrink-0", done ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/25" : "bg-brand/10 text-brand border-brand/20")}>
                          <PlayCircle className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-black text-xs sm:text-sm text-foreground line-clamp-2 leading-snug">{lesson.title}</p>
                          <span className="text-[10px] text-muted-foreground font-semibold block mt-1">{lesson.duration}</span>
                        </div>
                      </div>
                      {done && (
                        <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 border-2 border-emerald-500/25 px-2.5 py-1 rounded-xl self-start">
                          Hoàn thành
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {!hasTopics && generalLessons.length === 0 && (
            <div className="text-center py-16 rounded-3xl border-2 border-border/80 bg-card text-muted-foreground text-xs sm:text-sm font-medium shadow-[0_4px_0_0_theme(colors.border)]">
              <BookOpen className="h-10 w-10 mx-auto mb-2 text-brand opacity-50" />
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
