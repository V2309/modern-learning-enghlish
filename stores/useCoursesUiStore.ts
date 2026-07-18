'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CourseSortKey = 'newest' | 'oldest' | 'az' | 'za' | 'level' | 'lessons';

interface CoursesUiStoreState {
  searchQuery: string;
  currentPage: number;
  sortKey: CourseSortKey;
  setSearchQuery: (searchQuery: string) => void;
  setCurrentPage: (currentPage: number) => void;
  setSortKey: (sortKey: CourseSortKey) => void;
  reset: () => void;
}

export const useCoursesUiStore = create<CoursesUiStoreState>()(
  persist(
    (set) => ({
      searchQuery: '',
      currentPage: 1,
      sortKey: 'newest',
      setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      setSortKey: (sortKey) => set({ sortKey, currentPage: 1 }),
      reset: () => set({ searchQuery: '', currentPage: 1, sortKey: 'newest' }),
    }),
    {
      name: 'linguify-courses-ui',
      storage: createJSONStorage(() => localStorage),
    }
  )
);