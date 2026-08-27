'use client';

import React, { useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { MatchMode, MatchingCard } from '@/components/topic/MatchMode';
import { useTopicDetailStore } from '@/stores/useTopicDetailStore';

export default function MatchPageClient() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.topicId as string;

  const {
    words,
    matchingCards,
    selectedMatch,
    matchSeconds,
    isMatchFinished,
    setMatchingCards,
    setSelectedMatch,
    setMatchSeconds,
    setIsMatchFinished,
  } = useTopicDetailStore();

  const matchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initMatchingGame = () => {
    if (words.length === 0) return;
    const subset = [...words].sort(() => 0.5 - Math.random()).slice(0, 6);
    const wordCards: MatchingCard[] = subset.map((w) => ({
      id: `${w.id}_word`,
      wordId: w.id,
      type: 'word',
      content: w.word,
      isMatched: false,
      isSelected: false,
      isFailed: false,
    }));
    const meaningCards: MatchingCard[] = subset.map((w) => ({
      id: `${w.id}_meaning`,
      wordId: w.id,
      type: 'meaning',
      content: w.meaning,
      isMatched: false,
      isSelected: false,
      isFailed: false,
    }));
    setMatchingCards([...wordCards, ...meaningCards].sort(() => 0.5 - Math.random()));
    setSelectedMatch(null);
    setMatchSeconds(0);
    setIsMatchFinished(false);
    if (matchIntervalRef.current) clearInterval(matchIntervalRef.current);
    matchIntervalRef.current = setInterval(() => setMatchSeconds((p) => p + 1), 1000);
  };

  const handleMatchCardClick = (clickedCard: MatchingCard) => {
    if (clickedCard.isMatched || clickedCard.isFailed) return;
    setMatchingCards((prev) => prev.map((c) => (c.id === clickedCard.id ? { ...c, isSelected: true } : c)));
    if (!selectedMatch) {
      setSelectedMatch(clickedCard);
      return;
    }
    if (selectedMatch.id === clickedCard.id) {
      setMatchingCards((prev) => prev.map((c) => (c.id === clickedCard.id ? { ...c, isSelected: false } : c)));
      setSelectedMatch(null);
      return;
    }
    if (selectedMatch.wordId === clickedCard.wordId && selectedMatch.type !== clickedCard.type) {
      const matchWordId = clickedCard.wordId;
      setMatchingCards((prev) => {
        const next = prev.map((c) => (c.wordId === matchWordId ? { ...c, isMatched: true, isSelected: false } : c));
        const allDone = next.every((c) => c.isMatched);
        if (allDone) {
          setTimeout(() => {
            setIsMatchFinished(true);
            if (matchIntervalRef.current) window.clearInterval(matchIntervalRef.current);
          }, 600);
        }
        return next;
      });
      setSelectedMatch(null);
    } else {
      const fId = selectedMatch.id;
      const sId = clickedCard.id;
      setMatchingCards((prev) => prev.map((c) => ((c.id === fId || c.id === sId) ? { ...c, isFailed: true, isSelected: false } : c)));
      setSelectedMatch(null);
      setTimeout(() => setMatchingCards((prev) => prev.map((c) => ((c.id === fId || c.id === sId) ? { ...c, isFailed: false } : c))), 800);
    }
  };

  // Initialize matching game on mount
  useEffect(() => {
    if (words.length > 0) {
      initMatchingGame();
    }
    return () => {
      if (matchIntervalRef.current) window.clearInterval(matchIntervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [words]);

  return (
    <MatchMode
      matchingCards={matchingCards}
      matchSeconds={matchSeconds}
      isMatchFinished={isMatchFinished}
      onCardClick={handleMatchCardClick}
      onRestart={initMatchingGame}
      onBackToList={() => router.push(`/vocabulary/topic/${topicId}`)}
    />
  );
}
