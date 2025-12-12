import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlanId } from '../data/plans';

const STORAGE_KEY = '@fitness_face_progress';

interface ProgressData {
  isPaid: boolean;
  selectedPlanId: PlanId | null;
  selectedPlanName: string;
  completedDays: number[];
  streak: number;
  lastCompletedDate: string | null;
  totalDays: number;
}

interface ProgressContextType extends ProgressData {
  completePurchase: (planId: PlanId, planName: string, totalDays: number) => Promise<void>;
  completeDay: (dayNumber: number) => Promise<void>;
  resetProgress: () => Promise<void>;
  isLoading: boolean;
}

const defaultProgress: ProgressData = {
  isPaid: false,
  selectedPlanId: null,
  selectedPlanName: '',
  completedDays: [],
  streak: 0,
  lastCompletedDate: null,
  totalDays: 90,
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<ProgressData>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from storage on mount
  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setProgress(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProgress = async (newProgress: ProgressData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const completePurchase = async (planId: PlanId, planName: string, totalDays: number) => {
    const newProgress: ProgressData = {
      ...defaultProgress,
      isPaid: true,
      selectedPlanId: planId,
      selectedPlanName: planName,
      totalDays,
    };
    await saveProgress(newProgress);
  };

  const completeDay = async (dayNumber: number) => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    // Check if already completed today
    if (progress.completedDays.includes(dayNumber)) {
      return;
    }

    // Calculate new streak
    let newStreak = 1;
    if (progress.lastCompletedDate === yesterday) {
      newStreak = progress.streak + 1;
    } else if (progress.lastCompletedDate === today) {
      newStreak = progress.streak;
    }

    const newProgress: ProgressData = {
      ...progress,
      completedDays: [...progress.completedDays, dayNumber],
      streak: newStreak,
      lastCompletedDate: today,
    };

    await saveProgress(newProgress);
  };

  const resetProgress = async () => {
    await saveProgress(defaultProgress);
  };

  return (
    <ProgressContext.Provider
      value={{
        ...progress,
        completePurchase,
        completeDay,
        resetProgress,
        isLoading,
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider');
  }
  return context;
}
