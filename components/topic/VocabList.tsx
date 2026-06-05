'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Volume2, Sparkles, HelpCircle, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Vocabulary } from '@/data/mockData';

interface VocabListProps {
  words: (Vocabulary & { mastered?: boolean })[];
  speak: (text: string) => void;
  onOpenAddModal: () => void;
  onToggleMaster?: (wordId: string) => void;
  onEdit?: (word: any) => void;
  onDelete?: (word: any) => void;
}

export const VocabList = ({ words, speak, onOpenAddModal, onToggleMaster, onEdit, onDelete }: VocabListProps) => {
  return (
    <motion.div
      key="list-mode"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-muted/30 border border-border/40">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Học từ vựng theo chủ đề</h1>
          <p className="text-sm text-muted-foreground">
            Nhấp vào biểu tượng Loa để nghe phát âm giọng bản xứ rõ ràng.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {words.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-3xl">
            <HelpCircle className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              Chưa có từ vựng nào trong chủ đề này.
            </p>
            <button
              onClick={onOpenAddModal}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold"
            >
              Thêm từ ngay
            </button>
          </div>
        ) : (
          words.map((word) => (
            <motion.div
              key={word.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-card border border-border rounded-[2rem] p-6 sm:p-8 hover:shadow-md transition-all duration-300 relative group flex flex-col md:flex-row gap-6 items-start justify-between"
            >
              <div className="space-y-4 flex-1 w-full">
                {/* Title word header */}
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
                    {word.word}
                  </h3>
                  <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full uppercase border border-primary/20">
                    {word.partOfSpeech}
                  </span>
                  <div className="flex items-center gap-2 text-muted-foreground bg-muted/65 px-3 py-1 rounded-xl text-sm font-medium border border-border/40">
                    <span className="font-mono text-primary font-semibold">
                      {word.pronunciation || '/.../ '}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      onClick={() => speak(word.word)}
                      title="Giọng UK"
                      className="p-2 rounded-xl bg-muted border border-border/40 hover:bg-primary hover:text-white transition-all text-muted-foreground"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mr-2">UK</span>
                    <button
                      onClick={() => speak(word.word)}
                      title="Giọng US"
                      className="p-2 rounded-xl bg-muted border border-border/40 hover:bg-primary hover:text-white transition-all text-muted-foreground"
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mr-4">US</span>

                    {onToggleMaster && (
                      <button
                        onClick={() => onToggleMaster(word.id)}
                        title={word.mastered ? 'Đã thuộc từ này' : 'Đánh dấu đã thuộc'}
                        className={cn(
                          'p-2 rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer text-xs font-bold',
                          word.mastered
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                            : 'bg-muted border-border/40 hover:bg-muted-foreground/10 text-muted-foreground'
                        )}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>{word.mastered ? 'Đã thuộc' : 'Chưa thuộc'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Definitions block */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Định nghĩa:
                  </div>
                  <div className="text-base font-semibold text-foreground bg-muted/20 border border-border/30 rounded-2xl p-4">
                    <p>{word.meaning}</p>
                  </div>
                </div>

                {/* Examples block */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Ví dụ:
                  </div>
                  <div className="space-y-2">
                    {(word.examples && word.examples.length > 0
                      ? word.examples
                      : [word.example]
                    ).map((ex, exIdx) => (
                      <div
                        key={exIdx}
                        className="bg-muted/10 border border-border/20 rounded-2xl p-4 flex gap-4 items-start"
                      >
                        <button
                          onClick={() => speak(ex)}
                          className="p-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all mt-0.5 shrink-0"
                        >
                          <Volume2 className="h-4 w-4" />
                        </button>
                        <div className="flex-1">
                          <p className="text-foreground font-semibold italic text-base">{ex}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right side: Image + Actions */}
              <div className="flex flex-col items-end gap-3 shrink-0 self-start md:self-start">
                {/* Edit / Delete buttons */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(word)}
                      title="Sửa từ"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted border border-border hover:bg-primary/10 hover:border-primary/30 text-muted-foreground hover:text-primary transition-all text-xs font-bold"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      Sửa
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(word)}
                      title="Xoá từ"
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted border border-border hover:bg-red-500/10 hover:border-red-500/30 text-muted-foreground hover:text-red-500 transition-all text-xs font-bold"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Xoá
                    </button>
                  )}
                </div>

                {/* Image asset */}
                {word.imageUrl ? (
                  <div className="w-full md:w-48 aspect-[4/3] md:aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
                    <img
                      src={word.imageUrl}
                      alt={word.word}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-full md:w-48 aspect-[4/3] md:aspect-square rounded-2xl bg-muted/25 border border-dashed border-border flex flex-col items-center justify-center text-muted-foreground p-4">
                    <Sparkles className="h-8 w-8 text-primary mb-2 opacity-50" />
                    <span className="italic text-xs text-center font-medium">Bản minh hoạ sẵn sàng</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
};
