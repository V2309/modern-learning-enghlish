'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { syncAndGetStreakAction } from '@/actions/streak.action';
import { LearningStreakData } from '@/services/dashboard.service';
import { DuolingoStreakModal } from './DuolingoStreakModal';

interface StreakContextType {
  streakData: LearningStreakData | null;
  isLoading: boolean;
  openStreakModal: (forceCelebration?: boolean) => void;
  closeStreakModal: () => void;
  refreshStreak: () => Promise<void>;
}

const StreakContext = createContext<StreakContextType>({
  streakData: null,
  isLoading: false,
  openStreakModal: () => {},
  closeStreakModal: () => {},
  refreshStreak: async () => {},
});

export const useStreak = () => useContext(StreakContext);

export function StreakProvider({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useUser();
  const [streakData, setStreakData] = useState<LearningStreakData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCelebration, setIsCelebration] = useState(false);

  const getLocalDateStr = () => {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60 * 1000);
    return local.toISOString().split('T')[0];
  };

  const refreshStreak = useCallback(async () => {
    if (!isSignedIn) return;
    try {
      setIsLoading(true);
      const res = await syncAndGetStreakAction();
      if (res.success && res.data) {
        setStreakData(res.data);
      }
    } catch (e) {
      console.error('Failed to sync streak:', e);
    } finally {
      setIsLoading(false);
    }
  }, [isSignedIn]);

  // Check on mount if today has been celebrated
  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    let isMounted = true;

    async function initStreak() {
      try {
        setIsLoading(true);
        const res = await syncAndGetStreakAction();
        if (!isMounted) return;

        if (res.success && res.data) {
          setStreakData(res.data);

          const todayStr = getLocalDateStr();
          const lastCelebrated = localStorage.getItem('ling_last_streak_celebrated');

          // If not celebrated yet today, pop up the Duolingo celebration!
          if (lastCelebrated !== todayStr) {
            localStorage.setItem('ling_last_streak_celebrated', todayStr);
            setIsCelebration(true);
            setIsModalOpen(true);
          }
        }
      } catch (e) {
        console.error('Streak init error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initStreak();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn]);

  const openStreakModal = useCallback((forceCelebration = false) => {
    setIsCelebration(forceCelebration);
    setIsModalOpen(true);
  }, []);

  const closeStreakModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  return (
    <StreakContext.Provider
      value={{
        streakData,
        isLoading,
        openStreakModal,
        closeStreakModal,
        refreshStreak,
      }}
    >
      {children}

      {streakData && (
        <DuolingoStreakModal
          isOpen={isModalOpen}
          onClose={closeStreakModal}
          streak={streakData.streak}
          totalActiveDays={streakData.totalActiveDays}
          weeklyCalendar={streakData.weeklyCalendar}
          isNewCelebration={isCelebration}
        />
      )}
    </StreakContext.Provider>
  );
}
