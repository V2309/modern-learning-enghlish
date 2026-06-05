'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

import { cn } from '@/lib/utils';

// Sub-components
import { TopicSidebar, StudyMode, sidebarItems } from '@/components/topic/TopicSidebar';
import { VocabList } from '@/components/topic/VocabList';
import { FlashcardMode } from '@/components/topic/FlashcardMode';
import { QuizMode } from '@/components/topic/QuizMode';
import { MatchMode, MatchingCard } from '@/components/topic/MatchMode';
import { DictationMode } from '@/components/topic/DictationMode';
import { TranslateMode } from '@/components/topic/TranslateMode';
import { AddWordModal } from '@/components/topic/AddWordModal';
import { createVocabularyAction } from '@/actions/vocabulary.action';
import { masterVocabularyAction } from '@/actions/progress.action';
import { PartOfSpeech } from '@prisma/client';

interface TopicDetailClientProps {
  topic: any;
  userId: string;
  initialWords: any[];
  initialMasteredWordIds: string[];
}

export default function TopicDetailClient({ topic, userId, initialWords, initialMasteredWordIds }: TopicDetailClientProps) {
  // ── Data ──
  const [words, setWords] = useState<any[]>(initialWords);
  const [masteredIds, setMasteredIds] = useState<string[]>(initialMasteredWordIds);

  // ── UI ──
  const [activeMode, setActiveMode] = useState<StudyMode>('list');
  const [flashcardIndex, setFlashcardIndex] = useState(0);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // ── Add Word ──
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [newWord, setNewWord] = useState({ word: '', meaning: '', example: '', partOfSpeech: 'Noun' as PartOfSpeech });
  const [newWordExamples, setNewWordExamples] = useState<string[]>(['']);

  // ── Quiz ──
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<string | null>(null);
  const [isQuizAnswered, setIsQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);

  // ── Match ──
  const [matchingCards, setMatchingCards] = useState<MatchingCard[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchingCard | null>(null);
  const [matchSeconds, setMatchSeconds] = useState(0);
  const [isMatchFinished, setIsMatchFinished] = useState(false);
  const [matchIntervalId, setMatchIntervalId] = useState<any>(null);

  // ── Dictation ──
  const [dictationQuestions, setDictationQuestions] = useState<any[]>([]);
  const [dictationIndex, setDictationIndex] = useState(0);
  const [typedWord, setTypedWord] = useState('');
  const [isDictationChecked, setIsDictationChecked] = useState(false);
  const [isDictationCorrect, setIsDictationCorrect] = useState(false);
  const [dictationScore, setDictationScore] = useState(0);
  const [isDictationFinished, setIsDictationFinished] = useState(false);

  // ── Translate ──
  const [translateQuestions, setTranslateQuestions] = useState<any[]>([]);
  const [translateIndex, setTranslateIndex] = useState(0);
  const [translateInput, setTranslateInput] = useState('');
  const [isTranslateChecked, setIsTranslateChecked] = useState(false);
  const [isTranslateCorrect, setIsTranslateCorrect] = useState(false);
  const [translateScore, setTranslateScore] = useState(0);
  const [isTranslateFinished, setIsTranslateFinished] = useState(false);

  useEffect(() => () => { if (matchIntervalId) clearInterval(matchIntervalId); }, [matchIntervalId]);

  // ─── Helpers ───────────────────────────────
  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  const initQuizGame = () => {
    if (words.length === 0) return;
    const questions = words.map((w) => {
      const others = words.filter((o) => o.id !== w.id).map((o) => o.meaning).sort(() => 0.5 - Math.random()).slice(0, 3);
      while (others.length < 3) others.push('Sử dụng phù hợp cho trường hợp giao tiếp hàng ngày');
      return { word: w.word, correct: w.meaning, options: [w.meaning, ...others].sort(() => 0.5 - Math.random()), partOfSpeech: w.partOfSpeech };
    }).sort(() => 0.5 - Math.random());
    setQuizQuestions(questions); setCurrentQuizIndex(0); setSelectedQuizAnswer(null);
    setIsQuizAnswered(false); setQuizScore(0); setIsQuizFinished(false);
  };

  const initMatchingGame = () => {
    const subset = [...words].sort(() => 0.5 - Math.random()).slice(0, 6);
    const wordCards: MatchingCard[] = subset.map((w) => ({ id: `${w.id}_word`, wordId: w.id, type: 'word', content: w.word, isMatched: false, isSelected: false, isFailed: false }));
    const meaningCards: MatchingCard[] = subset.map((w) => ({ id: `${w.id}_meaning`, wordId: w.id, type: 'meaning', content: w.meaning, isMatched: false, isSelected: false, isFailed: false }));
    setMatchingCards([...wordCards, ...meaningCards].sort(() => 0.5 - Math.random()));
    setSelectedMatch(null); setMatchSeconds(0); setIsMatchFinished(false);
    if (matchIntervalId) clearInterval(matchIntervalId);
    const id = setInterval(() => setMatchSeconds((p) => p + 1), 1000);
    setMatchIntervalId(id);
  };

  const initDictationGame = () => {
    if (words.length === 0) return;
    const subset = [...words].sort(() => 0.5 - Math.random()).slice(0, 5);
    setDictationQuestions(subset); setDictationIndex(0); setTypedWord('');
    setIsDictationChecked(false); setIsDictationCorrect(false); setDictationScore(0); setIsDictationFinished(false);
    setTimeout(() => speak(subset[0].word), 400);
  };

  const initTranslateGame = () => {
    if (words.length === 0) return;
    const questions = words.map((w) => {
      const questionText = w.example.replace(new RegExp(`\\b${w.word}\\b`, 'gi'), '______');
      return { word: w.word, hint: w.meaning, question: questionText, fullSentence: w.example };
    }).sort(() => 0.5 - Math.random());
    setTranslateQuestions(questions); setTranslateIndex(0); setTranslateInput('');
    setIsTranslateChecked(false); setIsTranslateCorrect(false); setTranslateScore(0); setIsTranslateFinished(false);
  };

  const handleModeChange = (mode: StudyMode) => {
    setActiveMode(mode); setFlashcardIndex(0);
    if (mode === 'quiz') initQuizGame();
    if (mode === 'match') initMatchingGame();
    if (mode === 'dictation') initDictationGame();
    if (mode === 'translate') initTranslateGame();
  };

  const handleMatchCardClick = (clickedCard: MatchingCard) => {
    if (clickedCard.isMatched || clickedCard.isFailed) return;
    setMatchingCards((prev) => prev.map((c) => c.id === clickedCard.id ? { ...c, isSelected: true } : c));
    if (!selectedMatch) { setSelectedMatch(clickedCard); return; }
    if (selectedMatch.id === clickedCard.id) {
      setMatchingCards((prev) => prev.map((c) => c.id === clickedCard.id ? { ...c, isSelected: false } : c));
      setSelectedMatch(null); return;
    }
    if (selectedMatch.wordId === clickedCard.wordId && selectedMatch.type !== clickedCard.type) {
      setMatchingCards((prev) => prev.map((c) => c.wordId === clickedCard.wordId ? { ...c, isMatched: true, isSelected: false } : c));
      setSelectedMatch(null);
      setTimeout(() => {
        setMatchingCards((cur) => { const done = cur.every((c) => c.isMatched); if (done) { setIsMatchFinished(true); clearInterval(matchIntervalId); } return cur; });
      }, 100);
    } else {
      const fId = selectedMatch.id; const sId = clickedCard.id;
      setMatchingCards((prev) => prev.map((c) => (c.id === fId || c.id === sId) ? { ...c, isFailed: true, isSelected: false } : c));
      setSelectedMatch(null);
      setTimeout(() => setMatchingCards((prev) => prev.map((c) => (c.id === fId || c.id === sId) ? { ...c, isFailed: false } : c)), 850);
    }
  };

  const handleAddWord = async () => {
    if (!newWord.word.trim() || !newWord.meaning.trim()) return;

    const filteredExamples = newWordExamples.filter((ex) => ex.trim() !== '');
    
    const res = await createVocabularyAction({
      topicId: topic.id,
      word: newWord.word,
      meaning: newWord.meaning,
      example: filteredExamples[0] || '',
      examples: filteredExamples,
      category: topic.name,
      partOfSpeech: newWord.partOfSpeech,
      createdByUserId: userId
    });

    if (res.success && res.vocabulary) {
      setWords((prev) => [...prev, res.vocabulary]);
      setShowAddWordModal(false);
      setNewWord({ word: '', meaning: '', example: '', partOfSpeech: 'Noun' });
      setNewWordExamples(['']);
    } else {
      alert('Không thể lưu từ vựng: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const handleToggleMaster = async (wordId: string) => {
    const isCurrentlyMastered = masteredIds.includes(wordId);
    setMasteredIds((prev) => 
      isCurrentlyMastered 
        ? prev.filter((id) => id !== wordId) 
        : [...prev, wordId]
    );

    const res = await masterVocabularyAction(userId, wordId, topic.id);
    if (!res.success) {
      // Revert if failed
      setMasteredIds((prev) => 
        isCurrentlyMastered 
          ? [...prev, wordId] 
          : prev.filter((id) => id !== wordId)
      );
      alert('Không thể cập nhật tiến trình từ vựng: ' + (res.error || 'Có lỗi xảy ra'));
    }
  };

  const formattedWords = words.map((w) => ({
    ...w,
    mastered: masteredIds.includes(w.id)
  }));

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl relative">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-foreground tracking-tight">{topic.name}</h1>
            <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {words.length} từ vựng
            </span>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {masteredIds.length} đã thuộc
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all"
          >
            <Menu className="h-4 w-4 text-primary" />
            <span>Chế độ học ({sidebarItems.find((i) => i.mode === activeMode)?.label.replace('Từ vựng: ', '').replace('Luyện tập: ', '')})</span>
          </button>
          {/* Desktop sidebar toggle */}
          <button
            onClick={() => setIsDesktopSidebarOpen(!isDesktopSidebarOpen)}
            className="hidden lg:flex items-center gap-2 px-4 py-2.5 border border-border bg-card text-foreground rounded-xl text-xs font-bold hover:bg-muted transition-all"
          >
            <Menu className="h-4 w-4 text-primary" />
            <span>{isDesktopSidebarOpen ? 'Ẩn menu' : 'Hiện menu'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-12 gap-8 items-start">

        {/* Desktop Sidebar */}
        {isDesktopSidebarOpen && (
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            <TopicSidebar
              topic={topic}
              wordCount={words.length}
              activeMode={activeMode}
              onModeChange={handleModeChange}
              onOpenAddWord={() => setShowAddWordModal(true)}
            />
          </div>
        )}

        {/* Main content area */}
        <div className={cn('transition-all duration-300', isDesktopSidebarOpen ? 'lg:col-span-9' : 'lg:col-span-12')}>
          <AnimatePresence mode="wait">
            {activeMode === 'list' && (
              <VocabList 
                key="list" 
                words={formattedWords} 
                speak={speak} 
                onOpenAddModal={() => setShowAddWordModal(true)} 
                onToggleMaster={handleToggleMaster}
              />
            )}
            {activeMode === 'flashcards' && (
              <FlashcardMode key="flashcards" words={formattedWords} flashcardIndex={flashcardIndex} setFlashcardIndex={setFlashcardIndex} speak={speak} />
            )}
            {activeMode === 'quiz' && (
              <QuizMode
                key="quiz"
                quizQuestions={quizQuestions}
                currentQuizIndex={currentQuizIndex}
                selectedQuizAnswer={selectedQuizAnswer}
                isQuizAnswered={isQuizAnswered}
                quizScore={quizScore}
                isQuizFinished={isQuizFinished}
                onSelectAnswer={setSelectedQuizAnswer}
                onCheckAnswer={() => {
                  if (!selectedQuizAnswer) return;
                  setIsQuizAnswered(true);
                  if (selectedQuizAnswer === quizQuestions[currentQuizIndex].correct) setQuizScore((p) => p + 1);
                }}
                onNext={() => {
                  if (currentQuizIndex + 1 < quizQuestions.length) {
                    setCurrentQuizIndex((p) => p + 1); setSelectedQuizAnswer(null); setIsQuizAnswered(false);
                  } else setIsQuizFinished(true);
                }}
                onRestart={initQuizGame}
                onBackToList={() => handleModeChange('list')}
              />
            )}
            {activeMode === 'match' && (
              <MatchMode
                key="match"
                matchingCards={matchingCards}
                matchSeconds={matchSeconds}
                isMatchFinished={isMatchFinished}
                onCardClick={handleMatchCardClick}
                onRestart={initMatchingGame}
                onBackToList={() => handleModeChange('list')}
              />
            )}
            {activeMode === 'dictation' && (
              <DictationMode
                key="dictation"
                dictationQuestions={dictationQuestions}
                dictationIndex={dictationIndex}
                typedWord={typedWord}
                isDictationChecked={isDictationChecked}
                isDictationCorrect={isDictationCorrect}
                dictationScore={dictationScore}
                isDictationFinished={isDictationFinished}
                onTypedWordChange={setTypedWord}
                onCheck={() => {
                  if (!typedWord.trim()) return;
                  const correct = typedWord.trim().toLowerCase() === dictationQuestions[dictationIndex].word.trim().toLowerCase();
                  setIsDictationCorrect(correct); setIsDictationChecked(true);
                  if (correct) setDictationScore((p) => p + 1);
                }}
                onNext={() => {
                  if (dictationIndex + 1 < dictationQuestions.length) {
                    setDictationIndex((p) => p + 1); setTypedWord(''); setIsDictationChecked(false); setIsDictationCorrect(false);
                    setTimeout(() => speak(dictationQuestions[dictationIndex + 1].word), 300);
                  } else setIsDictationFinished(true);
                }}
                onRestart={initDictationGame}
                onBackToList={() => handleModeChange('list')}
                speak={speak}
              />
            )}
            {activeMode === 'translate' && (
              <TranslateMode
                key="translate"
                translateQuestions={translateQuestions}
                translateIndex={translateIndex}
                translateInput={translateInput}
                isTranslateChecked={isTranslateChecked}
                isTranslateCorrect={isTranslateCorrect}
                translateScore={translateScore}
                isTranslateFinished={isTranslateFinished}
                onInputChange={setTranslateInput}
                onCheck={() => {
                  if (!translateInput.trim()) return;
                  const correct = translateInput.trim().toLowerCase() === translateQuestions[translateIndex].word.trim().toLowerCase();
                  setIsTranslateCorrect(correct); setIsTranslateChecked(true);
                  if (correct) setTranslateScore((p) => p + 1);
                }}
                onNext={() => {
                  if (translateIndex + 1 < translateQuestions.length) {
                    setTranslateIndex((p) => p + 1); setTranslateInput(''); setIsTranslateChecked(false); setIsTranslateCorrect(false);
                  } else setIsTranslateFinished(true);
                }}
                onRestart={initTranslateGame}
                onBackToList={() => handleModeChange('list')}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Word Modal */}
      <AddWordModal
        show={showAddWordModal}
        topicName={topic.name}
        newWord={newWord}
        newWordExamples={newWordExamples}
        onClose={() => setShowAddWordModal(false)}
        onSave={handleAddWord}
        onWordChange={(field, value) => setNewWord((prev) => ({ ...prev, [field]: value }))}
        onAddExample={() => setNewWordExamples((prev) => [...prev, ''])}
        onRemoveExample={(idx) => setNewWordExamples((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : [''])}
        onUpdateExample={(idx, value) => setNewWordExamples((prev) => { const u = [...prev]; u[idx] = value; return u; })}
      />

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 flex justify-start lg:hidden">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileSidebarOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-sm h-full bg-card border-r border-border p-6 shadow-2xl overflow-y-auto z-10 flex flex-col space-y-6"
            >
              <div className="flex items-center justify-between pb-4 border-b border-border">
                <span className="text-base font-black text-foreground">Menu Chế Độ Luyện Tập</span>
                <button onClick={() => setIsMobileSidebarOpen(false)} className="p-2 bg-muted hover:bg-accent text-foreground rounded-xl">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex-1">
                <TopicSidebar
                  topic={topic}
                  wordCount={words.length}
                  activeMode={activeMode}
                  isMobileView
                  onModeChange={handleModeChange}
                  onOpenAddWord={() => setShowAddWordModal(true)}
                  onClose={() => setIsMobileSidebarOpen(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
