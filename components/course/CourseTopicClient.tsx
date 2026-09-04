'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  Bookmark,
  Share2,
  FileText,
  HelpCircle,
  Compass,
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
  const [activeTab, setActiveTab] = useState<'notes' | 'overview'>('notes');

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
      toast.success(alreadyCompleted ? 'Đã hủy đánh dấu hoàn thành' : 'Đã hoàn thành bài học');
    }
  };

  const handleCompletePracticeForLesson = async (lessonId: string) => {
    toggleCompletedPracticeId(lessonId);
    await completeLessonPracticeAction(userId, lessonId, topic.courseId);
    if (!completedIds.includes(lessonId)) {
      handleToggleComplete(lessonId);
    } else {
      toast.success('Đã hoàn thành bài luyện tập');
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
      toast.success('Cập nhật bài học thành công');
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
      toast.success('Xóa bài học thành công');
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
      duration: form.duration || '10:00',
      videoUrl: form.videoUrl,
      description: form.description,
      practiceContent: form.practiceContent,
    });
    setIsAddingLesson(false);
    if (res.success && res.lesson) {
      setLessons([...topicLessons, res.lesson]);
      setShowAddLessonModal(false);
      toast.success('Thêm bài học mới thành công');
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

  const formatLessonName = (title: string, index: number) => {
    if (/^Bài\s+\d+[:\s]/i.test(title)) {
      return title;
    }
    return `Bài ${index + 1}: ${title}`;
  };

  const getCleanLessonTitle = (title: string) => {
    return title.replace(/^Bài\s+\d+[:\s-]*/i, '').trim();
  };

  // Render Lesson Item for Sidebar (Coursera Syllabus Style)
  const renderSidebarLessonItem = (lesson: any, lessonIdx: number) => {
    const isCurrentLesson = activeLesson?.id === lesson.id;
    const isLessonCompleted = completedIds.includes(lesson.id);
    const isPracticeCompleted = completedPracticeIds.includes(lesson.id) || isLessonCompleted;
    const isVideoActive = isCurrentLesson && activeMode === 'video';
    const isPracticeActive = isCurrentLesson && activeMode === 'practice';
    const cleanTitle = getCleanLessonTitle(lesson.title);
    const hasPractice = hasLessonPractice(lesson);

    return (
      <div
        key={lesson.id}
        className={cn(
          'group rounded-xl transition-all border',
          isCurrentLesson
            ? 'bg-brand/5 border-brand/25 shadow-2xs'
            : 'bg-card/60 border-border/50 hover:bg-muted/40 hover:border-border/80'
        )}
      >
        {/* Main Lesson Row */}
        <div
          onClick={() => handleSelectLessonVideo(lesson)}
          className="flex items-start gap-3 p-3 cursor-pointer select-none"
        >
          {/* Status Indicator Icon */}
          <div className="pt-0.5 shrink-0">
            {isLessonCompleted ? (
              <div className="h-5 w-5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Check className="h-3 w-3 stroke-[2.5]" />
              </div>
            ) : isCurrentLesson ? (
              <div className="h-5 w-5 rounded-full bg-brand text-white flex items-center justify-center shadow-xs">
                <Play className="h-2.5 w-2.5 fill-current ml-0.5" />
              </div>
            ) : (
              <div className="h-5 w-5 rounded-full border border-border/80 text-muted-foreground flex items-center justify-center text-[10px] font-semibold bg-background group-hover:border-foreground/30">
                {lessonIdx + 1}
              </div>
            )}
          </div>

          {/* Lesson Metadata */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-1">
              <h4
                className={cn(
                  'text-xs md:text-sm font-medium leading-snug line-clamp-2 transition-colors',
                  isCurrentLesson
                    ? 'text-foreground font-semibold'
                    : 'text-foreground/80 group-hover:text-foreground'
                )}
              >
                {formatLessonName(lesson.title, lessonIdx)}
              </h4>
            </div>

            <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1 font-normal">
                <Clock className="h-3 w-3 opacity-70" />
                {lesson.duration || '10:00'}
              </span>
              <span>•</span>
              <span className="font-normal flex items-center gap-1">
                <Video className="h-3 w-3 opacity-70" />
                Video bài giảng
              </span>
            </div>
          </div>

          {/* Admin action buttons */}
          {isAdmin && (
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <button
                type="button"
                onClick={(e) => openEditLesson(lesson, e)}
                title="Sửa bài học"
                className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                <Pencil className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={(e) => openDeleteLesson(lesson, e)}
                title="Xoá bài học"
                className="p-1 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>

        {/* Sub-item: Practice Question Link */}
        {hasPractice && (
          <div className="border-t border-border/40 px-3 py-2 bg-muted/20 flex items-center justify-between rounded-b-xl">
            <button
              type="button"
              onClick={() => handleSelectLessonPractice(lesson)}
              className={cn(
                'flex items-center gap-2 text-xs font-medium transition-colors cursor-pointer text-left flex-1',
                isPracticeActive
                  ? 'text-brand font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <FileQuestion className="h-3.5 w-3.5 opacity-80 shrink-0" />
              <span className="truncate">Bài tập trắc nghiệm: {cleanTitle}</span>
            </button>

            <div className="shrink-0 ml-2">
              {isPracticeCompleted ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : isPracticeActive ? (
                <span className="text-[10px] text-brand font-medium bg-brand/10 px-1.5 py-0.5 rounded">
                  Đang làm
                </span>
              ) : null}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Sidebar Syllabus Content
  const renderSidebarContent = () => (
    <div className="space-y-4">
      {/* Syllabus Card Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 space-y-4 shadow-2xs">
        {/* Module Title */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-brand tracking-wide uppercase">
              Phần {partNumber}
            </span>
            <span className="text-xs text-muted-foreground">
              {totalTopicLessons} bài học
            </span>
          </div>
          <h3 className="text-sm md:text-base font-semibold text-foreground tracking-tight line-clamp-2">
            {topic.title}
          </h3>
        </div>

        {/* Minimalist Progress Indicator */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-medium">Tiến độ bài học</span>
            <span className="font-semibold text-foreground">{topicProgressPercent}%</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${topicProgressPercent}%` }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
              className="h-full bg-brand rounded-full"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              <strong className="text-foreground font-semibold">{completedTopicLessons}</strong>/{totalTopicLessons} đã xong
            </span>
            {completedTopicLessons === totalTopicLessons && totalTopicLessons > 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <Check className="h-3 w-3 stroke-[2.5]" /> Hoàn thành
              </span>
            )}
          </div>
        </div>

        {/* Lesson List */}
        <div className="space-y-2 pt-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1">
          {topicLessons.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground font-normal">
              Chưa có bài học nào trong phần này.
            </div>
          ) : (
            topicLessons.map((l: any, lIdx: number) => renderSidebarLessonItem(l, lIdx))
          )}

          {/* Admin: Add Lesson */}
          {isAdmin && (
            <button
              onClick={() => setShowAddLessonModal(true)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium text-brand bg-brand/5 border border-dashed border-brand/30 hover:bg-brand/10 transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Thêm bài học mới
            </button>
          )}
        </div>

        {/* Other Modules in Course */}
        {otherTopics.length > 0 && (
          <div className="border-t border-border/50 pt-3.5 space-y-2">
            <h5 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Các phần khác
            </h5>
            <div className="space-y-1">
              {otherTopics.map((ot: any, otIdx: number) => (
                <Link
                  key={ot.id}
                  href={`${courseBasePath}/${ot.id}`}
                  className="flex items-center justify-between p-2 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors group"
                >
                  <span className="truncate">Phần {otIdx + (partNumber === 1 ? 2 : 1)}: {ot.title}</span>
                  <ChevronRight className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full relative">
      {/* ── Coursera-Style Calm Top Bar / Breadcrumb ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-border/60 gap-3">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
          <Link
            href="/my-courses"
            className="hover:text-foreground transition-colors font-medium"
          >
            Khóa học của tôi
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-40 shrink-0" />
          <Link
            href={courseBasePath}
            className="hover:text-foreground transition-colors font-medium truncate max-w-[140px] sm:max-w-xs"
          >
            {topic.course?.title || 'Khóa học'}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 opacity-40 shrink-0" />
          <span className="font-semibold text-foreground truncate max-w-[160px] sm:max-w-sm">
            Phần {partNumber}: {topic.title}
          </span>
        </div>

        {/* View Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mobile drawer toggle */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <BookOpen className="h-3.5 w-3.5 text-brand" />
            <span>Mục lục ({completedTopicLessons}/{totalTopicLessons})</span>
          </button>

          {/* Desktop cinema view toggle */}
          <button
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card rounded-xl text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <Menu className="h-3.5 w-3.5 text-brand" />
            <span>{isDesktopSidebarOpen ? 'Thu gọn mục lục' : 'Hiện mục lục'}</span>
          </button>
        </div>
      </div>

      {/* ── Main 2-Column Grid Layout ── */}
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* ── LEFT COLUMN: Video Player / Practice View & Content ── */}
        <div
          ref={videoTopRef}
          className={cn(
            'transition-all duration-300 space-y-6',
            isDesktopSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'
          )}
        >
          {/* Main Content Area */}
          {activeMode === 'video' ? (
            <>
              {/* Cinematic Video Player Container */}
              <div className="rounded-2xl overflow-hidden bg-black border border-border/70 shadow-sm relative aspect-video w-full">
                {activeLesson ? (
                  <CustomVideoPlayer
                    key={activeLesson.videoUrl}
                    url={activeLesson.videoUrl}
                    poster={topic.course?.thumbnail}
                    className="w-full h-full border-0"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center space-y-3 bg-zinc-950 text-zinc-400">
                    <PlayCircle className="h-12 w-12 opacity-40 animate-pulse text-brand" />
                    <p className="text-xs font-medium tracking-wide">
                      Chọn bài học bên danh sách để bắt đầu xem
                    </p>
                  </div>
                )}
              </div>

              {/* Coursera-Style Calm Action Toolbar */}
              <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/70 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
                {/* Mode Tabs (Video / Practice) */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveMode('video')}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer',
                      activeMode === 'video'
                        ? 'bg-brand text-white shadow-xs'
                        : 'bg-muted/50 text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <Video className="h-3.5 w-3.5" />
                    <span>Video bài giảng</span>
                  </button>

                  {hasLessonPractice(activeLesson) && (
                    <button
                      type="button"
                      onClick={() => setActiveMode('practice')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    >
                      <FileQuestion className="h-3.5 w-3.5" />
                      <span>Bài tập trắc nghiệm</span>
                    </button>
                  )}
                </div>

                {/* Lesson Navigation Controls */}
                <div className="flex items-center gap-2">
                  {/* Previous Lesson */}
                  <button
                    disabled={!prevLesson}
                    onClick={handleGoToPrevLesson}
                    title={prevLesson ? `Bài trước: ${prevLesson.title}` : 'Không có bài trước'}
                    className={cn(
                      'inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors',
                      prevLesson
                        ? 'border-border bg-card text-foreground hover:bg-muted cursor-pointer'
                        : 'border-border/40 opacity-40 text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Bài trước</span>
                  </button>

                  {/* Toggle Complete */}
                  {activeLesson && (
                    <button
                      onClick={(e) => handleToggleComplete(activeLesson.id, e)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer border',
                        completedIds.includes(activeLesson.id)
                          ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15'
                          : 'border-border bg-card hover:border-brand/40 hover:bg-brand/5 text-foreground hover:text-brand'
                      )}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                      <span>
                        {completedIds.includes(activeLesson.id) ? 'Đã hoàn thành' : 'Đánh dấu hoàn thành'}
                      </span>
                    </button>
                  )}

                  {/* Next Lesson */}
                  <button
                    disabled={!nextLesson}
                    onClick={handleGoToNextLesson}
                    title={nextLesson ? `Bài tiếp theo: ${nextLesson.title}` : 'Đã đến bài cuối cùng'}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors',
                      nextLesson
                        ? 'bg-brand hover:bg-brand/90 text-white shadow-xs cursor-pointer'
                        : 'border border-border/40 opacity-40 text-muted-foreground cursor-not-allowed'
                    )}
                  >
                    <span className="hidden sm:inline">Bài tiếp theo</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Lesson Overview & Notes Section (Coursera-Inspired Editorial Reading) */}
              <div className="rounded-2xl bg-card border border-border/70 p-6 md:p-8 space-y-6 shadow-2xs">
                {/* Header info */}
                <div className="border-b border-border/60 pb-5 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold text-brand bg-brand/10 px-2.5 py-0.5 rounded-md">
                      Phần {partNumber}: {topic.title}
                    </span>
                    {activeLesson?.duration && (
                      <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 bg-muted/60 px-2.5 py-0.5 rounded-md">
                        <Clock className="h-3 w-3 opacity-70" />
                        {activeLesson.duration}
                      </span>
                    )}
                    {activeLesson && completedIds.includes(activeLesson.id) && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md flex items-center gap-1">
                        <Check className="h-3 w-3 stroke-[2.5]" /> Hoàn thành
                      </span>
                    )}
                  </div>

                  <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight pt-1">
                    {activeLesson ? formatLessonName(activeLesson.title, currentLessonIndex) : topic.title}
                  </h1>
                </div>

                {/* Tabs: Notes vs Overview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4 border-b border-border/50 text-xs font-medium">
                    <button
                      type="button"
                      onClick={() => setActiveTab('notes')}
                      className={cn(
                        'pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5',
                        activeTab === 'notes'
                          ? 'border-brand text-brand font-semibold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>Ghi chú &amp; Tóm tắt bài giảng</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveTab('overview')}
                      className={cn(
                        'pb-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5',
                        activeTab === 'overview'
                          ? 'border-brand text-brand font-semibold'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Compass className="h-3.5 w-3.5" />
                      <span>Mục tiêu &amp; Lộ trình</span>
                    </button>
                  </div>

                  {/* Tab Content 1: Notes Markdown */}
                  {activeTab === 'notes' && (
                    <div className="pt-2">
                      {activeLesson?.description ? (
                        <div className="prose-sm text-foreground/85 leading-relaxed max-w-none space-y-4">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              h1: ({ children }) => (
                                <h2 className="text-base sm:text-lg font-bold text-foreground mt-6 mb-2 pb-1 border-b border-border/60">
                                  {children}
                                </h2>
                              ),
                              h2: ({ children }) => (
                                <h3 className="text-sm sm:text-base font-semibold text-foreground mt-5 mb-2">{children}</h3>
                              ),
                              h3: ({ children }) => (
                                <h4 className="text-xs sm:text-sm font-semibold text-brand mt-4 mb-1.5">{children}</h4>
                              ),
                              p: ({ children }) => (
                                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed mb-3 font-normal">{children}</p>
                              ),
                              ul: ({ children }) => (
                                <ul className="list-disc pl-5 text-xs sm:text-sm space-y-1.5 mb-3 font-normal text-foreground/80">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal pl-5 text-xs sm:text-sm space-y-1.5 mb-3 font-normal text-foreground/80">{children}</ol>
                              ),
                              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                              blockquote: ({ children }) => (
                                <blockquote className="border-l-3 border-brand pl-3.5 py-1.5 bg-brand/5 rounded-r-lg text-xs sm:text-sm italic text-muted-foreground my-3">
                                  {children}
                                </blockquote>
                              ),
                              code: ({ children, className: cls }) => {
                                const isBlock = cls?.includes('language-');
                                return isBlock ? (
                                  <code className="block bg-muted/60 border border-border/70 rounded-xl px-4 py-3 text-xs font-mono text-foreground my-3 overflow-x-auto">
                                    {children}
                                  </code>
                                ) : (
                                  <code className="bg-muted/80 border border-border/50 px-1.5 py-0.5 rounded text-xs font-mono text-brand font-medium">
                                    {children}
                                  </code>
                                );
                              },
                              strong: ({ children }) => (
                                <strong className="font-semibold text-foreground">{children}</strong>
                              ),
                              hr: () => <hr className="border-border/50 my-4" />,
                            }}
                          >
                            {activeLesson.description}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-xs text-muted-foreground italic">
                          Chưa có ghi chú văn bản cho bài giảng này. Hãy xem video để nắm trọn nội dung.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab Content 2: Overview */}
                  {activeTab === 'overview' && (
                    <div className="pt-2 space-y-4 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                        <h4 className="font-semibold text-foreground flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-brand" />
                          Mục tiêu đầu ra của bài học
                        </h4>
                        <ul className="list-disc pl-5 space-y-1 text-foreground/80 text-xs">
                          <li>Nắm vững phương pháp và lý thuyết nền tảng trong bài giảng.</li>
                          <li>Thực hành phản xạ với câu hỏi trắc nghiệm đính kèm.</li>
                          <li>Áp dụng trực tiếp vào quá trình luyện đề thực tế.</li>
                        </ul>
                      </div>

                      <div className="flex items-center gap-3 pt-2 text-xs">
                        <span className="font-medium text-foreground">Gợi ý học tập:</span>
                        <span>Nghe trọn vẹn 1 lần &rarr; Ghi chú từ khóa &rarr; Hoàn thành bài trắc nghiệm.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Practice Mode View */
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

      {/* ── Mobile Drawer ── */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-xs"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-background border-l border-border p-5 shadow-xl overflow-y-auto z-10 flex flex-col space-y-5"
            >
              <div className="flex items-center justify-between pb-3 border-b border-border/70">
                <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <FolderOpen className="h-4 w-4 text-brand" />
                  Nội dung bài học
                </span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
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
