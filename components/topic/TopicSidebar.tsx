'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CheckCircle2, Plus } from 'lucide-react';
import { VocabularyTopic } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type StudyMode = 'list' | 'flashcards' | 'quiz' | 'match' | 'dictation' | 'translate' | 'sentence-practice';

const sidebarItems = [
  { mode: 'list' as StudyMode, label: 'Danh sách từ', group: 'Từ vựng' },
  { mode: 'flashcards' as StudyMode, label: 'Flashcards', group: 'Từ vựng' },
  { mode: 'quiz' as StudyMode, label: 'Trắc nghiệm từ vựng', group: 'Luyện tập' },
  { mode: 'match' as StudyMode, label: 'Trò chơi tìm cặp', group: 'Luyện tập' },
  { mode: 'dictation' as StudyMode, label: 'Nghe chính tả', group: 'Luyện tập' },
  { mode: 'translate' as StudyMode, label: 'Dịch nghĩa & Điền từ', group: 'Luyện tập' },
  { mode: 'sentence-practice' as StudyMode, label: 'Đặt câu với AI', group: 'Luyện tập' },
] as const;

interface TopicSidebarProps {
  topic: VocabularyTopic;
  wordCount: number;
  activeMode?: StudyMode;
  isMobileView?: boolean;
  isFixed?: boolean;
  onOpenAddWord: () => void;
  onClose?: () => void;
}

export const TopicSidebar = ({
  topic,
  wordCount,
  activeMode: propActiveMode,
  isMobileView = false,
  isFixed = false,
  onOpenAddWord,
  onClose,
}: TopicSidebarProps) => {
  const pathname = usePathname();

  // Determine active mode dynamically based on URL if not explicitly provided
  let activeMode: StudyMode = propActiveMode || 'list';
  if (!propActiveMode) {
    if (pathname.includes('/flashcards')) activeMode = 'flashcards';
    else if (pathname.includes('/quiz')) activeMode = 'quiz';
    else if (pathname.includes('/match')) activeMode = 'match';
    else if (pathname.includes('/dictation')) activeMode = 'dictation';
    else if (pathname.includes('/translate')) activeMode = 'translate';
    else if (pathname.includes('/sentence-practice')) activeMode = 'sentence-practice';
  }

  // Common inner layout
  const innerContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* Topic Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link href="/vocabulary" className="p-1.5 rounded-4xl hover:bg-muted text-muted-foreground transition-all shrink-0">
              <ChevronLeft className="h-4.5 w-4.5" />
            </Link>
            <h2 className="text-sm font-extrabold text-foreground tracking-tight line-clamp-1 min-w-0" title={topic.name}>
              {topic.name}
            </h2>
          </div>
          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 shrink-0">
            {wordCount} từ
          </span>
        </div>

        {/* Navigation list */}
        <div className="space-y-4">
          <div>
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest pl-2 block mb-2">Chế độ học</span>
            <nav className="space-y-1">
              {sidebarItems.map((item) => {
                const isActive = activeMode === item.mode;
                const linkHref = item.mode === 'list'
                  ? `/vocabulary/topic/${topic.id}`
                  : `/vocabulary/topic/${topic.id}/${item.mode}`;

                return (
                  <Link
                    key={item.mode}
                    href={linkHref}
                    onClick={() => {
                      onClose?.();
                    }}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2.5 rounded-4xl transition-all text-left font-semibold text-xs border',
                      isActive
                        ? 'bg-primary/10 border-primary/20 text-primary font-bold shadow-xs'
                        : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2
                        className={cn(
                          'h-4 w-4 transition-colors',
                          isActive ? 'text-primary fill-primary/10' : 'text-muted-foreground/30'
                        )}
                      />
                      <span className="line-clamp-1">{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="h-3.5 w-3.5 text-primary" />}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-6 border-t border-border">
        {/* Back to Library */}
        <Link
          href="/vocabulary"
          onClick={() => onClose?.()}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-4xl text-muted-foreground hover:bg-muted hover:text-foreground text-xs font-semibold transition-all"
        >
          <ChevronLeft className="h-4 w-4" />
          Quay lại thư viện
        </Link>

        {/* Add Word CTA (only show on list view) */}
        {activeMode === 'list' && (
          <button
            onClick={() => {
              onOpenAddWord();
              onClose?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-4xl bg-primary text-white font-bold hover:bg-primary/95 transition-all shadow-md shadow-primary/15 text-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Thêm từ vựng mới
          </button>
        )}
      </div>
    </div>
  );

  if (isFixed) {
    return (
      <aside className="fixed top-16 left-0 bottom-0 w-72 bg-card border-r border-border shadow-xs z-30 p-6 hidden lg:block select-none">
        {innerContent}
      </aside>
    );
  }

  // Mobile View or card/drawer view
  return (
    <div className="h-full flex flex-col justify-between">
      {innerContent}
    </div>
  );
};

export { sidebarItems };
export type { StudyMode };
