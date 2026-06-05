'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Link as LinkIcon, Clock, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import MarkdownEditor from '@/components/MarkdownEditor';

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
}

interface AddLessonModalProps {
  show: boolean;
  isSaving: boolean;
  onClose: () => void;
  onSave: (form: AddLessonForm) => void;
}

export const AddLessonModal = ({ show, isSaving, onClose, onSave }: AddLessonModalProps) => {
  const [form, setForm] = useState<AddLessonForm>({
    title: '',
    duration: '',
    videoUrl: '',
    description: '',
  });
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
      // Minimal check — anything starting with http counts as direct
      setUrlType(url.startsWith('http') ? 'direct' : 'invalid');
    }
  }, [form.videoUrl]);

  const handleClose = () => {
    setForm({ title: '', duration: '', videoUrl: '', description: '' });
    setYtParsed(null);
    setUrlType('empty');
    onClose();
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
            className="relative w-full max-w-lg max-h-[90vh] bg-card border border-border rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Thêm bài học mới</h2>
                <p className="text-muted-foreground text-sm">Dán link YouTube hoặc URL video trực tiếp.</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
                <X />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-5 overflow-y-auto flex-1">

              {/* Video URL — primary field */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Play className="h-3.5 w-3.5 text-red-500" />
                  URL Video (YouTube / MP4)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.videoUrl}
                    onChange={(e) => setForm((p) => ({ ...p, videoUrl: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-3 pr-12 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-mono"
                    placeholder="https://www.youtube.com/watch?v=..."
                    autoFocus
                  />
                  {/* URL status icon */}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {urlType === 'youtube' && <CheckCircle2 className="h-4 w-4 text-red-500" />}
                    {urlType === 'direct' && <LinkIcon className="h-4 w-4 text-primary" />}
                    {urlType === 'invalid' && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </div>
                </div>

                {/* URL type badge */}
                {urlType === 'youtube' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-xl w-fit">
                    <CheckCircle2 className="h-3.5 w-3.5 text-red-500" />
                    <span className="text-xs font-bold text-red-500">YouTube link hợp lệ</span>
                  </div>
                )}
                {urlType === 'direct' && (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-xl w-fit">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                    <span className="text-xs font-bold text-primary">Direct video URL</span>
                  </div>
                )}
                {urlType === 'invalid' && (
                  <p className="text-xs text-destructive pl-1">URL không hợp lệ. Vui lòng dùng link YouTube hoặc URL bắt đầu bằng https://</p>
                )}
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
                    <div className="h-14 w-14 rounded-full bg-red-500 flex items-center justify-center shadow-xl">
                      <svg className="h-6 w-6 text-white fill-white relative left-0.5" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-3">
                    <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">YouTube Preview</span>
                  </div>
                </div>
              )}

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Tên bài học</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. Lesson 1: Introduction"
                />
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  Thời lượng
                </label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm((p) => ({ ...p, duration: e.target.value }))}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. 10:30"
                />
              </div>

              {/* Description - Markdown Editor */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  Mô tả bài học
                </label>
                <MarkdownEditor
                  value={form.description}
                  onChange={(v) => setForm((p) => ({ ...p, description: v }))}
                  placeholder="Nhập nội dung mô tả bài học..."
                  minRows={5}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-muted/50 border-t border-border shrink-0">
              <button
                onClick={() => canSave && onSave(form)}
                disabled={!canSave || isSaving}
                className="w-full py-4 bg-primary disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
              >
                <Play className="h-5 w-5" />
                {isSaving ? 'Đang thêm...' : 'Thêm bài học'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
