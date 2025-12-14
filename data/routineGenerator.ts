// ============================================
// GÉNÉRATEUR DE ROUTINES - FITNESS FACE
// Système complet avec espacement et renouvellement
// ============================================

import { PlanId } from './plans';
import {
  Exercise,
  IntensityLevel,
  jawlineExercises,
  doubleChinExercises,
  getSeriesCount,
  getIntensityLevel,
} from './exercises';
import { getExerciseDisplayName, generateRoutineName } from './exerciseNameVariants';
import { generateBonusExercise as generateBonusFromPool } from './bonusExercises';

// ============================================
// CONFIGURATION
// ============================================

const MAX_EXERCISES_PER_ROUTINE = 3;
const MIN_SPACING_DAYS = 4; // Espacement minimum entre répétitions d'un exercice

// ============================================
// TYPES
// ============================================

export interface ExerciseStep {
  exerciseId: string;
  exerciseNumber: number;
  baseName: string;
  displayName: string; // Nom avec intensité (ex: "Jaw Push Forward (Hard)")
  description: string;
  instructions: string;
  seriesCount: number;
  durationPerSeries: number; // en secondes
  totalDuration: number; // en secondes
  order: number;
  intensity: IntensityLevel;
}

export interface BonusExercise {
  exerciseId: string;
  baseName: string;
  displayName: string;
  description: string;
  instructions: string;
  seriesCount: number;
  durationPerSeries: number;
}

export interface DailyRoutine {
  dayNumber: number;
  dayName: string;
  weekNumber: number;
  weekTheme: string;
  routineName: string;
  steps: ExerciseStep[];
  bonus: BonusExercise;
  totalDurationMinutes: number;
  intensity: IntensityLevel;
  programType: 'jawline' | 'double_chin' | 'all_in_one';
}

// ============================================
// ALGORITHME D'ESPACEMENT INTELLIGENT
// ============================================

/**
 * Génère la séquence d'exercices pour tout le programme
 * en respectant l'espacement minimum entre répétitions
 */
function generateExerciseSequence(
  exerciseCount: number,
  totalDays: number,
  exercisesPerDay: number = MAX_EXERCISES_PER_ROUTINE
): number[][] {
  const sequence: number[][] = [];
  const lastUsed: Map<number, number> = new Map(); // exercice -> dernier jour utilisé

  for (let day = 1; day <= totalDays; day++) {
    const dayExercises: number[] = [];
    const availableExercises: number[] = [];

    // Trouver les exercices disponibles (espacement respecté)
    for (let exNum = 1; exNum <= exerciseCount; exNum++) {
      const lastDay = lastUsed.get(exNum) || 0;
      if (day - lastDay >= MIN_SPACING_DAYS || lastDay === 0) {
        availableExercises.push(exNum);
      }
    }

    // Sélectionner les exercices pour ce jour
    // Utiliser un offset basé sur le jour pour varier la sélection
    const offset = (day - 1) % exerciseCount;

    for (let i = 0; i < exercisesPerDay && dayExercises.length < exercisesPerDay; i++) {
      // Priorité aux exercices non utilisés récemment
      let selectedIndex = (offset + i) % availableExercises.length;

      if (availableExercises.length > 0) {
        const selected = availableExercises[selectedIndex];
        if (!dayExercises.includes(selected)) {
          dayExercises.push(selected);
          lastUsed.set(selected, day);
          // Retirer de la liste disponible
          availableExercises.splice(selectedIndex, 1);
        }
      }
    }

    // Si on n'a pas assez d'exercices, prendre les moins récemment utilisés
    while (dayExercises.length < exercisesPerDay) {
      let oldestExercise = 1;
      let oldestDay = Infinity;

      for (let exNum = 1; exNum <= exerciseCount; exNum++) {
        if (!dayExercises.includes(exNum)) {
          const lastDay = lastUsed.get(exNum) || 0;
          if (lastDay < oldestDay) {
            oldestDay = lastDay;
            oldestExercise = exNum;
          }
        }
      }

      dayExercises.push(oldestExercise);
      lastUsed.set(oldestExercise, day);
    }

    sequence.push(dayExercises);
  }

  return sequence;
}

// ============================================
// THÈMES DES SEMAINES
// ============================================

