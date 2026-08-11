'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Play, 
  Sparkles, 
  Pencil, 
  Trash2, 
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lesson {
  id: string;
  courseId: string;
  topicId?: string | null;
  title: string;
  duration: string;
  videoUrl: string;
  description?: string | null;
  completed?: boolean;
}

interface Topic {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  level: string;
  lessons: Lesson[];
  topics?: Topic[];
}

interface CurriculumPanelProps {
  course: Course;
  activeLesson: Lesson | null;
  progressPercent: number;
  onSelectLesson: (lesson: Lesson) => void;
  onToggleComplete: (lessonId: string, e: React.MouseEvent) => void;
  onEditLesson?: (lesson: Lesson) => void;
  onDeleteLesson?: (lesson: Lesson) => void;
  onAddLesson?: () => void;
}

export const CurriculumPanel = ({
  course,
  activeLesson,
  progressPercent,
  onSelectLesson,
  onToggleComplete,
  onEditLesson,
  onDeleteLesson,
  onAddLesson,
}: CurriculumPanelProps) => {
  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});

  // Auto-expand the topic containing the active lesson
  useEffect(() => {
    if (activeLesson?.topicId) {
      setExpandedTopics((prev) => ({
        ...prev,
        [activeLesson.topicId!]: true
      }));
    }
  }, [activeLesson]);

  const toggleTopic = (topicId: string) => {
    setExpandedTopics((prev) => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const hasTopics = course.topics && course.topics.length > 0;

  // Separate lessons that do not belong to any topic
  const generalLessons = course.lessons.filter(
    (lesson) => !lesson.topicId || (course.topics && !course.topics.some((t) => t.id === lesson.topicId))
  );

  const renderLessonItem = (lesson: Lesson, index: number) => {
    const isActive = activeLesson?.id === lesson.id;
    return (
      <div key={lesson.id} className="group/item relative">
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectLesson(lesson)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelectLesson(lesson);
            }
          }}
          className={cn(
            'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            isActive
              ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
              : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted hover:border-muted-foreground/30 hover:text-foreground'
          )}
        >
          <div className={cn('h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold', isActive ? 'bg-white/20' : 'bg-muted')}>
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
              onClick={(e) => onToggleComplete(lesson.id, e)}
              className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
              title={lesson.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
            >
              {lesson.completed ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 fill-green-500/10" />
              ) : (
                <div className={cn('h-5 w-5 border-2 rounded-full flex items-center justify-center transition-colors', isActive ? 'border-white/50 hover:border-white' : 'border-muted-foreground/30 hover:border-primary')}>
                  <Play className={cn('h-1.5 w-1.5 relative left-[0.5px]', isActive ? 'text-white fill-white' : 'text-muted-foreground/60')} />
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Edit / Delete buttons — appear on row hover */}
        {(onEditLesson || onDeleteLesson) && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity z-10">
            {onEditLesson && (
              <button
                onClick={(e) => { e.stopPropagation(); onEditLesson(lesson); }}
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
            )}
            {onDeleteLesson && (
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteLesson(lesson); }}
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
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Lesson list container */}
      <div className="p-8 rounded-[2.5rem] bg-card border border-border">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Nội dung khóa học
          </h3>
          <span className="text-xs font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            {course.lessons.length} bài học
          </span>
        </div>

        <div className="space-y-4 max-h-[60vh] xl:max-h-[70vh] overflow-y-auto pr-1">
          {/* 1. General Lessons (without topic) */}
          {generalLessons.length > 0 && (
            <div className="space-y-3">
              {generalLessons.map((lesson, idx) => renderLessonItem(lesson, idx))}
            </div>
          )}

          {/* 2. Grouped Topics */}
          {hasTopics && course.topics!.map((topic, topicIdx) => {
            const isExpanded = !!expandedTopics[topic.id];
            return (
              <div key={topic.id} className="border border-border/80 rounded-2xl overflow-hidden bg-muted/20">
                {/* Topic Header Accordion Trigger */}
                <button
                  onClick={() => toggleTopic(topic.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-slate-850 dark:text-foreground hover:bg-muted/40 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <span className="text-[10px] text-primary font-black uppercase tracking-wider block mb-1">Chủ đề {topicIdx + 1}</span>
                    <h4 className="text-sm font-extrabold truncate">{topic.title}</h4>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-[10px] font-bold text-slate-400 bg-muted px-2 py-0.5 rounded-full uppercase">
                      {topic.lessons.length} bài học
                    </span>
                    {isExpanded ? (
                      <ChevronUp size={16} className="text-slate-500" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-500" />
                    )}
                  </div>
                </button>

                {/* Topic Lessons List */}
                {isExpanded && (
                  <div className="p-4 bg-white dark:bg-card/40 border-t border-border/50 space-y-3">
                    {topic.lessons.length === 0 ? (
                      <div className="text-center py-4 text-xs text-muted-foreground font-semibold">Chưa có bài học nào trong chủ đề này.</div>
                    ) : (
                      topic.lessons.map((lesson, lessonIdx) => renderLessonItem(lesson, lessonIdx))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add lesson button */}
        {onAddLesson && (
          <button
            onClick={onAddLesson}
            className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all text-sm font-bold cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm bài học
          </button>
        )}

        {/* Progress bar */}
        <div className="mt-10 p-6 rounded-2xl bg-primary/10 border border-primary/20">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Tiến độ học tập</h4>
            <span className="text-xs font-bold text-primary">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-primary/20 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* AI Tutor CTA */}
      <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
        <h4 className="text-lg font-bold text-foreground mb-2">Trợ giúp học tập</h4>
        <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
          Trao đổi trực tiếp và nhận hướng dẫn lộ trình học từ Trợ lý học tập AI thông minh.
        </p>
        <button className="w-full py-4 bg-background/50 hover:bg-background/80 border border-border/50 backdrop-blur-sm transition-all rounded-2xl font-bold text-foreground text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer">
          <Sparkles className="h-4 w-4 text-primary" />
          Chat với AI Tutor
        </button>
      </div>
    </div>
  );
};
