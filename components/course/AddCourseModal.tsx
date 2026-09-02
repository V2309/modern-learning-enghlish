'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles, Layout, Layers, Trash2 } from 'lucide-react';
import { CourseTopicDraft } from '@/stores/useCoursesPageStore';

interface NewCourse {
  title: string;
  description: string;
  thumbnail: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  accessCode: string;
}

interface AddCourseModalProps {
  show: boolean;
  newCourse: NewCourse;
  newTopics: CourseTopicDraft[];
  onClose: () => void;
  onSave: () => void;
  onCourseChange: (field: keyof NewCourse, value: string) => void;
  onAddTopic: () => void;
  onRemoveTopic: (idx: number) => void;
  onUpdateTopic: (idx: number, field: keyof CourseTopicDraft, value: string) => void;
}

export const AddCourseModal = ({
  show,
  newCourse,
  newTopics,
  onClose,
  onSave,
  onCourseChange,
  onAddTopic,
  onRemoveTopic,
  onUpdateTopic,
}: AddCourseModalProps) => {
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
            className="relative w-full max-w-2xl max-h-[90vh] bg-card border-2 border-border/80 rounded-3xl shadow-[0_12px_0_0_theme(colors.border)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 sm:p-7 border-b-2 border-border/70 flex items-center justify-between shrink-0 bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-duo/10 border-2 border-duo/25 text-duo">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Tạo Khóa Học Mới</h2>
                  <p className="text-muted-foreground text-xs font-medium">Thiết lập khóa học và các chủ đề / chương ban đầu.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 rounded-2xl bg-card border-2 border-border text-muted-foreground hover:text-foreground hover:bg-muted shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
              {/* Course Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-foreground uppercase tracking-wider pl-1">
                  Tên Khóa Học <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => onCourseChange('title', e.target.value)}
                  className="w-full bg-muted/40 border-2 border-border rounded-2xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-duo transition-all shadow-2xs placeholder:text-muted-foreground/60"
                  placeholder="Ví dụ: Lộ Trình TOEIC Toàn Diện 450 - 750+, IELTS Masterclass..."
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-foreground uppercase tracking-wider pl-1">
                  Mô Tả Khóa Học (Hỗ trợ Markdown)
                </label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => onCourseChange('description', e.target.value)}
                  rows={3}
                  className="w-full bg-muted/40 border-2 border-border rounded-2xl px-4 py-3 text-sm font-semibold text-foreground focus:outline-none focus:border-duo transition-all resize-none shadow-2xs placeholder:text-muted-foreground/60"
                  placeholder="Mô tả mục tiêu khóa học, lộ trình và kết quả đạt được..."
                />
                <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-semibold pl-1">
                  <Sparkles className="h-3.5 w-3.5 text-brand" />
                  <span>Dùng # để tạo đề mục và - để tạo danh sách gạch đầu dòng</span>
                </div>
              </div>

              {/* Level & Thumbnail Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-foreground uppercase tracking-wider pl-1">Trình Độ</label>
                  <select
                    value={newCourse.level}
                    onChange={(e) => onCourseChange('level', e.target.value as any)}
                    className="w-full bg-muted/40 border-2 border-border rounded-2xl px-4 py-3 text-sm font-bold text-foreground focus:outline-none focus:border-duo transition-all shadow-2xs cursor-pointer"
                  >
                    <option value="Beginner">Beginner (Cơ bản)</option>
                    <option value="Intermediate">Intermediate (Trung cấp)</option>
                    <option value="Advanced">Advanced (Nâng cao)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-black text-foreground uppercase tracking-wider pl-1">Ảnh Bìa Thumbnail</label>
                  <div className="h-[48px] flex items-center gap-3 bg-muted/40 border-2 border-border rounded-2xl px-4 shadow-2xs">
                    <Layout className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-xs font-bold text-muted-foreground truncate">Ảnh ngẫu nhiên mặc định</span>
                  </div>
                </div>
              </div>

              {/* Access Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-foreground uppercase tracking-wider pl-1">
                  Mã Kích Hoạt / Truy Cập (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={newCourse.accessCode}
                  onChange={(e) => onCourseChange('accessCode', e.target.value.toUpperCase())}
                  className="w-full bg-muted/40 border-2 border-border rounded-2xl px-4 py-3 text-sm text-foreground focus:outline-none focus:border-brand font-mono font-black tracking-widest uppercase transition-all shadow-2xs"
                  placeholder="VD: TOEIC-2026 (để trống nếu miễn phí)"
                />
                <p className="text-[11px] text-muted-foreground font-medium pl-1">
                  Để trống nếu khóa học mở miễn phí cho tất cả học viên.
                </p>
              </div>

              {/* Topics / Chapters Section */}
              <div className="space-y-3 pt-3 border-t-2 border-border/70">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-black text-foreground uppercase tracking-wider pl-1 block">
                      Danh Sách Chủ Đề / Chương ({newTopics.length})
                    </label>
                    <p className="text-[11px] text-muted-foreground pl-1">
                      Các chủ đề lớn của khóa học (bài học chi tiết sẽ được thêm vào từng chủ đề sau).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onAddTopic}
                    className="btn-3d-duo flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black shrink-0"
                  >
                    <Plus className="h-3.5 w-3.5 stroke-[3]" />
                    Thêm chủ đề
                  </button>
                </div>

                <div className="space-y-3">
                  {newTopics.map((topic, idx) => (
                    <div
                      key={idx}
                      className="p-4 sm:p-5 bg-muted/30 border-2 border-border/80 rounded-2xl space-y-2.5 shadow-[0_3px_0_0_theme(colors.border)]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-duo bg-duo/10 px-3 py-0.5 rounded-xl border border-duo/25">
                          Chủ đề {idx + 1}
                        </span>
                        {newTopics.length > 1 && (
                          <button
                            type="button"
                            onClick={() => onRemoveTopic(idx)}
                            className="p-1.5 rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                            title="Xóa chủ đề này"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        value={topic.title}
                        onChange={(e) => onUpdateTopic(idx, 'title', e.target.value)}
                        className="w-full bg-card border-2 border-border rounded-xl px-3.5 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-duo transition-all placeholder:text-muted-foreground/60"
                        placeholder="VD: Part 1: Photographs - Nghe tranh, Chương 1: Thì hiện tại..."
                      />

                      <input
                        type="text"
                        value={topic.description}
                        onChange={(e) => onUpdateTopic(idx, 'description', e.target.value)}
                        className="w-full bg-card border-2 border-border rounded-xl px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-duo transition-all font-medium placeholder:text-muted-foreground/60"
                        placeholder="Mô tả nội dung trọng tâm của chủ đề này..."
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 sm:p-7 bg-muted/40 border-t-2 border-border/70 shrink-0">
              <button
                onClick={onSave}
                disabled={!newCourse.title.trim()}
                className="btn-3d-duo w-full py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-5 w-5 stroke-[3]" />
                Tạo Khóa Học &amp; Khởi Tạo Chủ Đề
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
