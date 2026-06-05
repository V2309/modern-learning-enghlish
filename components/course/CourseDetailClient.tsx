'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, PlayCircle, BookOpen, Menu, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';
import { CurriculumPanel } from '@/components/course/CurriculumPanel';
import { completeLessonAction } from '@/actions/progress.action';

interface CourseDetailClientProps {
  course: any;
  userId: string;
  initialCompletedLessonIds: string[];
}

export default function CourseDetailClient({ course, userId, initialCompletedLessonIds }: CourseDetailClientProps) {
  const [completedIds, setCompletedIds] = useState<string[]>(initialCompletedLessonIds);
  const [activeLesson, setActiveLesson] = useState<any | null>(course?.lessons?.[0] || null);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const handleToggleComplete = async (lessonId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Optimistic UI update
    const alreadyCompleted = completedIds.includes(lessonId);
    setCompletedIds((prev) => 
      alreadyCompleted 
        ? prev.filter((id) => id !== lessonId) 
        : [...prev, lessonId]
    );

    const res = await completeLessonAction(userId, lessonId, course.id);
    if (!res.success) {
      // Revert if failed
      setCompletedIds((prev) => 
        alreadyCompleted 
          ? [...prev, lessonId] 
          : prev.filter((id) => id !== lessonId)
      );
      alert('Không thể lưu tiến độ: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const formattedLessons = course.lessons?.map((l: any) => ({
    ...l,
    completed: completedIds.includes(l.id)
  })) || [];

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
              <video src={activeLesson.videoUrl} controls className="w-full h-full object-cover" poster={course.thumbnail} />
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
                  <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Lesson Description</h4>
                  <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-line">{activeLesson.description}</p>
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
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