function getWeekTheme(weekNumber: number, totalWeeks: number): string {
  const progress = weekNumber / totalWeeks;

  if (progress <= 0.15) return `Semaine ${weekNumber} – Éveil & Initiation`;
  if (progress <= 0.30) return `Semaine ${weekNumber} – Fondations`;
  if (progress <= 0.45) return `Semaine ${weekNumber} – Activation`;
  if (progress <= 0.60) return `Semaine ${weekNumber} – Renforcement`;
  if (progress <= 0.75) return `Semaine ${weekNumber} – Intensification`;
  if (progress <= 0.90) return `Semaine ${weekNumber} – Sculpture`;
  return `Semaine ${weekNumber} – Maîtrise`;
}

// Noms de routines: voir exerciseNameVariants.ts pour le pool complet

// ============================================
// CRÉATION D'UN STEP D'EXERCICE
// ============================================

function createExerciseStep(
  exercise: Exercise,
  order: number,
  intensity: IntensityLevel,
  dayNumber: number
): ExerciseStep {
  const seriesCount = getSeriesCount(intensity);
  const durationPerSeries = exercise.baseDurationSeconds;

  return {
    exerciseId: exercise.id,
    exerciseNumber: exercise.number,
    baseName: exercise.name,
    displayName: getExerciseDisplayName(exercise.id, intensity, dayNumber),
    description: exercise.description,
    instructions: exercise.instructions,
    seriesCount,
    durationPerSeries,
    totalDuration: seriesCount * durationPerSeries,
    order,
    intensity,
  };
}

// ============================================
// CRÉATION D'UN EXERCICE BONUS (Pool de 20 exercices)
// ============================================

function createBonusExercise(
  dayNumber: number,
  totalDays: number
): BonusExercise {
  // Utilise le pool de 20 exercices bonus avec rotation intelligente
  const bonus = generateBonusFromPool(dayNumber, totalDays);

  return {
    exerciseId: bonus.exerciseId,
    baseName: bonus.name,
    displayName: bonus.displayName,
    description: bonus.category,
    instructions: bonus.instruction,
    seriesCount: bonus.seriesCount,
    durationPerSeries: bonus.durationPerSeries,
  };
}

// ============================================
// GÉNÉRATEUR JAWLINE (30 jours, 90 jours)
// ============================================

// Cache pour les séquences générées
const jawlineSequence90 = generateExerciseSequence(15, 90);
const jawlineSequence30 = generateExerciseSequence(15, 30);

export function generateJawlineRoutine(dayNumber: number, totalDays: number): DailyRoutine {
  const sequence = totalDays === 90 ? jawlineSequence90 : jawlineSequence30;
  const exerciseNumbers = sequence[dayNumber - 1] || [1, 2, 3];

  const weekNumber = Math.ceil(dayNumber / 7);
  const totalWeeks = Math.ceil(totalDays / 7);
  const intensity = getIntensityLevel(dayNumber, totalDays);

  const steps: ExerciseStep[] = exerciseNumbers.map((exNum, index) => {
    const exercise = jawlineExercises[exNum - 1];
    return createExerciseStep(exercise, index + 1, intensity, dayNumber);
  });

  const totalSeconds = steps.reduce((sum, step) => sum + step.totalDuration, 0);

  return {
    dayNumber,
    dayName: `Jour ${dayNumber}`,
    weekNumber,
    weekTheme: getWeekTheme(weekNumber, totalWeeks),
    routineName: generateRoutineName(dayNumber, 'jawline'),
    steps,
    bonus: createBonusExercise(dayNumber, totalDays),
    totalDurationMinutes: Math.ceil(totalSeconds / 60),
    intensity,
    programType: 'jawline',
  };
}

// ============================================
// GÉNÉRATEUR DOUBLE MENTON (30 jours, 60 jours)
// ============================================

const doubleChinSequence60 = generateExerciseSequence(12, 60);
const doubleChinSequence30 = generateExerciseSequence(12, 30);

export function generateDoubleChinRoutine(dayNumber: number, totalDays: number): DailyRoutine {
  const sequence = totalDays === 60 ? doubleChinSequence60 : doubleChinSequence30;
  const exerciseNumbers = sequence[dayNumber - 1] || [1, 2, 3];

  const weekNumber = Math.ceil(dayNumber / 7);
  const totalWeeks = Math.ceil(totalDays / 7);
  const intensity = getIntensityLevel(dayNumber, totalDays);

  const steps: ExerciseStep[] = exerciseNumbers.map((exNum, index) => {
    const exercise = doubleChinExercises[exNum - 1];
    return createExerciseStep(exercise, index + 1, intensity, dayNumber);
  });

  const totalSeconds = steps.reduce((sum, step) => sum + step.totalDuration, 0);

  return {
    dayNumber,
    dayName: `Jour ${dayNumber}`,
    weekNumber,
    weekTheme: getWeekTheme(weekNumber, totalWeeks),
    routineName: generateRoutineName(dayNumber, 'double_chin'),
    steps,
    bonus: createBonusExercise(dayNumber, totalDays),
    totalDurationMinutes: Math.ceil(totalSeconds / 60),
    intensity,
    programType: 'double_chin',
  };
}

