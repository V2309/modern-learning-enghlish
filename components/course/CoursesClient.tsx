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
import { defaultCourseDraft, defaultTopicDraft, defaultLessonDraft, useCoursesPageStore } from '@/stores/useCoursesPageStore';

const PAGE_SIZE = 8;

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
    newTopics,
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
    setNewTopics,
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
    const filteredTopics = (newTopics || [])
      .filter((t) => t.title.trim() !== '')
      .map((t) => ({
        title: t.title.trim(),
        description: t.description || '',
      }));

    const res = await createCourseAction({
      title: newCourse.title,
      description: newCourse.description,
      thumbnail: newCourse.thumbnail,
      level: newCourse.level,
      accessCode: newCourse.accessCode || undefined,
      topics: filteredTopics,
    });

    if (res.success && res.course) {
      setCourses((prev) => [res.course, ...prev]);
      setShowAddModal(false);
      setNewCourse(defaultCourseDraft);
      setNewTopics([{ ...defaultTopicDraft }]);
      toast.success('Tạo khóa học và các chủ đề mới thành công!');
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

  const SORT_OPTIONS: { key: CourseSortKey; label: string }[] = [
    { key: 'newest', label: 'Mới nhất' },
    { key: 'oldest', label: 'Cũ nhất' },
    { key: 'az', label: 'Tên A → Z' },
    { key: 'za', label: 'Tên Z → A' },
    { key: 'level', label: 'Cấp độ' },
    { key: 'lessons', label: 'Số bài giảng' },
  ];

  // Calculate telemetry KPI numbers
  const beginnerCount = courses.filter((c) => c.level === 'Beginner').length;
  const intermediateCount = courses.filter((c) => c.level === 'Intermediate').length;
  const advancedCount = courses.filter((c) => c.level === 'Advanced').length;
  const totalLessonsInAllCourses = courses.reduce((acc, c) => acc + (c.lessons?.length || 0), 0);

  return (
    <div className="w-full space-y-6 select-none">
      {/* ── 1. HEADER & KPI METRICS (Connected Bento Grid Style) ── */}
      <div className="space-y-4">
        {/* Editorial Section Header Card */}
        <div className="p-6 sm:p-7 border border-border bg-card flex flex-col md:flex-row md:items-end justify-between gap-5 relative overflow-hidden group rounded-none">
          {/* Light Sweep Sheen */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none z-20" />

          {/* Technical Crosshairs */}
          <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>

          <div className="space-y-1.5 relative z-10">
            <span className="text-[10px] uppercase tracking-[0.18em] text-brand font-bold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-brand animate-pulse" />
              01 · CHƯƠNG TRÌNH ĐÀO TẠO QUỐC TẾ
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight">
              Khám Phá <span className="text-brand">Các Khóa Học</span>
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-normal max-w-xl">
              Nâng tầm kỹ năng ngoại ngữ với các khóa học chất lượng cao, thiết kế bài bản theo khung CEFR quốc tế và phương pháp học tích cực.
            </p>
          </div>

          {/* Admin Create Course Button (Sharp rectangular button) */}
          {isAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-none border border-border bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs self-start md:self-auto relative z-10"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Thêm Khóa Học Mới</span>
            </button>
          )}
        </div>

        {/* Connected 3-Metric Hairline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-border border border-border overflow-hidden rounded-none">
          {/* Metric 1: Total Courses */}
          <div className="bg-card p-5 sm:p-6 relative overflow-hidden group hover:bg-muted/40 transition-colors rounded-none">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none z-20" />
            <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <div className="flex items-center justify-between text-muted-foreground mb-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-foreground">
                01 · TỔNG QUAN
              </span>
              <div className="p-1.5 bg-muted text-foreground border border-border">
                <BookOpen className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-0.5 relative z-10">
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {courses.length}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Khóa học trực tuyến được thiết kế</p>
            </div>
          </div>

          {/* Metric 2: Levels Breakdown */}
          <div className="bg-card p-5 sm:p-6 relative overflow-hidden group hover:bg-muted/40 transition-colors rounded-none">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none z-20" />
            <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <div className="flex items-center justify-between text-muted-foreground mb-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-foreground">
                02 · PHÂN HẠNG TRÌNH ĐỘ
              </span>
              <div className="p-1.5 bg-muted text-foreground border border-border">
                <Star className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="text-foreground">{beginnerCount} Cơ bản</span>
                <span className="text-muted-foreground">{intermediateCount} Trung cấp</span>
                <span className="text-brand">{advancedCount} Nâng cao</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Phù hợp từ người mới bắt đầu đến nâng cao</p>
            </div>
          </div>

          {/* Metric 3: Total Lessons */}
          <div className="bg-card p-5 sm:p-6 relative overflow-hidden group hover:bg-muted/40 transition-colors rounded-none">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none z-20" />
            <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
            <div className="flex items-center justify-between text-muted-foreground mb-3 relative z-10">
              <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-foreground">
                03 · QUY MÔ BÀI GIẢNG
              </span>
              <div className="p-1.5 bg-muted text-foreground border border-border">
                <PlayCircle className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>
            <div className="space-y-0.5 relative z-10">
              <div className="text-3xl font-extrabold text-foreground tracking-tight">
                {totalLessonsInAllCourses}
              </div>
              <p className="text-[11px] text-muted-foreground font-medium">Bài giảng tương tác tích hợp đa phương tiện</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. FILTER TABS, SEARCH & SORT BAR ── */}
      <div className="p-3 sm:p-4 border border-border bg-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 relative overflow-hidden rounded-none">
        {/* Segmented Filter Control */}
        <div className="flex flex-wrap items-center gap-1">
          {filterTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                setSelectedTag(tag);
                setCurrentPage(1);
              }}
              className={cn(
                'px-3.5 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer border rounded-none',
                selectedTag === tag
                  ? 'bg-primary text-primary-foreground border-border font-bold'
                  : 'bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground'
              )}
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Right Search + Sort Menu */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 pr-8 py-2 w-full sm:w-56 md:w-64 bg-muted/40 border border-border rounded-none focus:outline-none focus:border-brand text-foreground text-xs placeholder:text-muted-foreground transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <Trash2 className="h-3 w-3" />
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
            variant="sharp"
          />
        </div>
      </div>

      {/* ── 3. CONNECTED BENTO COURSE GRID ── */}
      {filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border text-center gap-4 relative overflow-hidden rounded-none">
          <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 font-bold">+</span>
          <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 font-bold">+</span>
          <div className="h-12 w-12 bg-brand/10 border border-brand/20 flex items-center justify-center text-2xl">
            🎓
          </div>
          <div className="space-y-1 max-w-sm">
            <p className="text-base font-bold text-foreground">Không tìm thấy khóa học nào</p>
            <p className="text-xs text-muted-foreground">
              {searchQuery ? `Không có kết quả phù hợp cho "${searchQuery}"` : 'Chưa có khóa học nào trong danh mục này.'}
            </p>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-none bg-muted border border-border text-xs font-semibold text-foreground hover:bg-muted/80 transition cursor-pointer"
            >
              Xoá bộ lọc tìm kiếm
            </button>
          )}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-border border border-border overflow-hidden rounded-none"
          ref={menuRef}
        >
          {paginatedCourses.map((course, i) => {
            const hasOriginalPrice = course.originalPrice && course.originalPrice > course.price;
            const isFree = !course.accessCode || (course.price ?? 0) === 0;
            const isAccessible = isFree || accessCourseIds.includes(course.id);
            const globalIndex = (currentPage - 1) * PAGE_SIZE + i;
            const isMenuThisOpen = openMenuId === course.id;

            return (
              <div
                key={course.id}
                className={`h-full bg-card ${isMenuThisOpen ? 'relative z-30' : 'relative z-0'}`}
              >
                <div
                  className={`relative group flex flex-col justify-between h-full bg-card p-5 sm:p-6 hover:bg-muted/40 transition-colors duration-200 rounded-none ${
                    isMenuThisOpen ? 'z-30 overflow-visible' : 'z-0 overflow-hidden'
                  }`}
                >
                  {/* Light Sweep Sheen */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-card-foreground/5 to-transparent pointer-events-none" />
                  </div>

                  {/* Technical Crosshairs */}
                  <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
                  <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>

                  <div>
                    {/* Top Header Row */}
                    <div className={`flex items-center justify-between gap-2 relative ${isMenuThisOpen ? 'z-40' : 'z-20'}`}>
                      {/* Topic Number Tag */}
                      <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-brand" />
                        {String(globalIndex + 1).padStart(2, '0')} · KHÓA HỌC
                      </span>

                      <div className="flex items-center gap-1.5">
                        {/* Level badge */}
                        <span
                          className={cn(
                            'px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider border rounded-none',
                            course.level === 'Beginner' && 'bg-brand/10 text-brand border-brand/20',
                            course.level === 'Intermediate' && 'bg-muted text-foreground border-border',
                            course.level === 'Advanced' && 'bg-primary text-primary-foreground border-border'
                          )}
                        >
                          {course.level}
                        </span>

                        {/* Admin 3-dots */}
                        {isAdmin && (
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenMenuId(isMenuThisOpen ? null : course.id);
                              }}
                              className="flex h-7 w-7 items-center justify-center rounded-none text-muted-foreground hover:bg-muted hover:text-foreground transition cursor-pointer"
                              title="Tùy chọn khóa học"
                            >
                              <MoreVertical className="h-3.5 w-3.5" />
                            </button>

                            <AnimatePresence>
                              {isMenuThisOpen && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  className="absolute right-0 top-8 w-40 bg-card border border-border rounded-none shadow-2xl z-50 py-1.5"
                                  style={{ isolation: 'isolate' }}
                                >
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openEditModal(course);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted transition cursor-pointer"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-brand" />
                                    Sửa khóa học
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.preventDefault();
                                      openDeleteModal(course);
                                    }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10 transition cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    Xóa khóa học
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Thumbnail box (Sharp rectangular) */}
                    <Link
                      href={`/courses/${course.id}`}
                      className="mt-3.5 block aspect-video relative overflow-hidden bg-muted border border-border group/thumb"
                    >
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-500"
                      />
                      {/* Rating Badge */}
                      {course.rating && (
                        <div className="absolute top-2.5 right-2.5 bg-card/95 border border-border px-2 py-0.5 text-[10px] font-bold text-foreground flex items-center gap-1 rounded-none shadow-2xs">
                          <Star className="h-3 w-3 fill-brand text-brand" />
                          <span>{course.rating.toFixed(1)}</span>
                        </div>
                      )}

                      {/* Best Seller Badge */}
                      {course.isBestSeller && (
                        <div className="absolute top-2.5 left-2.5 bg-brand text-brand-foreground px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase rounded-none">
                          Nổi Bật
                        </div>
                      )}
                    </Link>

                    {/* Course Title & Subject */}
                    <div className="mt-4 space-y-1.5 relative z-0">
                      {course.subject && (
                        <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground">
                          {course.subject}
                        </span>
                      )}
                      <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight leading-snug hover:text-brand transition-colors line-clamp-2">
                        <Link href={`/courses/${course.id}`}>{course.title}</Link>
                      </h3>
                      <p className="text-xs text-muted-foreground font-normal line-clamp-2 leading-relaxed">
                        {course.description.replace(/[#*`]/g, '')}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer: Metadata & Action CTA */}
                  <div className="mt-5 pt-3.5 border-t border-border space-y-3 relative z-10">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                      <div className="flex items-center gap-1.5">
                        <PlayCircle className="h-3.5 w-3.5 text-brand" />
                        <span>{course.lessons?.length || 0} bài giảng</span>
                      </div>
                      {course.weeks && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground/70" />
                          <span>{course.weeks} tuần</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex flex-col">
                        {hasOriginalPrice && (
                          <span className="text-[10px] text-muted-foreground line-through font-medium leading-none mb-0.5">
                            {formatPrice(course.originalPrice as number)}
                          </span>
                        )}
                        <span className="text-base font-extrabold text-brand leading-none">
                          {course.price > 0 ? formatPrice(course.price) : 'Miễn Phí'}
                        </span>
                      </div>

                      {isAccessible ? (
                        <Link
                          href={`/my-courses/${course.id}`}
                          className="px-3.5 py-2 rounded-none border border-border bg-primary text-primary-foreground hover:bg-brand hover:text-brand-foreground transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Unlock className="h-3 w-3 stroke-[2.5]" />
                          <span>Vào học</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => setAccessModalCourse(course)}
                          className="px-3.5 py-2 rounded-none border border-border bg-muted text-foreground hover:border-brand hover:text-brand transition-colors text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Lock className="h-3 w-3 stroke-[2.5] text-brand" />
                          <span>Kích hoạt</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
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
        variant="sharp"
      />

      {/* Add Course Modal */}
      <AddCourseModal
        show={showAddModal}
        newCourse={newCourse}
        newTopics={newTopics}
        onClose={() => setShowAddModal(false)}
        onSave={handleSaveCourse}
        onCourseChange={(field, value) => setNewCourse({ ...newCourse, [field]: value })}
        onAddTopic={() => setNewTopics([...newTopics, { ...defaultTopicDraft }])}
        onRemoveTopic={(idx) => setNewTopics(newTopics.length > 1 ? newTopics.filter((_, i) => i !== idx) : [{ ...defaultTopicDraft }])}
        onUpdateTopic={(idx, field, value) => {
          const updated = [...newTopics];
          updated[idx] = { ...updated[idx], [field]: value };
          setNewTopics(updated);
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
