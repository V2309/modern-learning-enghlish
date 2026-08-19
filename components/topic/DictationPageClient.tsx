'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DictationMode } from '@/components/topic/DictationMode';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';

const AUTO_NEXT_DELAY = 1500; // ms

export default function DictationPageClient() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const {
    words,
    dictationQuestions,
    dictationIndex,
    typedWord,
    isDictationChecked,
    isDictationCorrect,
    dictationScore,
    isDictationFinished,
    setDictationQuestions,
    setDictationIndex,
    setTypedWord,
    setIsDictationChecked,
    setIsDictationCorrect,
    setDictationScore,
    setIsDictationFinished,
  } = useTopicDetailStore();

  const autoNextTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasFailedRef = useRef(false); // true if user got current word wrong on first try

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  const goNext = () => {
    if (autoNextTimerRef.current) { clearTimeout(autoNextTimerRef.current); autoNextTimerRef.current = null; }
    hasFailedRef.current = false; // reset for next word
    if (dictationIndex + 1 < dictationQuestions.length) {
      const nextIndex = dictationIndex + 1;
      setDictationIndex(nextIndex);
      setTypedWord('');
      setIsDictationChecked(false);
      setIsDictationCorrect(false);
      setTimeout(() => speak(dictationQuestions[nextIndex].word), 300);
    } else {
      setIsDictationFinished(true);
    }
  };

  const handleRetry = () => {
    if (autoNextTimerRef.current) { clearTimeout(autoNextTimerRef.current); autoNextTimerRef.current = null; }
    hasFailedRef.current = true; // mark: first attempt was wrong
    setTypedWord('');
    setIsDictationChecked(false);
    setIsDictationCorrect(false);
  };

  const initDictationGame = () => {
    if (autoNextTimerRef.current) { clearTimeout(autoNextTimerRef.current); autoNextTimerRef.current = null; }
    hasFailedRef.current = false;
    if (words.length === 0) return;
    const subset = [...words].sort(() => 0.5 - Math.random());
    setDictationQuestions(subset);
    setDictationIndex(0);
    setTypedWord('');
    setIsDictationChecked(false);
    setIsDictationCorrect(false);
    setDictationScore(0);
    setIsDictationFinished(false);
    setTimeout(() => speak(subset[0].word), 400);
  };

  useEffect(() => {
    if (words.length > 0) initDictationGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  // Cleanup on unmount
  useEffect(() => () => { if (autoNextTimerRef.current) clearTimeout(autoNextTimerRef.current); }, []);

  return (
    <DictationMode
      dictationQuestions={dictationQuestions}
      dictationIndex={dictationIndex}
      typedWord={typedWord}
      isDictationChecked={isDictationChecked}
      isDictationCorrect={isDictationCorrect}
      dictationScore={dictationScore}
      isDictationFinished={isDictationFinished}
      autoNextDelay={AUTO_NEXT_DELAY}
      onTypedWordChange={setTypedWord}
      onCheck={() => {
        if (!typedWord.trim()) return;
        const correct = typedWord.trim().toLowerCase() === dictationQuestions[dictationIndex].word.trim().toLowerCase();
        setIsDictationCorrect(correct);
        setIsDictationChecked(true);
        if (correct) {
          // Only score if first attempt was correct (no retry)
          if (!hasFailedRef.current) {
            setDictationScore((p) => p + 1);
          }
          autoNextTimerRef.current = setTimeout(goNext, AUTO_NEXT_DELAY);
        }
      }}
      onNext={goNext}
      onRetry={handleRetry}
      onRestart={initDictationGame}
      onBackToList={() => router.push(`/vocabulary/topic/${topicId}`)}
      speak={speak}
    />
  );
}
