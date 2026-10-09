'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Pencil } from 'lucide-react';

interface EditCourseForm {
  title: string;
  description: string;
  thumbnail: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  accessCode: string;
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="relative w-full max-w-2xl max-h-[90vh] bg-card border border-border rounded-none shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 sm:p-7 border-b border-border flex items-center justify-between shrink-0 bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-none bg-brand/10 border border-brand/20 text-brand">
                  <Pencil className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">Sửa Khóa Học</h2>
                  <p className="text-muted-foreground text-xs font-medium">Cập nhật thông tin và cài đặt khóa học.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-none bg-transparent hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
              {/* Course Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider pl-1">
                  Tên Khóa Học <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => onChange('title', e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-none px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-2xs placeholder:text-muted-foreground/60"
                  placeholder="e.g. English for Marketing"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider pl-1">
                  Mô Tả Khóa Học (Hỗ trợ Markdown)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => onChange('description', e.target.value)}
                  rows={4}
                  className="w-full bg-muted/40 border border-border rounded-none px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-brand transition-all resize-none shadow-2xs placeholder:text-muted-foreground/60"
                  placeholder="Mô tả nội dung, mục tiêu và kết quả..."
                />
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold pl-1">
                  <Sparkles className="h-3.5 w-3.5 text-brand" />
                  <span>Dùng # cho tiêu đề và - cho gạch đầu dòng</span>
                </div>
              </div>

              {/* Level & Thumbnail URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider pl-1">Trình Độ</label>
                  <select
                    value={form.level}
                    onChange={(e) => onChange('level', e.target.value as any)}
                    className="w-full bg-muted/40 border border-border rounded-none px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-brand transition-all shadow-2xs cursor-pointer"
                  >
                    <option value="Beginner">Beginner (Cơ bản)</option>
                    <option value="Intermediate">Intermediate (Trung cấp)</option>
                    <option value="Advanced">Advanced (Nâng cao)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider pl-1">Link Ảnh Bìa Thumbnail</label>
                  <input
                    type="text"
                    value={form.thumbnail}
                    onChange={(e) => onChange('thumbnail', e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-none px-4 py-3 text-xs font-mono font-semibold text-foreground focus:outline-none focus:border-brand transition-all shadow-2xs"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
              </div>

              {/* Thumbnail Preview */}
              {form.thumbnail && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider pl-1">Xem Trước Ảnh Bìa</label>
                  <div className="rounded-none overflow-hidden border border-border aspect-video bg-muted max-w-sm">
                    <img src={form.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              {/* Access Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider pl-1">
                  Mã Truy Cập / Kích Hoạt
                </label>
                <input
                  type="text"
                  value={form.accessCode}
                  onChange={(e) => onChange('accessCode', e.target.value.toUpperCase())}
                  className="w-full bg-muted/40 border border-border rounded-none px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand font-mono font-bold tracking-widest uppercase transition-all shadow-2xs"
                  placeholder="VD: TOEIC-2026 (để trống nếu miễn phí)"
                />
                <p className="text-[11px] text-muted-foreground font-medium pl-1">Để trống nếu khóa học miễn phí.</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 sm:p-6 bg-muted/30 border-t border-border shrink-0">
              <button
                onClick={onSave}
                disabled={!form.title || isSaving}
                className="w-full py-3 rounded-none border border-border bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground transition-colors text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSaving ? 'Đang lưu cập nhật...' : 'Lưu Thay Đổi Khóa Học'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
