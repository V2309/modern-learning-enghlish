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
  Circle,
  Award,
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
          'rounded-2xl border transition-all overflow-hidden',
          isCurrentLesson
            ? 'border-primary/50 bg-primary/5 shadow-sm ring-1 ring-primary/20'
            : 'border-border/60 bg-card/70 hover:border-border hover:bg-card'
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
            isCurrentLesson ? 'bg-primary/10' : 'hover:bg-muted/40'
          )}
        >
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={cn(
                'h-7 w-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors',
                isLessonCompleted
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : isCurrentLesson
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-muted text-muted-foreground group-hover:bg-muted-foreground/20'
              )}
            >
              {isLessonCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : lessonIdx + 1}
            </div>

            <div className="flex-1 min-w-0 pr-2">
              <h4
                className={cn(
                  'font-bold text-xs md:text-sm truncate transition-colors',
                  isCurrentLesson ? 'text-primary font-black' : 'text-foreground'
                )}
              >
                {formatLessonName(lesson.title, lessonIdx)}
              </h4>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-semibold mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {lesson.duration || '10:00'}
                </span>
                <span>•</span>
                <span
                  className={cn(
                    isLessonCompleted
                      ? 'text-emerald-600 dark:text-emerald-400 font-bold'
                      : isCurrentLesson
                      ? 'text-primary font-bold'
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
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                >
                  <Pencil className="h-3 w-3" />
                </button>
                <button
                  type="button"
                  onClick={(e) => openDeleteLesson(lesson, e)}
                  title="Xoá bài học"
                  className="p-1 rounded-md hover:bg-red-500/10 text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
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
              className="border-t border-border/40 bg-background/50 p-2 space-y-1.5"
            >
              {/* 1. Video bài học */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSelectLessonVideo(lesson);
                }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-xs font-semibold cursor-pointer group/vid',
                  isVideoActive
                    ? 'bg-primary text-white font-bold shadow-sm'
                    : 'hover:bg-muted text-foreground'
                )}
              >
                <span className="truncate">
                  Video bài học
                </span>

                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {isVideoActive ? (
                    <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold text-white">
                      Đang xem
                    </span>
                  ) : isLessonCompleted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <span className="text-muted-foreground text-[11px] opacity-60">
                      {lesson.duration || 'Video'}
                    </span>
                  )}
                </div>
              </button>

              {/* 2. Luyện tập bài học (chỉ hiển thị khi bài học có câu hỏi trong database) */}
              {hasPractice && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSelectLessonPractice(lesson);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all text-xs font-semibold cursor-pointer group/prac',
                    isPracticeActive
                      ? 'bg-primary text-white font-bold shadow-sm'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  <span className="truncate">
                    Luyện tập: {cleanTitle}
                  </span>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    {isPracticeActive ? (
                      <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold text-white">
                        Đang làm
                      </span>
                    ) : isPracticeCompleted ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
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
      <div className="p-6 md:p-7 rounded-[2.5rem] bg-card border border-border space-y-6 shadow-sm">
        {/* Topic Title and Topic Section Indicator */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-primary uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded-lg">
              Phần {partNumber}
            </span>
            <span className="text-xs font-black text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {totalTopicLessons} bài học
            </span>
          </div>
          <h3 className="text-base md:text-lg font-black text-foreground flex items-center gap-2 pt-1">
            <BookOpen className="h-5 w-5 text-primary shrink-0" />
            <span className="truncate">{topic.title}</span>
          </h3>
        </div>

        {/* Topic Progress Bar Widget */}
        <div className="p-4 md:p-5 rounded-2xl bg-muted/30 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Course Progress
            </h4>
            <span className="text-xs font-bold text-primary">{topicProgressPercent}%</span>
          </div>

          <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden p-0.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${topicProgressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-emerald-500 rounded-full"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
            <span>
              <strong className="text-foreground font-black">{completedTopicLessons}</strong> / {totalTopicLessons} lessons completed
            </span>
            {completedTopicLessons === totalTopicLessons && totalTopicLessons > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> Completed
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
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-xs font-bold cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Thêm bài học mới
            </button>
          )}
        </div>

        {/* Other topics in course quick links */}
        {otherTopics.length > 0 && (
          <div className="border-t border-border/60 pt-4 space-y-2">
            <h5 className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              Các phần khác trong khóa học
            </h5>
            <div className="space-y-1.5">
              {otherTopics.map((ot: any, otIdx: number) => (
                <Link
                  key={ot.id}
                  href={`${courseBasePath}/${ot.id}`}
                  className="flex items-center justify-between p-2 rounded-xl text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-muted transition-all group"
                >
                  <span className="truncate">Phần {otIdx + (partNumber === 1 ? 2 : 1)}: {ot.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 relative">
      {/* ── Top Header Navigation ── */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={courseBasePath}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-semibold truncate max-w-[220px] sm:max-w-md">
            {topic.course?.title || 'Quay lại khóa học'}
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* Mobile drawer toggle button */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-3.5 py-2 border border-border bg-card rounded-xl text-xs font-bold text-foreground hover:bg-muted transition-all shadow-xs cursor-pointer"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Bài học ({completedTopicLessons}/{totalTopicLessons})</span>
          </button>

          {/* Desktop cinema view toggle */}
          <button
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-xl text-xs font-bold text-foreground hover:bg-muted transition-all shadow-xs cursor-pointer"
          >
            <Menu className="h-4 w-4 text-primary" />
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
              <div className="rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl bg-card border border-border">
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
                      <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs">
                        Chọn bài học để bắt đầu
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Action Bar (Video / Practice Toggle + Navigation Controls) */}
              <div className="p-4 md:p-6 rounded-3xl bg-card border border-border flex flex-wrap items-center justify-between gap-4 shadow-sm">
                {/* Mode Switcher Tabs */}
                {hasLessonPractice(activeLesson) ? (
                  <div className="flex items-center bg-muted/60 p-1 rounded-2xl border border-border/60">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all bg-primary text-white shadow-sm"
                    >
                      <Video className="h-4 w-4" />
                      <span>Video bài học</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveMode('practice')}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    >
                      <FileQuestion className="h-4 w-4" />
                      <span>Luyện tập thực hành</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-muted/40 px-3.5 py-2 rounded-xl border border-border/50">
                    <Video className="h-4 w-4 text-primary" />
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
                      'px-3.5 py-2.5 rounded-xl border border-border bg-card font-bold text-xs flex items-center gap-1.5 transition-all',
                      prevLesson
                        ? 'hover:bg-muted text-foreground cursor-pointer'
                        : 'opacity-40 text-muted-foreground cursor-not-allowed'
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
                        'px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm',
                        completedIds.includes(activeLesson.id)
                          ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/20'
                          : 'border border-border bg-card hover:bg-muted text-foreground'
                      )}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>
                        {completedIds.includes(activeLesson.id)
                          ? 'Đã hoàn thành'
                          : 'Đánh dấu hoàn thành'}
                      </span>
                    </button>
                  )}

                  {/* Next Lesson Button */}
                  <button
                    disabled={!nextLesson}
                    onClick={handleGoToNextLesson}
                    title={nextLesson ? `Bài tiếp theo: ${nextLesson.title}` : 'Đã đến bài cuối cùng'}
                    className={cn(
                      'px-4 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-sm',
                      nextLesson
                        ? 'bg-primary hover:bg-primary/95 text-white shadow-primary/20 cursor-pointer'
                        : 'border border-border bg-card opacity-40 text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    <span className="hidden sm:inline">Bài tiếp theo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Lesson Details & Markdown Notes Card */}
              <div className="p-6 md:p-10 rounded-[2.5rem] bg-card border border-border space-y-6 shadow-sm">
                {/* Header info */}
                <div className="border-b border-border/60 pb-6 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-lg">
                      Phần {partNumber}: {topic.title}
                    </span>
                    {activeLesson?.duration && (
                      <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 bg-muted px-2.5 py-1 rounded-lg">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        {activeLesson.duration}
                      </span>
                    )}
                    {activeLesson && completedIds.includes(activeLesson.id) && (
                      <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn thành
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl md:text-3xl font-black text-foreground">
                    {activeLesson ? formatLessonName(activeLesson.title, currentLessonIndex) : topic.title}
                  </h2>
                </div>

                {/* Markdown Description */}
                {activeLesson?.description ? (
                  <div className="p-6 rounded-2xl bg-muted/30 border border-border/50">
                    <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Nội dung bài học
                    </h4>
                    <div className="prose-sm text-foreground/80 leading-relaxed">
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
                            <h3 className="text-sm font-bold text-primary mt-2 mb-1">{children}</h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-sm text-foreground/80 leading-relaxed mb-3">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 text-sm space-y-1 mb-3">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 text-sm space-y-1 mb-3">{children}</ol>
                          ),
                          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-primary pl-3 py-1.5 bg-primary/5 rounded-r-xl text-sm italic text-muted-foreground my-3">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children, className: cls }) => {
                            const isBlock = cls?.includes('language-');
                            return isBlock ? (
                              <code className="block bg-muted border border-border rounded-xl px-4 py-3 text-xs font-mono text-foreground my-3 overflow-x-auto">
                                {children}
                              </code>
                            ) : (
                              <code className="bg-muted border border-border/50 px-1.5 py-0.5 rounded-md text-xs font-mono text-primary font-bold">
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
                  <p className="text-sm text-muted-foreground italic">
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
          className="flex items-center gap-2 h-14 px-6 bg-primary text-white rounded-full font-black text-sm shadow-2xl hover:bg-primary/95 transition-all shadow-primary/30 cursor-pointer"
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
              className="relative w-full max-w-md h-full bg-card border-l border-border p-6 shadow-2xl overflow-y-auto z-10 flex flex-col space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-base font-black text-foreground flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Nội dung chủ đề
                </span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 bg-muted hover:bg-accent text-foreground rounded-xl cursor-pointer"
                >
                  <X className="h-5 w-5" />
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
