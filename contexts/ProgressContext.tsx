import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PlanId, getPlanById, isFixedDurationPlan } from '../data/plans';

const STORAGE_KEY = '@fitness_face_progress';

// ============================================
// MODE TEST - Mettre à false pour la production
// ============================================
const TEST_MODE = true; // true = progression immédiate, false = attendre 02h Paris

// Structure d'une routine terminée
export interface CompletedRoutine {
  routineName: string;
  dayNumber: number;
  completedAt: string; // ISO timestamp
  bonusCompleted?: boolean; // Exercice bonus effectué ?
}

// Structure d'un bonus terminé
export interface CompletedBonus {
  dayNumber: number;
  exerciseName: string;
  completedAt: string; // ISO timestamp
}

interface ProgressData {
  isPaid: boolean;
  selectedPlanId: PlanId | null;
  selectedPlanName: string;
  // Date de début du programme (ISO)
  programStartDate: string | null;
  // Liste des routines terminées avec détails
  completedRoutines: CompletedRoutine[];
  // Liste des bonus terminés
  completedBonuses: CompletedBonus[];
  // Streak (jours d'affilée)
  streak: number;
  // Dernier jour de Paris où une routine a été terminée (YYYY-MM-DD)
  lastCompletedParisDate: string | null;
}

interface ProgressContextType extends ProgressData {
  // Actions
  completePurchase: (planId: PlanId, planName: string) => Promise<void>;
  completeDay: (dayNumber: number, routineName: string) => Promise<void>;
  completeBonusExercise: (dayNumber: number, exerciseName: string) => Promise<void>;
  resetProgress: () => Promise<void>;

  // Données calculées
  isLoading: boolean;
  // Jour actuel du programme (basé sur l'heure de Paris)
  currentDay: number;
  // Total de jours du programme (null si abonnement)
  totalDays: number | null;
  // Nombre de jours complétés
  completedDaysCount: number;
  // Nombre de bonus complétés
  completedBonusesCount: number;
  // Liste des numéros de jours complétés
  completedDayNumbers: number[];
  // Est-ce que la routine du jour actuel est terminée ?
  hasCompletedTodayRoutine: boolean;
  // Est-ce que le bonus du jour actuel est terminé ?
  hasCompletedTodayBonus: boolean;
  // Est-ce un programme à durée fixe ?
  isFixedProgram: boolean;
  // Pourcentage de progression (null si abonnement)
  progressPercent: number | null;
  // Jours restants (null si abonnement)
  daysRemaining: number | null;
}

const defaultProgress: ProgressData = {
  isPaid: false,
  selectedPlanId: null,
  selectedPlanName: '',
  programStartDate: null,
  completedRoutines: [],
  completedBonuses: [],
  streak: 0,
  lastCompletedParisDate: null,
};

const ProgressContext = createContext<ProgressContextType | undefined>(undefined);

// ============================================
// UTILITAIRES PARIS TIME
// ============================================

/**
 * Retourne la date actuelle à Paris au format YYYY-MM-DD
 * Le "jour" change à 02:00 du matin heure de Paris
 */
function getParisDate(): string {
  const now = new Date();

  // Utiliser Intl.DateTimeFormat pour obtenir les composants de date à Paris
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Paris',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value || '2024';
  const month = parts.find(p => p.type === 'month')?.value || '01';
  const day = parts.find(p => p.type === 'day')?.value || '01';
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '12', 10);

  // Construire la date
  let parisDate = `${year}-${month}-${day}`;

  // Si avant 02:00, on considère que c'est encore le jour précédent
  if (hour < 2) {
    const date = new Date(`${parisDate}T12:00:00`);
    date.setDate(date.getDate() - 1);
    parisDate = date.toISOString().split('T')[0];
  }

  return parisDate;
}

/**
 * Retourne la date de Paris d'hier (pour le calcul de streak)
 */
function getYesterdayParisDate(): string {
  const today = getParisDate();
  const date = new Date(`${today}T12:00:00`);
  date.setDate(date.getDate() - 1);
  return date.toISOString().split('T')[0];
}

/**
 * Calcule le numéro du jour actuel depuis le début du programme
 * Basé sur l'heure de Paris avec changement à 02:00
 */
function calculateCurrentDay(programStartDate: string | null): number {
  if (!programStartDate) return 1;

  const startDate = new Date(`${programStartDate}T12:00:00`);
  const todayParis = getParisDate();
  const today = new Date(`${todayParis}T12:00:00`);

  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  // Jour 1 = premier jour, pas jour 0
  return Math.max(1, diffDays + 1);
}

/**
 * En mode test: le jour actuel = dernier jour complété + 1
 * Permet de tester les routines sans attendre
 */
function calculateCurrentDayTestMode(completedRoutines: CompletedRoutine[]): number {
  if (completedRoutines.length === 0) return 1;

  const maxCompletedDay = Math.max(...completedRoutines.map(r => r.dayNumber));
  return maxCompletedDay + 1;
}

