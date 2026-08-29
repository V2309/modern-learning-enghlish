'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  BookOpen, ChevronRight, Search, Plus, X,
  MoreVertical, Pencil, Trash2, Check, Sparkles,
  GraduationCap, Brain,
} from 'lucide-react';
import { createTopicAction, updateTopicAction, deleteTopicAction } from '@/actions/topic.action';
import { toggleTopicCompletionAction } from '@/actions/progress.action';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Pagination from '@/components/Pagination';
import SortMenuButton from '@/components/SortMenuButton';
import { useVocabularyUiStore } from '@/stores/useVocabularyUiStore';
import { toast } from 'react-hot-toast';

interface VocabularyClientProps {
  initialTopics: any[];
  userId: string;
  completedTopicIds?: string[];
  isAdmin?: boolean;
}

const PAGE_SIZE = 8;

/* ── Curated accent palette cycling per card index ─────────────────────── */
const TOPIC_PALETTES = [
  {
    iconBg: 'bg-violet-500/15',
    iconColor: 'text-violet-500',
    hoverBorder: 'hover:border-violet-400/60',
    hoverShadow: 'hover:shadow-violet-500/10',
    titleHover: 'group-hover:text-violet-500',
    badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    chevron: 'text-violet-500',
    topBar: 'bg-violet-500',
  },
  {
    iconBg: 'bg-sky-500/15',
    iconColor: 'text-sky-500',
    hoverBorder: 'hover:border-sky-400/60',
    hoverShadow: 'hover:shadow-sky-500/10',
    titleHover: 'group-hover:text-sky-500',
    badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
    chevron: 'text-sky-500',
    topBar: 'bg-sky-500',
  },
  {
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-500',
    hoverBorder: 'hover:border-amber-400/60',
    hoverShadow: 'hover:shadow-amber-500/10',
    titleHover: 'group-hover:text-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    chevron: 'text-amber-500',
    topBar: 'bg-amber-500',
  },
  {
    iconBg: 'bg-rose-500/15',
    iconColor: 'text-rose-500',
    hoverBorder: 'hover:border-rose-400/60',
    hoverShadow: 'hover:shadow-rose-500/10',
    titleHover: 'group-hover:text-rose-500',
    badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
    chevron: 'text-rose-500',
    topBar: 'bg-rose-500',
  },
  {
    iconBg: 'bg-teal-500/15',
    iconColor: 'text-teal-500',
    hoverBorder: 'hover:border-teal-400/60',
    hoverShadow: 'hover:shadow-teal-500/10',
    titleHover: 'group-hover:text-teal-500',
    badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
    chevron: 'text-teal-500',
    topBar: 'bg-teal-500',
  },
  {
    iconBg: 'bg-orange-500/15',
    iconColor: 'text-orange-500',
    hoverBorder: 'hover:border-orange-400/60',
    hoverShadow: 'hover:shadow-orange-500/10',
    titleHover: 'group-hover:text-orange-500',
    badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
    chevron: 'text-orange-500',
    topBar: 'bg-orange-500',
  },
] as const;

/* Completed state always uses emerald for consistency */
const COMPLETED_PALETTE = {
  iconBg: 'bg-emerald-500/15',
  iconColor: 'text-emerald-500',
  hoverBorder: 'hover:border-emerald-400/70',
  hoverShadow: 'hover:shadow-emerald-500/15',
  titleHover: 'group-hover:text-emerald-500',
  badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
  chevron: 'text-emerald-500',
  topBar: 'bg-emerald-500',
};

