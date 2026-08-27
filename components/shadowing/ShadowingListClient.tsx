'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Play,
  PlayCircle,
  Clock,
  BookOpen,
  Search,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Check,
  Video,
  Sparkles,
  ArrowRight,
  X,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddShadowingModal } from '@/components/shadowing/AddShadowingModal';
import { EditShadowingModal } from '@/components/shadowing/EditShadowingModal';
import {
  createShadowingVideoAction,
  updateShadowingVideoAction,
  deleteShadowingVideoAction,
} from '@/actions/shadowing.action';
import { parseYouTubeUrl } from '@/components/course/AddLessonModal';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Pagination from '@/components/Pagination';
import SortMenuButton from '@/components/SortMenuButton';
import { toast } from 'react-hot-toast';

const PAGE_SIZE = 9;

interface ShadowingListClientProps {
  initialShadowings: any[];
  userId: string;
  isAdmin?: boolean;
  completedVideoIds?: string[];
}

export type ShadowingSortKey = 'newest' | 'oldest' | 'az' | 'za';

export default function ShadowingListClient({
  initialShadowings,
  userId,
  isAdmin = false,
  completedVideoIds = [],
}: ShadowingListClientProps) {
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
      createdByUserId: userId,
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
    <div className=" px-4 py-8 space-y-8">
      {/* ── Header: Asymmetric Hero / Action Row ── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-border/70">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider border border-primary/20">
              Luyện phát âm &amp; Ngữ điệu
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
              <span>{shadowings.length} bài học</span>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {completedVideoIds.length} đã xong
              </span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Luyện nói Shadowing
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Luyện phản xạ, phát âm chuẩn Mỹ và ngữ điệu tự nhiên qua video thực tế kèm phụ đề song ngữ đồng bộ theo từng giây.
          </p>
        </div>

        {/* Search, Sort & Action Controls */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Tìm bài học..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9.5 pr-8 py-2 w-56 sm:w-64 bg-card border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-xs font-medium text-foreground placeholder:text-muted-foreground/70 shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/95 transition-all shadow-sm shadow-primary/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm video mới</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Video Grid (3 Columns) ── */}
      {paginated.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((shadowing) => {
            const yt = parseYouTubeUrl(shadowing.videoUrl);
            const isCompleted = completedVideoIds.includes(shadowing.id);
            const isMenuOpen = openMenuId === shadowing.id;

            return (
              <motion.div
                key={shadowing.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="group relative flex flex-col bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs hover:shadow-lg hover:border-primary/40 transition-all duration-300"
              >
                {/* ── Video Thumbnail with Overlay ── */}
                <Link
                  href={`/shadowing/${shadowing.id}`}
                  className="aspect-video relative overflow-hidden bg-zinc-950 block shrink-0 cursor-pointer"
                >
                  {yt ? (
                    <img
                      src={`https://img.youtube.com/vi/${yt.videoId}/hqdefault.jpg`}
                      alt={shadowing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-indigo-500/10 flex items-center justify-center">
                      <Video className="h-10 w-10 text-primary/40" />
                    </div>
                  )}

                  {/* Gradient Scrim */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-black/30 group-hover:from-black/60 transition-all duration-300" />

                  {/* Badges Top Row */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/95 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-1 border border-white/10">
                      {yt ? <Play className="h-3 w-3 text-rose-400 fill-rose-400" /> : <Video className="h-3 w-3 text-sky-400" />}
                      <span>{yt ? 'YouTube' : 'Video'}</span>
                    </span>

                    {isCompleted && (
                      <span className="text-[10px] font-bold text-white bg-emerald-500/90 backdrop-blur-md px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm border border-emerald-400/30">
                        <Check className="h-3 w-3" />
                        <span>Đã xong</span>
                      </span>
                    )}
                  </div>

                  {/* Center Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-110 group-hover:bg-primary transition-all duration-300">
                      <Play className="h-5 w-5 fill-white translate-x-0.5" />
                    </div>
                  </div>
                </Link>

                {/* ── Card Content ── */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/shadowing/${shadowing.id}`}
                        className="text-base font-bold text-foreground line-clamp-2 hover:text-primary transition-colors leading-snug group-hover:text-primary"
                        title={shadowing.title}
                      >
                        {shadowing.title}
                      </Link>

                      {/* Admin 3-Dots Menu */}
                      {isAdmin && (
                        <div className="relative shrink-0" ref={openMenuId === shadowing.id ? menuRef : null}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setOpenMenuId(isMenuOpen ? null : shadowing.id);
                            }}
                            className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                            title="Tùy chọn"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-xl shadow-xl z-20 overflow-hidden"
                              >
                                <div className="p-1 space-y-0.5">
                                  <button
                                    onClick={() => openEdit(shadowing)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                    Chỉnh sửa
                                  </button>
                                  <button
                                    onClick={() => openDelete(shadowing)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
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
                      <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                        {shadowing.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground/50 text-xs italic">Không có mô tả bổ sung.</p>
                    )}
                  </div>

                  {/* Card Bottom Meta & Action */}
                  <div className="pt-3 border-t border-border/70 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-muted-foreground">
                      {new Date(shadowing.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <Link
                      href={`/shadowing/${shadowing.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Luyện ngay</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-card border border-border/80 p-12 sm:p-16 rounded-2xl text-center space-y-3.5 max-w-md mx-auto">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mx-auto">
            <Video className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-foreground">Không tìm thấy bài luyện Shadowing</h3>
            <p className="text-xs text-muted-foreground">
              {searchQuery
                ? `Không có kết quả nào khớp với "${searchQuery}". Hãy thử từ khóa khác!`
                : 'Chưa có bài luyện nào. Nhấn "+ Thêm video mới" để bắt đầu!'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-bold text-primary hover:underline"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          )}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="pt-4 flex justify-center w-full">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={sorted.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* ── Add Modal ── */}
      <AddShadowingModal
        show={showAddModal}
        isSaving={isSaving}
        onClose={() => setShowAddModal(false)}
        onSave={handleCreateShadowing}
      />

      {/* ── Edit Modal ── */}
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

      {/* ── Delete Modal ── */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        title={`Xoá video "${deletingShadowing?.title}"?`}
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

