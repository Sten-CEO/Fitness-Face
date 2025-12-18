import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { PlanId, getPlanById, isFixedDurationPlan } from '../data/plans';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import { ProgressDataSchema, validatePlanId } from '../lib/secureStorage';

const STORAGE_KEY = '@fitness_face_progress';

// ============================================
// MODE TEST - Mettre à false pour la production
// ============================================
const TEST_MODE = false; // true = progression immédiate, false = attendre 02h Paris

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
  syncFromCloud: () => Promise<void>;

  // Données calculées
  isLoading: boolean;
  isSyncing: boolean;
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [progress, setProgress] = useState<ProgressData>(defaultProgress);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  // ============================================
  // SUPABASE SYNC FUNCTIONS
  // ============================================

  /**
   * Charger les données depuis Supabase
   */
  const loadFromSupabase = useCallback(async (userId: string): Promise<ProgressData | null> => {
    try {
      // Charger le profil pour program_type et start_date
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('program_type, start_date')
        .eq('id', userId)
        .maybeSingle();

      if (profileError) {
        console.error('Erreur chargement profil:', profileError);
        return null;
      }

      // Charger la progression
      const { data: userProgress, error: progressError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (progressError) {
        console.error('Erreur chargement progression:', progressError);
        return null;
      }

      // Charger l'historique des routines
      const { data: routineHistory, error: historyError } = await supabase
        .from('routine_history')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: true });

      if (historyError) {
        console.error('Erreur chargement historique:', historyError);
        return null;
      }

      // Convertir les données Supabase en ProgressData
      const completedRoutines: CompletedRoutine[] = (routineHistory || []).map(r => ({
        routineName: r.routine_name,
        dayNumber: r.day_index,
        completedAt: r.completed_at,
        bonusCompleted: r.bonus !== null,
      }));

      const completedBonuses: CompletedBonus[] = (routineHistory || [])
        .filter(r => r.bonus !== null)
        .map(r => ({
          dayNumber: r.day_index,
          exerciseName: (r.bonus as { exerciseName?: string })?.exerciseName || 'Bonus',
          completedAt: r.completed_at,
        }));

      // Déterminer isPaid et planName
      const isPaid = !!profile?.program_type;
      const planId = profile?.program_type as PlanId | null;
      const plan = planId ? getPlanById(planId) : null;

      return {
        isPaid,
        selectedPlanId: planId,
        selectedPlanName: plan?.name || '',
        programStartDate: profile?.start_date || null,
        completedRoutines,
        completedBonuses,
        streak: userProgress?.streak || 0,
        lastCompletedParisDate: userProgress?.last_completed_date || null,
      };
    } catch (error) {
      console.error('Erreur loadFromSupabase:', error);
      return null;
    }
  }, []);

  /**
   * Sauvegarder les données vers Supabase
   */
  const saveToSupabase = useCallback(async (userId: string, data: ProgressData) => {
    try {
      // Mettre à jour le profil avec upsert pour éviter les problèmes de timing
      await supabase
        .from('profiles')
        .upsert({
          id: userId,
          program_type: data.selectedPlanId,
          start_date: data.programStartDate,
        }, { onConflict: 'id' });

      // Mettre à jour la progression
      await supabase
        .from('user_progress')
        .upsert({
          user_id: userId,
          current_day: TEST_MODE
            ? calculateCurrentDayTestMode(data.completedRoutines)
            : calculateCurrentDay(data.programStartDate),
          streak: data.streak,
          last_completed_date: data.lastCompletedParisDate,
          days_completed: data.completedRoutines.map(r => r.dayNumber),
          bonus_completed: data.completedBonuses.map(b => b.dayNumber),
        });

    } catch {
      // Erreur silencieuse - les données sont sauvegardées localement
    }
  }, []);

  /**
   * Sauvegarder une routine terminée dans l'historique Supabase
   */
  const saveRoutineToSupabase = useCallback(async (
    userId: string,
    routine: CompletedRoutine,
    programType: string,
    exercises?: object
  ) => {
    try {
      // Vérifier si cette routine existe déjà
      const { data: existing } = await supabase
        .from('routine_history')
        .select('id')
        .eq('user_id', userId)
        .eq('day_index', routine.dayNumber)
        .single();

      if (existing) {
        // Mettre à jour si bonus complété
        if (routine.bonusCompleted) {
          await supabase
            .from('routine_history')
            .update({ bonus: { completed: true } })
            .eq('id', existing.id);
        }
      } else {
        // Créer nouvelle entrée
        await supabase
          .from('routine_history')
          .insert({
            user_id: userId,
            day_index: routine.dayNumber,
            program_type: programType,
            routine_name: routine.routineName,
            completed_at: routine.completedAt,
            exercises: exercises || {},
            bonus: routine.bonusCompleted ? { completed: true } : null,
          });
      }
    } catch (error) {
      console.error('Erreur saveRoutineToSupabase:', error);
    }
  }, []);

  // ============================================
  // LOCAL STORAGE FUNCTIONS
  // ============================================

  const loadFromLocal = async (): Promise<ProgressData | null> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        let parsed;
        try {
          parsed = JSON.parse(stored);
        } catch (parseError) {
          console.error('Failed to parse stored progress:', parseError);
          return null;
        }

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

        // Validate with Zod schema
        const validation = ProgressDataSchema.safeParse(parsed);
        if (!validation.success) {
          console.warn('Progress data validation failed, using migrated data:', validation.error);
          // Return migrated data even if validation fails (for backwards compatibility)
          // but log for monitoring
        }

        // Validate planId if present
        if (parsed.selectedPlanId && !validatePlanId(parsed.selectedPlanId)) {
          console.error('Invalid planId in stored progress:', parsed.selectedPlanId);
          parsed.selectedPlanId = null;
          parsed.isPaid = false;
        }

        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Failed to load from local:', error);
      return null;
    }
  };

  const saveToLocal = async (data: ProgressData) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to local:', error);
    }
  };

  // ============================================
  // MAIN LOAD/SAVE FUNCTIONS
  // ============================================

  const loadProgress = useCallback(async () => {
    setIsLoading(true);

    try {
      if (isAuthenticated && user) {
        // Utilisateur connecté: charger depuis Supabase ET local
        setIsSyncing(true);
        const cloudData = await loadFromSupabase(user.id);
        const localData = await loadFromLocal();

        // Fusionner intelligemment les données
        // Prendre le programme du cloud ou local (priorité cloud si égal)
        // Mais prendre la progression la plus avancée

        const cloudHasProgram = cloudData && cloudData.selectedPlanId;
        const localHasProgram = localData && localData.selectedPlanId;
        const cloudRoutines = cloudData?.completedRoutines?.length || 0;
        const localRoutines = localData?.completedRoutines?.length || 0;

        let finalData: ProgressData;

        if (cloudHasProgram && localHasProgram) {
          // Les deux ont un programme - prendre celui avec le plus de progression
          if (localRoutines > cloudRoutines) {
            // Local a plus de progression - utiliser local et sync vers cloud
            finalData = localData;
            await saveToSupabase(user.id, localData);
            // Aussi sync les routines manquantes vers Supabase
            for (const routine of localData.completedRoutines) {
              await saveRoutineToSupabase(user.id, routine, localData.selectedPlanId!);
            }
          } else {
            // Cloud a autant ou plus - utiliser cloud
            finalData = cloudData;
          }
        } else if (cloudHasProgram) {
          // Seulement cloud a un programme
          finalData = cloudData;
        } else if (localHasProgram) {
          // Seulement local a un programme - sync vers cloud
          finalData = localData;
          await saveToSupabase(user.id, localData);
          for (const routine of localData.completedRoutines) {
            await saveRoutineToSupabase(user.id, routine, localData.selectedPlanId!);
          }
        } else if (cloudData) {
          // Cloud existe mais sans programme
          finalData = cloudData;
        } else if (localData) {
          // Seulement local existe
          finalData = localData;
        } else {
          // Aucune donnée
          finalData = defaultProgress;
        }

        setProgress(finalData);
        await saveToLocal(finalData);
        setIsSyncing(false);
      } else {
        // Utilisateur non connecté: charger depuis local uniquement
        const localData = await loadFromLocal();
        if (localData) {
          setProgress(localData);
        }
      }
    } catch {
      // Fallback local en cas d'erreur
      const localData = await loadFromLocal();
      if (localData) {
        setProgress(localData);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, loadFromSupabase, saveToSupabase, saveRoutineToSupabase]);

  const saveProgress = useCallback(async (newProgress: ProgressData) => {
    // Toujours sauvegarder en local
    await saveToLocal(newProgress);
    setProgress(newProgress);

    // Si connecté, aussi sauvegarder vers Supabase
    if (isAuthenticated && user) {
      await saveToSupabase(user.id, newProgress);
    }
  }, [isAuthenticated, user, saveToSupabase]);

  // ============================================
  // SYNC FROM CLOUD (pour forcer une sync)
  // ============================================

  const syncFromCloud = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    setIsSyncing(true);
    try {
      const cloudData = await loadFromSupabase(user.id);
      if (cloudData) {
        setProgress(cloudData);
        await saveToLocal(cloudData);
      }
    } catch (error) {
      console.error('Sync from cloud failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, user, loadFromSupabase]);

  // ============================================
  // EFFECTS
  // ============================================

  // Track mounted state to prevent state updates after unmount
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Charger les données au montage et quand l'auth change
  useEffect(() => {
    if (!authLoading && isMountedRef.current) {
      loadProgress();
    }
  }, [authLoading, isAuthenticated, user?.id, loadProgress]);

  // ============================================
  // ACTIONS
  // ============================================

  const completePurchase = async (planId: PlanId, planName: string) => {
    const newProgress: ProgressData = {
      ...defaultProgress,
      isPaid: true,
      selectedPlanId: planId,
      selectedPlanName: planName,
      programStartDate: getParisDate(),
    };

    // Toujours sauvegarder en local
    await saveToLocal(newProgress);
    setProgress(newProgress);

    // Forcer la sauvegarde Supabase même si le contexte auth n'est pas à jour
    // Récupérer la session directement depuis Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await saveToSupabase(session.user.id, newProgress);
      }
    } catch {
      // Erreur silencieuse - les données sont sauvegardées localement
    }
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
      const previousDayCompleted = progress.completedRoutines.some(
        (r) => r.dayNumber === dayNumber - 1
      );
      if (previousDayCompleted) {
        newStreak = progress.streak + 1;
      } else if (dayNumber === 1) {
        newStreak = 1;
      } else {
        newStreak = 1;
      }
    } else {
      // En mode production: streak basé sur les dates Paris
      if (progress.lastCompletedParisDate === yesterdayParis) {
        newStreak = progress.streak + 1;
      } else if (progress.lastCompletedParisDate === todayParis) {
        newStreak = progress.streak;
      }
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

    // Sauvegarder la routine dans l'historique Supabase
    if (isAuthenticated && user && progress.selectedPlanId) {
      await saveRoutineToSupabase(user.id, newRoutine, progress.selectedPlanId);
    }
  };

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

    // Mettre à jour dans Supabase
    if (isAuthenticated && user && progress.selectedPlanId) {
      const routine = updatedRoutines.find(r => r.dayNumber === dayNumber);
      if (routine) {
        await saveRoutineToSupabase(user.id, routine, progress.selectedPlanId);
      }
    }
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

  const totalDays = selectedPlan?.durationDays ?? null;

  const isFixedProgram = progress.selectedPlanId
    ? isFixedDurationPlan(progress.selectedPlanId)
    : false;

  const currentDay = TEST_MODE
    ? calculateCurrentDayTestMode(progress.completedRoutines)
    : calculateCurrentDay(progress.programStartDate);

  const completedDaysCount = progress.completedRoutines.length;
  const completedBonusesCount = progress.completedBonuses.length;
  const completedDayNumbers = progress.completedRoutines.map((r) => r.dayNumber);
  const hasCompletedTodayRoutine = completedDayNumbers.includes(currentDay);
  const hasCompletedTodayBonus = progress.completedBonuses.some(
    (b) => b.dayNumber === currentDay
  );

  const progressPercent = isFixedProgram && totalDays
    ? (completedDaysCount / totalDays) * 100
    : null;

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
        syncFromCloud,
        isLoading,
        isSyncing,
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
