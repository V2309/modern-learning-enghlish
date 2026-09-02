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
    <div className="w-full space-y-8">

      {/* ── Duolingo-styled Hero Header & Stats ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-border/70">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-duo bg-duo/10 px-3 py-1 rounded-full border border-duo/20">
              <Sparkles className="h-3.5 w-3.5" />
              Thư Viện Từ Vựng Thông Minh
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
            Khám Phá <span className="text-duo">Chủ Đề Từ Vựng</span>
          </h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium">
            Tổ chức các từ vựng theo danh mục chủ đề để ghi nhớ hiệu quả.
          </p>
        </div>

        {/* Duolingo Gamification Stats Chips */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* In progress chip */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
            <Flame className="h-4 w-4 stroke-[2.5]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500/80">Đang học</span>
              <span className="text-xs font-black">{inProgressCount} chủ đề</span>
            </div>
          </div>

          {/* Completed chip */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-duo/10 border border-duo/25 text-duo">
            <Trophy className="h-4 w-4 stroke-[2.5]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Hoàn thành</span>
              <span className="text-xs font-black">{completedCount} chủ đề</span>
            </div>
          </div>

          {/* Words count chip */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400">
            <BookOpen className="h-4 w-4 stroke-[2.5]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-500/80">Tổng từ vựng</span>
              <span className="text-xs font-black">{totalWordsCount} từ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Duolingo Daily Quest / SRS Spaced Repetition Callout ─────────────────────────── */}
      <div className="p-5 sm:p-6 rounded-3xl bg-card border-2 border-border/80 shadow-[0_4px_0_0_theme(colors.border)] flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-duo/15 border-2 border-duo/30 flex items-center justify-center text-duo shrink-0 text-2xl shadow-xs">
            <Zap className="h-6 w-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-foreground">Ôn Tập Ngắt Quãng (SRS Review)</h3>
              <span className="text-[10px] font-black uppercase tracking-wide text-duo bg-duo/10 px-2 py-0.5 rounded-full border border-duo/25">
                Thuật toán SM-2
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground font-medium">
              Ôn lại các từ vựng đến hạn hôm nay để củng cố trí nhớ dài hạn và không bao giờ bị quên.
            </p>
          </div>
        </div>

        <Link
          href="/review"
          className="px-6 py-3 rounded-2xl bg-duo hover:brightness-105 active:border-b-0 active:translate-y-1 border-b-4 border-duo-dark text-duo-foreground text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-xs"
        >
          <span>Vào Bảng Ôn Tập</span>
          <ArrowRight className="h-4 w-4 stroke-[3]" />
        </Link>
      </div>

      {/* ── Filter Tabs, Search & Admin Action Bar ─────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Duolingo Pill Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-muted/70 rounded-2xl border border-border/80 self-start">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === 'all'
                ? 'bg-card text-foreground shadow-xs border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Tất cả ({topics.length})
          </button>
          <button
            onClick={() => setFilterTab('learning')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === 'learning'
                ? 'bg-card text-foreground shadow-xs border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Đang học ({inProgressCount})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${filterTab === 'completed'
                ? 'bg-card text-foreground shadow-xs border border-border/60'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            Đã xong ({completedCount})
          </button>
        </div>

        {/* Right Search + Sort + Admin Add */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-8 py-2 w-full sm:w-56 md:w-64 bg-card border-2 border-border/80 rounded-2xl focus:outline-none focus:border-duo text-foreground text-xs sm:text-sm placeholder:text-muted-foreground transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-duo hover:brightness-105 border-b-4 border-duo-dark active:border-b-0 active:translate-y-1 text-duo-foreground text-xs font-black transition-all cursor-pointer shadow-xs"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Thêm chủ đề</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Topic Grid ──────────────────────────────────────────────────── */}
      {filteredTopics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-card border-2 border-dashed border-border rounded-3xl text-center gap-4"
        >
          <div className="h-16 w-16 rounded-3xl bg-duo/10 border-2 border-duo/20 flex items-center justify-center text-3xl">
            🦉
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-base sm:text-lg font-black text-foreground">Không tìm thấy chủ đề nào</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {searchQuery ? `Không có kết quả phù hợp cho "${searchQuery}"` : 'Chưa có bài học nào trong danh mục này.'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-muted font-bold text-xs text-foreground hover:bg-muted/80 transition cursor-pointer"
            >
              Xoá bộ lọc tìm kiếm
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            ref={menuRef}
          >
            {paginatedTopics.map((topic: any, i: number) => {
              const isCompleted = completedIds.includes(topic.id);
              const wordCount = topic.vocabularies?.length || 0;
              const globalIndex = (currentPage - 1) * PAGE_SIZE + i;

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.045, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
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
                </motion.div>
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

      {/* ── Duolingo Add Modal ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
              className="relative w-full max-w-md bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-foreground">Tạo Chủ Đề Mới</h2>
                  <p className="text-muted-foreground text-xs mt-0.5 font-medium">Tổ chức các bài học từ vựng mới.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tên chủ đề</label>
                  <input
                    type="text"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    className="w-full bg-muted/60 border-2 border-border rounded-2xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-duo transition-all"
                    placeholder="ví dụ: Travel & Adventure"
                    autoFocus
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mô tả</label>
                  <textarea
                    value={newTopic.description}
                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    rows={3}
                    className="w-full bg-muted/60 border-2 border-border rounded-2xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-duo transition-all resize-none"
                    placeholder="Chủ đề này gồm những từ vựng ngữ cảnh nào?"
                  />
                </div>
              </div>
              <div className="p-6 bg-muted/30 border-t border-border">
                <button
                  onClick={handleAddTopic}
                  disabled={!newTopic.name || isAdding}
                  className="w-full py-3.5 bg-duo hover:brightness-105 border-b-4 border-duo-dark active:border-b-0 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-duo-foreground rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  {isAdding ? 'Đang tạo...' : 'Tạo chủ đề'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Duolingo Edit Modal ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showEditModal && editTopic && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.93, y: 16 }}
              transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.35 }}
              className="relative w-full max-w-md bg-card border-2 border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-black text-foreground">Sửa Chủ Đề</h2>
                  <p className="text-muted-foreground text-xs mt-0.5 font-medium">Cập nhật thông tin chủ đề bài học.</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Tên chủ đề</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-muted/60 border-2 border-border rounded-2xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-duo transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mô tả</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-muted/60 border-2 border-border rounded-2xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:border-duo transition-all resize-none"
                  />
                </div>
              </div>
              <div className="p-6 bg-muted/30 border-t border-border">
                <button
                  onClick={handleEditTopic}
                  disabled={!editForm.name || isSaving}
                  className="w-full py-3.5 bg-duo hover:brightness-105 border-b-4 border-duo-dark active:border-b-0 active:translate-y-1 disabled:opacity-50 text-duo-foreground rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
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
