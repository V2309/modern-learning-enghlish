'use client';

import React, { useEffect } from 'react';
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
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { EditLessonModal } from '@/components/course/EditLessonModal';
import { AddLessonModal } from '@/components/course/AddLessonModal';
import { CustomVideoPlayer } from '@/components/CustomVideoPlayer';
import { completeLessonAction } from '@/actions/progress.action';
import { createLessonAction, updateLessonAction, deleteLessonAction } from '@/actions/lesson.action';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { useCourseTopicStore } from '@/stores/useCourseTopicStore';
import { toast } from 'react-hot-toast';

interface CourseTopicClientProps {
  topic: any;   // CourseTopic with lessons[] and course
  userId: string;
  initialCompletedLessonIds: string[];
  basePath?: string; // e.g. '/my-courses/[courseId]' or '/courses/[courseId]'
}

export default function CourseTopicClient({
  topic,
  userId,
  initialCompletedLessonIds,
  basePath,
}: CourseTopicClientProps) {
  const courseBasePath = basePath ?? `/courses/${topic.courseId}`;
  const {
    completedIds,
    activeLesson,
    lessons,
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
    setActiveLesson,
    setLessons,
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

  useEffect(() => {
    resetStore();
    useCourseTopicStore.getState().setCompletedIds(initialCompletedLessonIds);
    useCourseTopicStore.getState().setLessons(topic?.lessons || []);
    useCourseTopicStore.getState().setActiveLesson(topic?.lessons?.[0] || null);
    return () => resetStore();
  }, [topic, initialCompletedLessonIds, resetStore]);

  // ── Progress ──
  const handleToggleComplete = async (lessonId: string, event: React.MouseEvent) => {
    event.stopPropagation();
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
      toast.success(alreadyCompleted ? 'Đã hủy hoàn thành bài học!' : 'Hoàn thành bài học!');
    }
  };

  // ── Edit lesson ──
  const openEditLesson = (lesson: any) => {
    setEditingLesson(lesson);
    setEditLessonForm({
      title: lesson.title,
      duration: lesson.duration,
      videoUrl: lesson.videoUrl,
      description: lesson.description || '',
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
      },
      topic.id
    );
    setIsSavingLesson(false);
    if (res.success && res.lesson) {
      setLessons(lessons.map((l) => (l.id === editingLesson.id ? { ...l, ...res.lesson } : l)));
      if (activeLesson?.id === editingLesson.id) setActiveLesson({ ...activeLesson, ...res.lesson });
      setShowEditLessonModal(false);
      setEditingLesson(null);
      toast.success('Cập nhật bài học thành công!');
    } else {
      toast.error('Không thể cập nhật bài học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  // ── Delete lesson ──
  const openDeleteLesson = (lesson: any) => {
    setDeletingLesson(lesson);
    setShowDeleteLessonModal(true);
  };

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    setIsDeletingLesson(true);
    const res = await deleteLessonAction(deletingLesson.id, topic.courseId, topic.id);
    setIsDeletingLesson(false);
    if (res.success) {
      const updated = lessons.filter((l) => l.id !== deletingLesson.id);
      setLessons(updated);
      if (activeLesson?.id === deletingLesson.id) setActiveLesson(updated[0] || null);
      setShowDeleteLessonModal(false);
      setDeletingLesson(null);
      toast.success('Xóa bài học thành công!');
    } else {
      toast.error('Không thể xoá bài học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  // ── Add lesson ──
  const handleAddLesson = async (form: {
    title: string;
    duration: string;
    videoUrl: string;
    description: string;
  }) => {
    setIsAddingLesson(true);
    const res = await createLessonAction({
      courseId: topic.courseId,
      topicId: topic.id,
      title: form.title,
      duration: form.duration || '00:00',
      videoUrl: form.videoUrl,
      description: form.description,
    });
    setIsAddingLesson(false);
    if (res.success && res.lesson) {
      setLessons([...lessons, res.lesson]);
      setShowAddLessonModal(false);
      toast.success('Thêm bài học mới thành công!');
    } else {
      toast.error('Không thể thêm bài học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const formattedLessons = lessons.map((l: any) => ({
    ...l,
    completed: completedIds.includes(l.id),
  }));

  const completedCount = completedIds.filter((id) => lessons.some((l) => l.id === id)).length;
  const progressPercent =
    formattedLessons.length > 0
      ? Math.round((completedCount / formattedLessons.length) * 100)
      : 0;

  const renderLessonRow = (lesson: any, index: number) => {
    const isActive = activeLesson?.id === lesson.id;
    return (
      <motion.div
        key={lesson.id}
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.04 }}
        className="group/item relative"
      >
        <div
          role="button"
          tabIndex={0}
          onClick={() => setActiveLesson(lesson)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setActiveLesson(lesson);
            }
          }}
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            isActive
              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
              : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/30 hover:text-foreground'
          )}
        >
          <div
            className={cn(
              'h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold text-sm',
              isActive ? 'bg-white/20' : 'bg-muted'
            )}
          >
            {index + 1}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold truncate text-sm">{lesson.title}</h4>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest mt-1 opacity-60">
              <Clock className="h-3 w-3" />
              {lesson.duration}
            </div>
          </div>
          <div className="shrink-0">
            <button
              onClick={(e) => handleToggleComplete(lesson.id, e)}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title={lesson.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
            >
              {lesson.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 fill-green-500/10" />
              ) : (
                <div
                  className={cn(
                    'h-5 w-5 border-2 rounded-full flex items-center justify-center transition-colors',
                    isActive
                      ? 'border-white/50 hover:border-white'
                      : 'border-muted-foreground/30 hover:border-primary'
                  )}
                >
                  <Play
                    className={cn(
                      'h-1.5 w-1.5 relative left-[0.5px]',
                      isActive ? 'text-white fill-white' : 'text-muted-foreground/60'
                    )}
                  />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Edit / Delete hover buttons */}
        <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              openEditLesson(lesson);
            }}
            title="Sửa bài học"
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isActive
                ? 'bg-white/20 hover:bg-white/30 text-white'
                : 'bg-muted hover:bg-primary/10 hover:text-primary text-muted-foreground'
            )}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDeleteLesson(lesson);
            }}
            title="Xoá bài học"
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              isActive
                ? 'bg-white/20 hover:bg-red-400/40 text-white'
                : 'bg-muted hover:bg-red-500/10 hover:text-red-500 text-muted-foreground'
            )}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </motion.div>
    );
  };

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Lesson List */}
      <div className="p-8 rounded-[2.5rem] bg-card border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Danh sách bài học
          </h3>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {formattedLessons.length} bài
          </span>
        </div>

        <div className="space-y-3 max-h-[60vh] xl:max-h-[70vh] overflow-y-auto pr-1">
          {formattedLessons.length === 0 ? (
            <p className="text-center py-8 text-sm text-muted-foreground font-semibold">
              Chưa có bài học nào.
            </p>
          ) : (
            formattedLessons.map((lesson, idx) => renderLessonRow(lesson, idx))
          )}
        </div>

        {/* Add lesson button */}
        <button
          onClick={() => setShowAddLessonModal(true)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm font-bold cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Thêm bài học
        </button>

        {/* Progress bar */}
        <div className="mt-8 p-6 rounded-2xl bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest">
              Tiến độ học tập
            </h4>
            <span className="text-xs font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">
            {completedCount} / {formattedLessons.length} bài đã hoàn thành
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href={courseBasePath}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
        >
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-semibold truncate max-w-[200px] sm:max-w-none">
            {topic.course?.title || 'Quầy lại khóa học'}
          </span>
        </Link>

        <div className="flex gap-2">
          {/* Mobile drawer toggle */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-xl text-xs font-bold hover:bg-muted transition-all"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Bài học ({formattedLessons.length})</span>
          </button>
          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-xl text-xs font-bold hover:bg-muted transition-all"
          >
            <Menu className="h-4 w-4 text-primary" />
            <span>{isDesktopSidebarOpen ? 'Cinema View (Ẩn mục lục)' : 'Hiện mục lục'}</span>
          </button>
        </div>
      </div>

      {/* ── Topic title / meta ── */}
      <div className="mb-8 space-y-1">
        <p className="text-xs font-black uppercase tracking-widest text-primary">
          {topic.course?.title}
        </p>
        <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{topic.title}</h1>
        {topic.description && (
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed max-w-3xl">
            {topic.description}
          </p>
        )}
      </div>

      {/* ── Main layout ── */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* Video + Info */}
        <div
          className={cn(
            'transition-all duration-300 space-y-8',
            isDesktopSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12'
          )}
        >
          {/* Video player */}
          <div className="aspect-video rounded-xl md:rounded-2xl overflow-hidden shadow-2xl bg-black">
            {activeLesson ? (
              <CustomVideoPlayer
                key={activeLesson.videoUrl}
                url={activeLesson.videoUrl}
                poster={topic.course?.thumbnail}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <PlayCircle className="h-20 w-20 text-muted" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">
                  Chọn bài học để bắt đầu
                </p>
              </div>
            )}
          </div>

          {/* Lesson info card */}
          <div className="p-8 md:p-10 rounded-[2.5rem] bg-card border border-border space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2 underline decoration-primary decoration-4 underline-offset-8">
                {activeLesson ? activeLesson.title : topic.title}
              </h2>
              {activeLesson?.duration && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold mt-2">
                  <Clock className="h-3.5 w-3.5 text-primary" />
                  {activeLesson.duration}
                </div>
              )}
            </div>

            {/* Lesson description */}
            {activeLesson?.description && (
              <div className="p-6 rounded-2xl bg-muted/40 border border-border/50">
                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">
                  Nội dung bài học
                </h4>
                <div className="prose-sm text-muted-foreground leading-relaxed">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="text-lg font-extrabold text-foreground mt-3 mb-1.5 pb-1 border-b border-border">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-base font-bold text-foreground mt-2 mb-1">{children}</h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-sm font-bold text-primary mt-1.5 mb-1">{children}</h3>
                      ),
                      p: ({ children }) => (
                        <p className="text-sm text-foreground/80 leading-relaxed mb-2">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc pl-5 text-sm text-foreground/80 space-y-1 mb-2">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal pl-5 text-sm text-foreground/80 space-y-1 mb-2">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/50 pl-3 py-1 bg-primary/5 rounded-r-lg text-sm italic text-muted-foreground mb-2">
                          {children}
                        </blockquote>
                      ),
                      code: ({ children, className: cls }) => {
                        const isBlock = cls?.includes('language-');
                        return isBlock ? (
                          <code className="block bg-muted border border-border rounded-xl px-4 py-3 text-xs font-mono text-foreground mb-2 overflow-x-auto">
                            {children}
                          </code>
                        ) : (
                          <code className="bg-muted border border-border/50 px-1.5 py-0.5 rounded-md text-xs font-mono text-primary">
                            {children}
                          </code>
                        );
                      },
                      strong: ({ children }) => (
                        <strong className="font-bold text-foreground">{children}</strong>
                      ),
                      hr: () => <hr className="border-border my-3" />,
                    }}
                  >
                    {activeLesson.description}
                  </ReactMarkdown>
                </div>
              </div>
            )}

            {/* Topic description when no lesson selected */}
            {!activeLesson && topic.description && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-base font-bold text-foreground mb-2">Giới thiệu chủ đề</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{topic.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Sidebar */}
        {isDesktopSidebarOpen && (
          <div className="hidden lg:block lg:col-span-4">
            <SidebarContent />
          </div>
        )}
      </div>

      {/* Mobile FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="flex items-center gap-2 h-14 px-6 bg-primary text-white rounded-full font-bold shadow-2xl hover:bg-primary/95 transition-all shadow-primary/30"
        >
          <BookOpen className="h-5 w-5" />
          <span>Bài học ({formattedLessons.length})</span>
        </button>
      </div>

      {/* Mobile Drawer */}
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
              className="relative w-full max-w-sm h-full bg-card border-l border-border p-6 shadow-2xl overflow-y-auto z-10 flex flex-col space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-lg font-bold text-foreground">Danh sách bài học</span>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-2 bg-muted hover:bg-accent text-foreground rounded-xl"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1">
                <SidebarContent />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Lesson Modal */}
      <AddLessonModal
        show={showAddLessonModal}
        isSaving={isAddingLesson}
        onClose={() => setShowAddLessonModal(false)}
        onSave={handleAddLesson}
      />

      {/* Edit Lesson Modal */}
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

      {/* Delete Lesson Confirm Modal */}
      <ConfirmDeleteModal
        show={showDeleteLessonModal}
        title={`Xoá bài học "${deletingLesson?.title}"?`}
        description="Bài học này sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác."
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
