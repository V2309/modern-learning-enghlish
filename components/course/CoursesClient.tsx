'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { PlayCircle, Clock, BookOpen, Search, Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AddCourseModal } from '@/components/course/AddCourseModal';
import { EditCourseModal } from '@/components/course/EditCourseModal';
import { createCourseAction, updateCourseAction, deleteCourseAction } from '@/actions/course.action';
import { CourseLevel } from '@prisma/client';
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal';
import Pagination from '@/components/Pagination';
import SortMenuButton from '@/components/SortMenuButton';
import { useCoursesUiStore, type CourseSortKey } from '@/stores/useCoursesUiStore';
import { toast } from 'react-hot-toast';
import { defaultCourseDraft, defaultLessonDraft, useCoursesPageStore } from '@/stores/useCoursesPageStore';

const PAGE_SIZE = 6;

interface CoursesClientProps {
  initialCourses: any[];
}

export default function CoursesClient({ initialCourses }: CoursesClientProps) {
  const [courses, setCourses] = useState<any[]>(initialCourses);
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

  // Sort
  const SORT_OPTIONS: { key: CourseSortKey; label: string }[] = [
    { key: 'newest', label: 'Mới nhất' },
    { key: 'oldest', label: 'Cũ nhất' },
    { key: 'az', label: 'Tên A → Z' },
    { key: 'za', label: 'Tên Z → A' },
    { key: 'level', label: 'Cấp độ (Beginner → Advanced)' },
    { key: 'lessons', label: 'Nhiều bài học nhất' },
  ];
  const sortMenuRef = useRef<HTMLDivElement>(null);

  const menuRef = useRef<HTMLDivElement>(null);

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

  // ── Handlers ──────────────────────────────────
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

  const LEVEL_ORDER: Record<string, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 };

  const filteredCourses = courses
    .filter(
      (c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
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

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Learning Paths</h1>
          <p className="text-muted-foreground text-lg">Curated courses to master English in specific contexts.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="pl-12 pr-6 py-3 w-64 bg-muted border border-border rounded-4xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground"
            />
          </div>

          {/* Sort dropdown */}
          <SortMenuButton
            options={SORT_OPTIONS}
            value={sortKey}
            onChange={(nextKey) => {
              setSortKey(nextKey);
              setCurrentPage(1);
            }}
          />

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-4xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            Add Course
          </button>
        </div>
      </div>

      {/* Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border rounded-4xl text-muted-foreground">
          Chưa có khoá học nào được tìm thấy.
        </div>
      ) : (
        <div className="flex flex-col gap-6" ref={menuRef}>
          {paginatedCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group relative"
            >
              <Link
                href={`/courses/${course.id}`}
                className="flex flex-col sm:flex-row bg-card border border-border rounded-3xl overflow-hidden hover:border-primary/50 transition-all hover:bg-muted/50 shadow-sm"
              >
                {/* Thumbnail Section */}
                <div className="relative w-full sm:w-72 md:w-80 aspect-video sm:aspect-auto shrink-0 overflow-hidden">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-linear-to-t sm:bg-linear-to-r from-slate-950/40 via-transparent to-transparent" />
                  
                  {/* Play icon overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300">
                      <PlayCircle className="h-6 w-6" />
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:p-8 flex flex-col justify-between grow">
                  <div>
                    {/* Level Badge */}
                    <div className="mb-3">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        course.level === 'Beginner' && "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                        course.level === 'Intermediate' && "bg-blue-500/10 text-blue-600 dark:text-blue-400",
                        course.level === 'Advanced' && "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                      )}>
                        {course.level}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors pr-10">
                      {course.title}
                    </h3>
                    <p className="text-muted-foreground text-sm line-clamp-2 sm:line-clamp-3 mb-6">
                      {course.description.replace(/[#*`]/g, '')}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest border-t border-border pt-4">
                    <div className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />12h</div>
                    <div className="flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />{course.lessons?.length || 0} Lessons</div>
                  </div>
                </div>
              </Link>

              {/* Action menu — outside Link */}
              <div className="absolute top-6 right-6 z-10">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === course.id ? null : course.id);
                  }}
                  className="p-2 rounded-xl bg-card/85 backdrop-blur border border-border hover:bg-muted text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 shadow-sm cursor-pointer"
                  id={`course-menu-btn-${course.id}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </button>

                <AnimatePresence>
                  {openMenuId === course.id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -4 }}
                      className="absolute right-0 mt-1 w-44 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
                    >
                      <button
                        onClick={(e) => { e.preventDefault(); openEditModal(course); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                      >
                        <Pencil className="h-4 w-4 text-primary" />
                        Sửa khoá học
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); openDeleteModal(course); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xoá khoá học
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}

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
    </div>
  );
}
