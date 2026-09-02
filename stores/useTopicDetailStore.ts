'use client';

import { create } from 'zustand';
import type { PartOfSpeech } from '@prisma/client';
import type { StudyMode } from '@/components/topic/TopicSidebar';
import type { MatchingCard } from '@/components/topic/MatchMode';

interface TopicWordForm {
  word: string;
  meaning: string;
  definition: string;
  example: string;
  partOfSpeech: PartOfSpeech;
  imageUrl?: string;
}

interface EditWordForm {
  word: string;
  meaning: string;
  example: string;
  partOfSpeech: PartOfSpeech;
  imageUrl?: string;
}

interface TopicDetailStoreState {
  words: any[];
  masteredIds: string[];
  activeMode: StudyMode;
  flashcardIndex: number;
  isDesktopSidebarOpen: boolean;
  isMobileSidebarOpen: boolean;
  showAddWordModal: boolean;
  newWord: TopicWordForm;
  newWordExamples: string[];
  showEditWordModal: boolean;
  editingWord: any | null;
  editWordForm: EditWordForm;
  editWordExamples: string[];
  isSavingWord: boolean;
  showDeleteWordModal: boolean;
  deletingWord: any | null;
  isDeletingWord: boolean;
  quizQuestions: any[];
  currentQuizIndex: number;
  selectedQuizAnswer: string | null;
  isQuizAnswered: boolean;
  quizScore: number;
  isQuizFinished: boolean;
  matchingCards: MatchingCard[];
  selectedMatch: MatchingCard | null;
  matchSeconds: number;
  isMatchFinished: boolean;
  matchIntervalId: ReturnType<typeof setInterval> | null;
  dictationQuestions: any[];
  dictationIndex: number;
  typedWord: string;
  isDictationChecked: boolean;
  isDictationCorrect: boolean;
  dictationScore: number;
  isDictationFinished: boolean;
  translateQuestions: any[];
  translateIndex: number;
  translateInput: string;
  isTranslateChecked: boolean;
  isTranslateCorrect: boolean;
  translateScore: number;
  isTranslateFinished: boolean;
  setWords: (words: any[] | ((prev: any[]) => any[])) => void;
  setMasteredIds: (masteredIds: string[] | ((prev: string[]) => string[])) => void;
  setActiveMode: (mode: StudyMode) => void;
  setFlashcardIndex: (index: number | ((prev: number) => number)) => void;
  setIsDesktopSidebarOpen: (open: boolean) => void;
  setIsMobileSidebarOpen: (open: boolean) => void;
  setShowAddWordModal: (show: boolean) => void;
  setNewWord: (updater: TopicWordForm | ((prev: TopicWordForm) => TopicWordForm)) => void;
  setNewWordExamples: (updater: string[] | ((prev: string[]) => string[])) => void;
  setShowEditWordModal: (show: boolean) => void;
  setEditingWord: (word: any | null) => void;
  setEditWordForm: (updater: EditWordForm | ((prev: EditWordForm) => EditWordForm)) => void;
  setEditWordExamples: (updater: string[] | ((prev: string[]) => string[])) => void;
  setIsSavingWord: (saving: boolean) => void;
  setShowDeleteWordModal: (show: boolean) => void;
  setDeletingWord: (word: any | null) => void;
  setIsDeletingWord: (deleting: boolean) => void;
  setQuizQuestions: (questions: any[]) => void;
  setCurrentQuizIndex: (index: number | ((prev: number) => number)) => void;
  setSelectedQuizAnswer: (answer: string | null) => void;
  setIsQuizAnswered: (answered: boolean) => void;
  setQuizScore: (score: number | ((prev: number) => number)) => void;
  setIsQuizFinished: (finished: boolean) => void;
  setMatchingCards: (cards: MatchingCard[] | ((prev: MatchingCard[]) => MatchingCard[])) => void;
  setSelectedMatch: (card: MatchingCard | null) => void;
  setMatchSeconds: (seconds: number | ((prev: number) => number)) => void;
  setIsMatchFinished: (finished: boolean) => void;
  setMatchIntervalId: (intervalId: ReturnType<typeof setInterval> | null) => void;
  setDictationQuestions: (questions: any[]) => void;
  setDictationIndex: (index: number | ((prev: number) => number)) => void;
  setTypedWord: (word: string) => void;
  setIsDictationChecked: (checked: boolean) => void;
  setIsDictationCorrect: (correct: boolean) => void;
  setDictationScore: (score: number | ((prev: number) => number)) => void;
  setIsDictationFinished: (finished: boolean) => void;
  setTranslateQuestions: (questions: any[]) => void;
  setTranslateIndex: (index: number | ((prev: number) => number)) => void;
  setTranslateInput: (input: string) => void;
  setIsTranslateChecked: (checked: boolean) => void;
  setIsTranslateCorrect: (correct: boolean) => void;
  setTranslateScore: (score: number | ((prev: number) => number)) => void;
  setIsTranslateFinished: (finished: boolean) => void;
  resetTopicUiState: () => void;
}

