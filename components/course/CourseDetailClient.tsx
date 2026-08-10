'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, PlayCircle, BookOpen, Menu, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { CurriculumPanel } from '@/components/course/CurriculumPanel';
import { EditLessonModal } from '@/components/course/EditLessonModal';
import { AddLessonModal, parseYouTubeUrl } from '@/components/course/AddLessonModal';
import { completeLessonAction } from '@/actions/progress.action';
import { createLessonAction, updateLessonAction, deleteLessonAction } from '@/actions/lesson.action';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { useCourseDetailStore } from '@/stores/useCourseDetailStore';
import { toast } from 'react-hot-toast';

interface CourseDetailClientProps {
  course: any;
  userId: string;
  initialCompletedLessonIds: string[];
}

export default function CourseDetailClient({ course, userId, initialCompletedLessonIds }: CourseDetailClientProps) {
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
    reset: resetCourseDetailState,
  } = useCourseDetailStore();

  useEffect(() => {
    resetCourseDetailState();
    useCourseDetailStore.getState().setCompletedIds(initialCompletedLessonIds);
    useCourseDetailStore.getState().setLessons(course?.lessons || []);
    useCourseDetailStore.getState().setActiveLesson(course?.lessons?.[0] || null);
    return () => resetCourseDetailState();
  }, [course, initialCompletedLessonIds, resetCourseDetailState]);

  const handleToggleComplete = async (lessonId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Optimistic UI update
    const alreadyCompleted = completedIds.includes(lessonId);
    setCompletedIds(
      alreadyCompleted
        ? completedIds.filter((id) => id !== lessonId)
        : [...completedIds, lessonId]
    );

    const res = await completeLessonAction(userId, lessonId, course.id);
    if (!res.success) {
      // Revert if failed
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

  // ── Edit lesson handlers ──
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
    const res = await updateLessonAction(editingLesson.id, course.id, {
      title: editLessonForm.title,
      duration: editLessonForm.duration,
      videoUrl: editLessonForm.videoUrl,
      description: editLessonForm.description,
    });
    setIsSavingLesson(false);

    if (res.success && res.lesson) {
      setLessons(lessons.map((l) => (l.id === editingLesson.id ? { ...l, ...res.lesson } : l)));
      if (activeLesson?.id === editingLesson.id) {
        setActiveLesson({ ...activeLesson, ...res.lesson });
      }
      setShowEditLessonModal(false);
      setEditingLesson(null);
      toast.success('Cập nhật bài học thành công!');
    } else {
      toast.error('Không thể cập nhật bài học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const openDeleteLesson = (lesson: any) => {
    setDeletingLesson(lesson);
    setShowDeleteLessonModal(true);
  };

  const handleDeleteLesson = async () => {
    if (!deletingLesson) return;
    setIsDeletingLesson(true);
    const res = await deleteLessonAction(deletingLesson.id, course.id);
    setIsDeletingLesson(false);

    if (res.success) {
      const updated = lessons.filter((l) => l.id !== deletingLesson.id);
      setLessons(updated);
      if (activeLesson?.id === deletingLesson.id) {
        setActiveLesson(updated[0] || null);
      }
      setShowDeleteLessonModal(false);
      setDeletingLesson(null);
      toast.success('Xóa bài học thành công!');
    } else {
      toast.error('Không thể xoá bài học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const handleAddLesson = async (form: { title: string; duration: string; videoUrl: string; description: string }) => {
    setIsAddingLesson(true);
    const res = await createLessonAction({
      courseId: course.id,
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
    completed: completedIds.includes(l.id)
  }));

  const formattedCourse = {
    ...course,
    lessons: formattedLessons
  };

  const completedCount = completedIds.length;
  const progressPercent = formattedLessons.length > 0 
    ? Math.round((completedCount / formattedLessons.length) * 100) 
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/courses" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group">
          <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Courses
        </Link>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-xl text-xs font-bold hover:bg-muted"
          >
            <BookOpen className="h-4 w-4 text-primary" />
            <span>Mục lục ({formattedLessons.length})</span>
          </button>
          <button
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className="hidden lg:flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-xl text-xs font-bold hover:bg-muted transition-all"
          >
            <Menu className="h-4 w-4 text-primary" />
            <span>{isDesktopSidebarOpen ? 'Cinema View (Ẩn mục lục)' : 'Hiện mục lục'}</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-12">
        {/* Video + Info */}
        <div className={cn('transition-all duration-300 space-y-8', isDesktopSidebarOpen ? 'lg:col-span-8' : 'lg:col-span-12')}>
          <div className="aspect-video rounded-[2.5rem] bg-card border border-border overflow-hidden shadow-2xl">
            {activeLesson ? (
              (() => {
                const yt = parseYouTubeUrl(activeLesson.videoUrl);
                return yt ? (
                  <iframe
                    key={yt.embedUrl}
                    src={yt.embedUrl}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                ) : (
                  <video
                    key={activeLesson.videoUrl}
                    src={activeLesson.videoUrl}
                    controls
                    className="w-full h-full object-cover"
                    poster={course.thumbnail}
                  />
                );
              })()
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center space-y-4">
                <PlayCircle className="h-20 w-20 text-muted" />
                <p className="text-muted-foreground font-bold uppercase tracking-widest text-sm">Select a lesson to start</p>
              </div>
            )}
          </div>

          <div className="p-10 rounded-[2.5rem] bg-card border border-border space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-4 underline decoration-primary decoration-4 underline-offset-8">
                {activeLesson ? activeLesson.title : course.title}
              </h1>
              {activeLesson?.description && (
                <div className="mt-6 p-6 rounded-2xl bg-muted/40 border border-border/50">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-3">Lesson Description</h4>
                  <div className="prose-sm text-muted-foreground leading-relaxed">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-lg font-extrabold text-foreground mt-3 mb-1.5 pb-1 border-b border-border">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold text-foreground mt-2 mb-1">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold text-primary mt-1.5 mb-1">{children}</h3>,
                        p: ({ children }) => <p className="text-sm text-foreground/80 leading-relaxed mb-2">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 text-sm text-foreground/80 space-y-1 mb-2">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 text-sm text-foreground/80 space-y-1 mb-2">{children}</ol>,
                        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/50 pl-3 py-1 bg-primary/5 rounded-r-lg text-sm italic text-muted-foreground mb-2">{children}</blockquote>,
                        code: ({ children, className: cls }) => {
                          const isBlock = cls?.includes('language-');
                          return isBlock
                            ? <code className="block bg-muted border border-border rounded-xl px-4 py-3 text-xs font-mono text-foreground mb-2 overflow-x-auto">{children}</code>
                            : <code className="bg-muted border border-border/50 px-1.5 py-0.5 rounded-md text-xs font-mono text-primary">{children}</code>;
                        },
                        table: ({ children }) => <div className="overflow-x-auto mb-3 rounded-xl border border-border"><table className="min-w-full text-sm">{children}</table></div>,
                        thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
                        th: ({ children }) => <th className="px-3 py-2 text-left font-bold text-foreground text-xs uppercase tracking-widest border-b border-border">{children}</th>,
                        td: ({ children }) => <td className="px-3 py-2 text-foreground/80 border-b border-border/40 text-sm">{children}</td>,
                        strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                        hr: () => <hr className="border-border my-3" />,
                      }}
                    >
                      {activeLesson.description}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
            <div className="pt-6 border-t border-border">
              <h3 className="text-lg font-bold text-foreground mb-4">Course Syllabus</h3>
              <div className="prose dark:prose-invert prose-lg max-w-none prose-headings:text-primary prose-strong:text-primary/80 prose-li:text-muted-foreground prose-p:text-muted-foreground">
                <ReactMarkdown>{course.description}</ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        {isDesktopSidebarOpen && (
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            <CurriculumPanel
              course={formattedCourse}
              activeLesson={activeLesson}
              progressPercent={progressPercent}
              onSelectLesson={(lesson) => { setActiveLesson(lesson); setIsMobileDrawerOpen(false); }}
              onToggleComplete={handleToggleComplete}
              onEditLesson={openEditLesson}
              onDeleteLesson={openDeleteLesson}
              onAddLesson={() => setShowAddLessonModal(true)}
            />
          </div>
        )}
      </div>

      {/* FAB Mobile */}
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
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-card border-l border-border p-6 shadow-2xl overflow-y-auto z-10 flex flex-col space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-lg font-bold text-foreground">Menu Chương Học</span>
                <button onClick={() => setIsMobileDrawerOpen(false)} className="p-2 bg-muted hover:bg-accent text-foreground rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1">
                <CurriculumPanel
                  course={formattedCourse}
                  activeLesson={activeLesson}
                  progressPercent={progressPercent}
                  onSelectLesson={(lesson) => { setActiveLesson(lesson); setIsMobileDrawerOpen(false); }}
                  onToggleComplete={handleToggleComplete}
                  onEditLesson={openEditLesson}
                  onDeleteLesson={openDeleteLesson}
                  onAddLesson={() => { setIsMobileDrawerOpen(false); setShowAddLessonModal(true); }}
                />
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
        onClose={() => { setShowEditLessonModal(false); setEditingLesson(null); }}
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
        onCancel={() => { setShowDeleteLessonModal(false); setDeletingLesson(null); }}
      />
    </div>
  );
}
