'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, ChevronDown, Sparkles, BookOpen, Trash2 } from 'lucide-react';
import { Vocabulary } from '@/data/mockData';
import { ImageUploadField } from '@/components/topic/ImageUploadField';

interface NewWordState {
  word: string;
  meaning: string;
  definition: string;
  example: string;
  partOfSpeech: Vocabulary['partOfSpeech'];
  imageUrl?: string;
}

interface AddWordModalProps {
  show: boolean;
  topicName: string;
  newWord: NewWordState;
  newWordExamples: string[];
  onClose: () => void;
  onSave: () => void;
  onWordChange: (field: keyof NewWordState, value: string) => void;
  onAddExample: () => void;
  onRemoveExample: (idx: number) => void;
  onUpdateExample: (idx: number, value: string) => void;
}

export const AddWordModal = ({
  show,
  topicName,
  newWord,
  newWordExamples,
  onClose,
  onSave,
  onWordChange,
  onAddExample,
  onRemoveExample,
  onUpdateExample,
}: AddWordModalProps) => {
  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-lg max-h-[90vh] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between bg-muted/20 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground tracking-tight">Thêm từ vựng mới</h2>
                  <p className="text-xs text-muted-foreground">
                    Chủ đề: <span className="font-semibold text-foreground">{topicName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                title="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* English Word */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  <span>Từ tiếng Anh (Word) <span className="text-rose-500">*</span></span>
                </label>
                <input
                  type="text"
                  value={newWord.word}
                  onChange={(e) => onWordChange('word', e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  placeholder="e.g. Resilience"
                  autoFocus
                />
              </div>

              {/* Grid: Meaning & Part of Speech */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Nghĩa tiếng Việt <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newWord.meaning}
                    onChange={(e) => onWordChange('meaning', e.target.value)}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="e.g. Sự kiên cường"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Loại từ (Part of Speech)
                  </label>
                  <div className="relative">
                    <select
                      value={newWord.partOfSpeech}
                      onChange={(e) => onWordChange('partOfSpeech', e.target.value)}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer pr-9"
                    >
                      <option value="Noun">Noun (Danh từ)</option>
                      <option value="Verb">Verb (Động từ)</option>
                      <option value="Adjective">Adjective (Tính từ)</option>
                      <option value="Adverb">Adverb (Trạng từ)</option>
                      <option value="Phrase">Phrase (Cụm từ)</option>
                    </select>
                    <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Definition */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Định nghĩa tiếng Anh (Definition - Không bắt buộc)
                </label>
                <input
                  type="text"
                  value={newWord.definition}
                  onChange={(e) => onWordChange('definition', e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="e.g. the capacity to recover quickly from difficulties"
                />
              </div>

              {/* Image Upload */}
              <ImageUploadField
                imageUrl={newWord.imageUrl}
                onChange={(url) => onWordChange('imageUrl', url)}
              />

              {/* Example Sentences */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>Câu ví dụ mẫu</span>
                    <span className="text-[11px] text-muted-foreground font-normal">({newWordExamples.length})</span>
                  </label>
                  <button
                    type="button"
                    onClick={onAddExample}
                    className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all rounded-lg font-bold text-xs cursor-pointer"
                  >
                    <Plus className="h-3 w-3" />
                    Thêm ví dụ
                  </button>
                </div>

                <div className="space-y-2">
                  {newWordExamples.map((ex, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-[11px] font-bold text-muted-foreground px-2 py-1 rounded-md bg-muted/60 shrink-0 select-none">
                        #{idx + 1}
                      </span>
                      <input
                        type="text"
                        value={ex}
                        onChange={(e) => onUpdateExample(idx, e.target.value)}
                        className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="e.g. She showed great resilience during difficult times."
                      />
                      {newWordExamples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveExample(idx)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
                          title="Xóa ví dụ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-3.5 bg-muted/20 border-t border-border/70 flex items-center justify-end gap-2.5 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={onSave}
                disabled={!newWord.word.trim() || !newWord.meaning.trim()}
                className="px-5 py-2 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition-all flex items-center gap-1.5 shadow-sm shadow-primary/20 cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Lưu từ vựng</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

