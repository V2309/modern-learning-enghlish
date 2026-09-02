'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  Languages,
  RotateCcw,
  Sparkles,
  ArrowLeft,
  Quote,
  CheckCircle2,
  Clock,
  Flame,
  BookOpen,
} from 'lucide-react';
import Link from 'next/link';
import { submitSrsReviewAction } from '@/actions/srs.action';
import { SrsRating } from '@/services/srs.service';
import { SrsCompletedView } from './SrsCompletedView';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface SrsWord {
  id: string;
  word: string;
  meaning: string;
  definition?: string | null;
  example?: string | null;
  partOfSpeech: string;
  pronunciation?: string | null;
  imageUrl?: string | null;
  topicName?: string;
  srs?: {
    status: string;
    interval: number;
    easeFactor: number;
    repetitions: number;
  };
}

interface SrsReviewSessionClientProps {
  initialWords: SrsWord[];
  streakDays?: number;
}

export function SrsReviewSessionClient({
  initialWords,
  streakDays = 0,
}: SrsReviewSessionClientProps) {
  const [words, setWords] = useState<SrsWord[]>(initialWords);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState<string | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // Performance tracking
  const [reviewedCount, setReviewedCount] = useState(0);
  const [goodEasyCount, setGoodEasyCount] = useState(0);
  const startTimeRef = useRef<number>(Date.now());
  const [durationSeconds, setDurationSeconds] = useState(0);

  const currentWord = words[currentIndex];

  // Text to Speech
  const speak = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Keyboard Shortcuts: Space (Reveal), 1 (Again), 2 (Hard), 3 (Good), 4 (Easy), R (Pronounce)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isCompleted || !currentWord || isSubmitting) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsAnswerRevealed(true);
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        speak(currentWord.word);
      } else if (isAnswerRevealed) {
        if (e.key === '1') {
          e.preventDefault();
          handleRate('again');
        } else if (e.key === '2') {
          e.preventDefault();
          handleRate('hard');
        } else if (e.key === '3') {
          e.preventDefault();
          handleRate('good');
        } else if (e.key === '4') {
          e.preventDefault();
          handleRate('easy');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAnswerRevealed, currentWord, isCompleted, isSubmitting]);

  // Handle User SRS Rating
  const handleRate = async (rating: SrsRating) => {
    if (!currentWord || isSubmitting) return;
    setIsSubmitting(true);

    const isGoodRecall = rating === 'good' || rating === 'easy';
    if (isGoodRecall) {
      setGoodEasyCount((prev) => prev + 1);
    }
    setReviewedCount((prev) => prev + 1);

    let feedbackText = '';
    if (rating === 'again') feedbackText = 'Ôn lại sau 10 phút';
    else if (rating === 'hard') feedbackText = 'Ôn lại sau 1 ngày';
    else if (rating === 'good') feedbackText = 'Ôn lại sau 3 ngày';
    else if (rating === 'easy') feedbackText = 'Ôn lại sau 7 ngày';

    setSessionFeedback(feedbackText);

    try {
      await submitSrsReviewAction(currentWord.id, rating);
    } catch (e) {
      console.error('Failed to submit SRS review:', e);
    }

    // If rated 'again', push to end of current queue so user remembers today!
    if (rating === 'again') {
      setWords((prev) => [...prev, currentWord]);
    }

    // Move to next word smoothly
    setTimeout(() => {
      setSessionFeedback(null);
      setIsAnswerRevealed(false);
      setIsSubmitting(false);

      if (currentIndex + 1 >= words.length && rating !== 'again') {
        setDurationSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
        setIsCompleted(true);
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    }, 450);
  };

  // ── 1. COMPLETED VIEW ──
  if (isCompleted || words.length === 0) {
    return (
      <SrsCompletedView
        reviewedCount={reviewedCount}
        goodEasyCount={goodEasyCount}
        durationSeconds={durationSeconds || 30}
        streakDays={streakDays}
        onRestartSession={() => {
          setWords([...initialWords]);
          setCurrentIndex(0);
          setIsAnswerRevealed(false);
          setIsCompleted(false);
          setReviewedCount(0);
          setGoodEasyCount(0);
          startTimeRef.current = Date.now();
        }}
      />
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / words.length) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto py-4 sm:py-8 space-y-6">
      {/* ── Top Bar with Back & Progress ── */}
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/review"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Thoát phiên ôn</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-muted-foreground">
            {currentIndex + 1} / {words.length}
          </span>
          <div className="w-28 sm:w-40 h-2 bg-muted rounded-full overflow-hidden border border-border/60">
            <div
              className="bg-brand h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Main Flashcard Card ── */}
      <div className="relative min-h-[380px] sm:min-h-[420px] rounded-3xl bg-card border-2 border-border/80 p-6 sm:p-10 flex flex-col justify-between shadow-[0_8px_0_0_theme(colors.border)] overflow-hidden">
        {/* Floating feedback tag */}
        <AnimatePresence>
          {sessionFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-4 right-4 z-20 px-3.5 py-1 bg-brand text-white text-xs font-black rounded-2xl shadow-xs"
            >
              {sessionFeedback}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Card Header (Part of Speech & Topic Tag) */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
          <span className="text-[10px] font-black uppercase tracking-wider text-brand bg-brand/10 px-3 py-1 rounded-xl border border-brand/20">
            {currentWord.partOfSpeech || 'Vocabulary'}
          </span>
          <span className="text-xs font-bold text-muted-foreground">
            {currentWord.topicName || 'Từ vựng'}
          </span>
        </div>

        {/* Center: Word, Phonetic, Audio & Examples */}
        <div className="space-y-4 py-4 my-auto text-center">
          {/* Main Word */}
          <h1 className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
            {currentWord.word}
          </h1>

          {/* Phonetic & TTS button */}
          <div className="inline-flex items-center justify-center gap-2 px-3.5 py-1 rounded-xl bg-muted/60 border border-border/70">
            <span className="font-mono text-xs sm:text-sm font-semibold text-muted-foreground">
              {currentWord.pronunciation || '/.../'}
            </span>
            <button
              onClick={() => speak(currentWord.word)}
              title="Nghe phát âm (R)"
              className="p-1 rounded-lg text-brand hover:bg-brand/10 transition-colors cursor-pointer"
            >
              <Volume2 className="h-4 w-4" />
            </button>
          </div>

          {/* Example Sentence */}
          {currentWord.example && (
            <div className="p-3.5 rounded-2xl bg-muted/40 border-2 border-border/60 max-w-lg mx-auto text-left flex items-start gap-2.5">
              <Quote className="h-4 w-4 text-brand shrink-0 mt-0.5 rotate-180" />
              <p className="text-xs sm:text-sm text-muted-foreground font-semibold italic leading-relaxed">
                {currentWord.example}
              </p>
            </div>
          )}

          {/* Hidden/Revealed Meaning */}
          <div className="min-h-[70px] flex items-center justify-center pt-2">
            {!isAnswerRevealed ? (
              <button
                onClick={() => setIsAnswerRevealed(true)}
                className="btn-3d-duo px-7 py-3.5 rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Hiện đáp án (Space)</span>
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-1"
              >
                <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                  {currentWord.meaning}
                </p>
                {currentWord.definition && (
                  <p className="text-xs text-muted-foreground font-medium italic max-w-md mx-auto line-clamp-2">
                    {currentWord.definition}
                  </p>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* ── 4 SRS Rating Buttons (Shown after answer is revealed) ── */}
        <div className="border-t border-border/60 pt-4">
          {isAnswerRevealed ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* Again */}
              <button
                disabled={isSubmitting}
                onClick={() => handleRate('again')}
                className="p-3 rounded-2xl bg-rose-500 hover:brightness-105 text-white font-black text-xs shadow-[0_4px_0_0_#9f1239] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
              >
                <div className="uppercase">Again (1)</div>
                <div className="text-[10px] text-white/80 font-bold mt-0.5">10 phút</div>
              </button>

              {/* Hard */}
              <button
                disabled={isSubmitting}
                onClick={() => handleRate('hard')}
                className="p-3 rounded-2xl bg-amber-500 hover:brightness-105 text-white font-black text-xs shadow-[0_4px_0_0_#b45309] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
              >
                <div className="uppercase">Hard (2)</div>
                <div className="text-[10px] text-white/80 font-bold mt-0.5">1 ngày</div>
              </button>

              {/* Good */}
              <button
                disabled={isSubmitting}
                onClick={() => handleRate('good')}
                className="p-3 rounded-2xl bg-sky-500 hover:brightness-105 text-white font-black text-xs shadow-[0_4px_0_0_#0369a1] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
              >
                <div className="uppercase">Good (3)</div>
                <div className="text-[10px] text-white/80 font-bold mt-0.5">3 ngày</div>
              </button>

              {/* Easy */}
              <button
                disabled={isSubmitting}
                onClick={() => handleRate('easy')}
                className="p-3 rounded-2xl bg-duo hover:brightness-105 text-duo-foreground font-black text-xs shadow-[0_4px_0_0_var(--duo-dark)] active:translate-y-1 active:shadow-none transition-all cursor-pointer flex flex-col items-center justify-center disabled:opacity-50"
              >
                <div className="uppercase">Easy (4)</div>
                <div className="text-[10px] text-white/80 font-bold mt-0.5">7 ngày</div>
              </button>
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground font-medium">
              Bấm <strong className="text-foreground">Space</strong> hoặc nút <strong className="text-foreground">&quot;Hiện đáp án&quot;</strong> để mở các mức đánh giá ghi nhớ.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
