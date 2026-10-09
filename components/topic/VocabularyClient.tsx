'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, Search, Plus, X,
  Zap, Trophy, Flame, Sparkles, ArrowRight
} from 'lucide-react';
import { createTopicAction, updateTopicAction, deleteTopicAction } from '@/actions/topic.action';
import { toggleTopicCompletionAction } from '@/actions/progress.action';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Pagination from '@/components/Pagination';
import SortMenuButton from '@/components/SortMenuButton';
import { useVocabularyUiStore } from '@/stores/useVocabularyUiStore';
import { toast } from 'react-hot-toast';
import { VocabTopicCard } from './VocabTopicCard';

interface VocabularyClientProps {
  initialTopics: any[];
  userId: string;
  completedTopicIds?: string[];
  isAdmin?: boolean;
}

const PAGE_SIZE = 8;

export default function VocabularyClient({
  initialTopics,
  userId,
  completedTopicIds = [],
  isAdmin = false,
}: VocabularyClientProps) {
  const [topics, setTopics] = useState<any[]>(initialTopics);
  const [completedIds, setCompletedIds] = useState<string[]>(completedTopicIds);
  const [filterTab, setFilterTab] = useState<'all' | 'learning' | 'completed'>('all');

  const searchQuery = useVocabularyUiStore((state) => state.searchQuery);
  const currentPage = useVocabularyUiStore((state) => state.currentPage);
  const setSearchQuery = useVocabularyUiStore((state) => state.setSearchQuery);
  const setCurrentPage = useVocabularyUiStore((state) => state.setCurrentPage);

  useEffect(() => {
    setCompletedIds(completedTopicIds);
  }, [completedTopicIds]);

  const handleToggleTopicCompleted = async (topicId: string, complete: boolean) => {
    if (!userId) {
      toast.error('Vui lòng đăng nhập để thực hiện chức năng này.');
      return;
    }
    setCompletedIds((prev) =>
      complete ? [...prev, topicId] : prev.filter((id) => id !== topicId)
    );
    const res = await toggleTopicCompletionAction(userId, topicId, complete);
    if (res.success) {
      toast.success(complete ? '🎉 Đã hoàn thành chủ đề!' : 'Đã hủy đánh dấu hoàn thành!');
    } else {
      setCompletedIds((prev) =>
        complete ? prev.filter((id) => id !== topicId) : [...prev, topicId]
      );
      toast.error('Có lỗi xảy ra: ' + (res.error || 'Không thể cập nhật'));
    }
  };

  const [sortKey, setSortKey] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTopic, setEditTopic] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleAddTopic = async () => {
    if (!newTopic.name.trim()) return;
    setIsAdding(true);
    const res = await createTopicAction({
      name: newTopic.name,
      description: newTopic.description,
      createdByUserId: userId,
    });
    setIsAdding(false);
    if (res.success && res.topic) {
      setTopics((prev) => [{ ...res.topic, vocabularies: [] }, ...prev]);
      setShowAddModal(false);
      setNewTopic({ name: '', description: '' });
      toast.success('Tạo chủ đề mới thành công!');
    } else {
      toast.error('Không thể tạo chủ đề: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const openEditModal = (topic: any) => {
    setEditTopic(topic);
    setEditForm({ name: topic.name, description: topic.description || '' });
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  const handleEditTopic = async () => {
    if (!editTopic || !editForm.name.trim()) return;
    setIsSaving(true);
    const res = await updateTopicAction(editTopic.id, {
      name: editForm.name,
      description: editForm.description,
    });
    setIsSaving(false);
    if (res.success && res.topic) {
      setTopics((prev) => prev.map((t) => (t.id === editTopic.id ? { ...t, ...res.topic } : t)));
      setShowEditModal(false);
      setEditTopic(null);
      toast.success('Cập nhật chủ đề thành công!');
    } else {
      toast.error('Không thể cập nhật chủ đề: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const openDeleteModal = (topic: any) => {
    setDeletingTopic(topic);
    setOpenMenuId(null);
    setShowDeleteModal(true);
  };

  const handleDeleteTopic = async () => {
    if (!deletingTopic) return;
    setIsDeleting(true);
    const res = await deleteTopicAction(deletingTopic.id);
    setIsDeleting(false);
    if (res.success) {
      setTopics((prev) => prev.filter((t) => t.id !== deletingTopic.id));
      setShowDeleteModal(false);
      setDeletingTopic(null);
      toast.success('Xóa chủ đề thành công!');
    } else {
      toast.error('Không thể xoá chủ đề: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const SORT_OPTIONS = [
    { key: 'newest', label: 'Mới nhất' },
    { key: 'oldest', label: 'Cũ nhất' },
    { key: 'az', label: 'Tên A → Z' },
    { key: 'za', label: 'Tên Z → A' },
  ] as const;

  // Filter by query and tab
  const filteredTopics = topics
    .filter((t) => {
      const matchQuery =
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchQuery) return false;

      const isCompleted = completedIds.includes(t.id);
      if (filterTab === 'learning') return !isCompleted;
      if (filterTab === 'completed') return isCompleted;
      return true;
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'newest':
          return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        case 'oldest':
          return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
        case 'az':
          return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
        case 'za':
          return b.name.localeCompare(a.name, undefined, { numeric: true, sensitivity: 'base' });
        default:
          return 0;
      }
    });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterTab, topics.length]);

  const totalPages = Math.max(1, Math.ceil(filteredTopics.length / PAGE_SIZE));
  const paginatedTopics = filteredTopics.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const completedCount = topics.filter((t) => completedIds.includes(t.id)).length;
  const inProgressCount = topics.length - completedCount;
  const totalWordsCount = topics.reduce((acc, t) => acc + (t.vocabularies?.length || 0), 0);

  return (
    <div className="w-full space-y-6">

      {/* ── 1. HEADER & KPI METRICS (Bento Grid Style with Hairline Dividers) ── */}
      <div className="space-y-4">
        {/* Editorial Section Header Card */}
        <div className="p-6 sm:p-7 border border-[#e5e7eb] dark:border-[#1f2937] bg-white dark:bg-[#0f1115] flex flex-col md:flex-row md:items-end justify-between gap-5 relative overflow-hidden group">
          {/* Light Sweep Sheen */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

          {/* Technical Crosshairs */}
          <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>

          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#f28500] font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#f28500] animate-pulse" />
              01 · THƯ VIỆN TỪ VỰNG THÔNG MINH
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#111827] dark:text-white tracking-tight leading-tight">
              Khám Phá <span className="text-[#f28500]">Chủ Đề Từ Vựng</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-xl">
              Tổ chức từ vựng theo chủ đề ngữ cảnh chuyên sâu, kết hợp phương pháp lặp lại ngắt quãng để ghi nhớ bền vững.
            </p>
          </div>

          {/* Admin Create Topic Button (Tactile 3D Button) */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-3d-duo px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-md self-start md:self-auto relative z-10"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Thêm Chủ Đề Mới</span>
            </button>
          )}
        </div>

        {/* Connected 3-Metric Hairline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#e5e7eb] dark:bg-[#1f2937] border border-[#e5e7eb] dark:border-[#1f2937] overflow-hidden">
          {/* Metric 1: In Progress */}
          <div className="bg-white dark:bg-[#0f1115] p-5 sm:p-6 relative overflow-hidden group hover:bg-[#fafafa] dark:hover:bg-[#14171b] transition-colors">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />
            <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <div className="flex items-center justify-between text-muted-foreground mb-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-amber-600 dark:text-amber-400">
                01 · TIẾN ĐỘ
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Flame className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white">
                {inProgressCount} <span className="text-xs font-normal text-muted-foreground">chủ đề</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Đang trong quá trình rèn luyện</p>
            </div>
          </div>

          {/* Metric 2: Completed */}
          <div className="bg-white dark:bg-[#0f1115] p-5 sm:p-6 relative overflow-hidden group hover:bg-[#fafafa] dark:hover:bg-[#14171b] transition-colors">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />
            <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <div className="flex items-center justify-between text-muted-foreground mb-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-emerald-600 dark:text-emerald-400">
                02 · THÀNH TỰU
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Trophy className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white">
                {completedCount} <span className="text-xs font-normal text-muted-foreground">chủ đề</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Đã thành thạo 100% mục tiêu</p>
            </div>
          </div>

          {/* Metric 3: Total Words */}
          <div className="bg-white dark:bg-[#0f1115] p-5 sm:p-6 relative overflow-hidden group hover:bg-[#fafafa] dark:hover:bg-[#14171b] transition-colors">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />
            <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <div className="flex items-center justify-between text-muted-foreground mb-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-sky-600 dark:text-sky-400">
                03 · DỮ LIỆU
              </span>
              <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <BookOpen className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="relative z-10">
              <div className="text-2xl sm:text-3xl font-bold text-[#111827] dark:text-white">
                {totalWordsCount} <span className="text-xs font-normal text-muted-foreground">từ</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-1">Từ vựng thuộc kho lưu trữ</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SRS SPACED REPETITION BENTO CALLOUT ── */}
      <div className="p-5 sm:p-6 border border-[#e5e7eb] dark:border-[#1f2937] bg-white dark:bg-[#0f1115] flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden group">
        {/* Light Sweep Sheen */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />
        <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
        <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>

        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="h-12 w-12 rounded-xl bg-[#f28500]/10 border border-[#f28500]/25 flex items-center justify-center text-[#f28500] shrink-0">
            <Zap className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-[#111827] dark:text-white tracking-tight">
                Ôn Tập Ngắt Quãng (Spaced Repetition System)
              </h3>
              <span className="text-[10px] uppercase tracking-wider text-[#f28500] bg-[#f28500]/10 px-2 py-0.5 rounded border border-[#f28500]/25 font-bold">
                Thuật toán SM-2
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal">
              Tự động tính toán chu kỳ lặp lại tối ưu cho các từ vựng đến hạn hôm nay để củng cố trí nhớ vĩnh viễn.
            </p>
          </div>
        </div>

        <Link
          href="/review"
          className="btn-3d-brand px-6 py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md relative z-10"
        >
          <span>Bảng Ôn Tập SRS</span>
          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
        </Link>
      </div>

      {/* ── 3. FILTER TABS, SEARCH & CONTROLS BAR ── */}
      <div className="p-3 sm:p-4 border border-[#e5e7eb] dark:border-[#1f2937] bg-white dark:bg-[#0f1115] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative overflow-hidden">
        {/* Segmented Filter Control */}
        <div className="inline-flex items-center p-0.5 bg-[#f3f4f6] dark:bg-[#1a1d21] border border-[#e5e7eb] dark:border-[#1f2937] rounded-lg self-start">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filterTab === 'all'
                ? 'bg-white dark:bg-[#0f1115] text-[#111827] dark:text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Tất cả ({topics.length})
          </button>
          <button
            onClick={() => setFilterTab('learning')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filterTab === 'learning'
                ? 'bg-white dark:bg-[#0f1115] text-[#111827] dark:text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Đang học ({inProgressCount})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
              filterTab === 'completed'
                ? 'bg-white dark:bg-[#0f1115] text-[#111827] dark:text-white shadow-xs font-bold'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Đã xong ({completedCount})
          </button>
        </div>

        {/* Right Search + Sort Menu */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 py-2 w-full sm:w-56 md:w-64 bg-[#f9fafb] dark:bg-[#14171b] border border-[#e5e7eb] dark:border-[#1f2937] rounded-lg focus:outline-none focus:border-[#f28500] text-foreground text-xs placeholder:text-muted-foreground transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <SortMenuButton
            options={SORT_OPTIONS}
            value={sortKey}
            onChange={(nextKey) => {
              setSortKey(nextKey);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      {/* ── 4. CONNECTED BENTO TOPIC GRID ── */}
      {filteredTopics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-white dark:bg-[#0f1115] border border-[#e5e7eb] dark:border-[#1f2937] text-center gap-4 relative overflow-hidden"
        >
          <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 font-bold">+</span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 font-bold">+</span>
          <div className="h-14 w-14 rounded-2xl bg-[#f28500]/10 border border-[#f28500]/25 flex items-center justify-center text-3xl">
            📚
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-base font-bold text-[#111827] dark:text-white">Không tìm thấy chủ đề nào</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? `Không có kết quả phù hợp cho "${searchQuery}"` : 'Chưa có bài học nào trong danh mục này.'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-lg bg-[#f3f4f6] dark:bg-[#1a1d21] border border-[#e5e7eb] dark:border-[#1f2937] text-xs font-semibold text-foreground hover:bg-[#e5e7eb] dark:hover:bg-[#252a30] transition cursor-pointer"
            >
              Xoá bộ lọc tìm kiếm
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-[#e5e7eb] dark:bg-[#1f2937] border border-[#e5e7eb] dark:border-[#1f2937] overflow-hidden"
            ref={menuRef}
          >
            {paginatedTopics.map((topic: any, i: number) => {
              const isCompleted = completedIds.includes(topic.id);
              const wordCount = topic.vocabularies?.length || 0;
              const globalIndex = (currentPage - 1) * PAGE_SIZE + i;

              return (
                <div
                  key={topic.id}
                  className={`h-full bg-white dark:bg-[#0f1115] ${openMenuId === topic.id ? 'relative z-30' : 'relative z-0'}`}
                >
                  <VocabTopicCard
                    id={topic.id}
                    index={globalIndex}
                    title={topic.name}
                    description={topic.description}
                    totalWords={wordCount}
                    isCompleted={isCompleted}
                    isAdmin={isAdmin}
                    isMenuOpen={openMenuId === topic.id}
                    onMenuToggle={() => setOpenMenuId(openMenuId === topic.id ? null : topic.id)}
                    onEdit={() => openEditModal(topic)}
                    onDelete={() => openDeleteModal(topic)}
                    onToggleComplete={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      await handleToggleTopicCompleted(topic.id, !isCompleted);
                    }}
                  />
                </div>
              );
            })}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTopics.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}

      {/* ── Add Topic Modal (Consistent Bento Aesthetic with Tactile 3D Action) ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0f1115] border border-[#e5e7eb] dark:border-[#1f2937] rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-[#e5e7eb] dark:border-[#1f2937] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#111827] dark:text-white">Tạo Chủ Đề Mới</h2>
                  <p className="text-muted-foreground text-xs mt-0.5">Tổ chức các bài học từ vựng mới theo danh mục.</p>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1.5 rounded-lg hover:bg-[#f3f4f6] dark:hover:bg-[#1f2937] text-muted-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Tên chủ đề</label>
                  <input
                    type="text"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    className="w-full bg-[#f9fafb] dark:bg-[#14171b] border border-[#e5e7eb] dark:border-[#1f2937] rounded-lg px-3.5 py-2 text-foreground text-sm focus:outline-none focus:border-[#f28500] transition-all"
                    placeholder="ví dụ: Du Lịch & Khám Phá (Travel & Adventure)"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Mô tả</label>
                  <textarea
                    value={newTopic.description}
                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    rows={3}
                    className="w-full bg-[#f9fafb] dark:bg-[#14171b] border border-[#e5e7eb] dark:border-[#1f2937] rounded-lg px-3.5 py-2 text-foreground text-sm focus:outline-none focus:border-[#f28500] transition-all resize-none"
                    placeholder="Chủ đề này gồm những nhóm từ vựng ngữ cảnh nào?"
                  />
                </div>
              </div>

              <div className="p-5 bg-[#f9fafb] dark:bg-[#14171b] border-t border-[#e5e7eb] dark:border-[#1f2937]">
                <button
                  onClick={handleAddTopic}
                  disabled={!newTopic.name || isAdding}
                  className="btn-3d-duo w-full py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  {isAdding ? 'Đang tạo...' : 'Tạo chủ đề'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Topic Modal (Bento Aesthetic with Tactile 3D Action) ── */}
      <AnimatePresence>
        {showEditModal && editTopic && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0f1115] border border-[#e5e7eb] dark:border-[#1f2937] rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-[#e5e7eb] dark:border-[#1f2937] flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-[#111827] dark:text-white">Sửa Chủ Đề</h2>
                  <p className="text-muted-foreground text-xs mt-0.5">Cập nhật thông tin chủ đề bài học.</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1.5 rounded-lg hover:bg-[#f3f4f6] dark:hover:bg-[#1f2937] text-muted-foreground transition-colors cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Tên chủ đề</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-[#f9fafb] dark:bg-[#14171b] border border-[#e5e7eb] dark:border-[#1f2937] rounded-lg px-3.5 py-2 text-foreground text-sm focus:outline-none focus:border-[#f28500] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Mô tả</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-[#f9fafb] dark:bg-[#14171b] border border-[#e5e7eb] dark:border-[#1f2937] rounded-lg px-3.5 py-2 text-foreground text-sm focus:outline-none focus:border-[#f28500] transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-5 bg-[#f9fafb] dark:bg-[#14171b] border-t border-[#e5e7eb] dark:border-[#1f2937]">
                <button
                  onClick={handleEditTopic}
                  disabled={!editForm.name || isSaving}
                  className="btn-3d-duo w-full py-3 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        show={showDeleteModal}
        title={`Xoá chủ đề "${deletingTopic?.name}"?`}
        description="Tất cả từ vựng trong chủ đề này cũng sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác."
        isLoading={isDeleting}
        onConfirm={handleDeleteTopic}
        onCancel={() => { setShowDeleteModal(false); setDeletingTopic(null); }}
      />
    </div>
  );
}
