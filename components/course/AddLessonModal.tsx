'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Link as LinkIcon, Clock, FileText, CheckCircle2, AlertCircle, FileQuestion } from 'lucide-react';
import MarkdownEditor from '@/components/MarkdownEditor';
import { QuestionBuilder, QuestionData } from '@/components/course/QuestionBuilder';
import { cn } from '@/lib/utils';

/** Parse YouTube URL → embed URL, returns null if not YouTube */
export function parseYouTubeUrl(url: string): { embedUrl: string; videoId: string } | null {
  try {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]{11})/,
      /youtube\.com\/shorts\/([^&?/\s]{11})/,
    ];
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        const videoId = match[1];
        return {
          videoId,
          embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`,
        };
      }
    }
  } catch {}
  return null;
}

interface AddLessonForm {
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  practiceContent?: string;
}

interface AddLessonModalProps {
  show: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (form: AddLessonForm) => void;
}

export const AddLessonModal = ({ show, isSaving, onClose, onSave }: AddLessonModalProps) => {
  const [activeTab, setActiveTab] = useState<'info' | 'practice'>('info');
  const [form, setForm] = useState<AddLessonForm>({
    title: '',
    duration: '',
    videoUrl: '',
    description: '',
    practiceContent: '',
  });
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [ytParsed, setYtParsed] = useState<{ embedUrl: string; videoId: string } | null>(null);
  const [urlType, setUrlType] = useState<'youtube' | 'direct' | 'invalid' | 'empty'>('empty');

  // Re-parse URL whenever it changes
  useEffect(() => {
    const url = form.videoUrl.trim();
    if (!url) { setUrlType('empty'); setYtParsed(null); return; }
    const yt = parseYouTubeUrl(url);
    if (yt) {
      setYtParsed(yt);
      setUrlType('youtube');
    } else {
      setYtParsed(null);
      setUrlType(url.startsWith('http') ? 'direct' : 'invalid');
    }
  }, [form.videoUrl]);

  const handleClose = () => {
    setForm({ title: '', duration: '', videoUrl: '', description: '', practiceContent: '' });
    setQuestions([]);
    setYtParsed(null);
    setUrlType('empty');
    setActiveTab('info');
    onClose();
  };

  const handleSave = () => {
    const practiceContentStr = questions.length > 0 ? JSON.stringify(questions) : '';
    onSave({
      ...form,
      practiceContent: practiceContentStr,
    });
  };

  const canSave = form.title.trim() && form.videoUrl.trim() && urlType !== 'invalid';

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
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
                <h2 className="text-xl md:text-2xl font-bold text-foreground">Thêm bài học mới</h2>
                <p className="text-muted-foreground text-xs mt-0.5">Nhập thông tin video và bài tập thực hành (nếu có).</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
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
                  {/* Video URL */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <Play className="h-3.5 w-3.5 text-red-500" />
                      URL Video (YouTube / MP4)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={form.videoUrl}
                        onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                        className="w-full bg-muted border border-border rounded-2xl px-5 py-3 pr-12 text-foreground focus:outline-none focus:border-primary transition-all text-xs font-mono"
                        placeholder="https://www.youtube.com/watch?v=..."
                        autoFocus
                      />
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {urlType === 'youtube' && <CheckCircle2 className="h-4 w-4 text-red-500" />}
                        {urlType === 'direct' && <LinkIcon className="h-4 w-4 text-primary" />}
                        {urlType === 'invalid' && <AlertCircle className="h-4 w-4 text-destructive" />}
                      </div>
                    </div>
                  </div>

                  {/* YouTube thumbnail preview */}
                  {ytParsed && (
                    <div className="rounded-2xl overflow-hidden border border-red-500/20 aspect-video relative bg-black">
                      <img
                        src={`https://img.youtube.com/vi/${ytParsed.videoId}/hqdefault.jpg`}
                        alt="YouTube thumbnail"
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center shadow-xl">
                          <svg className="h-5 w-5 text-white fill-white relative left-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tên bài học</label>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                      placeholder="e.g. Bài 1: Danh từ (Nouns)"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      Thời lượng
                    </label>
                    <input
                      type="text"
                      value={form.duration}
                      onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm"
                      placeholder="e.g. 10:30"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5" />
                      Mô tả & Ghi chú bài học
                    </label>
                    <MarkdownEditor
                      value={form.description}
                      onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                      placeholder="Nhập nội dung mô tả bài học..."
                      minRows={4}
                    />
                  </div>
                </>
              ) : (
                <QuestionBuilder
                  questions={questions}
                  onChange={(updated) => setQuestions(updated)}
                />
              )}
            </div>

            {/* Footer */}
            <div className="p-6 md:p-8 bg-muted/30 border-t border-border shrink-0">
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className="w-full py-3.5 bg-primary disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Play className="h-4 w-4" />
                <span>{isSaving ? 'Đang thêm...' : 'Lưu bài học'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
