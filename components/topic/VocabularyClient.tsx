'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { BookOpen, ChevronRight, Search, Plus, X, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { createTopicAction, updateTopicAction, deleteTopicAction } from '@/actions/topic.action';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { useVocabularyUiStore } from '@/stores/useVocabularyUiStore';

interface VocabularyClientProps {
  initialTopics: any[];
  userId: string;
}

const PAGE_SIZE = 6;

export default function VocabularyClient({ initialTopics, userId }: VocabularyClientProps) {
  const [topics, setTopics] = useState<any[]>(initialTopics);
  const searchQuery = useVocabularyUiStore((state) => state.searchQuery);
  const setSearchQuery = useVocabularyUiStore((state) => state.setSearchQuery);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

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
  const loadMoreRef = useRef<HTMLDivElement>(null);

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
    } else {
      alert('Không thể tạo chủ đề: ' + (res.error || 'Có lỗi xảy ra'));
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
    } else {
      alert('Không thể cập nhật chủ đề: ' + (res.error || 'Có lỗi xảy ra'));
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
    } else {
      alert('Không thể xoá chủ đề: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const filteredTopics = topics.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, topics.length]);

  const visibleTopics = filteredTopics.slice(0, visibleCount);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredTopics.length));
        }
      },
      { rootMargin: '200px 0px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [filteredTopics.length]);

  return (
    <div className="container mx-auto px-4 py-12">
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
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-4xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            New Topic
          </button>
        </div>
      </div>

      {filteredTopics.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-4xl text-muted-foreground">
          Chưa có chủ đề nào được tìm thấy.
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6" ref={menuRef}>
            {visibleTopics.map((topic: any, i: number) => (
              <motion.div
                key={topic.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <Link
                  href={`/vocabulary/topic/${topic.id}`}
                  className="block p-8 h-full rounded-3xl bg-card border border-border hover:border-primary/50 transition-all hover:bg-muted/50 group relative overflow-hidden shadow-sm"
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-6 w-6 text-primary" />
                  </div>

                  <div className="h-12 w-12 rounded-4xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                    <BookOpen className="h-6 w-6" />
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors pr-8">
                    {topic.name}
                  </h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{topic.description}</p>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                      {topic.vocabularies?.length || 0} Words
                    </span>
                  </div>
                </Link>

                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === topic.id ? null : topic.id);
                    }}
                    className="p-2 rounded-xl bg-card/80 backdrop-blur border border-border hover:bg-muted text-muted-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    id={`topic-menu-btn-${topic.id}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>

                  <AnimatePresence>
                    {openMenuId === topic.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        className="absolute right-0 mt-1 w-40 bg-card border border-border rounded-4xl shadow-xl overflow-hidden z-50"
                      >
                        <button
                          onClick={(e) => { e.preventDefault(); openEditModal(topic); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                          Sửa chủ đề
                        </button>
                        <button
                          onClick={(e) => { e.preventDefault(); openDeleteModal(topic); }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                          Xoá chủ đề
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>

          {visibleCount < filteredTopics.length && (
            <div ref={loadMoreRef} className="py-10 flex items-center justify-center text-sm text-muted-foreground">
              Đang tải thêm từ vựng...
            </div>
          )}
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
