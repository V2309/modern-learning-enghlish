'use client';

import { create } from 'zustand';

export type CourseLevelOption = 'Beginner' | 'Intermediate' | 'Advanced';

export interface CourseLessonDraft {
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
}

export interface CourseDraft {
  title: string;
  description: string;
  thumbnail: string;
  level: CourseLevelOption;
}

interface CoursesPageStoreState {
  showAddModal: boolean;
  newCourse: CourseDraft;
  newLessons: CourseLessonDraft[];
  showEditModal: boolean;
  editingCourse: any | null;
  editForm: CourseDraft;
  isSaving: boolean;
  showDeleteModal: boolean;
  deletingCourse: any | null;
  isDeleting: boolean;
  openMenuId: string | null;
  showSortMenu: boolean;
  setShowAddModal: (show: boolean) => void;
  setNewCourse: (course: CourseDraft) => void;
  setNewLessons: (lessons: CourseLessonDraft[]) => void;
  setShowEditModal: (show: boolean) => void;
  setEditingCourse: (course: any | null) => void;
  setEditForm: (form: CourseDraft) => void;
  setIsSaving: (saving: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;
  setDeletingCourse: (course: any | null) => void;
  setIsDeleting: (deleting: boolean) => void;
  setOpenMenuId: (menuId: string | null) => void;
  setShowSortMenu: (show: boolean) => void;
  reset: () => void;
}

const DEFAULT_LESSON: CourseLessonDraft = { title: '', duration: '10:00', videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', description: '' };

const DEFAULT_COURSE: CourseDraft = {
  title: '',
  description: '',
  thumbnail: 'https://picsum.photos/seed/new/800/450',
  level: 'Beginner',
};

const initialState = {
  showAddModal: false,
  newCourse: DEFAULT_COURSE,
  newLessons: [{ ...DEFAULT_LESSON }],
  showEditModal: false,
  editingCourse: null,
  editForm: DEFAULT_COURSE,
  isSaving: false,
  showDeleteModal: false,
  deletingCourse: null,
  isDeleting: false,
  openMenuId: null,
  showSortMenu: false,
};

export const useCoursesPageStore = create<CoursesPageStoreState>((set) => ({
  ...initialState,
  setShowAddModal: (showAddModal) => set({ showAddModal }),
  setNewCourse: (newCourse) => set({ newCourse }),
  setNewLessons: (newLessons) => set({ newLessons }),
  setShowEditModal: (showEditModal) => set({ showEditModal }),
  setEditingCourse: (editingCourse) => set({ editingCourse }),
  setEditForm: (editForm) => set({ editForm }),
  setIsSaving: (isSaving) => set({ isSaving }),
  setShowDeleteModal: (showDeleteModal) => set({ showDeleteModal }),
  setDeletingCourse: (deletingCourse) => set({ deletingCourse }),
  setIsDeleting: (isDeleting) => set({ isDeleting }),
  setOpenMenuId: (openMenuId) => set({ openMenuId }),
  setShowSortMenu: (showSortMenu) => set({ showSortMenu }),
  reset: () => set({ ...initialState }),
}));

export const defaultCourseDraft = DEFAULT_COURSE;
export const defaultLessonDraft = DEFAULT_LESSON;