'use client';

import React from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Layers,
  HelpCircle,
  Gamepad2,
  Headphones,
  Languages,
  Sparkles,
} from 'lucide-react';
import { VocabularyTopic } from '@/data/mockData';
import { cn } from '@/lib/utils';
import { usePathname } from 'next/navigation';

type StudyMode = 'list' | 'flashcards' | 'quiz' | 'match' | 'dictation' | 'translate' | 'sentence-practice';

interface SidebarItem {
  mode: StudyMode;
  label: string;
  group: 'Học tập' | 'Luyện tập';
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { mode: 'list', label: 'Danh sách từ', group: 'Học tập', icon: BookOpen },
  { mode: 'flashcards', label: 'Flashcards', group: 'Học tập', icon: Layers },
  { mode: 'quiz', label: 'Trắc nghiệm từ vựng', group: 'Luyện tập', icon: HelpCircle },
  { mode: 'match', label: 'Trò chơi tìm cặp', group: 'Luyện tập', icon: Gamepad2 },
  { mode: 'dictation', label: 'Nghe chính tả', group: 'Luyện tập', icon: Headphones },
  { mode: 'translate', label: 'Dịch nghĩa & Điền từ', group: 'Luyện tập', icon: Languages },
  { mode: 'sentence-practice', label: 'Đặt câu với AI', group: 'Luyện tập', icon: Sparkles },
];

interface TopicSidebarProps {
  topic: VocabularyTopic;
  wordCount: number;
  activeMode?: StudyMode;
  isMobileView?: boolean;
  isFixed?: boolean;
  onOpenAddWord?: () => void;
  onClose?: () => void;
  isAdmin?: boolean;
}

export const TopicSidebar = ({
  topic,
  wordCount,
  activeMode: propActiveMode,
  isMobileView = false,
  isFixed = false,
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

  const studyGroup = sidebarItems.filter((i) => i.group === 'Học tập');
  const practiceGroup = sidebarItems.filter((i) => i.group === 'Luyện tập');

  const renderNavGroup = (title: string, items: SidebarItem[]) => (
    <div className="space-y-1.5">
      <span className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest px-2.5 block">
        {title}
      </span>
      <nav className="space-y-0.5">
        {items.map((item) => {
          const isActive = activeMode === item.mode;
          const Icon = item.icon;
          const linkHref = item.mode === 'list'
            ? `/vocabulary/topic/${topic.id}`
            : `/vocabulary/topic/${topic.id}/${item.mode}`;

          return (
            <Link
              key={item.mode}
              href={linkHref}
              onClick={() => onClose?.()}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2.5 rounded-2xl transition-all text-left text-xs font-bold border group cursor-pointer',
                isActive
                  ? 'bg-brand/10 border-brand/20 text-brand font-black shadow-2xs'
                  : 'bg-transparent border-transparent text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className={cn(
                  'p-1.5 rounded-xl transition-colors shrink-0',
                  isActive ? 'bg-brand/15 text-brand' : 'bg-muted/60 text-muted-foreground group-hover:text-foreground group-hover:bg-muted'
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && (
                <div className="h-2 w-2 rounded-full bg-brand shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  const innerContent = (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-5">
        {/* Topic Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border/70">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/vocabulary"
              className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all shrink-0"
              title="Quay lại danh sách chủ đề"
            >
              <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
            </Link>
            <h2 className="text-sm font-black text-foreground tracking-tight truncate" title={topic.name}>
              {topic.name}
            </h2>
          </div>
          <span className="text-[10px] font-black text-brand bg-brand/10 px-2.5 py-0.5 rounded-full border border-brand/20 shrink-0">
            {wordCount} từ
          </span>
        </div>

        {/* Navigation list */}
        <div className="space-y-4">
          {renderNavGroup('Học tập', studyGroup)}
          {renderNavGroup('Luyện tập', practiceGroup)}
        </div>
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-border/70">
        <Link
          href="/vocabulary"
          onClick={() => onClose?.()}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-muted-foreground hover:bg-muted/70 hover:text-foreground text-xs font-medium transition-all"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span>Quay lại thư viện</span>
        </Link>
      </div>
    </div>
  );

  if (isFixed) {
    return (
      <aside className="fixed top-16 left-0 bottom-0 w-72 bg-card border-r border-border shadow-xs z-30 p-4.5 hidden lg:block select-none">
        {innerContent}
      </aside>
    );
  }

  return (
    <div className="h-full flex flex-col justify-between">
      {innerContent}
    </div>
  );
};

export { sidebarItems };
export type { StudyMode };

