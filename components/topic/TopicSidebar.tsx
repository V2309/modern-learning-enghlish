'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle2, Plus } from 'lucide-react';
import { VocabularyTopic } from '@/data/mockData';
import { cn } from '@/lib/utils';

type StudyMode = 'list' | 'flashcards' | 'quiz' | 'match' | 'dictation' | 'translate' | 'sentence-practice';

const sidebarItems = [
  { mode: 'list' as StudyMode, label: 'Từ vựng: Danh sách từ', group: 'Từ vựng' },
  { mode: 'flashcards' as StudyMode, label: 'Từ vựng: Flashcards', group: 'Từ vựng' },
  { mode: 'quiz' as StudyMode, label: 'Luyện tập: Trắc nghiệm từ vựng', group: 'Luyện tập' },
  { mode: 'match' as StudyMode, label: 'Luyện tập: Tìm cặp', group: 'Luyện tập' },
  { mode: 'dictation' as StudyMode, label: 'Luyện tập: Nghe từ vựng', group: 'Luyện tập' },
  { mode: 'translate' as StudyMode, label: 'Luyện tập: Dịch nghĩa / Điền từ', group: 'Luyện tập' },
    { mode: 'sentence-practice' as StudyMode, label: 'Luyện tập: Đặt câu với AI', group: 'Luyện tập' },
] as const;

interface TopicSidebarProps {
  topic: VocabularyTopic;
  wordCount: number;
  activeMode: StudyMode;
  isMobileView?: boolean;
  onModeChange: (mode: StudyMode) => void;
  onOpenAddWord: () => void;
  onClose?: () => void;
}

export const TopicSidebar = ({
  topic,
  wordCount,
  activeMode,
  isMobileView = false,
  onModeChange,
  onOpenAddWord,
  onClose,
}: TopicSidebarProps) => {
  return (
    <div className="space-y-4">
      <div className="p-6 rounded-[2rem] bg-card border border-border shadow-sm">

        {/* Desktop header – topic name + back link */}
        {!isMobileView && (
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
            <div className="flex items-center gap-3">
              <Link href="/vocabulary" className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h2 className="text-xl font-extrabold text-foreground tracking-tight line-clamp-1">
                {topic.name}
              </h2>
            </div>
            <span className="text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
              {wordCount} từ
            </span>
          </div>
        )}

        {/* Mobile header */}
        {isMobileView && (
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
            <span className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">Chế độ học</span>
            <span className="text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-full">
              {wordCount} Từ Vựng
            </span>
          </div>
        )}

        {/* Mode list */}
        <nav className="space-y-1">
          {sidebarItems.map((item) => {
            const isActive = activeMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => {
                  onModeChange(item.mode);
                  onClose?.();
                }}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition-all text-left font-medium text-sm border',
                  isActive
                    ? 'bg-primary/10 border-primary/30 text-primary font-bold shadow-sm'
                    : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2
                    className={cn(
                      'h-5 w-5 transition-colors',
                      isActive ? 'text-primary fill-primary/10' : 'text-muted-foreground/30'
                    )}
                  />
                  <span className="line-clamp-1">{item.label}</span>
                </div>
                {isActive && <ChevronRight className="h-4 w-4 text-primary" />}
              </button>
            );
          })}
        </nav>

        {/* Back to library */}
        <div className="mt-8 pt-4 border-t border-border flex flex-col gap-2">
          <Link
            href="/vocabulary"
            onClick={() => onClose?.()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground text-sm font-medium transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại thư viện
          </Link>
        </div>
      </div>

      {/* Add Word CTA */}
      {activeMode === 'list' && (
        <button
          onClick={() => {
            onOpenAddWord();
            onClose?.();
          }}
          className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-[1.5rem] bg-primary text-white font-bold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/30 text-sm"
        >
          <Plus className="h-5 w-5" />
          Thêm từ vựng mới
        </button>
      )}
    </div>
  );
};

export { sidebarItems };
export type { StudyMode };