const initialState = {
  words: [],
  masteredIds: [],
  activeMode: 'list' as StudyMode,
  flashcardIndex: 0,
  isDesktopSidebarOpen: true,
  isMobileSidebarOpen: false,
  showAddWordModal: false,
  newWord: { word: '', meaning: '', definition: '', example: '', partOfSpeech: 'Noun' as PartOfSpeech, imageUrl: '' },
  newWordExamples: [''],
  showEditWordModal: false,
  editingWord: null,
  editWordForm: { word: '', meaning: '', example: '', partOfSpeech: 'Noun' as PartOfSpeech, imageUrl: '' },
  editWordExamples: [''],
  isSavingWord: false,
  showDeleteWordModal: false,
  deletingWord: null,
  isDeletingWord: false,
  quizQuestions: [],
  currentQuizIndex: 0,
  selectedQuizAnswer: null,
  isQuizAnswered: false,
  quizScore: 0,
  isQuizFinished: false,
  matchingCards: [],
  selectedMatch: null,
  matchSeconds: 0,
  isMatchFinished: false,
  matchIntervalId: null,
  dictationQuestions: [],
  dictationIndex: 0,
  typedWord: '',
  isDictationChecked: false,
  isDictationCorrect: false,
  dictationScore: 0,
  isDictationFinished: false,
  translateQuestions: [],
  translateIndex: 0,
  translateInput: '',
  isTranslateChecked: false,
  isTranslateCorrect: false,
  translateScore: 0,
  isTranslateFinished: false,
};

const setMaybeUpdater = <T,>(
  value: T | ((prev: T) => T),
  current: T
): T => (typeof value === 'function' ? (value as (prev: T) => T)(current) : value);

