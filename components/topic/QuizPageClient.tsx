'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { QuizMode } from '@/components/topic/QuizMode';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';

export default function QuizPageClient() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const {
    words,
    quizQuestions,
    currentQuizIndex,
    selectedQuizAnswer,
    isQuizAnswered,
    quizScore,
    isQuizFinished,
    setQuizQuestions,
    setCurrentQuizIndex,
    setSelectedQuizAnswer,
    setIsQuizAnswered,
    setQuizScore,
    setIsQuizFinished,
  } = useTopicDetailStore();

  const playCorrectSound = () => {
    const audio = new Audio('/Correct_Sound_Effect.mp3');
    audio.volume = 0.8;
    void audio.play().catch(() => {});
  };

  const initQuizGame = () => {
    if (words.length === 0) return;
    const questions = words.map((w) => {
      const others = words.filter((o) => o.id !== w.id).map((o) => o.meaning).sort(() => 0.5 - Math.random()).slice(0, 3);
      while (others.length < 3) others.push('Sử dụng phù hợp cho trường hợp giao tiếp hàng ngày');
      return { word: w.word, correct: w.meaning, options: [w.meaning, ...others].sort(() => 0.5 - Math.random()), partOfSpeech: w.partOfSpeech };
    }).sort(() => 0.5 - Math.random());
    setQuizQuestions(questions);
    setCurrentQuizIndex(0);
    setSelectedQuizAnswer(null);
    setIsQuizAnswered(false);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  // Initialize quiz game on mount
  useEffect(() => {
    if (words.length > 0) {
      initQuizGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  return (
    <QuizMode
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
        if (selectedQuizAnswer === quizQuestions[currentQuizIndex].correct) {
          setQuizScore((p) => p + 1);
          playCorrectSound();
        }
      }}
      onNext={() => {
        if (currentQuizIndex + 1 < quizQuestions.length) {
          setCurrentQuizIndex((p) => p + 1);
          setSelectedQuizAnswer(null);
          setIsQuizAnswered(false);
        } else {
          setIsQuizFinished(true);
        }
      }}
      onRestart={initQuizGame}
      onBackToList={() => router.push(`/vocabulary/topic/${topicId}`)}
    />
  );
}
