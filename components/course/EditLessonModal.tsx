'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Play, Clock, FileText, FileQuestion } from 'lucide-react';
import { parseYouTubeUrl } from '@/components/course/AddLessonModal';
import MarkdownEditor from '@/components/MarkdownEditor';
import { QuestionBuilder, QuestionData } from '@/components/course/QuestionBuilder';
import { cn } from '@/lib/utils';

export interface EditLessonForm {
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  practiceContent?: string;
}

interface EditLessonModalProps {
  show: boolean;
  form: EditLessonForm;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof EditLessonForm, value: string) => void;
}

export const EditLessonModal = ({
  show,
  form,
  isSaving,
  onClose,
  onSave,
  onChange,
}: EditLessonModalProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'practice'>('info');
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [ytParsed, setYtParsed] = useState<{ embedUrl: string; videoId: string } | null>(null);

  // Parse questions from form.practiceContent on open / change
  useEffect(() => {
    if (form.practiceContent && form.practiceContent.trim()) {
      try {
        const parsed = JSON.parse(form.practiceContent);
        if (Array.isArray(parsed)) {
          setQuestions(parsed);
        } else if (parsed.questions && Array.isArray(parsed.questions)) {
          setQuestions(parsed.questions);
        } else {
          setQuestions([]);
        }
      } catch {
        setQuestions([]);
      }
    } else {
      setQuestions([]);
    }
  }, [form.practiceContent, show]);

  useEffect(() => {
    setYtParsed(parseYouTubeUrl(form.videoUrl));
  }, [form.videoUrl]);

  const handleQuestionsChange = (updatedQuestions: QuestionData[]) => {
    setQuestions(updatedQuestions);
    const serialized = updatedQuestions.length > 0 ? JSON.stringify(updatedQuestions) : '';
    onChange('practiceContent', serialized);
  };

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
            className="relative w-full max-w-xl max-h-[90vh] bg-card border border-border rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Sửa bài học</h2>
                <p className="text-muted-foreground text-xs mt-0.5">Cập nhật video và câu hỏi bài tập thực hành.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border/60 px-6 md:px-8 shrink-0 bg-muted/20">
              <button
                type="button"
                onClick={() => setActiveTab('info')}
                className={cn(
                  'py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
                  activeTab === 'info'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Play className="h-3.5 w-3.5" />
                <span>Thông tin Video</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('practice')}
                className={cn(
                  'py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
                  activeTab === 'practice'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <FileQuestion className="h-3.5 w-3.5" />
                <span>Bài tập thực hành {questions.length > 0 && `(${questions.length})`}</span>
              </button>
            </div>

            {/* Body */}
            <div className="p-6 md:p-8 space-y-5 overflow-y-auto flex-1">
              {activeTab === 'info' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tên bài học</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => onChange('title', e.target.value)}
                      className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                      placeholder="e.g. Bài 1: Danh từ (Nouns)"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Thời lượng
                    </label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => onChange('duration', e.target.value)}
                      className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                      placeholder="e.g. 10:30"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <LinkIcon className="h-3.5 w-3.5" />
                      Video URL
                      {ytParsed && <Play className="h-3.5 w-3.5 text-red-500" />}
                    </label>
                    <input
                      type="text"
                      value={form.videoUrl}
                      onChange={(e) => onChange('videoUrl', e.target.value)}
                      className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-xs font-mono"
                      placeholder="https://..."
                    />
                    {ytParsed && (
                      <div className="rounded-xl overflow-hidden border border-red-500/20 h-28 relative bg-black flex items-center">
                        <img
                          src={`https://img.youtube.com/vi/${ytParsed.videoId}/hqdefault.jpg`}
                          alt="YouTube thumbnail"
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute inset-0 flex items-center gap-3 px-4">
                          <div className="h-8 w-8 rounded-full bg-red-500 flex items-center justify-center shrink-0 shadow-lg">
                            <svg className="h-3.5 w-3.5 text-white fill-white relative left-[1px]" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                          <span className="text-xs font-bold text-white drop-shadow line-clamp-2">YouTube · {ytParsed.videoId}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Description - Markdown Editor */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Mô tả & Ghi chú bài học
                    </label>
                    <MarkdownEditor
                      value={form.description}
                      onChange={(v) => onChange('description', v)}
                      placeholder="Nhập nội dung mô tả bài học..."
                      minRows={5}
                    />
                  </div>
                </>
              ) : (
                <QuestionBuilder
                  questions={questions}
                  onChange={handleQuestionsChange}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 bg-muted/30 border-t border-border shrink-0">
              <button
                type="button"
                onClick={onSave}
                disabled={!form.title || !form.videoUrl || isSaving}
                className="w-full py-3.5 bg-primary disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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
