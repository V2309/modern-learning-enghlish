'use client';

import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, FileQuestion, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface QuestionData {
  id?: number | string;
  question: string;
  category?: string;
  options: { key: string; text: string }[];
  correct: string;
  explanation: string;
}

interface QuestionBuilderProps {
  questions: QuestionData[];
  onChange: (questions: QuestionData[]) => void;
}

export const QuestionBuilder = ({ questions, onChange }: QuestionBuilderProps) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const handleAddQuestion = () => {
    const newQ: QuestionData = {
      id: Date.now(),
      question: '',
      category: 'Ngữ pháp',
      options: [
        { key: 'A', text: '' },
        { key: 'B', text: '' },
        { key: 'C', text: '' },
        { key: 'D', text: '' },
      ],
      correct: 'A',
      explanation: '',
    };
    const updated = [...questions, newQ];
    onChange(updated);
    setExpandedIndex(updated.length - 1);
  };

  const handleRemoveQuestion = (index: number) => {
    const updated = questions.filter((_, idx) => idx !== index);
    onChange(updated);
    if (expandedIndex === index) {
      setExpandedIndex(updated.length > 0 ? 0 : null);
    }
  };

  const handleUpdateField = (index: number, field: keyof QuestionData, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    onChange(updated);
  };

  const handleUpdateOption = (qIndex: number, optKey: string, text: string) => {
    const updated = [...questions];
    const q = updated[qIndex];
    q.options = q.options.map((opt) => (opt.key === optKey ? { ...opt, text } : opt));
    onChange(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
            <FileQuestion className="h-4 w-4 text-primary" />
            Câu hỏi bài tập thực hành ({questions.length})
          </h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Thêm câu hỏi trắc nghiệm nếu bài học này có phần luyện tập.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl font-bold text-xs transition-all cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Thêm câu hỏi</span>
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="p-6 rounded-2xl border border-dashed border-border text-center space-y-2 bg-muted/20">
          <p className="text-xs text-muted-foreground">
            Bài học này hiện chưa có câu hỏi luyện tập nào (chỉ hiển thị video bài học).
          </p>
          <button
            type="button"
            onClick={handleAddQuestion}
            className="text-xs text-primary font-bold hover:underline cursor-pointer inline-flex items-center gap-1"
          >
            <Plus className="h-3 w-3" /> Nhấp vào đây để thêm bài tập
          </button>
        </div>
      ) : (
        <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
          {questions.map((q, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={q.id || idx}
                className="border border-border/80 rounded-2xl overflow-hidden bg-card transition-all"
              >
                {/* Header */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setExpandedIndex(isExpanded ? null : idx);
                    }
                  }}
                  className="flex items-center justify-between p-3.5 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer select-none"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <span className="h-5 w-5 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-xs text-foreground truncate">
                      {q.question.trim() || `Câu hỏi ${idx + 1}`}
                    </span>
                    {q.category && (
                      <span className="text-[10px] bg-muted px-2 py-0.5 rounded text-muted-foreground shrink-0">
                        {q.category}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveQuestion(idx);
                      }}
                      className="p-1 text-muted-foreground hover:text-rose-500 rounded transition-colors"
                      title="Xóa câu hỏi này"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {/* Form fields when expanded */}
                {isExpanded && (
                  <div className="p-4 space-y-3 border-t border-border/60 bg-background/50 text-xs">
                    {/* Question text */}
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground uppercase text-[10px]">
                        Nội dung câu hỏi
                      </label>
                      <textarea
                        rows={2}
                        value={q.question}
                        onChange={(e) => handleUpdateField(idx, 'question', e.target.value)}
                        placeholder="e.g. The marketing team made a detailed _______ to increase sales."
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="font-bold text-muted-foreground uppercase text-[10px]">
                        Phân loại (Từ loại / Chủ đề)
                      </label>
                      <input
                        type="text"
                        value={q.category || ''}
                        onChange={(e) => handleUpdateField(idx, 'category', e.target.value)}
                        placeholder="e.g. Danh từ, Động từ, Tính từ, Trọng âm..."
                        className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>

                    {/* Options A, B, C, D */}
                    <div className="space-y-1.5 pt-1">
                      <label className="font-bold text-muted-foreground uppercase text-[10px]">
                        Các phương án trả lời (chọn đáp án đúng)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {['A', 'B', 'C', 'D'].map((key) => {
                          const opt = q.options.find((o) => o.key === key) || { key, text: '' };
                          const isCorrect = q.correct === key;

                          return (
                            <div
                              key={key}
                              className={cn(
                                'flex items-center gap-2 p-1.5 rounded-xl border transition-all',
                                isCorrect
                                  ? 'border-emerald-500 bg-emerald-500/10'
                                  : 'border-border bg-muted/40'
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => handleUpdateField(idx, 'correct', key)}
                                className={cn(
                                  'h-6 w-6 rounded-md font-bold text-xs flex items-center justify-center shrink-0 transition-colors cursor-pointer',
                                  isCorrect
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-muted text-muted-foreground hover:bg-muted-foreground/20'
                                )}
                                title={isCorrect ? 'Đáp án đúng' : 'Nhấp để đặt làm đáp án đúng'}
                              >
                                {key}
                              </button>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => handleUpdateOption(idx, key, e.target.value)}
                                placeholder={`Lựa chọn ${key}...`}
                                className="flex-1 bg-transparent text-xs text-foreground focus:outline-none min-w-0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="space-y-1 pt-1">
                      <label className="font-bold text-muted-foreground uppercase text-[10px]">
                        Giải thích chi tiết
                      </label>
                      <textarea
                        rows={2}
                        value={q.explanation}
                        onChange={(e) => handleUpdateField(idx, 'explanation', e.target.value)}
                        placeholder="Giải thích vì sao chọn đáp án này..."
                        className="w-full bg-muted border border-border rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
