'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  PlayCircle, 
  Clock, 
  BookOpen, 
  Search, 
  Plus, 
  MoreVertical, 
  Pencil, 
  Trash2, 
  Star, 
  Lock,
  Unlock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddCourseModal } from '@/components/course/AddCourseModal';
import { EditCourseModal } from '@/components/course/EditCourseModal';
import { AccessCodeModal } from '@/components/course/AccessCodeModal';
import { createCourseAction, updateCourseAction, deleteCourseAction } from '@/actions/course.action';
import { CourseLevel } from '@prisma/client';
import { useUser } from '@clerk/nextjs';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Pagination from '@/components/Pagination';
import SortMenuButton from '@/components/SortMenuButton';
import { useCoursesUiStore, type CourseSortKey } from '@/stores/useCoursesUiStore';
import { toast } from 'react-hot-toast';
import { defaultCourseDraft, defaultLessonDraft, useCoursesPageStore } from '@/stores/useCoursesPageStore';

const PAGE_SIZE = 6;

interface CoursesClientProps {
  initialCourses: any[];
  userAccessCourseIds?: string[];
  isAdmin?: boolean;
}

export default function CoursesClient({ initialCourses, userAccessCourseIds = [], isAdmin = false }: CoursesClientProps) {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>(initialCourses);
  const [accessCourseIds, setAccessCourseIds] = useState<string[]>(userAccessCourseIds);
  const [accessModalCourse, setAccessModalCourse] = useState<any | null>(null);
  const [selectedTag, setSelectedTag] = useState<string>('Tất cả');
  const searchQuery = useCoursesUiStore((state) => state.searchQuery);
  const currentPage = useCoursesUiStore((state) => state.currentPage);
  const sortKey = useCoursesUiStore((state) => state.sortKey);
  const setSearchQuery = useCoursesUiStore((state) => state.setSearchQuery);
  const setCurrentPage = useCoursesUiStore((state) => state.setCurrentPage);
  const setSortKey = useCoursesUiStore((state) => state.setSortKey);
  
  const {
    showAddModal,
    newCourse,
    newLessons,
    showEditModal,
    editingCourse,
    editForm,
    isSaving,
    showDeleteModal,
    deletingCourse,
    isDeleting,
    openMenuId,
    showSortMenu,
    setShowAddModal,
    setNewCourse,
    setNewLessons,
    setShowEditModal,
    setEditingCourse,
    setEditForm,
    setIsSaving,
    setShowDeleteModal,
    setDeletingCourse,
    setIsDeleting,
    setOpenMenuId,
    setShowSortMenu,
    reset: resetCoursePageState,
  } = useCoursesPageStore();

  const menuRef = useRef<HTMLDivElement>(null);
  const sortMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
      if (sortMenuRef.current && !sortMenuRef.current.contains(e.target as Node)) {
        setShowSortMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => () => {
    resetCoursePageState();
  }, [resetCoursePageState]);

  // Handlers for Add/Edit/Delete
  const handleSaveCourse = async () => {
    if (!newCourse.title.trim()) return;
    const filteredLessons = newLessons
      .filter((l) => l.title.trim() !== '')
      .map((l) => ({
        title: l.title,
        duration: l.duration || '10:00',
        videoUrl: l.videoUrl || defaultLessonDraft.videoUrl,
        description: l.description || '',
      }));

    const res = await createCourseAction({
      title: newCourse.title,
      description: newCourse.description,
      thumbnail: newCourse.thumbnail,
      level: newCourse.level,
      accessCode: newCourse.accessCode || undefined,
      lessons: filteredLessons,
    });

    if (res.success && res.course) {
      setCourses((prev) => [res.course, ...prev]);
      setShowAddModal(false);
      setNewCourse(defaultCourseDraft);
      setNewLessons([{ ...defaultLessonDraft }]);
      toast.success('Tạo khóa học mới thành công!');
    } else {
      toast.error('Không thể lưu khoá học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      level: course.level,
      accessCode: course.accessCode || '',
    });
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  const handleEditCourse = async () => {
    if (!editingCourse || !editForm.title.trim()) return;
    setIsSaving(true);
    const res = await updateCourseAction(editingCourse.id, {
      title: editForm.title,
      description: editForm.description,
      thumbnail: editForm.thumbnail,
      level: editForm.level as CourseLevel,
      accessCode: editForm.accessCode || undefined,
    });
    setIsSaving(false);

    if (res.success && res.course) {
      setCourses((prev) =>
        prev.map((c) => (c.id === editingCourse.id ? { ...c, ...res.course } : c))
      );
      setShowEditModal(false);
      setEditingCourse(null);
      toast.success('Cập nhật khóa học thành công!');
    } else {
      toast.error('Không thể cập nhật khoá học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const openDeleteModal = (course: any) => {
    setDeletingCourse(course);
    setOpenMenuId(null);
    setShowDeleteModal(true);
  };

  const handleDeleteCourse = async () => {
    if (!deletingCourse) return;
    setIsDeleting(true);
    const res = await deleteCourseAction(deletingCourse.id);
    setIsDeleting(false);

    if (res.success) {
      setCourses((prev) => prev.filter((c) => c.id !== deletingCourse.id));
      setShowDeleteModal(false);
      setDeletingCourse(null);
      toast.success('Xóa khóa học thành công!');
    } else {
      toast.error('Không thể xoá khoá học: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  // Tag filter options
  const filterTags = ['Tất cả', 'IELTS', 'Tiếng Anh Đi Làm', 'Giao Tiếp', 'Ngữ Pháp'];

  // Level mapping for sorting
  const LEVEL_ORDER: Record<string, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

  // Filter & Sort logic
  const filteredCourses = courses
    .filter((c) => {
      // Search matching title or description
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            c.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      // Tag subject matching
      if (selectedTag === 'Tất cả') return true;
      
      const subject = c.subject || '';
      return subject.toLowerCase() === selectedTag.toLowerCase();
    })
    .sort((a, b) => {
      switch (sortKey) {
        case 'newest': return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
        case 'oldest': return new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime();
        case 'az': return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
        case 'za': return b.title.localeCompare(a.title, undefined, { numeric: true, sensitivity: 'base' });
        case 'level': return (LEVEL_ORDER[a.level] ?? 0) - (LEVEL_ORDER[b.level] ?? 0);
        case 'lessons': return (b.lessons?.length ?? 0) - (a.lessons?.length ?? 0);
        default: return 0;
      }
    });

  const totalPages = Math.ceil(filteredCourses.length / PAGE_SIZE);
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, setCurrentPage, totalPages]);

  const paginatedCourses = filteredCourses.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })
      .format(value)
      .replace('₫', 'đ');
  };

  return (
    <div className="w-full text-center select-none">
      {/* ── HEADER ── */}
      <div className="space-y-2 max-w-3xl mx-auto mb-8">
        <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-3.5 py-1 rounded-full border border-brand/20">
          Chương Trình Trực Tuyến
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          Khám Phá <span className="text-brand">Các Khóa Học</span>
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed max-w-2xl mx-auto">
          Nâng tầm kỹ năng ngoại ngữ của bạn với các khóa học chất lượng cao, thiết kế bài bản từ cơ bản đến nâng cao theo chuẩn CEFR quốc tế.
        </p>
      </div>

      {/* ── FILTER TAGS & CONTROLS ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-border/40 pb-6">
        {/* Filter tags row */}
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag);
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer border",
                selectedTag === tag
                  ? "bg-primary text-primary-foreground border-primary shadow-md shadow-black/10"
                  : "bg-muted/60 text-muted-foreground border-border/60 hover:bg-muted hover:text-foreground"
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Right side controls (Search & Add Course) */}
        <div className="flex items-center justify-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-brand transition-colors" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-10 pr-5 py-2 w-56 sm:w-64 bg-muted/60 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-xs text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-md shadow-black/10 cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" />
              Thêm Khóa Học
            </button>
          )}
        </div>
      </div>

      {/* ── COURSE GRID ── */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 bg-card border border-border/80 rounded-3xl text-muted-foreground text-xs sm:text-sm">
          Chưa có khoá học nào được tìm thấy.
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch text-left" ref={menuRef}>
          {paginatedCourses.map((course, i) => {
            const hasOriginalPrice = course.originalPrice && course.originalPrice > course.price;
            const isFree = !course.accessCode || (course.price ?? 0) === 0;
            const isAccessible = isFree || accessCourseIds.includes(course.id);
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="group relative flex flex-col bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xs hover:border-brand/40 hover:shadow-xl transition-all duration-300"
              >
                {/* Image Section */}
                <div className="aspect-video relative overflow-hidden bg-muted shrink-0">
                  <Link href={`/courses/${course.id}`}>
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 cursor-pointer"
                    />
                  </Link>
                  
                  {/* Rating Badge */}
                  {course.rating && (
                    <div className="absolute top-3 right-3 bg-card/95 border border-border/50 px-2 py-0.5 rounded-md text-[10px] font-bold text-foreground shadow-sm flex items-center gap-1 backdrop-blur-xs">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{course.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Best Seller Badge */}
                  {course.isBestSeller && (
                    <div className="absolute top-3 left-3 bg-brand text-brand-foreground px-2.5 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase shadow-xs">
                      Nổi Bật
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    {/* Category tags */}
                    <div className="flex flex-wrap gap-1.5">
                      <span className={cn(
                        "px-2 py-0.5 rounded-md text-[9px] font-black tracking-wider uppercase",
                        course.level === 'Beginner' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
                        course.level === 'Intermediate' && "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
                        course.level === 'Advanced' && "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      )}>
                        {course.level}
                      </span>
                      {course.subject && (
                        <span className="px-2 py-0.5 bg-muted text-muted-foreground rounded-md text-[9px] font-bold tracking-wider uppercase border border-border/40">
                          {course.subject}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-foreground group-hover:text-brand transition-colors line-clamp-1 pr-6">
                      <Link href={`/courses/${course.id}`} className="hover:text-brand transition-colors">
                        {course.title}
                      </Link>
                    </h3>
                    
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2">
                      {course.description.replace(/[#*`]/g, '')}
                    </p>

                    {/* Meta info */}
                    <div className="flex items-center gap-3 text-[10px] font-bold text-muted-foreground tracking-wide pt-2.5 border-t border-border/40">
                      <div className="flex items-center gap-1">
                        <PlayCircle className="h-3.5 w-3.5 text-brand" />
                        <span>{course.lessons?.length || 0} bài giảng</span>
                      </div>
                      {course.weeks && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-brand" />
                          <span>{course.weeks} tuần</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing and Action row */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/40 gap-3">
                    <div className="flex flex-col">
                      {hasOriginalPrice && (
                        <span className="text-[10px] text-muted-foreground line-through font-medium leading-none mb-0.5">
                          {formatPrice(course.originalPrice as number)}
                        </span>
                      )}
                      <span className="text-base font-black text-brand leading-none">
                        {course.price > 0 ? formatPrice(course.price) : 'Miễn Phí'}
                      </span>
                    </div>

                    {isAccessible ? (
                      <Link
                        href={`/my-courses/${course.id}`}
                        className="flex items-center gap-1 px-4 py-2 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all cursor-pointer text-center shadow-md shadow-black/10"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                        Vào học
                      </Link>
                    ) : (
                      <button
                        onClick={() => setAccessModalCourse(course)}
                        className="flex items-center gap-1 px-4 py-2 text-xs font-bold border border-border bg-background hover:bg-muted text-foreground rounded-xl transition-all cursor-pointer text-center"
                      >
                        <Lock className="h-3.5 w-3.5" />
                        Kích hoạt
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit / Delete context menu for administrators */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === course.id ? null : course.id);
                      }}
                      className="p-1 rounded-md bg-card/90 backdrop-blur border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs cursor-pointer"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </button>

                    <AnimatePresence>
                      {openMenuId === course.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -4 }}
                          className="absolute right-0 mt-1 w-40 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50 text-xs"
                        >
                          <button
                            onClick={(e) => { e.preventDefault(); openEditModal(course); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5 text-primary" />
                            Sửa khóa học
                          </button>
                          <button
                            onClick={(e) => { e.preventDefault(); openDeleteModal(course); }}
                            className="w-full flex items-center gap-2 px-3 py-2 text-left font-semibold text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Xóa khóa học
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredCourses.length}
        pageSize={PAGE_SIZE}
        onPageChange={setCurrentPage}
      />

      {/* Add Course Modal */}
      <AddCourseModal
        show={showAddModal}
        newCourse={newCourse}
        newLessons={newLessons}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveCourse}
        onCourseChange={(field, value) => setNewCourse({ ...newCourse, [field]: value })}
        onAddLesson={() => setNewLessons([...newLessons, { ...defaultLessonDraft }])}
        onRemoveLesson={(idx) => setNewLessons(newLessons.length > 1 ? newLessons.filter((_, i) => i !== idx) : [{ ...defaultLessonDraft }])}
        onUpdateLesson={(idx, field, value) => {
          const updated = [...newLessons];
          updated[idx] = { ...updated[idx], [field]: value };
          setNewLessons(updated);
        }}
      />

      {/* Edit Course Modal */}
      <EditCourseModal
        show={showEditModal}
        form={editForm}
        isSaving={isSaving}
        onClose={() => { setShowEditModal(false); setEditingCourse(null); }}
        onSave={handleEditCourse}
        onChange={(field, value) => setEditForm({ ...editForm, [field]: value })}
      />

      {/* Delete Confirm Modal */}
      <ConfirmDeleteModal
        show={showDeleteModal}
        title={`Xoá khoá học "${deletingCourse?.title}"?`}
        description="Tất cả bài học trong khoá này cũng sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác."
        isLoading={isDeleting}
        onConfirm={handleDeleteCourse}
        onCancel={() => { setShowDeleteModal(false); setDeletingCourse(null); }}
      />

      {/* Access Code Modal */}
      {accessModalCourse && (
        <AccessCodeModal
          show={!!accessModalCourse}
          course={accessModalCourse}
          onClose={() => setAccessModalCourse(null)}
          onSuccess={(courseId) => {
            setAccessCourseIds((prev) => [...prev, courseId]);
            setAccessModalCourse(null);
            router.push(`/my-courses/${courseId}`);
          }}
        />
      )}
    </div>
  );
}
