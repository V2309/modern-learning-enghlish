'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PlayCircle, Clock, BookOpen, Search, Plus, MoreVertical, Pencil, Trash2, ArrowUpDown, Check, Video, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddShadowingModal } from '@/components/shadowing/AddShadowingModal';
import { EditShadowingModal } from '@/components/shadowing/EditShadowingModal';
import { createShadowingVideoAction, updateShadowingVideoAction, deleteShadowingVideoAction } from '@/actions/shadowing.action';
import { parseYouTubeUrl } from '@/components/course/AddLessonModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Pagination from '@/components/Pagination';
import SortMenuButton from '@/components/SortMenuButton';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

const PAGE_SIZE = 6;

interface ShadowingListClientProps {
  initialShadowings: any[];
  userId: string;
}

export type ShadowingSortKey = 'newest' | 'oldest' | 'az' | 'za';

export default function ShadowingListClient({ initialShadowings, userId }: ShadowingListClientProps) {
  const { user } = useUser();
  const isAdmin = user?.id === 'user_3DRcDBsgk0yYQLjs2JkTgQHsr9v';
  const [shadowings, setShadowings] = useState<any[]>(initialShadowings);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<ShadowingSortKey>('newest');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingShadowing, setEditingShadowing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ title: '', videoUrl: '', description: '', transcript: '' });
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingShadowing, setDeletingShadowing] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menus on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Filter & Sort
  const filtered = shadowings.filter((s) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return s.title.toLowerCase().includes(query) || (s.description && s.description.toLowerCase().includes(query));
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sortKey === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortKey === 'oldest') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortKey === 'az') return a.title.localeCompare(b.title);
    if (sortKey === 'za') return b.title.localeCompare(a.title);
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Handlers
  const handleCreateShadowing = async (form: { title: string; videoUrl: string; description: string; transcript: string }) => {
    setIsSaving(true);
    const res = await createShadowingVideoAction({
      title: form.title,
      description: form.description,
      videoUrl: form.videoUrl,
      transcript: form.transcript,
      createdByUserId: userId
    });
    setIsSaving(false);

    if (res.success && res.shadowing) {
      setShadowings((prev) => [res.shadowing, ...prev]);
      setShowAddModal(false);
      toast.success('Thêm video shadowing thành công!');
    } else {
      toast.error('Không thể tạo video: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const openEdit = (s: any) => {
    setEditingShadowing(s);
    setEditForm({
      title: s.title,
      videoUrl: s.videoUrl,
      description: s.description || '',
      transcript: s.transcript || '',
    });
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  const handleEditShadowing = async () => {
    if (!editingShadowing) return;
    setIsSaving(true);
    const res = await updateShadowingVideoAction(editingShadowing.id, editForm);
    setIsSaving(false);

    if (res.success && res.shadowing) {
      setShadowings((prev) =>
        prev.map((c) => (c.id === editingShadowing.id ? { ...c, ...res.shadowing } : c))
      );
      setShowEditModal(false);
      setEditingShadowing(null);
      toast.success('Cập nhật video shadowing thành công!');
    } else {
      toast.error('Không thể lưu thay đổi: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const openDelete = (s: any) => {
    setDeletingShadowing(s);
    setOpenMenuId(null);
    setShowDeleteModal(true);
  };

  const handleDeleteShadowing = async () => {
    if (!deletingShadowing) return;
    setIsDeleting(true);
    const res = await deleteShadowingVideoAction(deletingShadowing.id);
    setIsDeleting(false);

    if (res.success) {
      setShadowings((prev) => prev.filter((c) => c.id !== deletingShadowing.id));
      setShowDeleteModal(false);
      setDeletingShadowing(null);
      toast.success('Xóa video shadowing thành công!');
    } else {
      toast.error('Không thể xoá video: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const SORT_OPTIONS: { key: ShadowingSortKey; label: string }[] = [
    { key: 'newest', label: 'Mới nhất' },
    { key: 'oldest', label: 'Cũ nhất' },
    { key: 'az', label: 'Tên A → Z' },
    { key: 'za', label: 'Tên Z → A' },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold text-foreground">Shadowing Videos</h1>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {shadowings.length} bài luyện
            </span>
          </div>
          <p className="text-muted-foreground text-lg">
            Luyện phát âm chuẩn Mỹ & tốc độ nói tiếng Anh thông qua phim ảnh, tin tức thực tế.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-all" />
            <input
              type="text"
              placeholder="Tìm bài học shadowing..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
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
              Thêm video mới
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {paginated.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {paginated.map((shadowing) => {
            const yt = parseYouTubeUrl(shadowing.videoUrl);
            const isCreatedByMe = shadowing.createdByUserId === userId;
            const isMenuOpen = openMenuId === shadowing.id;

            return (
              <motion.div
                key={shadowing.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group relative flex flex-col bg-card border border-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-primary/50 transition-all hover:bg-muted/50 duration-300"
              >
                {/* Image / Thumbnail Container */}
                <div className="aspect-video relative overflow-hidden bg-black shrink-0">
                  {yt ? (
                    <img
                      src={`https://img.youtube.com/vi/${yt.videoId}/hqdefault.jpg`}
                      alt={shadowing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-indigo-500/10 flex items-center justify-center">
                      <Video className="h-12 w-12 text-primary/40" />
                    </div>
                  )}

                  {/* Play badge */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <PlayCircle className="h-16 w-16 text-white drop-shadow-lg" />
                  </div>

                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-white bg-black/60 backdrop-blur-sm px-3 py-1 rounded-full">
                      {yt ? 'YouTube' : 'Direct Video'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={`/shadowing/${shadowing.id}`}
                        className="text-xl font-bold text-foreground line-clamp-2 hover:text-primary transition-colors underline decoration-transparent group-hover:decoration-primary/30 group-hover:underline-offset-4"
                      >
                        {shadowing.title}
                      </Link>

                      {/* Admin action button */}
                      {isAdmin && (
                        <div className="relative shrink-0" ref={openMenuId === shadowing.id ? menuRef : null}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : shadowing.id);
                            }}
                            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden"
                              >
                                <div className="p-1.5 space-y-1">
                                  <button
                                    onClick={() => openEdit(shadowing)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Chỉnh sửa
                                  </button>
                                  <button
                                    onClick={() => openDelete(shadowing)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Xoá video
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>

                    {shadowing.description ? (
                      <p className="text-muted-foreground text-xs leading-relaxed line-clamp-3">
                        {shadowing.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground/40 text-xs italic">Không có mô tả cho bài học này.</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border/60 text-[10px] font-bold text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5 text-primary" />
                      <span>{shadowing.createdByUser?.name || 'Học viên'}</span>
                    </div>
                    <span>{new Date(shadowing.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border/80 p-16 rounded-4xl text-center space-y-4">
          <div className="h-16 w-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto">
            <Video className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-bold text-foreground">Không tìm thấy bài luyện Shadowing</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Hãy thử tìm bằng từ khóa khác hoặc nhấp vào "Thêm video mới" để tạo bài luyện nói đầu tiên!
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-12 flex justify-center w-full">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sorted.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add Modal */}
      <AddShadowingModal
        show={showAddModal}
        isSaving={isSaving}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateShadowing}
      />

      {/* Edit Modal */}
      <EditShadowingModal
        show={showEditModal}
        form={editForm}
        isSaving={isSaving}
        onClose={() => {
          setShowEditModal(false);
          setEditingShadowing(null);
        }}
        onSave={handleEditShadowing}
        onChange={(field, val) => setEditForm((p) => ({ ...p, [field]: val }))}
      />

      {/* Delete Modal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        title={`Xoá video Shadowing "${deletingShadowing?.title}"?`}
        description="Dữ liệu và tiến trình bài shadowing này sẽ bị xoá vĩnh viễn khỏi hệ thống."
        isLoading={isDeleting}
        onConfirm={handleDeleteShadowing}
        onCancel={() => {
          setShowDeleteModal(false);
          setDeletingShadowing(null);
        }}
      />
    </div>
  );
}
