'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Link as LinkIcon, FileText, CheckCircle2, AlertCircle, Download, Loader2 } from 'lucide-react';
import { parseYouTubeUrl } from '@/components/course/AddLessonModal';
import { cn } from '@/lib/utils';

interface EditShadowingForm {
  title: string;
  videoUrl: string;
  description: string;
  transcript: string;
}

interface EditShadowingModalProps {
  show: boolean;
  form: EditShadowingForm;
  isSaving: boolean;
  onClose: () => void;
  onSave: () => void;
  onChange: (field: keyof EditShadowingForm, value: string) => void;
}

export const EditShadowingModal = ({
  show,
  form,
  isSaving,
  onClose,
  onSave,
  onChange,
}: EditShadowingModalProps) => {
  const [ytParsed, setYtParsed] = useState<{ embedUrl: string; videoId: string } | null>(null);
  const [urlType, setUrlType] = useState<'youtube' | 'direct' | 'invalid' | 'empty'>('empty');
  const [isFetchingTranscript, setIsFetchingTranscript] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [fetchSuccess, setFetchSuccess] = useState(false);

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
    setFetchError(null);
    setFetchSuccess(false);
  }, [form.videoUrl]);

  const handleFetchTranscript = async () => {
    if (urlType !== 'youtube') return;
    setIsFetchingTranscript(true);
    setFetchError(null);
    setFetchSuccess(false);

    try {
      const res = await fetch('/api/shadowing/generate-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: form.videoUrl }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setFetchError(data.error || 'Không thể lấy phụ đề từ video này.');
      } else {
        onChange('transcript', data.transcript);
        setFetchSuccess(true);
      }
    } catch {
      setFetchError('Lỗi kết nối mạng. Vui lòng thử lại.');
    } finally {
      setIsFetchingTranscript(false);
    }
  };

  const canSave = form.title.trim() && form.videoUrl.trim() && form.transcript.trim() && urlType !== 'invalid';

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
            <div className="p-8 border-b border-border flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Sửa bài học Shadowing</h2>
                <p className="text-muted-foreground text-sm">Cập nhật thông tin video và phụ đề đồng bộ.</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
                <X />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-5 overflow-y-auto flex-1">
              {/* Title */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Tiêu đề bài học</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => onChange('title', e.target.value)}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm font-semibold"
                  placeholder="e.g. Luyện giọng Mỹ qua phim Friends"
                />
              </div>

              {/* Video URL */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-2">
                  <Play className="h-3.5 w-3.5 text-red-500" />
                  URL Video (YouTube / MP4)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={form.videoUrl}
                    onChange={(e) => onChange('videoUrl', e.target.value)}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-3 pr-12 text-foreground focus:outline-none focus:border-primary transition-all text-xs font-mono"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {urlType === 'youtube' && <CheckCircle2 className="h-4 w-4 text-red-500" />}
                    {urlType === 'direct' && <LinkIcon className="h-4 w-4 text-primary" />}
                    {urlType === 'invalid' && <AlertCircle className="h-4 w-4 text-destructive" />}
                  </div>
                </div>

                {/* Auto-fetch button for YouTube */}
                {urlType === 'youtube' && (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleFetchTranscript}
                      disabled={isFetchingTranscript}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                        isFetchingTranscript
                          ? "bg-muted text-muted-foreground border-border"
                          : "bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500 hover:text-white hover:border-red-500"
                      )}
                    >
                      {isFetchingTranscript
                        ? <><Loader2 className="h-3.5 w-3.5 animate-spin" />Đang lấy phụ đề từ YouTube...</>
                        : <><Download className="h-3.5 w-3.5" />Tự động lấy phụ đề từ YouTube</>
                      }
                    </button>

                    {fetchError && (
                      <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-4 py-2.5 flex items-start gap-2">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        {fetchError}
                      </p>
                    )}

                    {fetchSuccess && !fetchError && (
                      <p className="text-xs text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2.5 flex items-center gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Đã lấy được phụ đề từ YouTube! Bạn có thể chỉnh sửa bên dưới nếu cần.
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Ghi chú bài học (Mô tả)</label>
                <textarea
                  value={form.description}
                  onChange={(e) => onChange('description', e.target.value)}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-sm h-20 resize-none"
                  placeholder="Ghi chú về từ vựng, ngữ pháp hay cách phát âm trong video này..."
                />
              </div>

              {/* Transcript Textarea */}
              <div className="space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    Nội dung Phụ đề (Transcript)
                    {form.transcript && (
                      <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md ml-1">
                        {form.transcript.split('\n').filter(Boolean).length} dòng
                      </span>
                    )}
                  </label>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md">Hỗ trợ định dạng LRC & SRT</span>
                </div>
                <textarea
                  value={form.transcript}
                  onChange={(e) => onChange('transcript', e.target.value)}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all text-xs font-mono h-44 resize-none"
                  placeholder="Nhập theo dạng LRC:&#10;[00:00.00] Welcome to our channel.&#10;[00:02.50] Today we study English.&#10;&#10;Hoặc nhấn nút 'Tự động lấy phụ đề' ở trên."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-muted/50 border-t border-border shrink-0">
              <button
                onClick={onSave}
                disabled={!canSave || isSaving}
                className="w-full py-4 bg-primary disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-primary/20"
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
