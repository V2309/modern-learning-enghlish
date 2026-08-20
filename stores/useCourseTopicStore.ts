'use client';

import { create } from 'zustand';

interface LessonForm {
  title: string;
  duration: string;
  videoUrl: string;
  description: string;
  practiceContent?: string;
}

interface CourseTopicStoreState {
  completedIds: string[];
  completedPracticeIds: string[];
  activeLesson: any | null;
  activeMode: 'video' | 'practice';
  lessons: any[];
  expandedTopics: Record<string, boolean>;
  expandedLessons: Record<string, boolean>;
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
  setCompletedPracticeIds: (ids: string[]) => void;
  toggleCompletedPracticeId: (id: string) => void;
  setActiveLesson: (lesson: any | null) => void;
  setActiveMode: (mode: 'video' | 'practice') => void;
  setLessons: (lessons: any[]) => void;
  setExpandedTopics: (topics: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  toggleTopicExpanded: (topicId: string) => void;
  setExpandedLessons: (lessons: Record<string, boolean> | ((prev: Record<string, boolean>) => Record<string, boolean>)) => void;
  toggleLessonExpanded: (lessonId: string) => void;
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
  completedPracticeIds: [],
  activeLesson: null,
  activeMode: 'video' as const,
  lessons: [],
  expandedTopics: {},
  expandedLessons: {},
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

export const useCourseTopicStore = create<CourseTopicStoreState>((set) => ({
  ...initialState,
  setCompletedIds: (completedIds) => set({ completedIds }),
  setCompletedPracticeIds: (completedPracticeIds) => set({ completedPracticeIds }),
  toggleCompletedPracticeId: (id) =>
    set((state) => ({
      completedPracticeIds: state.completedPracticeIds.includes(id)
        ? state.completedPracticeIds.filter((item) => item !== id)
        : [...state.completedPracticeIds, id],
    })),
  setActiveLesson: (activeLesson) => set({ activeLesson }),
  setActiveMode: (activeMode) => set({ activeMode }),
  setLessons: (lessons) => set({ lessons }),
  setExpandedTopics: (updater) =>
    set((state) => ({
      expandedTopics: typeof updater === 'function' ? updater(state.expandedTopics) : updater,
    })),
  toggleTopicExpanded: (topicId) =>
    set((state) => ({
      expandedTopics: {
        ...state.expandedTopics,
        [topicId]: !state.expandedTopics[topicId],
      },
    })),
  setExpandedLessons: (updater) =>
    set((state) => ({
      expandedLessons: typeof updater === 'function' ? updater(state.expandedLessons) : updater,
    })),
  toggleLessonExpanded: (lessonId) =>
    set((state) => {
      const current = state.expandedLessons[lessonId] ?? true;
      return {
        expandedLessons: {
          ...state.expandedLessons,
          [lessonId]: !current,
        },
      };
    }),
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
