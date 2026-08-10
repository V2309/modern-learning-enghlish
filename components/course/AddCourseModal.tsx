'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Layout } from 'lucide-react';

interface NewLesson {
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
}

interface NewCourse {
  title: string;
  description: string;
  thumbnail: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface AddCourseModalProps {
  show: boolean;
  newCourse: NewCourse;
  newLessons: NewLesson[];
  onClose: () => void;
  onSave: () => void;
  onCourseChange: (field: keyof NewCourse, value: string) => void;
  onAddLesson: () => void;
  onRemoveLesson: (idx: number) => void;
  onUpdateLesson: (idx: number, field: string, value: string) => void;
}

export const AddCourseModal = ({
  show,
  newCourse,
  newLessons,
  onClose,
  onSave,
  onCourseChange,
  onAddLesson,
  onRemoveLesson,
  onUpdateLesson,
}: AddCourseModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/90 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-xl max-h-[85vh] bg-card border border-border rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Create New Course</h2>
                <p className="text-muted-foreground text-sm">Design your own learning path.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-4xl hover:bg-muted text-muted-foreground transition-all">
                <X />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Course Title</label>
                <input
                  type="text" value={newCourse.title}
                  onChange={(e) => onCourseChange('title', e.target.value)}
                  className="w-full bg-muted border border-border rounded-4xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. English for Marketing"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Description (Markdown Supported)</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => onCourseChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-muted border border-border rounded-4xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all resize-none"
                  placeholder="Describe what users will learn..."
                />
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium italic">
                  <Sparkles className="h-3 w-3" />
                  Use # for headings and - for lists
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Level</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => onCourseChange('level', e.target.value)}
                    className="w-full bg-muted border border-border rounded-4xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Thumbnail</label>
                  <div className="h-12 flex items-center gap-4 bg-muted border border-border rounded-4xl px-4">
                    <Layout className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">Default Random Image</span>
                  </div>
                </div>
              </div>

              {/* Lessons */}
              <div className="space-y-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Lessons List ({newLessons.length})
                  </label>
                  <button
                    type="button" onClick={onAddLesson}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs text-primary bg-primary/10 rounded-4xl hover:bg-primary hover:text-white transition-all font-bold cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Lesson
                  </button>
                </div>
                <div className="space-y-3">
                  {newLessons.map((lesson, idx) => (
                    <div key={idx} className="p-4 bg-muted/40 border border-border rounded-3xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">Lesson {idx + 1}</span>
                        {newLessons.length > 1 && (
                          <button type="button" onClick={() => onRemoveLesson(idx)} className="p-1 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors cursor-pointer">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="col-span-1 md:col-span-2">
                          <input type="text" value={lesson.title} onChange={(e) => onUpdateLesson(idx, 'title', e.target.value)}
                            className="w-full bg-background border border-border rounded-4xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                            placeholder="e.g. Lesson Title" />
                        </div>
                        <input type="text" value={lesson.duration} onChange={(e) => onUpdateLesson(idx, 'duration', e.target.value)}
                          className="w-full bg-background border border-border rounded-4xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                          placeholder="Duration (e.g. 10:00)" />
                      </div>
                      <input type="text" value={lesson.videoUrl} onChange={(e) => onUpdateLesson(idx, 'videoUrl', e.target.value)}
                        className="w-full bg-background border border-border rounded-4xl px-3 py-2 text-xs text-muted-foreground focus:outline-none focus:border-primary transition-all font-mono"
                        placeholder="Video Link (e.g. mp4 URL)" />
                      <input type="text" value={lesson.description} onChange={(e) => onUpdateLesson(idx, 'description', e.target.value)}
                        className="w-full bg-background border border-border rounded-4xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary transition-all"
                        placeholder="Mô tả ngắn gọn nội dung bài tập/bài học..." />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-muted/50 border-t border-border shrink-0">
              <button onClick={onSave} disabled={!newCourse.title}
                className="w-full py-4 bg-primary disabled:opacity-50 disabled:grayscale text-white rounded-4xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20">
                <Plus className="h-5 w-5" />
                Create Course
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
