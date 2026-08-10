'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TranslateMode } from '@/components/topic/TranslateMode';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';

export default function TranslatePageClient() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const {
    words,
    translateQuestions,
    translateIndex,
    translateInput,
    isTranslateChecked,
    isTranslateCorrect,
    translateScore,
    isTranslateFinished,
    setTranslateQuestions,
    setTranslateIndex,
    setTranslateInput,
    setIsTranslateChecked,
    setIsTranslateCorrect,
    setTranslateScore,
    setIsTranslateFinished,
  } = useTopicDetailStore();

  const initTranslateGame = () => {
    if (words.length === 0) return;
    const questions = words.map((w) => {
      const questionText = w.example.replace(new RegExp(`\\b${w.word}\\b`, 'gi'), '______');
      return { word: w.word, hint: w.meaning, question: questionText, fullSentence: w.example };
    }).sort(() => 0.5 - Math.random());
    setTranslateQuestions(questions);
    setTranslateIndex(0);
    setTranslateInput('');
    setIsTranslateChecked(false);
    setIsTranslateCorrect(false);
    setTranslateScore(0);
    setIsTranslateFinished(false);
  };

  // Initialize translation game on mount
  useEffect(() => {
    if (words.length > 0) {
      initTranslateGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  return (
    <TranslateMode
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
        setIsTranslateCorrect(correct);
        setIsTranslateChecked(true);
        if (correct) setTranslateScore((p) => p + 1);
      }}
      onNext={() => {
        if (translateIndex + 1 < translateQuestions.length) {
          setTranslateIndex((p) => p + 1);
          setTranslateInput('');
          setIsTranslateChecked(false);
          setIsTranslateCorrect(false);
        } else {
          setIsTranslateFinished(true);
        }
      }}
      onRestart={initTranslateGame}
      onBackToList={() => router.push(`/vocabulary/topic/${topicId}`)}
    />
  );
}
