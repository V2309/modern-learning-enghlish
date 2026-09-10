'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
  Award,
  ArrowLeft,
  Search,
  Volume2,
  Calendar,
  Layers,
  Filter,
  ArrowUpDown,
  BookOpen,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Pagination from '@/components/Pagination';

export interface MasteredWordItem {
  id: string;
  progressId: string;
  word: string;
  meaning: string;
  definition: string | null;
  example: string | null;
  category: string;
  partOfSpeech: string;
  pronunciation: string | null;
  imageUrl: string | null;
  topicId: string;
  topicName: string;
  interval: number;
  easeFactor: number;
  repetitions: number;
  reviewCount: number;
  lapseCount: number;
  masteredAt: string | null;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface ProfessionalWordsClientProps {
  initialWords: MasteredWordItem[];
  pagination: PaginationInfo;
  totalLearned: number;
  topics: { id: string; name: string }[];
  currentSearch?: string;
  currentTopicId?: string;
  currentSortBy?: string;
}

const POS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  Noun: { bg: 'bg-sky-500/10', text: 'text-sky-600 dark:text-sky-400', border: 'border-sky-500/20' },
  Verb: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-500/20' },
  Adjective: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-500/20' },
  Adverb: { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-500/20' },
  Phrase: { bg: 'bg-rose-500/10', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-500/20' },
  Other: { bg: 'bg-slate-500/10', text: 'text-slate-600 dark:text-slate-400', border: 'border-slate-500/20' },
};

export function ProfessionalWordsClient({
  initialWords,
  pagination,
  totalLearned,
  topics,
  currentSearch = '',
  currentTopicId = '',
  currentSortBy = 'masteredAt',
}: ProfessionalWordsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);

  // Play audio using Web Speech API
  const handlePlayAudio = (word: string, id: string) => {
    if (typeof window === 'undefined') return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      setPlayingWordId(id);
      utterance.onend = () => setPlayingWordId(null);
      utterance.onerror = () => setPlayingWordId(null);
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('Speech synthesis error:', e);
      setPlayingWordId(null);
    }
  };

