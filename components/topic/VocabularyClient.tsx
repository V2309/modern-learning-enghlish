'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, ChevronRight, Search, Plus, X, MoreVertical, Pencil, Trash2, Check } from 'lucide-react';
import { createTopicAction, updateTopicAction, deleteTopicAction } from '@/actions/topic.action';
import { toggleTopicCompletionAction } from '@/actions/progress.action';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Pagination from '@/components/Pagination';
import SortMenuButton from '@/components/SortMenuButton';
import { useVocabularyUiStore } from '@/stores/useVocabularyUiStore';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

interface VocabularyClientProps {
  initialTopics: any[];
  userId: string;
  completedTopicIds?: string[];
  isAdmin?: boolean;
}

const PAGE_SIZE = 8;

export default function VocabularyClient({ initialTopics, userId, completedTopicIds = [], isAdmin = false }: VocabularyClientProps) {
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
      toast.error("Vui lòng đăng nhập để thực hiện chức năng này.");
      return;
    }

    // Optimistic update
    setCompletedIds((prev) =>
      complete ? [...prev, topicId] : prev.filter((id) => id !== topicId)
    );

    const res = await toggleTopicCompletionAction(userId, topicId, complete);

    if (res.success) {
      toast.success(complete ? "Đã đánh dấu hoàn thành chủ đề!" : "Đã hủy đánh dấu hoàn thành!");
    } else {
      // Revert optimistic update
      setCompletedIds((prev) =>
        complete ? prev.filter((id) => id !== topicId) : [...prev, topicId]
      );
      toast.error("Có lỗi xảy ra: " + (res.error || "Không thể cập nhật"));
    }
  };

  const [sortKey, setSortKey] = useState<'newest' | 'oldest' | 'az' | 'za'>('newest');

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopic, setNewTopic] = useState({ name: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTopic, setEditTopic] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingTopic, setDeletingTopic] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Dropdown menu
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
  const paginatedTopics = filteredTopics.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Vocabulary Library</h1>
          <p className="text-muted-foreground text-lg">Pick a topic and start expanding your knowledge.</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-6 py-3 w-full md:w-80 bg-muted border border-border rounded-4xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            />
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
              className="flex items-center gap-2 px-6 py-3 rounded-4xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
            >
              <Plus className="h-5 w-5" />
              New Topic
            </button>
          )}
        </div>
      </div>

      {filteredTopics.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-4xl text-muted-foreground">
          Chưa có chủ đề nào được tìm thấy.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6" ref={menuRef}>
            {paginatedTopics.map((topic: any, i: number) => {
              const isCompleted = completedIds.includes(topic.id);
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative"
                >
                  <Link
                    href={`/vocabulary/topic/${topic.id}`}
                    className={`block p-8 h-full rounded-3xl bg-card border transition-all hover:bg-muted/50 group relative overflow-hidden shadow-sm ${
                      isCompleted
                        ? "border-emerald-500/20 hover:border-emerald-500/50"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ChevronRight className={`h-6 w-6 ${isCompleted ? "text-emerald-500" : "text-primary"}`} />
                    </div>

                    <div className={`h-12 w-12 rounded-4xl flex items-center justify-center mb-6 transition-colors ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "bg-primary/10 text-primary"
                    }`}>
                      <BookOpen className="h-6 w-6" />
                    </div>

                    <h3 className={`text-2xl font-bold text-foreground mb-2 transition-colors pr-8 ${
                      isCompleted ? "group-hover:text-emerald-500" : "group-hover:text-primary"
                    }`}>
                      {topic.name}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{topic.description}</p>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                        {topic.vocabularies?.length || 0} Words
                      </span>
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                          <Check className="h-3 w-3 stroke-[3]" />
                          Hoàn thành
                        </span>
                      )}
                    </div>
                  </Link>

                  <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                    <button
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await handleToggleTopicCompleted(topic.id, !isCompleted);
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 opacity-100"
                          : "bg-card/85 backdrop-blur border-border hover:bg-muted text-muted-foreground/60 opacity-40 hover:opacity-100"
                      }`}
                      title={isCompleted ? "Đánh dấu chưa hoàn thành" : "Đánh dấu đã hoàn thành"}
                    >
                      <Check className="h-4 w-4 stroke-[3]" />
                    </button>

                    {isAdmin && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenMenuId(openMenuId === topic.id ? null : topic.id);
                        }}
                        className="p-2 rounded-xl bg-card/80 backdrop-blur border border-border hover:bg-muted text-muted-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                        id={`topic-menu-btn-${topic.id}`}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                    )}

                    <AnimatePresence>
                      {openMenuId === topic.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -4 }}
                          className="absolute right-0 mt-12 w-40 bg-card border border-border rounded-4xl shadow-xl overflow-hidden z-50"
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

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Create New Topic</h2>
                  <p className="text-muted-foreground text-sm">Organize words into a meaningful collection.</p>
                </div>
                <button onClick={() => setShowAddModal(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
                  <X />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Topic Name</label>
                  <input
                    type="text"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                    className="w-full bg-muted border border-border rounded-4xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                    placeholder="e.g. Travel & Adventure"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Description</label>
                  <textarea
                    value={newTopic.description}
                    onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                    rows={4}
                    className="w-full bg-muted border border-border rounded-4xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all resize-none"
                    placeholder="What is this collection about?"
                  />
                </div>
              </div>

              <div className="p-8 bg-muted/50 border-t border-border">
                <button
                  onClick={handleAddTopic}
                  disabled={!newTopic.name || isAdding}
                  className="w-full py-4 bg-primary disabled:opacity-50 disabled:grayscale text-white rounded-4xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="h-5 w-5" />
                  {isAdding ? 'Đang tạo...' : 'Create Topic'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showEditModal && editTopic && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl bg-card border border-border rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Sửa chủ đề</h2>
                  <p className="text-muted-foreground text-sm">Cập nhật thông tin chủ đề từ vựng.</p>
                </div>
                <button onClick={() => setShowEditModal(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">
                  <X />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Tên chủ đề</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-muted border border-border rounded-4xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Mô tả</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                    className="w-full bg-muted border border-border rounded-4xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all resize-none"
                  />
                </div>
              </div>

              <div className="p-8 bg-muted/50 border-t border-border">
                <button
                  onClick={handleEditTopic}
                  disabled={!editForm.name || isSaving}
                  className="w-full py-4 bg-primary disabled:opacity-50 text-white rounded-4xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