export const useTopicDetailStore = create<TopicDetailStoreState>((set) => ({
  ...initialState,
  setWords: (words) => set((state) => ({ words: setMaybeUpdater(words, state.words) })),
  setMasteredIds: (masteredIds) => set((state) => ({ masteredIds: setMaybeUpdater(masteredIds, state.masteredIds) })),
  setActiveMode: (mode) => set({ activeMode: mode }),
  setFlashcardIndex: (flashcardIndex) => set((state) => ({ flashcardIndex: setMaybeUpdater(flashcardIndex, state.flashcardIndex) })),
  setIsDesktopSidebarOpen: (isDesktopSidebarOpen) => set({ isDesktopSidebarOpen }),
  setIsMobileSidebarOpen: (isMobileSidebarOpen) => set({ isMobileSidebarOpen }),
  setShowAddWordModal: (showAddWordModal) => set({ showAddWordModal }),
  setNewWord: (newWord) => set((state) => ({ newWord: setMaybeUpdater(newWord, state.newWord) })),
  setNewWordExamples: (newWordExamples) => set((state) => ({ newWordExamples: setMaybeUpdater(newWordExamples, state.newWordExamples) })),
  setShowEditWordModal: (showEditWordModal) => set({ showEditWordModal }),
  setEditingWord: (editingWord) => set({ editingWord }),
  setEditWordForm: (editWordForm) => set((state) => ({ editWordForm: setMaybeUpdater(editWordForm, state.editWordForm) })),
  setEditWordExamples: (editWordExamples) => set((state) => ({ editWordExamples: setMaybeUpdater(editWordExamples, state.editWordExamples) })),
  setIsSavingWord: (isSavingWord) => set({ isSavingWord }),
  setShowDeleteWordModal: (showDeleteWordModal) => set({ showDeleteWordModal }),
  setDeletingWord: (deletingWord) => set({ deletingWord }),
  setIsDeletingWord: (isDeletingWord) => set({ isDeletingWord }),
  setQuizQuestions: (quizQuestions) => set({ quizQuestions }),
  setCurrentQuizIndex: (currentQuizIndex) => set((state) => ({ currentQuizIndex: setMaybeUpdater(currentQuizIndex, state.currentQuizIndex) })),
  setSelectedQuizAnswer: (selectedQuizAnswer) => set({ selectedQuizAnswer }),
  setIsQuizAnswered: (isQuizAnswered) => set({ isQuizAnswered }),
  setQuizScore: (quizScore) => set((state) => ({ quizScore: setMaybeUpdater(quizScore, state.quizScore) })),
  setIsQuizFinished: (isQuizFinished) => set({ isQuizFinished }),
  setMatchingCards: (matchingCards) => set((state) => ({ matchingCards: setMaybeUpdater(matchingCards, state.matchingCards) })),
  setSelectedMatch: (selectedMatch) => set({ selectedMatch }),
  setMatchSeconds: (matchSeconds) => set((state) => ({ matchSeconds: setMaybeUpdater(matchSeconds, state.matchSeconds) })),
  setIsMatchFinished: (isMatchFinished) => set({ isMatchFinished }),
  setMatchIntervalId: (matchIntervalId) => set({ matchIntervalId }),
  setDictationQuestions: (dictationQuestions) => set({ dictationQuestions }),
  setDictationIndex: (dictationIndex) => set((state) => ({ dictationIndex: setMaybeUpdater(dictationIndex, state.dictationIndex) })),
  setTypedWord: (typedWord) => set({ typedWord }),
  setIsDictationChecked: (isDictationChecked) => set({ isDictationChecked }),
  setIsDictationCorrect: (isDictationCorrect) => set({ isDictationCorrect }),
  setDictationScore: (dictationScore) => set((state) => ({ dictationScore: setMaybeUpdater(dictationScore, state.dictationScore) })),
  setIsDictationFinished: (isDictationFinished) => set({ isDictationFinished }),
  setTranslateQuestions: (translateQuestions) => set({ translateQuestions }),
  setTranslateIndex: (translateIndex) => set((state) => ({ translateIndex: setMaybeUpdater(translateIndex, state.translateIndex) })),
  setTranslateInput: (translateInput) => set({ translateInput }),
  setIsTranslateChecked: (isTranslateChecked) => set({ isTranslateChecked }),
  setIsTranslateCorrect: (isTranslateCorrect) => set({ isTranslateCorrect }),
  setTranslateScore: (translateScore) => set((state) => ({ translateScore: setMaybeUpdater(translateScore, state.translateScore) })),
  setIsTranslateFinished: (isTranslateFinished) => set({ isTranslateFinished }),
  resetTopicUiState: () => set({
    activeMode: initialState.activeMode,
    flashcardIndex: initialState.flashcardIndex,
    isDesktopSidebarOpen: initialState.isDesktopSidebarOpen,
    isMobileSidebarOpen: initialState.isMobileSidebarOpen,
    showAddWordModal: initialState.showAddWordModal,
    newWord: initialState.newWord,
    newWordExamples: initialState.newWordExamples,
    showEditWordModal: initialState.showEditWordModal,
    editingWord: initialState.editingWord,
    editWordForm: initialState.editWordForm,
    editWordExamples: initialState.editWordExamples,
    isSavingWord: initialState.isSavingWord,
    showDeleteWordModal: initialState.showDeleteWordModal,
    deletingWord: initialState.deletingWord,
    isDeletingWord: initialState.isDeletingWord,
    quizQuestions: initialState.quizQuestions,
    currentQuizIndex: initialState.currentQuizIndex,
    selectedQuizAnswer: initialState.selectedQuizAnswer,
    isQuizAnswered: initialState.isQuizAnswered,
    quizScore: initialState.quizScore,
    isQuizFinished: initialState.isQuizFinished,
    matchingCards: initialState.matchingCards,
    selectedMatch: initialState.selectedMatch,
    matchSeconds: initialState.matchSeconds,
    isMatchFinished: initialState.isMatchFinished,
    matchIntervalId: initialState.matchIntervalId,
    dictationQuestions: initialState.dictationQuestions,
    dictationIndex: initialState.dictationIndex,
    typedWord: initialState.typedWord,
    isDictationChecked: initialState.isDictationChecked,
    isDictationCorrect: initialState.isDictationCorrect,
    dictationScore: initialState.dictationScore,
    isDictationFinished: initialState.isDictationFinished,
    translateQuestions: initialState.translateQuestions,
    translateIndex: initialState.translateIndex,
    translateInput: initialState.translateInput,
    isTranslateChecked: initialState.isTranslateChecked,
    isTranslateCorrect: initialState.isTranslateCorrect,
    translateScore: initialState.translateScore,
    isTranslateFinished: initialState.isTranslateFinished,
  }),
}));
