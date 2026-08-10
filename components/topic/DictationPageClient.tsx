'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DictationMode } from '@/components/topic/DictationMode';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';

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

  const speak = (text: string) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    window.speechSynthesis.speak(u);
  };

  const initDictationGame = () => {
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

  // Initialize dictation game on mount
  useEffect(() => {
    if (words.length > 0) {
      initDictationGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  return (
    <DictationMode
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
        setIsDictationCorrect(correct);
        setIsDictationChecked(true);
        if (correct) setDictationScore((p) => p + 1);
      }}
      onNext={() => {
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
      }}
      onRestart={initDictationGame}
      onBackToList={() => router.push(`/vocabulary/topic/${topicId}`)}
      speak={speak}
    />
  );
}