// ============================================
// PROVIDER
// ============================================

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
        const parsed = JSON.parse(stored);
        // Migration: convertir l'ancien format si nécessaire
        if (parsed.completedDays && !parsed.completedRoutines) {
          parsed.completedRoutines = parsed.completedDays.map((day: number) => ({
            routineName: 'Routine',
            dayNumber: day,
            completedAt: new Date().toISOString(),
          }));
          delete parsed.completedDays;
        }
        // Migration: ajouter programStartDate si absent
        if (!parsed.programStartDate && parsed.isPaid) {
          parsed.programStartDate = getParisDate();
        }
        // Migration: convertir lastCompletedDate en lastCompletedParisDate
        if (parsed.lastCompletedDate && !parsed.lastCompletedParisDate) {
          parsed.lastCompletedParisDate = parsed.lastCompletedDate;
          delete parsed.lastCompletedDate;
        }
        // Migration: ajouter completedBonuses si absent
        if (!parsed.completedBonuses) {
          parsed.completedBonuses = [];
        }
        setProgress(parsed);
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

  const completePurchase = async (planId: PlanId, planName: string) => {
    const newProgress: ProgressData = {
      ...defaultProgress,
      isPaid: true,
      selectedPlanId: planId,
      selectedPlanName: planName,
      programStartDate: getParisDate(),
    };
    await saveProgress(newProgress);
  };

  const completeDay = async (dayNumber: number, routineName: string) => {
    const todayParis = getParisDate();
    const yesterdayParis = getYesterdayParisDate();

    // Vérifier si ce jour a déjà été complété
    const alreadyCompleted = progress.completedRoutines.some(
      (r) => r.dayNumber === dayNumber
    );
    if (alreadyCompleted) {
      return;
    }

    // Calculer le nouveau streak
    let newStreak = 1;

    if (TEST_MODE) {
      // En mode test: streak basé sur les jours consécutifs complétés
      // Vérifie si le jour précédent (dayNumber - 1) a été complété
      const previousDayCompleted = progress.completedRoutines.some(
        (r) => r.dayNumber === dayNumber - 1
      );
      if (previousDayCompleted) {
        newStreak = progress.streak + 1;
      } else if (dayNumber === 1) {
        // Premier jour du programme
        newStreak = 1;
      } else {
        // Jour sauté, reset streak
        newStreak = 1;
      }
    } else {
      // En mode production: streak basé sur les dates Paris
      if (progress.lastCompletedParisDate === yesterdayParis) {
        // Continue le streak
        newStreak = progress.streak + 1;
      } else if (progress.lastCompletedParisDate === todayParis) {
        // Déjà complété aujourd'hui, garde le streak
        newStreak = progress.streak;
      }
      // Sinon, streak reset à 1
    }

    const newRoutine: CompletedRoutine = {
      routineName,
      dayNumber,
      completedAt: new Date().toISOString(),
      bonusCompleted: false,
    };

    const newProgress: ProgressData = {
      ...progress,
      completedRoutines: [...progress.completedRoutines, newRoutine],
      streak: newStreak,
      lastCompletedParisDate: todayParis,
    };

    await saveProgress(newProgress);
  };

  /**
   * Marquer l'exercice bonus comme terminé pour un jour donné
   * L'exercice bonus n'affecte PAS le streak ou la progression principale
   * Il ajoute juste une mention "Exercice bonus effectué"
   */
  const completeBonusExercise = async (dayNumber: number, exerciseName: string) => {
    // Vérifier si le bonus de ce jour a déjà été complété
    const alreadyCompleted = progress.completedBonuses.some(
      (b) => b.dayNumber === dayNumber
    );
    if (alreadyCompleted) {
      return;
    }

    const newBonus: CompletedBonus = {
      dayNumber,
      exerciseName,
      completedAt: new Date().toISOString(),
    };

    // Mettre à jour la routine correspondante si elle existe
    const updatedRoutines = progress.completedRoutines.map((routine) => {
      if (routine.dayNumber === dayNumber) {
        return { ...routine, bonusCompleted: true };
      }
      return routine;
    });

    const newProgress: ProgressData = {
      ...progress,
      completedRoutines: updatedRoutines,
      completedBonuses: [...progress.completedBonuses, newBonus],
    };

    await saveProgress(newProgress);
  };

  const resetProgress = async () => {
    await saveProgress(defaultProgress);
  };

  // ============================================
  // VALEURS CALCULÉES
  // ============================================

  const selectedPlan = progress.selectedPlanId
    ? getPlanById(progress.selectedPlanId)
    : null;

  // Durée totale du programme (null si abonnement)
  const totalDays = selectedPlan?.durationDays ?? null;

  // Est-ce un programme à durée fixe ?
  const isFixedProgram = progress.selectedPlanId
    ? isFixedDurationPlan(progress.selectedPlanId)
    : false;

  // Jour actuel du programme
  // En mode test: basé sur les jours complétés, sinon basé sur la date Paris
  const currentDay = TEST_MODE
    ? calculateCurrentDayTestMode(progress.completedRoutines)
    : calculateCurrentDay(progress.programStartDate);

  // Nombre de jours complétés
  const completedDaysCount = progress.completedRoutines.length;

  // Nombre de bonus complétés
  const completedBonusesCount = progress.completedBonuses.length;

  // Liste des numéros de jours complétés
  const completedDayNumbers = progress.completedRoutines.map((r) => r.dayNumber);

  // Est-ce que la routine du jour actuel est terminée ?
  const hasCompletedTodayRoutine = completedDayNumbers.includes(currentDay);

  // Est-ce que le bonus du jour actuel est terminé ?
  const hasCompletedTodayBonus = progress.completedBonuses.some(
    (b) => b.dayNumber === currentDay
  );

  // Pourcentage de progression (null si abonnement)
  const progressPercent = isFixedProgram && totalDays
    ? (completedDaysCount / totalDays) * 100
    : null;

  // Jours restants (null si abonnement)
  const daysRemaining = isFixedProgram && totalDays
    ? Math.max(0, totalDays - completedDaysCount)
    : null;

  return (
    <ProgressContext.Provider
      value={{
        ...progress,
        completePurchase,
        completeDay,
        completeBonusExercise,
        resetProgress,
        isLoading,
        currentDay,
        totalDays,
        completedDaysCount,
        completedBonusesCount,
        completedDayNumbers,
        hasCompletedTodayRoutine,
        hasCompletedTodayBonus,
        isFixedProgram,
        progressPercent,
        daysRemaining,
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