// ============================================
// GÉNÉRATEUR TOUT-EN-UN
// ============================================

export function generateAllInOneRoutine(dayNumber: number): DailyRoutine {
  const totalDays = 90; // Programme premium de 90 jours
  const cycleDay = ((dayNumber - 1) % 28) + 1; // Cycle de 28 jours
  const cycleNumber = Math.floor((dayNumber - 1) / 28) + 1;

  // Alternance: Jour 1 = Jawline, Jour 2 = Double Menton, Jour 3 = Mix
  const dayType = dayNumber % 3;

  const weekNumber = Math.ceil(dayNumber / 7);
  const intensity = getIntensityLevel(cycleDay, 28);

  let steps: ExerciseStep[] = [];
  let programType: 'jawline' | 'double_chin' | 'all_in_one' = 'all_in_one';

  if (dayType === 1) {
    // Jawline day
    programType = 'jawline';
    const jawSequence = generateExerciseSequence(15, 28);
    const exerciseNumbers = jawSequence[cycleDay - 1] || [1, 5, 9];

    steps = exerciseNumbers.map((exNum, index) => {
      const exercise = jawlineExercises[exNum - 1];
      return createExerciseStep(exercise, index + 1, intensity, dayNumber);
    });
  } else if (dayType === 2) {
    // Double menton day
    programType = 'double_chin';
    const dcSequence = generateExerciseSequence(12, 28);
    const exerciseNumbers = dcSequence[cycleDay - 1] || [1, 4, 7];

    steps = exerciseNumbers.map((exNum, index) => {
      const exercise = doubleChinExercises[exNum - 1];
      return createExerciseStep(exercise, index + 1, intensity, dayNumber);
    });
  } else {
    // Mix day: 2 jawline + 1 double menton
    programType = 'all_in_one';
    const jawIndex1 = (cycleDay % 15);
    const jawIndex2 = ((cycleDay + 5) % 15);
    const dcIndex = (cycleDay % 12);

    steps = [
      createExerciseStep(jawlineExercises[jawIndex1], 1, intensity, dayNumber),
      createExerciseStep(doubleChinExercises[dcIndex], 2, intensity, dayNumber),
      createExerciseStep(jawlineExercises[jawIndex2], 3, intensity, dayNumber),
    ];
  }

  const totalSeconds = steps.reduce((sum, step) => sum + step.totalDuration, 0);

  return {
    dayNumber,
    dayName: `Jour ${dayNumber} – Cycle ${cycleNumber}`,
    weekNumber,
    weekTheme: `${getWeekTheme(Math.ceil(cycleDay / 7), 4)} (Premium)`,
    routineName: generateRoutineName(dayNumber, programType),
    steps,
    bonus: createBonusExercise(dayNumber, totalDays),
    totalDurationMinutes: Math.ceil(totalSeconds / 60),
    intensity,
    programType,
  };
}

// ============================================
// FONCTION PRINCIPALE
// ============================================

export function getDailyRoutine(planId: PlanId, dayNumber: number): DailyRoutine {
  switch (planId) {
    case 'jawline_90':
      return generateJawlineRoutine(dayNumber, 90);
    case 'jawline_monthly':
      return generateJawlineRoutine(dayNumber, 30);
    case 'double_60':
      return generateDoubleChinRoutine(dayNumber, 60);
    case 'double_monthly':
      return generateDoubleChinRoutine(dayNumber, 30);
    case 'all_in_one':
      return generateAllInOneRoutine(dayNumber);
    default:
      return generateJawlineRoutine(dayNumber, 90);
  }
}

// ============================================
// HELPERS POUR L'AFFICHAGE
// ============================================

export function formatDuration(minutes: number): string {
  if (minutes < 1) return '< 1 min';
  return `${minutes}-${minutes + 2} min`;
}

export function getIntensityLabel(intensity: IntensityLevel): string {
  switch (intensity) {
    case 'normal':
      return 'Normal';
    case 'hard':
      return 'Intense';
    case 'advanced':
      return 'Avancé';
    case 'elite':
      return 'Elite';
  }
}

export function formatSeries(seriesCount: number, duration: number): string {
  return `${seriesCount} séries × ${duration}s`;
}