export default function VocabularyClient({
  initialTopics,
  userId,
  completedTopicIds = [],
  isAdmin = false,
}: VocabularyClientProps) {
  const [topics, setTopics] = useState<any[]>(initialTopics);
  const [completedIds, setCompletedIds] = useState<string[]>(completedTopicIds);
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
      toast.success(complete ? 'Đã đánh dấu hoàn thành chủ đề!' : 'Đã hủy đánh dấu hoàn thành!');
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

  const filteredTopics = topics
    .filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )
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
  }, [searchQuery, topics.length]);

  const totalPages = Math.max(1, Math.ceil(filteredTopics.length / PAGE_SIZE));
  const paginatedTopics = filteredTopics.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const completedCount = filteredTopics.filter((t) => completedIds.includes(t.id)).length;

  return (
    <div className="w-full">

      {/* ── Header: asymmetric split layout ─────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
        {/* Left: title + stats */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand bg-brand/10 px-3 py-1 rounded-full border border-brand/20">
            <GraduationCap className="h-3.5 w-3.5" />
            Thư Viện Từ Vựng Thông Minh
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
            Khám Phá <span className="text-brand">Chủ Đề Từ Vựng</span>
          </h1>
          {filteredTopics.length > 0 && (
            <p className="text-muted-foreground text-xs sm:text-sm">
              <span className="font-semibold text-foreground">{filteredTopics.length}</span> chủ đề có sẵn
              {completedCount > 0 && (
                <> · <span className="font-semibold text-emerald-600 dark:text-emerald-400">{completedCount} đã hoàn thành</span></>
              )}
            </p>
          )}
        </div>

        {/* Right: controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm chủ đề..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-5 py-2 w-56 sm:w-64 bg-muted/60 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-foreground text-xs sm:text-sm placeholder:text-muted-foreground"
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-black/10 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Thêm chủ đề
            </button>
          )}
        </div>
      </div>

      {/* ── SRS Spaced Repetition Callout Banner ─────────────────────────── */}
      <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-card border border-border/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="h-11 w-11 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0">
            <Brain className="h-5 w-5" />
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-foreground">Ôn Tập Ngắt Quãng (SRS Review)</h3>
              <span className="text-[9px] font-black uppercase text-brand bg-brand/10 px-2 py-0.5 rounded border border-brand/20">
                Thuật toán SM-2
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Ôn lại các từ vựng đến hạn hôm nay để củng cố trí nhớ dài hạn và không bao giờ bị quên.
            </p>
          </div>
        </div>

        <Link
          href="/review"
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-black/10 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <span>Vào Bảng Ôn Tập</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* ── Topic Grid ──────────────────────────────────────────────────── */}
      {filteredTopics.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-20 bg-card border border-border/80 rounded-3xl text-center gap-3.5"
        >
          <div className="h-14 w-14 rounded-2xl bg-muted/60 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-base font-bold text-foreground">Không tìm thấy chủ đề phù hợp</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? `Không có kết quả nào cho "${searchQuery}"` : 'Chưa có chủ đề từ vựng nào được tạo.'}
            </p>
          </div>
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-xs font-bold text-brand hover:underline cursor-pointer">
              Xoá tìm kiếm
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            ref={menuRef}
          >
            {paginatedTopics.map((topic: any, i: number) => {
              const isCompleted = completedIds.includes(topic.id);
              const pal = isCompleted ? COMPLETED_PALETTE : TOPIC_PALETTES[i % TOPIC_PALETTES.length];
              const wordCount = topic.vocabularies?.length || 0;

              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.055, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative group"
                >
                  <Link
                    href={`/vocabulary/topic/${topic.id}`}
                    className={[
                      'flex flex-col h-full rounded-2xl bg-card border border-border/80 overflow-hidden',
                      'transition-all duration-300 hover:shadow-xl hover:-translate-y-1',
                      pal.hoverBorder,
                      pal.hoverShadow,
                    ].join(' ')}
                  >
                    {/* Colored accent top bar */}
                    <div className={`h-1 w-full ${pal.topBar} opacity-70`} />

                    <div className="flex flex-col flex-1 p-5 gap-4">

                      {/* Title + description */}
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm sm:text-base font-bold text-foreground mb-1.5 leading-snug transition-colors pr-6 ${pal.titleHover} line-clamp-2`}>
                          {topic.name}
                        </h3>
                        {topic.description && (
                          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                            {topic.description}
                          </p>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
                        {/* Word count badge */}
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${pal.badge}`}>
                          <Sparkles className="h-3 w-3" />
                          {wordCount} từ
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Complete toggle button — always visible */}
                          <button
                            onClick={async (e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              await handleToggleTopicCompleted(topic.id, !isCompleted);
                            }}
                            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                              isCompleted
                                ? 'bg-emerald-500 border-emerald-500 text-white hover:bg-emerald-600 hover:border-emerald-600'
                                : 'bg-transparent border-border text-muted-foreground hover:border-emerald-400 hover:text-emerald-500 hover:bg-emerald-500/8'
                            }`}
                            title={isCompleted ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu đã hoàn thành'}
                          >
                            <Check className="h-3 w-3 stroke-[2.5]" />
                            {isCompleted ? 'Đã xong' : 'Xong'}
                          </button>

                          <ChevronRight className={`h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 ${pal.chevron}`} />
                        </div>
                      </div>
                    </div>
                  </Link>

                  {/* Action buttons (top-right overlay) — admin only */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === topic.id ? null : topic.id);
                        }}
                        className="p-1.5 rounded-lg bg-card/80 backdrop-blur border border-border hover:bg-muted text-muted-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        id={`topic-menu-btn-${topic.id}`}
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <AnimatePresence>
                      {openMenuId === topic.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -4 }}
                          className="absolute right-0 top-9 w-40 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                        >
                          <button
                            onClick={(e) => { e.preventDefault(); openEditModal(topic); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Pencil className="h-4 w-4 text-primary" />
                            Sửa chủ đề
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); openDeleteModal(topic); }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                            Xoá chủ đề
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
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

      {/* ── Add Modal ───────────────────────────────────────────────────── */}
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
              className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Tạo Chủ Đề Mới</h2>
                  <p className="text-muted-foreground text-xs mt-0.5">Tổ chức các từ vựng theo danh mục chủ đề.</p>
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
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
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
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                    placeholder="Chủ đề này gồm những từ vựng ngữ cảnh nào?"
                  />
                </div>
              </div>
              <div className="p-6 bg-muted/30 border-t border-border">
                <button
                  onClick={handleAddTopic}
                  disabled={!newTopic.name || isAdding}
                  className="w-full py-3 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-black/10"
                >
                  <Plus className="h-4 w-4" />
                  {isAdding ? 'Đang tạo...' : 'Tạo chủ đề'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit Modal ──────────────────────────────────────────────────── */}
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
              className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-foreground">Sửa Chủ Đề</h2>
                  <p className="text-muted-foreground text-xs mt-0.5">Cập nhật thông tin chủ đề từ vựng.</p>
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
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mô tả</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    className="w-full bg-muted/60 border border-border rounded-xl px-4 py-2.5 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all resize-none"
                  />
                </div>
              </div>
              <div className="p-6 bg-muted/30 border-t border-border">
                <button
                  onClick={handleEditTopic}
                  disabled={!editForm.name || isSaving}
                  className="w-full py-3 bg-primary disabled:opacity-50 text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-black/10"
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