  // Push new URL params with transition
  const updateUrlParams = (updates: Record<string, string | number | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, val]) => {
      if (val === undefined || val === '' || val === 'all') {
        params.delete(key);
      } else {
        params.set(key, String(val));
      }
    });

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ search: searchInput.trim(), page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateUrlParams({ search: undefined, page: 1 });
  };

  const handleTopicChange = (topicId: string) => {
    updateUrlParams({ topicId: topicId === 'all' ? undefined : topicId, page: 1 });
  };

  const handleSortChange = (sortBy: string) => {
    updateUrlParams({ sortBy, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages || newPage === pagination.page) return;
    updateUrlParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const masteryPercentage = totalLearned > 0
    ? Math.round((pagination.totalCount / totalLearned) * 100)
    : 0;

  return (
    <div className="w-full space-y-6">
      {/* ── 1. TOP BREADCRUMB & BACK LINK ── */}
      <div className="flex items-center justify-between">
        <Link
          href="/review"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-card hover:bg-muted text-foreground border-2 border-border shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none text-xs font-black transition-all group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>Quay lại Trang Ôn Tập SRS</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
          <span>Ôn tập SRS</span>
          <span>/</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-black">Đã Thành Thạo</span>
        </div>
      </div>

      {/* ── 2. HERO MASTERY HEADER BANNER (COMPACT & DUO GREEN) ── */}
      <div className="p-4 sm:p-5 rounded-2xl bg-card border-2 border-emerald-500/30 shadow-[0_4px_0_0_theme(colors.border)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white bg-[var(--duo)] px-2.5 py-0.5 rounded-lg shadow-2xs">
              <Award className="h-3 w-3" />
              Từ Vựng Đã Thành Thạo
            </span>
            <span className="text-[10px] font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-lg border border-border">
              Khoảng cách &ge; 21 ngày
            </span>
          </div>

          <h1 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
            Kho Trí Nhớ Dài Hạn Của Bạn
          </h1>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">
            Danh sách những từ vựng bạn đã ôn luyện nhuần nhuyễn qua nhiều chu kỳ SRS và được ghi nhớ sâu.
          </p>
        </div>

        {/* Compact Duo Metric Badge */}
        <div className="shrink-0 px-4 py-3 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/25 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[var(--duo)] text-white flex items-center justify-center shadow-[0_2px_0_0_var(--duo-dark)]">
            <Award className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-foreground leading-none">
              {pagination.totalCount} <span className="text-xs font-bold text-muted-foreground">/ {totalLearned} từ</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Đạt {masteryPercentage}% toàn bộ kho từ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. SEARCH & FILTER TOOLBAR ── */}
      <div className="p-3 sm:p-3.5 rounded-2xl bg-card border-2 border-border/80 shadow-[0_3px_0_0_theme(colors.border)] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search form */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tìm theo từ vựng, nghĩa tiếng Việt..."
            className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-muted/50 border-2 border-border focus:border-emerald-500 focus:outline-hidden text-xs sm:text-sm font-bold text-foreground placeholder:text-muted-foreground transition-all"
          />
          {searchInput && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </form>

        {/* Filter by Topic & Sort */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Topic filter */}
          <div className="relative flex items-center">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={currentTopicId || 'all'}
              onChange={(e) => handleTopicChange(e.target.value)}
              className="pl-8 pr-8 py-2.5 rounded-2xl bg-card border-2 border-border hover:border-border/80 focus:border-emerald-500 focus:outline-hidden text-xs font-bold text-foreground transition-all cursor-pointer appearance-none"
            >
              <option value="all">Tất cả chủ đề</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort selection */}
          <div className="relative flex items-center">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={currentSortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="pl-8 pr-8 py-2.5 rounded-2xl bg-card border-2 border-border hover:border-border/80 focus:border-emerald-500 focus:outline-hidden text-xs font-bold text-foreground transition-all cursor-pointer appearance-none"
            >
              <option value="masteredAt">Mới thành thạo nhất</option>
              <option value="interval">Khoảng cách SRS cao nhất</option>
              <option value="word">Từ vựng (A-Z)</option>
              <option value="reviewCount">Số lần ôn tập nhiều nhất</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading overlay indicator */}
      {isPending && (
        <div className="w-full text-center py-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 animate-pulse">
          Đang cập nhật danh sách...
        </div>
      )}

      {/* ── 4. WORD CARDS GRID ── */}
      {initialWords.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-card border-2 border-dashed border-border/80 space-y-4">
          <div className="h-16 w-16 mx-auto rounded-3xl bg-emerald-500/10 border-2 border-emerald-500/25 flex items-center justify-center text-emerald-600">
            <BookOpen className="h-8 w-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-black text-foreground">
              {currentSearch || currentTopicId
                ? 'Không tìm thấy từ vựng nào'
                : 'Chưa có từ vựng nào đạt Thành Thạo'}
            </h3>
            <p className="text-xs text-muted-foreground font-medium">
              {currentSearch || currentTopicId
                ? 'Hãy thử thay đổi từ khóa hoặc bộ lọc chủ đề của bạn.'
                : 'Khi bạn duy trì khoảng cách ôn tập liên tiếp &ge; 21 ngày, các từ vựng sẽ xuất hiện tại đây.'}
            </p>
          </div>
          {currentSearch || currentTopicId ? (
            <button
              onClick={() => {
                setSearchInput('');
                updateUrlParams({ search: undefined, topicId: undefined, page: 1 });
              }}
              className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition-all shadow-[0_3px_0_0_#059669] active:translate-y-0.5 active:shadow-none"
            >
              Xóa tất cả bộ lọc
            </button>
          ) : (
            <Link
              href="/review"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand hover:bg-brand/90 text-white text-xs font-black transition-all shadow-[0_3px_0_0_#d95847] active:translate-y-0.5 active:shadow-none"
            >
              <Sparkles className="h-4 w-4" />
              <span>Bắt đầu ôn tập ngay</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5">
          {initialWords.map((item) => {
            const posStyle = POS_COLORS[item.partOfSpeech] || POS_COLORS.Other;
            const isPlaying = playingWordId === item.id;

            return (
              <div
                key={item.progressId}
                className="p-4 rounded-2xl bg-card border-2 border-border/80 shadow-[0_3px_0_0_theme(colors.border)] hover:border-emerald-500/50 hover:shadow-[0_5px_0_0_theme(colors.border)] hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-3 group"
              >
                {/* Top badges & Audio Button */}
                <div className="flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 flex-wrap min-w-0">
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-muted text-muted-foreground border border-border truncate max-w-[100px]" title={item.topicName}>
                      {item.topicName}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-black px-2 py-0.5 rounded-lg border',
                        posStyle.bg,
                        posStyle.text,
                        posStyle.border
                      )}
                    >
                      {item.partOfSpeech}
                    </span>
                  </div>

                  <button
                    onClick={() => handlePlayAudio(item.word, item.id)}
                    title="Nghe phát âm"
                    className={cn(
                      'h-7 w-7 shrink-0 rounded-xl flex items-center justify-center border-2 transition-all cursor-pointer',
                      isPlaying
                        ? 'bg-emerald-500 text-white border-emerald-600 scale-110 shadow-2xs'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted border-border'
                    )}
                  >
                    <Volume2 className={cn('h-3.5 w-3.5', isPlaying && 'animate-pulse')} />
                  </button>
                </div>

                {/* Word & Meaning */}
                <div className="space-y-1">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors break-all">
                      {item.word}
                    </h3>
                    {item.pronunciation && (
                      <span className="text-[11px] font-mono font-medium text-muted-foreground">
                        {item.pronunciation}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-bold text-emerald-700 dark:text-emerald-300 leading-snug line-clamp-2">
                    {item.meaning}
                  </p>
                </div>

                {/* Bottom SRS Meta Footer */}
                <div className="pt-2.5 border-t border-border/60 flex items-center justify-between text-[10px] font-bold text-muted-foreground">
                  <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-black">
                    <Layers className="h-3 w-3 shrink-0" />
                    <span>{item.interval} ngày</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 shrink-0" />
                    <span>{item.reviewCount} lần</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 5. FULL PAGINATION BAR ── */}
      <Pagination
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalCount}
        pageSize={pagination.limit}
        onPageChange={handlePageChange}
        itemName="từ thành thạo"
      />
    </div>
  );
}
