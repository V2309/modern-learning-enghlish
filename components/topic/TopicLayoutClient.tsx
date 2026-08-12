'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Plus } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { TopicSidebar, sidebarItems } from '@/components/topic/TopicSidebar';
import { AddWordModal } from '@/components/topic/AddWordModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';
import { createVocabularyAction, updateVocabularyAction, deleteVocabularyAction } from '@/actions/vocabulary.action';
import { PartOfSpeech } from '@prisma/client';
import { toast } from 'react-hot-toast';

interface TopicLayoutClientProps {
  topic: any;
  userId: string;
  initialWords: any[];
  initialMasteredWordIds: string[];
  children: React.ReactNode;
  isAdmin?: boolean;
}

export default function TopicLayoutClient({
  topic,
  userId,
  initialWords,
  initialMasteredWordIds,
  children,
  isAdmin = false,
}: TopicLayoutClientProps) {
  const pathname = usePathname();

  const {
    words,
    masteredIds,
    isDesktopSidebarOpen,
    isMobileSidebarOpen,
    showAddWordModal,
    newWord,
    newWordExamples,
    showEditWordModal,
    editingWord,
    editWordForm,
    editWordExamples,
    isSavingWord,
    showDeleteWordModal,
    deletingWord,
    isDeletingWord,
    setIsDesktopSidebarOpen,
    setIsMobileSidebarOpen,
    setShowAddWordModal,
    setNewWord,
    setNewWordExamples,
    setShowEditWordModal,
    setEditingWord,
    setEditWordForm,
    setEditWordExamples,
    setIsSavingWord,
    setShowDeleteWordModal,
    setDeletingWord,
    setIsDeletingWord,
    setWords,
    setMasteredIds,
  } = useTopicDetailStore();

  // Sync server data to Zustand store
  useEffect(() => {
    setWords(initialWords);
    setMasteredIds(initialMasteredWordIds);
  }, [initialWords, initialMasteredWordIds, setWords, setMasteredIds]);

  // Determine active mode dynamically based on pathname
  let activeMode: 'list' | 'flashcards' | 'quiz' | 'match' | 'dictation' | 'translate' | 'sentence-practice' = 'list';
  if (pathname.includes('/flashcards')) activeMode = 'flashcards';
  else if (pathname.includes('/quiz')) activeMode = 'quiz';
  else if (pathname.includes('/match')) activeMode = 'match';
  else if (pathname.includes('/dictation')) activeMode = 'dictation';
  else if (pathname.includes('/translate')) activeMode = 'translate';
  else if (pathname.includes('/sentence-practice')) activeMode = 'sentence-practice';

  const handleAddWord = async () => {
    if (!newWord.word.trim() || !newWord.meaning.trim()) return;

    const filteredExamples = newWordExamples.filter((ex) => ex.trim() !== '');

    const res = await createVocabularyAction({
      topicId: topic.id,
      word: newWord.word,
      meaning: newWord.meaning,
      definition: newWord.definition || undefined,
      example: filteredExamples[0] || '',
      examples: filteredExamples,
      category: topic.name,
      partOfSpeech: newWord.partOfSpeech,
      createdByUserId: userId,
    });

    if (res.success && res.vocabulary) {
      setWords([...words, res.vocabulary]);
      setShowAddWordModal(false);
      setNewWord({ word: '', meaning: '', definition: '', example: '', partOfSpeech: 'Noun' });
      setNewWordExamples(['']);
      toast.success('Thêm từ vựng mới thành công!');
    } else {
      toast.error('Không thể lưu từ vựng: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const handleEditWord = async () => {
    if (!editingWord || !editWordForm.word.trim() || !editWordForm.meaning.trim()) return;
    setIsSavingWord(true);
    const filteredExamples = editWordExamples.filter((ex) => ex.trim() !== '');
    const res = await updateVocabularyAction(editingWord.id, topic.id, {
      word: editWordForm.word,
      meaning: editWordForm.meaning,
      example: filteredExamples[0] || '',
      examples: filteredExamples,
      partOfSpeech: editWordForm.partOfSpeech,
    });
    setIsSavingWord(false);

    if (res.success && res.vocabulary) {
      setWords(
        words.map((w: any) => (w.id === editingWord.id ? { ...w, ...res.vocabulary } : w))
      );
      setShowEditWordModal(false);
      setEditingWord(null);
      toast.success('Cập nhật từ vựng thành công!');
    } else {
      toast.error('Không thể cập nhật từ vựng: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const handleDeleteWord = async () => {
    if (!deletingWord) return;
    setIsDeletingWord(true);
    const res = await deleteVocabularyAction(deletingWord.id, topic.id);
    setIsDeletingWord(false);

    if (res.success) {
      setWords(words.filter((w: any) => w.id !== deletingWord.id));
      setShowDeleteWordModal(false);
      setDeletingWord(null);
      toast.success('Xóa từ vựng thành công!');
    } else {
      toast.error('Không thể xoá từ vựng: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const currentModeLabel = sidebarItems.find((i) => i.mode === activeMode)?.label
    .replace('Từ vựng: ', '')
    .replace('Luyện tập: ', '') || 'Danh sách từ';

  return (
    <div className="w-full relative min-h-[calc(100vh-64px)] flex">
      {/* Desktop Sidebar */}
      {isDesktopSidebarOpen && (
        <TopicSidebar
          topic={topic}
          wordCount={words.length}
          isFixed
          onOpenAddWord={() => setShowAddWordModal(true)}
          isAdmin={isAdmin}
        />
      )}

      {/* Main Right Area: Content & Header */}
      <div className={cn(
        'transition-all duration-300 flex-1 w-full min-h-[calc(100vh-64px)] flex flex-col',
        isDesktopSidebarOpen ? 'lg:pl-72' : 'lg:pl-0'
      )}>
        {/* Inner centered page container */}
        <div className="container mx-auto px-4 py-12 flex-1 flex flex-col">
          {/* Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60 shrink-0">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black text-foreground tracking-tight">{topic.name}</h1>
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
                  {words.length} từ vựng
                </span>
                <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  {masteredIds.length} đã thuộc
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border bg-card text-foreground rounded-4xl text-xs font-bold hover:bg-muted transition-all"
              >
                <Menu className="h-4 w-4 text-primary" />
                <span>Chế độ học ({currentModeLabel})</span>
              </button>
              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                className="hidden lg:flex items-center gap-2 px-4 py-2.5 border border-border bg-card text-foreground rounded-4xl text-xs font-bold hover:bg-muted transition-all"
              >
                <Menu className="h-4 w-4 text-primary" />
                <span>{isDesktopSidebarOpen ? 'Ẩn menu' : 'Hiện menu'}</span>
              </button>
            </div>
          </div>

          {/* Children Viewport */}
          <div className="flex-1 w-full">
            {children}
          </div>
        </div>
      </div>

      {/* Add Word Modal */}
      <AddWordModal
        show={showAddWordModal}
        topicName={topic.name}
        newWord={newWord}
        newWordExamples={newWordExamples}
        onClose={() => setShowAddWordModal(false)}
        onSave={handleAddWord}
        onWordChange={(field, value) => setNewWord((prev) => ({ ...prev, [field]: value }))}
        onAddExample={() => setNewWordExamples((prev) => [...prev, ''])}
        onRemoveExample={(idx) => setNewWordExamples((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : [''])}
        onUpdateExample={(idx, value) => setNewWordExamples((prev) => { const u = [...prev]; u[idx] = value; return u; })}
      />

      {/* Edit Word Modal */}
      <AnimatePresence>
        {showEditWordModal && editingWord && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditWordModal(false)}
              className="absolute inset-0 bg-background/90 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-xl max-h-[85vh] bg-card border border-border rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="p-8 border-b border-border flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Sửa từ vựng</h2>
                  <p className="text-muted-foreground text-sm">Cập nhật thông tin của từ <strong>{editingWord.word}</strong>.</p>
                </div>
                <button onClick={() => setShowEditWordModal(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground">
                  <X />
                </button>
              </div>

              <div className="p-8 space-y-6 overflow-y-auto flex-1">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">English Word</label>
                  <input
                    type="text"
                    value={editWordForm.word}
                    onChange={(e) => setEditWordForm((p) => ({ ...p, word: e.target.value }))}
                    className="w-full bg-muted border border-border rounded-4xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Meaning (VN)</label>
                    <input
                      type="text"
                      value={editWordForm.meaning}
                      onChange={(e) => setEditWordForm((p) => ({ ...p, meaning: e.target.value }))}
                      className="w-full bg-muted border border-border rounded-4xl px-5 py-3 text-foreground focus:outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Part of Speech</label>
                    <select
                      value={editWordForm.partOfSpeech}
                      onChange={(e) => setEditWordForm((p) => ({ ...p, partOfSpeech: e.target.value as PartOfSpeech }))}
                      className="w-full bg-muted border border-border rounded-4xl px-5 py-2.75 text-foreground focus:outline-none focus:border-primary transition-all appearance-none"
                    >
                      <option value="Noun">Noun</option>
                      <option value="Verb">Verb</option>
                      <option value="Adjective">Adjective</option>
                      <option value="Adverb">Adverb</option>
                      <option value="Phrase">Phrase</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-muted-foreground uppercase tracking-widest pl-1">Ví dụ</label>
                    <button
                      type="button"
                      onClick={() => setEditWordExamples((p) => [...p, ''])}
                      className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all rounded-xl font-bold text-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Thêm ví dụ
                    </button>
                  </div>
                  {editWordExamples.map((ex, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <span className="text-xs font-bold text-muted-foreground w-12 text-center select-none">Ví dụ {idx + 1}</span>
                      <input
                        type="text"
                        value={ex}
                        onChange={(e) => setEditWordExamples((p) => { const u = [...p]; u[idx] = e.target.value; return u; })}
                        className="flex-1 bg-muted border border-border rounded-4xl px-4 py-2 text-sm text-foreground focus:outline-none focus:border-primary transition-all"
                      />
                      {editWordExamples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setEditWordExamples((p) => p.filter((_, i) => i !== idx))}
                          className="p-1.5 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-8 bg-muted/50 border-t border-border shrink-0">
                <button
                  onClick={handleEditWord}
                  disabled={!editWordForm.word || !editWordForm.meaning || isSavingWord}
                  className="w-full py-4 bg-primary disabled:opacity-50 disabled:grayscale text-white rounded-4xl font-bold hover:bg-primary/95 transition-all flex items-center justify-center gap-2"
                >
                  {isSavingWord ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Word Confirm Modal */}
      <ConfirmDeleteModal
        show={showDeleteWordModal}
        title={`Xoá từ "${deletingWord?.word}"?`}
        description="Từ vựng này sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác."
        isLoading={isDeletingWord}
        onConfirm={handleDeleteWord}
        onCancel={() => {
          setShowDeleteWordModal(false);
          setDeletingWord(null);
        }}
      />

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-start lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-card border-r border-border p-6 shadow-2xl overflow-y-auto z-10 flex flex-col space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-base font-black text-foreground">Menu Chế Độ Luyện Tập</span>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 bg-muted hover:bg-accent text-foreground rounded-4xl">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1">
                <TopicSidebar
                  topic={topic}
                  wordCount={words.length}
                  isMobileView
                  onOpenAddWord={() => setShowAddWordModal(true)}
                  onClose={() => setIsMobileSidebarOpen(false)}
                  isAdmin={isAdmin}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
