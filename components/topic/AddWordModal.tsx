'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Vocabulary } from '@/data/mockData';

interface NewWordState {
  word: string;
  meaning: string;
  definition: string;
  example: string;
  partOfSpeech: Vocabulary['partOfSpeech'];
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
                <h2 className="text-2xl font-bold text-foreground">Add New Word</h2>
                <p className="text-muted-foreground text-sm font-medium">
                  Bổ sung từ vựng mới vào chủ đề {topicName}.
                </p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                <X />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 space-y-6 overflow-y-auto flex-1">
              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  English Word
                </label>
                <input
                  type="text"
                  value={newWord.word}
                  onChange={(e) => onWordChange('word', e.target.value)}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. Resilience"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Meaning (VN)
                  </label>
                  <input
                    type="text"
                    value={newWord.meaning}
                    onChange={(e) => onWordChange('meaning', e.target.value)}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                    placeholder="e.g. Sự kiên cường"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Part of Speech
                  </label>
                  <select
                    value={newWord.partOfSpeech}
                    onChange={(e) => onWordChange('partOfSpeech', e.target.value)}
                    className="w-full bg-muted border border-border rounded-2xl px-5 py-[11px] text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
                  >
                    <option value="Noun">Noun</option>
                    <option value="Verb">Verb</option>
                    <option value="Adjective">Adjective</option>
                    <option value="Adverb">Adverb</option>
                    <option value="Phrase">Phrase</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">
                  Definition (EN)
                </label>
                <input
                  type="text"
                  value={newWord.definition}
                  onChange={(e) => onWordChange('definition', e.target.value)}
                  className="w-full bg-muted border border-border rounded-2xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                  placeholder="e.g. the ability to recover quickly from difficulties"
                />
              </div>

              {/* Examples */}
              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">
                    Example Sentences (Ví dụ)
                  </label>
                  <button
                    type="button"
                    onClick={onAddExample}
                    className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all rounded-xl font-bold text-xs"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Thêm ví dụ
                  </button>
                </div>
                <div className="space-y-2.5">
                  {newWordExamples.map((ex, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-muted-foreground w-12 text-center select-none">
                        Ví dụ {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={ex}
                        onChange={(e) => onUpdateExample(idx, e.target.value)}
                        className="flex-1 bg-muted border border-border rounded-2xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                        placeholder="e.g. He showed great resilience during the crisis."
                      />
                      {newWordExamples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveExample(idx)}
                          className="p-1.5 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-muted/50 border-t border-border shrink-0">
              <button
                onClick={onSave}
                disabled={!newWord.word || !newWord.meaning}
                className="w-full py-4 bg-primary disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                Save Word
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
