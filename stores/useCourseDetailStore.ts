'use client';

import { create } from 'zustand';

interface LessonForm {
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
}

interface CourseDetailStoreState {
  completedIds: string[];
  activeLesson: any | null;
  lessons: any[];
  isDesktopSidebarOpen: boolean;
  isMobileDrawerOpen: boolean;
  showEditLessonModal: boolean;
  editingLesson: any | null;
  editLessonForm: LessonForm;
  isSavingLesson: boolean;
  showDeleteLessonModal: boolean;
  deletingLesson: any | null;
  isDeletingLesson: boolean;
  showAddLessonModal: boolean;
  isAddingLesson: boolean;
  setCompletedIds: (ids: string[]) => void;
  setActiveLesson: (lesson: any | null) => void;
  setLessons: (lessons: any[]) => void;
  setIsDesktopSidebarOpen: (open: boolean) => void;
  setIsMobileDrawerOpen: (open: boolean) => void;
  setShowEditLessonModal: (show: boolean) => void;
  setEditingLesson: (lesson: any | null) => void;
  setEditLessonForm: (form: LessonForm) => void;
  setIsSavingLesson: (saving: boolean) => void;
  setShowDeleteLessonModal: (show: boolean) => void;
  setDeletingLesson: (lesson: any | null) => void;
  setIsDeletingLesson: (deleting: boolean) => void;
  setShowAddLessonModal: (show: boolean) => void;
  setIsAddingLesson: (adding: boolean) => void;
  reset: () => void;
}

const DEFAULT_EDIT_FORM: LessonForm = { title: '', duration: '', videoUrl: '', description: '' };

const initialState = {
  completedIds: [],
  activeLesson: null,
  lessons: [],
  isDesktopSidebarOpen: true,
  isMobileDrawerOpen: false,
  showEditLessonModal: false,
  editingLesson: null,
  editLessonForm: DEFAULT_EDIT_FORM,
  isSavingLesson: false,
  showDeleteLessonModal: false,
  deletingLesson: null,
  isDeletingLesson: false,
  showAddLessonModal: false,
  isAddingLesson: false,
};

export const useCourseDetailStore = create<CourseDetailStoreState>((set) => ({
  ...initialState,
  setCompletedIds: (completedIds) => set({ completedIds }),
  setActiveLesson: (activeLesson) => set({ activeLesson }),
  setLessons: (lessons) => set({ lessons }),
  setIsDesktopSidebarOpen: (isDesktopSidebarOpen) => set({ isDesktopSidebarOpen }),
  setIsMobileDrawerOpen: (isMobileDrawerOpen) => set({ isMobileDrawerOpen }),
  setShowEditLessonModal: (showEditLessonModal) => set({ showEditLessonModal }),
  setEditingLesson: (editingLesson) => set({ editingLesson }),
  setEditLessonForm: (editLessonForm) => set({ editLessonForm }),
  setIsSavingLesson: (isSavingLesson) => set({ isSavingLesson }),
  setShowDeleteLessonModal: (showDeleteLessonModal) => set({ showDeleteLessonModal }),
  setDeletingLesson: (deletingLesson) => set({ deletingLesson }),
  setIsDeletingLesson: (isDeletingLesson) => set({ isDeletingLesson }),
  setShowAddLessonModal: (showAddLessonModal) => set({ showAddLessonModal }),
  setIsAddingLesson: (isAddingLesson) => set({ isAddingLesson }),
  reset: () => set({ ...initialState }),
}));