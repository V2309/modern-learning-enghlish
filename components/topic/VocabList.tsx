'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Sparkles, CheckCircle2, Pencil, Trash2, Loader2, Plus, Check, BookOpen, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Vocabulary } from '@/data/mockData';

interface VocabListProps {
  words: (Vocabulary & { mastered?: boolean })[];
  speak: (text: string) => void;
  onOpenAddModal: () => void;
  onToggleMaster?: (wordId: string) => void;
  onEdit?: (word: any) => void;
  onDelete?: (word: any) => void;
  isAdmin?: boolean;
}

const PAGE_SIZE = 10;

export const VocabList = ({
  words,
  speak,
  onOpenAddModal,
  onToggleMaster,
  onEdit,
  onDelete,
  isAdmin = false,
}: VocabListProps) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Reset page when list count changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [words.length]);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, words.length));
  }, [words.length]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  const visibleWords = words.slice(0, visibleCount);
  const hasMore = visibleCount < words.length;
  const masteredCount = words.filter((w) => w.mastered).length;
  const progressPercent = words.length > 0 ? Math.round((masteredCount / words.length) * 100) : 0;

  return (
    <motion.div
      key="list-mode"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      {/* ── Duolingo Header & Progress Bar ─────────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border-2 border-border/80 shadow-[0_4px_0_0_theme(colors.border)] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-duo bg-duo/10 px-2.5 py-0.5 rounded-full border border-duo/25">
                Danh Sách Bài Học
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Danh Sách Từ Vựng
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Nhấp vào biểu tượng Loa để nghe phát âm giọng bản xứ chuẩn xác.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {words.length > 0 && (
              <div className="flex items-center gap-2">
                {/* Mastered chip */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black bg-duo/15 text-duo border border-duo/30 shadow-2xs">
                  <Trophy className="h-3.5 w-3.5" />
                  {masteredCount}/{words.length} đã thuộc ({progressPercent}%)
                </span>
              </div>
            )}

            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="btn-3d-duo px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Thêm từ vựng</span>
              </button>
            )}
          </div>
        </div>

        {/* Thin progress bar */}
        {words.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/60">
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted p-0.5">
              <div
                className="h-full rounded-full bg-duo transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Word Cards List ──────────────────────────────────────────────── */}
      <div className="space-y-5">
        {words.length === 0 ? (
          <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl bg-card space-y-4">
            <div className="h-16 w-16 rounded-3xl bg-duo/10 border-2 border-duo/20 flex items-center justify-center mx-auto text-3xl">
              📖
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-base font-black text-foreground">Chưa có từ vựng nào trong chủ đề này</p>
              <p className="text-xs text-muted-foreground">
                Hãy bắt đầu bổ sung các từ vựng đầu tiên để luyện tập và nâng cao vốn từ.
              </p>
            </div>
            {isAdmin && (
              <button
                onClick={onOpenAddModal}
                className="btn-3d-duo px-5 py-2.5 rounded-2xl text-xs font-black inline-flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4 stroke-[3]" />
                <span>Thêm từ ngay</span>
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-5">
              {visibleWords.map((word) => (
                <motion.div
                  key={word.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  className="bg-card border-2 border-border/80 rounded-3xl p-6 sm:p-7 shadow-[0_4px_0_0_theme(colors.border)] hover:border-duo/50 hover:shadow-[0_6px_0_0_theme(colors.border)] transition-all relative group flex flex-col md:flex-row gap-6 items-start justify-between"
                >
                  <div className="space-y-4 flex-1 w-full">
                    {/* Title word header */}
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                        {word.word}
                      </h3>

                      {/* Part of Speech Pill */}
                      <span className="text-xs font-black text-duo bg-duo/10 px-3 py-1 rounded-xl uppercase border border-duo/25">
                        {word.partOfSpeech}
                      </span>

                      {/* Phonetic Pronunciation */}
                      <div className="flex items-center gap-2 text-muted-foreground bg-muted/80 px-3 py-1 rounded-xl text-sm font-medium border border-border/60">
                        <span className="font-mono text-foreground font-semibold">
                          {word.pronunciation || '/.../'}
                        </span>
                      </div>

                      {/* Pronunciation & Mastered Buttons */}
                      <div className="flex flex-wrap items-center gap-2 ml-auto sm:ml-2">
                        {/* UK Audio */}
                        <button
                          onClick={() => speak(word.word)}
                          title="Phát âm giọng UK"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border-2 border-border text-foreground shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted font-bold text-xs cursor-pointer transition-all"
                        >
                          <Volume2 className="h-3.5 w-3.5 text-duo" />
                          <span className="text-[10px] text-muted-foreground">UK</span>
                        </button>

                        {/* US Audio */}
                        <button
                          onClick={() => speak(word.word)}
                          title="Phát âm giọng US"
                          className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-card border-2 border-border text-foreground shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted font-bold text-xs cursor-pointer transition-all"
                        >
                          <Volume2 className="h-3.5 w-3.5 text-duo" />
                          <span className="text-[10px] text-muted-foreground">US</span>
                        </button>

                        {/* Mastered Toggle 3D Button */}
                        {onToggleMaster && (
                          <button
                            onClick={() => onToggleMaster(word.id)}
                            title={word.mastered ? 'Đã thuộc từ này (Click để huỷ)' : 'Đánh dấu đã thuộc từ này'}
                            className={cn(
                              'px-3.5 py-1.5 rounded-2xl transition-all flex items-center gap-1.5 cursor-pointer text-xs font-black select-none',
                              word.mastered
                                ? 'bg-duo text-duo-foreground shadow-[0_3px_0_0_var(--duo-dark)] active:translate-y-0.5 active:shadow-none'
                                : 'bg-card border-2 border-border text-muted-foreground shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:text-duo hover:border-duo/50'
                            )}
                          >
                            <Check className={cn('h-3.5 w-3.5', word.mastered ? 'stroke-[3]' : 'stroke-[2]')} />
                            <span>{word.mastered ? 'Đã thuộc' : 'Chưa thuộc'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Definitions block */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                        Định nghĩa:
                      </span>
                      <div className="text-base font-bold text-foreground bg-muted/40 border-2 border-border/70 rounded-2xl p-4 space-y-1">
                        <p>{word.meaning}</p>
                        {(word as any).definition && (
                          <p className="text-xs text-muted-foreground font-medium italic">
                            = {(word as any).definition}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Examples block */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-black text-muted-foreground uppercase tracking-wider">
                        Ví dụ mẫu:
                      </span>
                      <div className="space-y-2">
                        {(word.examples && word.examples.length > 0
                          ? word.examples
                          : [word.example]
                        ).map((ex, exIdx) => (
                          <div
                            key={exIdx}
                            className="bg-muted/30 border-2 border-border/50 rounded-2xl p-3.5 flex gap-3.5 items-start"
                          >
                            <button
                              onClick={() => speak(ex)}
                              title="Nghe câu ví dụ"
                              className="p-1.5 rounded-xl bg-card border border-border/80 hover:bg-muted text-duo transition-all mt-0.5 shrink-0 cursor-pointer shadow-2xs"
                            >
                              <Volume2 className="h-3.5 w-3.5" />
                            </button>
                            <div className="flex-1 min-w-0">
                              <p className="text-foreground font-semibold italic text-sm leading-relaxed">{ex}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Image + Actions */}
                  <div className="flex flex-col items-end gap-3 shrink-0 self-start md:self-start w-full md:w-auto">
                    {/* Admin Edit / Delete buttons */}
                    {isAdmin && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity self-end">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(word)}
                            title="Sửa từ"
                            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-card border-2 border-border text-foreground hover:bg-muted text-xs font-bold cursor-pointer transition-all shadow-2xs"
                          >
                            <Pencil className="h-3 w-3 text-sky-500" />
                            Sửa
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(word)}
                            title="Xoá từ"
                            className="flex items-center gap-1 px-3 py-1 rounded-xl bg-card border-2 border-border text-destructive hover:bg-destructive/10 text-xs font-bold cursor-pointer transition-all shadow-2xs"
                          >
                            <Trash2 className="h-3 w-3" />
                            Xoá
                          </button>
                        )}
                      </div>
                    )}

                    {/* Image asset */}
                    {word.imageUrl ? (
                      <div className="w-full md:w-80 lg:w-96 xl:w-[420px] aspect-[4/3] rounded-3xl overflow-hidden border-2 border-border/80 shadow-xs">
                        <img
                          src={word.imageUrl}
                          alt={word.word}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : (
                      <div className="w-full md:w-80 lg:w-96 xl:w-[420px] aspect-[4/3] rounded-3xl bg-muted/40 border-2 border-dashed border-border/80 flex flex-col items-center justify-center text-muted-foreground p-5">
                        <Sparkles className="h-9 w-9 text-duo mb-2 opacity-60" />
                        <span className="text-xs sm:text-sm text-center font-bold">Hình minh hoạ</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={loaderRef} className="flex justify-center py-6">
              {hasMore ? (
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-bold bg-card border border-border px-4 py-2 rounded-2xl shadow-xs">
                  <Loader2 className="h-4 w-4 animate-spin text-duo" />
                  <span>Đang tải thêm từ vựng...</span>
                </div>
              ) : (
                words.length > PAGE_SIZE && (
                  <p className="text-xs text-muted-foreground font-bold tracking-wide bg-muted/60 px-4 py-1.5 rounded-full">
                    ✓ Đã hiển thị đầy đủ {words.length} từ vựng
                  </p>
                )
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};
