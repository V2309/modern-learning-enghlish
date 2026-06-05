'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface EditCourseForm {
  title: string;
  description: string;
  thumbnail: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

interface EditCourseModalProps {
  show: boolean;
  form: EditCourseForm;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof EditCourseForm, value: string) => void;
}

export const EditCourseModal = ({
  show,
  form,
  isSaving,
  onClose,
  onSave,
  onChange,
}: EditCourseModalProps) => {
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
                <h2 className="text-2xl font-bold text-foreground">Sửa khoá học</h2>
                <p className="text-muted-foreground text-sm">Cập nhật thông tin khoá học.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
                <X />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Course Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => onChange('title', e.target.value)}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. English for Marketing"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Description (Markdown Supported)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => onChange('description', e.target.value)}
                  rows={4}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all resize-none"
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
                    value={form.level}
                    onChange={(e) => onChange('level', e.target.value)}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Thumbnail URL</label>
                  <input
                    type="text"
                    value={form.thumbnail}
                    onChange={(e) => onChange('thumbnail', e.target.value)}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-xs font-mono"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Thumbnail preview */}
              {form.thumbnail && (
                <div className="rounded-2xl overflow-hidden border border-border aspect-video">
                  <img src={form.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 bg-muted/50 border-t border-border shrink-0">
              <button
                onClick={onSave}
                disabled={!form.title || isSaving}
                className="w-full py-4 bg-primary disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
