'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface VocabularyUiStoreState {
  searchQuery: string;
  currentPage: number;
  setSearchQuery: (searchQuery: string) => void;
  setCurrentPage: (currentPage: number) => void;
  reset: () => void;
}

export const useVocabularyUiStore = create<VocabularyUiStoreState>()(
  persist(
    (set) => ({
      searchQuery: '',
      currentPage: 1,
      setSearchQuery: (searchQuery) => set({ searchQuery, currentPage: 1 }),
      setCurrentPage: (currentPage) => set({ currentPage }),
      reset: () => set({ searchQuery: '', currentPage: 1 }),
    }),
    {
      name: 'linguify-vocabulary-ui',
      storage: createJSONStorage(() => localStorage),
    }
  )
);