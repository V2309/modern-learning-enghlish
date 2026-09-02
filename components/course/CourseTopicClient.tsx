'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  PlayCircle,
  BookOpen,
  Menu,
  X,
  CheckCircle2,
  Clock,
  Play,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Video,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  FolderOpen,
  ChevronRight,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { EditLessonModal } from '@/components/course/EditLessonModal';
import { AddLessonModal } from '@/components/course/AddLessonModal';
import { CustomVideoPlayer } from '@/components/CustomVideoPlayer';
import { completeLessonAction, completeLessonPracticeAction } from '@/actions/progress.action';
import { createLessonAction, updateLessonAction, deleteLessonAction } from '@/actions/lesson.action';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { useCourseTopicStore } from '@/stores/useCourseTopicStore';
import { LessonPracticeView } from '@/components/course/LessonPracticeView';
import { toast } from 'react-hot-toast';

interface CourseTopicClientProps {
  topic: any; // CourseTopic with lessons[] and course
  userId: string;
  initialCompletedLessonIds: string[];
  initialCompletedPracticeIds?: string[];
  basePath?: string; // e.g. '/my-courses/[courseId]' or '/courses/[courseId]'
  isAdmin?: boolean;
}

export default function CourseTopicClient({
  topic,
  userId,
  initialCompletedLessonIds,
  initialCompletedPracticeIds = [],
  basePath,
  isAdmin = false,
}: CourseTopicClientProps) {
  const courseBasePath = basePath ?? `/courses/${topic.courseId}`;
  const videoTopRef = useRef<HTMLDivElement>(null);

  const {
    completedIds,
    completedPracticeIds,
    activeLesson,
    activeMode,
    lessons,
    expandedLessons,
    isDesktopSidebarOpen,
    isMobileDrawerOpen,
    showEditLessonModal,
    editingLesson,
    editLessonForm,
    isSavingLesson,
    showDeleteLessonModal,
    deletingLesson,
    isDeletingLesson,
    showAddLessonModal,
    isAddingLesson,
    setCompletedIds,
    setCompletedPracticeIds,
    toggleCompletedPracticeId,
    setActiveLesson,
    setActiveMode,
    setLessons,
    setExpandedLessons,
    toggleLessonExpanded,
    setIsDesktopSidebarOpen,
    setIsMobileDrawerOpen,
    setShowEditLessonModal,
    setEditingLesson,
    setEditLessonForm,
    setIsSavingLesson,
    setShowDeleteLessonModal,
    setDeletingLesson,
    setIsDeletingLesson,
    setShowAddLessonModal,
    setIsAddingLesson,
    reset: resetStore,
  } = useCourseTopicStore();

  // Lessons strictly belonging to this topic
  const topicLessons = useMemo(() => {
    return lessons && lessons.length > 0 ? lessons : (topic?.lessons || []);
  }, [lessons, topic?.lessons]);

  // All topics of the course (for other parts navigation)
  const otherTopics = useMemo(() => {
    if (topic?.course?.topics && topic.course.topics.length > 0) {
      return topic.course.topics.filter((t: any) => t.id !== topic.id);
    }
    return [];
  }, [topic]);

  // Topic order or part label
  const partNumber = useMemo(() => {
    if (topic?.course?.topics && topic.course.topics.length > 0) {
      const idx = topic.course.topics.findIndex((t: any) => t.id === topic.id);
      return idx >= 0 ? idx + 1 : 1;
    }
    return 1;
  }, [topic]);

  // Initialize store state
  useEffect(() => {
    resetStore();
    useCourseTopicStore.getState().setCompletedIds(initialCompletedLessonIds);
    useCourseTopicStore.getState().setCompletedPracticeIds(initialCompletedPracticeIds);
    useCourseTopicStore.getState().setLessons(topic?.lessons || []);

    const firstLesson = topic?.lessons?.[0] || null;
    useCourseTopicStore.getState().setActiveLesson(firstLesson);
    useCourseTopicStore.getState().setActiveMode('video');

    // Auto expand all lessons in this topic
    const initialExpanded: Record<string, boolean> = {};
    (topic?.lessons || []).forEach((l: any) => {
      initialExpanded[l.id] = true;
    });
    useCourseTopicStore.getState().setExpandedLessons(initialExpanded);

    return () => resetStore();
  }, [topic, initialCompletedLessonIds, initialCompletedPracticeIds, resetStore]);

  // ── Progress & Completion ──
  const handleToggleComplete = async (lessonId: string, event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    const alreadyCompleted = completedIds.includes(lessonId);
    setCompletedIds(
      alreadyCompleted
        ? completedIds.filter((id) => id !== lessonId)
        : [...completedIds, lessonId]
    );

    const res = await completeLessonAction(userId, lessonId, topic.courseId);
    if (!res.success) {
      setCompletedIds(
        alreadyCompleted
          ? [...completedIds, lessonId]
          : completedIds.filter((id) => id !== lessonId)
      );
      toast.error('Không thể lưu tiến độ: ' + (res.error || 'Có lỗi xảy ra'));
    } else {
      toast.success(alreadyCompleted ? 'Đã hủy hoàn thành bài học!' : '🎉 Đã hoàn thành bài học!');
    }
  };

  const handleCompletePracticeForLesson = async (lessonId: string) => {
    toggleCompletedPracticeId(lessonId);
    await completeLessonPracticeAction(userId, lessonId, topic.courseId);
    if (!completedIds.includes(lessonId)) {
      handleToggleComplete(lessonId);
    } else {
      toast.success('🎉 Đã hoàn thành bài luyện tập!');
    }
  };

  // Find index of current lesson within this topic
  const currentLessonIndex = useMemo(() => {
    if (!activeLesson) return -1;
    return topicLessons.findIndex((l: any) => l.id === activeLesson.id);
  }, [activeLesson, topicLessons]);

  const prevLesson = currentLessonIndex > 0 ? topicLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex >= 0 && currentLessonIndex < topicLessons.length - 1
      ? topicLessons[currentLessonIndex + 1]
      : null;

  const handleSelectLessonVideo = (lesson: any) => {
    setActiveLesson(lesson);
    setActiveMode('video');
    setExpandedLessons((prev) => ({ ...prev, [lesson.id]: true }));
  };

  const handleSelectLessonPractice = (lesson: any) => {
    setActiveLesson(lesson);
    setActiveMode('practice');
    setExpandedLessons((prev) => ({ ...prev, [lesson.id]: true }));
  };

  const handleGoToNextLesson = () => {
    if (nextLesson) {
      setActiveLesson(nextLesson);
      setActiveMode('video');
    }
  };

  const handleGoToPrevLesson = () => {
    if (prevLesson) {
      setActiveLesson(prevLesson);
      setActiveMode('video');
    }
  };

  // ── Admin: Edit / Delete / Add lesson ──
  const openEditLesson = (lesson: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingLesson(lesson);
    setEditLessonForm({
      title: lesson.title,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl,
      description: lesson.description || '',
      practiceContent: lesson.practiceContent || '',
    });
    setShowEditLessonModal(true);
  };

  const handleEditLesson = async () => {
    if (!editingLesson) return;
    setIsSavingLesson(true);
    const res = await updateLessonAction(
      editingLesson.id,
      topic.courseId,
      {
        title: editLessonForm.title,
        duration: editLessonForm.duration,
        videoUrl: editLessonForm.videoUrl,
        description: editLessonForm.description,
        practiceContent: editLessonForm.practiceContent,
      },
      topic.id
    );
    setIsSavingLesson(false);
    if (res.success && res.lesson) {
      const updated = topicLessons.map((l: any) =>
        l.id === editingLesson.id ? { ...l, ...res.lesson } : l
      );
      setLessons(updated);
      if (activeLesson?.id === editingLesson.id) setActiveLesson({ ...activeLesson, ...res.lesson });
      setShowEditLessonModal(false);
      setEditingLesson(null);
      toast.success('Cập nhật bài học thành công!');
    } else {
      toast.error('Không thể cập nhật bài học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const openDeleteLesson = (lesson: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingLesson(lesson);
    setShowDeleteLessonModal(true);
  };

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    setIsDeletingLesson(true);
    const res = await deleteLessonAction(deletingLesson.id, topic.courseId, topic.id);
    setIsDeletingLesson(false);
    if (res.success) {
      const updated = topicLessons.filter((l: any) => l.id !== deletingLesson.id);
      setLessons(updated);
      if (activeLesson?.id === deletingLesson.id) setActiveLesson(updated[0] || null);
      setShowDeleteLessonModal(false);
      setDeletingLesson(null);
      toast.success('Xóa bài học thành công!');
    } else {
      toast.error('Không thể xoá bài học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const handleAddLesson = async (form: {
    title: string;
    duration: string;
    videoUrl: string;
    description: string;
    practiceContent?: string;
  }) => {
    setIsAddingLesson(true);
    const res = await createLessonAction({
      courseId: topic.courseId,
      topicId: topic.id,
      title: form.title,
      duration: form.duration || '00:00',
      videoUrl: form.videoUrl,
      description: form.description,
      practiceContent: form.practiceContent,
    });
    setIsAddingLesson(false);
    if (res.success && res.lesson) {
      setLessons([...topicLessons, res.lesson]);
      setShowAddLessonModal(false);
      toast.success('Thêm bài học mới thành công!');
    } else {
      toast.error('Không thể thêm bài học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  // Progress Calculations strictly for THIS topic
  const totalTopicLessons = topicLessons.length;
  const completedTopicLessons = topicLessons.filter((l: any) => completedIds.includes(l.id)).length;
  const topicProgressPercent =
    totalTopicLessons > 0 ? Math.round((completedTopicLessons / totalTopicLessons) * 100) : 0;

  // Clean helper to check if lesson has practice questions in database
  const hasLessonPractice = (l: any) => {
    if (!l) return false;
    if (l.questions && Array.isArray(l.questions) && l.questions.length > 0) return true;
    if (l.practiceContent && typeof l.practiceContent === 'string' && l.practiceContent.trim() && l.practiceContent.trim() !== '[]') {
      try {
        const parsed = JSON.parse(l.practiceContent);
        if (Array.isArray(parsed) && parsed.length > 0) return true;
        if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) return true;
      } catch {}
    }
    return false;
  };

  // Clean helper to extract clean lesson name
  const formatLessonName = (title: string, index: number) => {
    if (/^Bài\s+\d+[:\s]/i.test(title)) {
      return title;
    }
    return `Bài ${index + 1}: ${title}`;
  };

  const getCleanLessonTitle = (title: string) => {
    return title.replace(/^Bài\s+\d+[:\s-]*/i, '').trim();
  };

  // Render Lesson Accordion Group for THIS topic
  const renderLessonAccordionItem = (lesson: any, lessonIdx: number) => {
    const isCurrentLesson = activeLesson?.id === lesson.id;
    const isLessonCompleted = completedIds.includes(lesson.id);
    const isPracticeCompleted = completedPracticeIds.includes(lesson.id) || isLessonCompleted;
    const isExpanded = expandedLessons[lesson.id] ?? true;
    const isVideoActive = isCurrentLesson && activeMode === 'video';
    const isPracticeActive = isCurrentLesson && activeMode === 'practice';
    const cleanTitle = getCleanLessonTitle(lesson.title);
    const hasPractice = hasLessonPractice(lesson);

    return (
      <div
        key={lesson.id}
        className={cn(
          'rounded-2xl border-2 transition-all overflow-hidden shadow-2xs',
          isCurrentLesson
            ? 'border-brand/40 bg-brand/5 shadow-[0_3px_0_0_theme(colors.brand)]'
            : 'border-border/70 bg-card hover:border-border'
        )}
      >
        {/* Lesson Header Accordion Toggle */}
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            toggleLessonExpanded(lesson.id);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleLessonExpanded(lesson.id);
            }
          }}
          className={cn(
            'w-full flex items-center justify-between p-3.5 text-left cursor-pointer transition-colors select-none group',
            isCurrentLesson ? 'bg-brand/10' : 'hover:bg-muted/40'
          )}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                'h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors border-2 shadow-2xs',
                isLessonCompleted
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : isCurrentLesson
                  ? 'bg-brand border-brand text-white shadow-xs'
                  : 'bg-muted border-border/80 text-muted-foreground group-hover:bg-muted-foreground/20'
              )}
            >
              {isLessonCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : lessonIdx + 1}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4
                className={cn(
                  'font-black text-xs md:text-sm truncate transition-colors',
                  isCurrentLesson ? 'text-brand' : 'text-foreground'
                )}
              >
                {formatLessonName(lesson.title, lessonIdx)}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-brand" />
                  {lesson.duration || '10:00'}
                </span>
                <span>•</span>
                <span
                  className={cn(
                    isLessonCompleted
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : isCurrentLesson
                      ? 'text-brand font-bold'
                      : ''
                  )}
                >
                  {isLessonCompleted ? 'Đã hoàn thành' : isCurrentLesson ? 'Đang học' : 'Chưa học'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Admin buttons */}
            {isAdmin && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => openEditLesson(lesson, e)}
                  title="Sửa bài học"
                  className="p-1.5 rounded-xl border border-border bg-card hover:bg-muted text-muted-foreground hover:text-brand transition-colors cursor-pointer"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => openDeleteLesson(lesson, e)}
                  title="Xoá bài học"
                  className="p-1.5 rounded-xl border border-rose-500/30 bg-card hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}

            <div className="p-1 text-muted-foreground">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </div>
          </div>
        </div>

        {/* Sub-items (Video + Practice if present) */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="border-t-2 border-border/60 bg-muted/20 p-2.5 space-y-2"
            >
              {/* 1. Video bài học */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectLessonVideo(lesson);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all text-xs font-black cursor-pointer border-2',
                  isVideoActive
                    ? 'btn-3d-duo'
                    : 'bg-card border-border shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted text-foreground'
                )}
              >
                <span className="truncate flex items-center gap-2">
                  <Video className="h-3.5 w-3.5" />
                  Video bài học
                </span>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {isVideoActive ? (
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-black text-white">
                      Đang xem
                    </span>
                  ) : isLessonCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 stroke-[2.5]" />
                  ) : (
                    <span className="text-muted-foreground text-[11px] font-semibold">
                      {lesson.duration || 'Video'}
                    </span>
                  )}
                </div>
              </button>

              {/* 2. Luyện tập bài học */}
              {hasPractice && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectLessonPractice(lesson);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left transition-all text-xs font-black cursor-pointer border-2',
                    isPracticeActive
                      ? 'btn-3d-duo'
                      : 'bg-card border-border shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted text-foreground'
                  )}
                >
                  <span className="truncate flex items-center gap-2">
                    <FileQuestion className="h-3.5 w-3.5" />
                    Luyện tập: {cleanTitle}
                  </span>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isPracticeActive ? (
                      <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-black text-white">
                        Đang làm
                      </span>
                    ) : isPracticeCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 stroke-[2.5]" />
                    ) : null}
                  </div>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  // Sidebar focused on THIS topic
  const renderSidebarContent = () => (
    <div className="space-y-6">
      {/* Course Navigation Header */}
      <div className="p-5 md:p-6 rounded-3xl bg-card border-2 border-border/80 space-y-5 shadow-[0_6px_0_0_theme(colors.border)]">
        {/* Topic Title and Topic Section Indicator */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-brand uppercase tracking-wider bg-brand/10 px-2.5 py-1 rounded-xl border-2 border-brand/20">
              Phần {partNumber}
            </span>
            <span className="text-xs font-black text-muted-foreground bg-muted px-2.5 py-1 rounded-xl border border-border/60">
              {totalTopicLessons} bài học
            </span>
          </div>
          <h3 className="text-sm md:text-base font-black text-foreground flex items-center gap-2 pt-1">
            <FolderOpen className="h-4 w-4 text-brand shrink-0" />
            <span className="truncate">{topic.title}</span>
          </h3>
        </div>

        {/* Topic Progress Bar Widget */}
        <div className="p-4 rounded-2xl bg-brand/5 border-2 border-brand/20 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-black text-brand uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
              Tiến Độ Phần Học
            </h4>
            <span className="text-xs font-black text-brand">{topicProgressPercent}%</span>
          </div>

          <div className="h-2.5 w-full bg-brand/15 rounded-full overflow-hidden p-0.5 border border-brand/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${topicProgressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-brand rounded-full"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>
              <strong className="text-foreground font-black">{completedTopicLessons}</strong> / {totalTopicLessons} bài đã học
            </span>
            {completedTopicLessons === totalTopicLessons && totalTopicLessons > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-black flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" /> Hoàn thành
              </span>
            )}
          </div>
        </div>

        {/* Lesson Accordion List for THIS topic */}
        <div className="space-y-3 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
          {topicLessons.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground font-semibold">
              Chưa có bài học nào trong chủ đề này.
            </div>
          ) : (
            topicLessons.map((l: any, lIdx: number) => renderLessonAccordionItem(l, lIdx))
          )}

          {/* Admin: Add Lesson */}
          {isAdmin && (
            <button
              onClick={() => setShowAddLessonModal(true)}
              className="btn-3d-duo mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              Thêm bài học mới
            </button>
          )}
        </div>

        {/* Other topics in course quick links */}
        {otherTopics.length > 0 && (
          <div className="border-t-2 border-border/60 pt-4 space-y-2">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Các phần khác trong khóa học
            </h5>
            <div className="space-y-1.5">
              {otherTopics.map((ot: any, otIdx: number) => (
                <Link
                  key={ot.id}
                  href={`${courseBasePath}/${ot.id}`}
                  className="flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold text-muted-foreground hover:text-brand hover:bg-muted border border-transparent hover:border-border/60 transition-all group"
                >
                  <span className="truncate">Phần {otIdx + (partNumber === 1 ? 2 : 1)}: {ot.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-brand group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full relative select-none">
      {/* ── Top Header Navigation ── */}
      <div className="flex items-center justify-between mb-6 gap-3">
        <Link
          href={courseBasePath}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card border-2 border-border shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none text-muted-foreground hover:text-brand transition-all group"
        >
          <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
          <span className="text-xs sm:text-sm font-black truncate max-w-[180px] sm:max-w-md">
            {topic.course?.title || 'Quay lại khóa học'}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Mobile drawer toggle button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 border-2 border-border bg-card rounded-2xl text-xs font-black text-foreground shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted transition-all cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-brand" />
            <span>Bài học ({completedTopicLessons}/{totalTopicLessons})</span>
          </button>

          {/* Desktop cinema view toggle */}
          <button
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 border-2 border-border bg-card rounded-2xl text-xs font-black text-foreground shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted transition-all cursor-pointer"
          >
            <Menu className="h-4 w-4 text-brand" />
            <span>{isDesktopSidebarOpen ? 'Cinema View (Ẩn mục lục)' : 'Hiện mục lục'}</span>
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Grid Layout ── */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT COLUMN: Video Player / Practice View & Lesson Info ── */}
        <div
          ref={videoTopRef}
          className={cn(
            'transition-all duration-300 space-y-6 min-h-[70vh]',
            isDesktopSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'
          )}
        >
          {/* Main Content Area */}
          {activeMode === 'video' ? (
            <>
              {/* Video Player Container */}
              <div className="rounded-3xl overflow-hidden shadow-[0_8px_0_0_theme(colors.border)] bg-card border-2 border-border/80">
                <div className="aspect-video w-full bg-black relative">
                  {activeLesson ? (
                    <CustomVideoPlayer
                      key={activeLesson.videoUrl}
                      url={activeLesson.videoUrl}
                      poster={topic.course?.thumbnail}
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                      <PlayCircle className="h-16 w-16 text-muted-foreground opacity-40 animate-pulse" />
                      <p className="text-muted-foreground font-black uppercase tracking-wider text-xs">
                        Chọn bài học để bắt đầu
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Action Bar (Video / Practice Toggle + Navigation Controls) */}
              <div className="p-5 sm:p-6 rounded-3xl bg-card border-2 border-border/80 flex flex-wrap items-center justify-between gap-4 shadow-[0_5px_0_0_theme(colors.border)]">
                {/* Mode Switcher Tabs */}
                {hasLessonPractice(activeLesson) ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-3d-duo flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black"
                    >
                      <Video className="h-4 w-4" />
                      <span>Video bài học</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMode('practice')}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer bg-card border-2 border-border text-muted-foreground hover:text-foreground shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted"
                    >
                      <FileQuestion className="h-4 w-4" />
                      <span>Luyện tập</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-black text-brand bg-brand/10 px-3.5 py-2 rounded-2xl border-2 border-brand/20">
                    <Video className="h-4 w-4 text-brand" />
                    <span>Video bài học</span>
                  </div>
                )}

                {/* Navigation & Complete Buttons */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Prev Lesson Button */}
                  <button
                    disabled={!prevLesson}
                    onClick={handleGoToPrevLesson}
                    title={prevLesson ? `Bài trước: ${prevLesson.title}` : 'Không có bài trước'}
                    className={cn(
                      'px-3.5 py-2 rounded-2xl border-2 border-border bg-card font-black text-xs flex items-center gap-1.5 transition-all shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none',
                      prevLesson
                        ? 'hover:bg-muted text-foreground cursor-pointer'
                        : 'opacity-40 text-muted-foreground cursor-not-allowed shadow-none'
                    )}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Bài trước</span>
                  </button>

                  {/* Toggle Complete Button */}
                  {activeLesson && (
                    <button
                      onClick={(e) => handleToggleComplete(activeLesson.id, e)}
                      className={cn(
                        'px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer border-2',
                        completedIds.includes(activeLesson.id)
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-[0_2px_0_0_#059669]'
                          : 'bg-card border-border shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted text-foreground'
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4 stroke-[2.5]" />
                      <span>
                        {completedIds.includes(activeLesson.id)
                          ? 'Đã hoàn thành'
                          : 'Đánh dấu xong'}
                      </span>
                    </button>
                  )}

                  {/* Next Lesson Button */}
                  <button
                    disabled={!nextLesson}
                    onClick={handleGoToNextLesson}
                    title={nextLesson ? `Bài tiếp theo: ${nextLesson.title}` : 'Đã đến bài cuối cùng'}
                    className={cn(
                      'px-4 py-2 rounded-2xl font-black text-xs flex items-center gap-1.5 transition-all',
                      nextLesson
                        ? 'btn-3d-duo cursor-pointer'
                        : 'border-2 border-border bg-card opacity-40 text-muted-foreground cursor-not-allowed shadow-none'
                    )}
                  >
                    <span className="hidden sm:inline">Bài tiếp theo</span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[3]" />
                  </button>
                </div>
              </div>

              {/* Lesson Details & Markdown Notes Card */}
              <div className="p-6 md:p-8 rounded-3xl bg-card border-2 border-border/80 space-y-6 shadow-[0_6px_0_0_theme(colors.border)]">
                {/* Header info */}
                <div className="border-b-2 border-border/60 pb-5 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand/10 border-2 border-brand/20 px-3 py-1 rounded-xl">
                      Phần {partNumber}: {topic.title}
                    </span>
                    {activeLesson?.duration && (
                      <span className="text-xs text-muted-foreground font-black flex items-center gap-1 bg-muted px-3 py-1 rounded-xl border border-border/60">
                        <Clock className="h-3.5 w-3.5 text-brand" />
                        {activeLesson.duration}
                      </span>
                    )}
                    {activeLesson && completedIds.includes(activeLesson.id) && (
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-2 border-emerald-500/25 px-3 py-1 rounded-xl flex items-center gap-1 shadow-2xs">
                        <CheckCircle2 className="h-3.5 w-3.5 stroke-[3]" /> Đã hoàn thành
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl md:text-2xl font-black text-foreground tracking-tight">
                    {activeLesson ? formatLessonName(activeLesson.title, currentLessonIndex) : topic.title}
                  </h2>
                </div>

                {/* Markdown Description */}
                {activeLesson?.description ? (
                  <div className="p-6 rounded-2xl bg-muted/40 border-2 border-border/80">
                    <h4 className="text-xs font-black text-brand uppercase tracking-wider mb-4 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Nội dung &amp; Ghi chú bài học
                    </h4>
                    <div className="prose-sm text-foreground/85 leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-lg font-black text-foreground mt-4 mb-2 pb-1 border-b border-border">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-bold text-foreground mt-3 mb-1.5">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-bold text-brand mt-2 mb-1">{children}</h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-sm text-foreground/80 leading-relaxed mb-3 font-medium">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 text-sm space-y-1 mb-3 font-medium">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 text-sm space-y-1 mb-3 font-medium">{children}</ol>
                          ),
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-brand pl-3 py-1.5 bg-brand/5 rounded-r-xl text-sm italic text-muted-foreground my-3">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children, className: cls }) => {
                            const isBlock = cls?.includes('language-');
                            return isBlock ? (
                              <code className="block bg-muted border-2 border-border rounded-xl px-4 py-3 text-xs font-mono text-foreground my-3 overflow-x-auto">
                                {children}
                              </code>
                            ) : (
                              <code className="bg-muted border border-border/60 px-1.5 py-0.5 rounded-md text-xs font-mono text-brand font-bold">
                                {children}
                              </code>
                            );
                          },
                          strong: ({ children }) => (
                            <strong className="font-bold text-foreground">{children}</strong>
                          ),
                          hr: () => <hr className="border-border my-4" />,
                        }}
                      >
                        {activeLesson.description}
                      </ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic font-medium">
                    Chưa có ghi chú nội dung cho bài học này.
                  </p>
                )}
              </div>
            </>
          ) : (
            /* Practice Mode: ONLY display the Lesson Practice View */
            <LessonPracticeView
              key={activeLesson?.id}
              lesson={activeLesson}
              topicTitle={topic.title}
              isCompleted={completedIds.includes(activeLesson?.id)}
              onCompletePractice={() => {
                if (activeLesson) handleCompletePracticeForLesson(activeLesson.id);
              }}
              onNextLesson={nextLesson ? handleGoToNextLesson : undefined}
              onBackToVideo={() => setActiveMode('video')}
            />
          )}
        </div>

        {/* ── RIGHT COLUMN: Desktop Sidebar ── */}
        {isDesktopSidebarOpen && (
          <div className="hidden lg:block lg:col-span-4 sticky top-20">
            {renderSidebarContent()}
          </div>
        )}
      </div>

      {/* ── Mobile FAB (Floating Action Button) ── */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="btn-3d-duo flex items-center gap-2 h-14 px-6 rounded-full text-sm font-black"
        >
          <BookOpen className="h-5 w-5" />
          <span>Bài học ({completedTopicLessons}/{totalTopicLessons})</span>
        </button>
      </div>

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-card border-l-2 border-border p-6 shadow-2xl overflow-y-auto z-10 flex flex-col space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b-2 border-border/70">
                <span className="text-base font-black text-foreground flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-brand" />
                  Nội dung chủ đề
                </span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 bg-muted hover:bg-accent text-foreground rounded-2xl border-2 border-border cursor-pointer shadow-2xs"
                >
                  <X className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>
              <div className="flex-1">
                {renderSidebarContent()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Admin Modals ── */}
      <AddLessonModal
        show={showAddLessonModal}
        isSaving={isAddingLesson}
        onClose={() => setShowAddLessonModal(false)}
        onSave={handleAddLesson}
      />

      <EditLessonModal
        show={showEditLessonModal}
        form={editLessonForm}
        isSaving={isSavingLesson}
        onClose={() => {
          setShowEditLessonModal(false);
          setEditingLesson(null);
        }}
        onSave={handleEditLesson}
        onChange={(field, value) => setEditLessonForm({ ...editLessonForm, [field]: value })}
      />

      <ConfirmDeleteModal
        show={showDeleteLessonModal}
        title={`Xoá bài học "${deletingLesson?.title}"?`}
        description="Bài học này sẽ bị xoá vĩnh viễn khỏi khóa học. Hành động này không thể hoàn tác."
        isLoading={isDeletingLesson}
        onConfirm={handleDeleteLesson}
        onCancel={() => {
          setShowDeleteLessonModal(false);
          setDeletingLesson(null);
        }}
      />
    </div>
  );
}
