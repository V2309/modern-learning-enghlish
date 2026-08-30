'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Plus, BookOpen, Trash2 } from 'lucide-react';
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
    setFlashcardIndex,
    setCurrentQuizIndex,
    setDictationIndex,
    setTranslateIndex,
  } = useTopicDetailStore();

  // Sync server data to Zustand store and reset progress indices when topic changes
  useEffect(() => {
    setWords(initialWords);
    setMasteredIds(initialMasteredWordIds);
    setFlashcardIndex(0);
    setCurrentQuizIndex(0);
    setDictationIndex(0);
    setTranslateIndex(0);
  }, [topic.id, initialWords, initialMasteredWordIds, setWords, setMasteredIds, setFlashcardIndex, setCurrentQuizIndex, setDictationIndex, setTranslateIndex]);

  // Determine active mode dynamically based on pathname
  let activeMode: 'list' | 'flashcards' | 'quiz' | 'match' | 'dictation' | 'translate' | 'sentence-practice' = 'list';
  if (pathname.includes('/flashcards')) activeMode = 'flashcards';
  else if (pathname.includes('/quiz')) activeMode = 'quiz';
  else if (pathname.includes('/match')) activeMode = 'match';
  else if (pathname.includes('/dictation')) activeMode = 'dictation';
  else if (pathname.includes('/translate')) activeMode = 'translate';
  else if (pathname.includes('/sentence-practice')) activeMode = 'sentence-practice';

  const isPracticeMode = activeMode !== 'list';

  // Hide the global browser scrollbar when inside topic practice modes
  useEffect(() => {
    if (isPracticeMode) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isPracticeMode]);

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
    <div className={cn(
      'w-full relative flex',
      isPracticeMode ? 'h-[calc(100vh-64px)] overflow-hidden' : 'min-h-[calc(100vh-64px)]'
    )}>
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
        'transition-all duration-300 flex-1 w-full flex flex-col',
        isDesktopSidebarOpen ? 'lg:pl-72' : 'lg:pl-0',
        isPracticeMode ? 'h-[calc(100vh-64px)] overflow-hidden' : 'min-h-[calc(100vh-64px)]'
      )}>
        {/* Inner centered page container */}
        <div className={cn(
          'w-full max-w-[1650px] mx-auto px-3 sm:px-6 py-3 flex-1 flex flex-col',
          isPracticeMode ? 'h-full overflow-hidden' : ''
        )}>
          {/* Page Header */}
          <div className="flex items-center justify-between gap-3 mb-3 pb-3 border-b border-border/60 shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-lg font-bold text-foreground tracking-tight truncate">{topic.name}</h1>
              <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 whitespace-nowrap">
                {words.length} từ
              </span>
              <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 whitespace-nowrap">
                {masteredIds.length} đã thuộc
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card text-foreground rounded-full text-xs font-medium hover:bg-muted transition-all"
              >
                <Menu className="h-3.5 w-3.5 text-primary" />
                <span>Menu</span>
              </button>
              {/* Desktop sidebar toggle */}
              <button
                onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 border border-border bg-card text-foreground rounded-full text-xs font-medium hover:bg-muted transition-all"
              >
                <Menu className="h-3.5 w-3.5 text-primary" />
                <span>{isDesktopSidebarOpen ? 'Ẩn menu' : 'Hiện menu'}</span>
              </button>
            </div>
          </div>

          {/* Children Viewport */}
          <div className={cn(
            'flex-1 w-full',
            isPracticeMode ? 'h-full overflow-y-auto no-scrollbar' : 'h-full'
          )}>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditWordModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg max-h-[90vh] bg-card border border-border/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between bg-muted/20 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-foreground tracking-tight">Sửa từ vựng</h2>
                    <p className="text-xs text-muted-foreground">
                      Chỉnh sửa thông tin từ <span className="font-semibold text-foreground">&quot;{editingWord.word}&quot;</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditWordModal(false)}
                  className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                  title="Đóng"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-5 space-y-4 overflow-y-auto flex-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Từ tiếng Anh (Word) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editWordForm.word}
                    onChange={(e) => setEditWordForm((p) => ({ ...p, word: e.target.value }))}
                    className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Nghĩa tiếng Việt <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={editWordForm.meaning}
                      onChange={(e) => setEditWordForm((p) => ({ ...p, meaning: e.target.value }))}
                      className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Loại từ (Part of Speech)
                    </label>
                    <div className="relative">
                      <select
                        value={editWordForm.partOfSpeech}
                        onChange={(e) => setEditWordForm((p) => ({ ...p, partOfSpeech: e.target.value as PartOfSpeech }))}
                        className="w-full bg-muted/40 border border-border rounded-xl px-3.5 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer pr-9"
                      >
                        <option value="Noun">Noun (Danh từ)</option>
                        <option value="Verb">Verb (Động từ)</option>
                        <option value="Adjective">Adjective (Tính từ)</option>
                        <option value="Adverb">Adverb (Trạng từ)</option>
                        <option value="Phrase">Phrase (Cụm từ)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-border/60">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <span>Ví dụ câu mẫu</span>
                      <span className="text-[11px] text-muted-foreground font-normal">({editWordExamples.length})</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setEditWordExamples((p) => [...p, ''])}
                      className="flex items-center gap-1 px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all rounded-lg font-bold text-xs cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      Thêm ví dụ
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editWordExamples.map((ex, idx) => (
                      <div key={idx} className="flex gap-2 items-center">
                        <span className="text-[11px] font-bold text-muted-foreground px-2 py-1 rounded-md bg-muted/60 shrink-0 select-none">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={ex}
                          onChange={(e) => setEditWordExamples((p) => { const u = [...p]; u[idx] = e.target.value; return u; })}
                          className="flex-1 bg-muted/40 border border-border rounded-xl px-3 py-2 text-xs sm:text-sm text-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        {editWordExamples.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setEditWordExamples((p) => p.filter((_, i) => i !== idx))}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors shrink-0 cursor-pointer"
                            title="Xóa ví dụ"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3.5 bg-muted/20 border-t border-border/70 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowEditWordModal(false)}
                  className="px-4 py-2 rounded-xl border border-border hover:bg-muted text-xs font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleEditWord}
                  disabled={!editWordForm.word.trim() || !editWordForm.meaning.trim() || isSavingWord}
                  className="px-5 py-2 bg-primary disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold hover:bg-primary/95 transition-all flex items-center gap-1.5 shadow-sm shadow-primary/20 cursor-pointer"
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
