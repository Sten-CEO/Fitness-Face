// ============================================
// GÉNÉRATEUR DE ROUTINES QUOTIDIENNES
// ============================================

import { PlanId } from './plans';
import {
  Exercise,
  ExerciseLevel,
  ExerciseVariant,
  jawlineExercises,
  doubleChinExercises,
  createBonusVersion,
} from './exercises';

// ============================================
// TYPES
// ============================================

export interface DailyRoutineStep {
  exerciseId: string;
  exerciseName: string;
  variant: ExerciseVariant;
  order: number;
}

export interface BonusExercise {
  exerciseId: string;
  exerciseName: string;
  variant: ExerciseVariant;
}

export interface DailyRoutine {
  dayNumber: number;
  dayName: string;
  weekTheme: string;
  routineName: string;
  steps: DailyRoutineStep[];
  bonus: BonusExercise;
  totalDurationMinutes: number;
  level: ExerciseLevel;
}

// ============================================
// THÈMES DES SEMAINES
// ============================================

const weekThemes60Days: string[] = [
  'Semaine 1 – Éveil & Découverte',
  'Semaine 2 – Fondations',
  'Semaine 3 – Activation',
  'Semaine 4 – Renforcement',
  'Semaine 5 – Progression',
  'Semaine 6 – Intensification',
  'Semaine 7 – Sculpture',
  'Semaine 8 – Définition',
  'Semaine 9 – Maîtrise',
];

const weekThemes90Days: string[] = [
  'Semaine 1 – Éveil & Initiation',
  'Semaine 2 – Fondamentaux',
  'Semaine 3 – Activation Musculaire',
  'Semaine 4 – Construction',
  'Semaine 5 – Renforcement',
  'Semaine 6 – Progression Visible',
  'Semaine 7 – Intensité Croissante',
  'Semaine 8 – Sculpture Active',
  'Semaine 9 – Définition',
  'Semaine 10 – Affinement',
  'Semaine 11 – Perfection',
  'Semaine 12 – Maîtrise Totale',
  'Semaine 13 – Excellence',
];

const weekThemesSubscription: string[] = [
  'Semaine A – Fondations',
  'Semaine B – Activation',
  'Semaine C – Renforcement',
  'Semaine D – Intensification',
];

// ============================================
// NOMS DE ROUTINES PAR PHASE
// ============================================

const routineNamesDoubleChin: Record<string, string[]> = {
  discovery: [
    'Réveil du Cou',
    'Premier Contact',
    'Initiation Menton',
    'Découverte Cervicale',
    'Base du Drainage',
  ],
  foundation: [
    'Fondations du Cou',
    'Stabilisation Menton',
    'Ancrage Cervical',
    'Construction Base',
    'Assise Musculaire',
  ],
  activation: [
    'Activation Ciblée',
    'Éveil Profond',
    'Stimulation Active',
    'Mise en Route',
    'Dynamique du Cou',
  ],
  reinforcement: [
    'Renforcement Menton',
    'Puissance du Cou',
    'Consolidation',
    'Force Cervicale',
    'Endurance Menton',
  ],
  sculpting: [
    'Sculpture du Menton',
    'Définition Cervicale',
    'Affinement Ciblé',
    'Modelage du Cou',
    'Contour Précis',
  ],
  mastery: [
    'Maîtrise Complète',
    'Excellence du Cou',
    'Perfection Menton',
    'Virtuosité',
    'Art du Contour',
  ],
};

const routineNamesJawline: Record<string, string[]> = {
  discovery: [
    'Éveil de la Mâchoire',
    'Premier Pas Jawline',
    'Initiation Masseter',
    'Découverte Faciale',
    'Base du Sculpt',
  ],
  foundation: [
    'Fondations Jawline',
    'Stabilité Mâchoire',
    'Ancrage Facial',
    'Construction Solide',
    'Assise Masseter',
  ],
  activation: [
    'Activation Jawline',
    'Éveil Musculaire',
    'Stimulation Mâchoire',
    'Mise en Tension',
    'Dynamique Faciale',
  ],
  reinforcement: [
    'Puissance Jawline',
    'Force de la Mâchoire',
    'Consolidation Faciale',
    'Endurance Masseter',
    'Résistance Totale',
  ],
  sculpting: [
    'Sculpture Jawline',
    'Définition Maximale',
    'Affinement Mâchoire',
    'Modelage Précis',
    'Contour Parfait',
  ],
  mastery: [
    'Maîtrise Jawline',
    'Excellence Faciale',
    'Perfection Mâchoire',
    'Art du Jawline',
    'Virtuosité Faciale',
  ],
};

const routineNamesFullFace: Record<string, string[]> = {
  discovery: [
    'Éveil Total',
    'Harmonie Découverte',
    'Initiation Complète',
    'Premier Équilibre',
    'Base Globale',
  ],
  foundation: [
    'Fondations Visage',
    'Équilibre Facial',
    'Construction Globale',
    'Harmonie Base',
    'Assise Complète',
  ],
  activation: [
    'Activation Globale',
    'Éveil Intégral',
    'Stimulation Totale',
    'Dynamique Visage',
    'Synergie Active',
  ],
  reinforcement: [
    'Puissance Totale',
    'Force Intégrale',
    'Consolidation Globale',
    'Endurance Visage',
    'Résistance Complète',
  ],
  sculpting: [
    'Sculpture Intégrale',
    'Définition Totale',
    'Modelage Complet',
    'Affinement Global',
    'Harmonie Sculptée',
  ],
  mastery: [
    'Maîtrise Absolue',
    'Excellence Totale',
    'Perfection Visage',
    'Art Complet',
    'Virtuosité Intégrale',
  ],
};

// ============================================
// LOGIQUE DE PROGRESSION
// ============================================

function getPhaseForDay(dayNumber: number, totalDays: number): string {
  const progress = dayNumber / totalDays;

  if (progress <= 0.15) return 'discovery';
  if (progress <= 0.30) return 'foundation';
  if (progress <= 0.45) return 'activation';
  if (progress <= 0.65) return 'reinforcement';
  if (progress <= 0.85) return 'sculpting';
  return 'mastery';
}

function getLevelForDay(dayNumber: number, totalDays: number): ExerciseLevel {
  const progress = dayNumber / totalDays;

  if (progress <= 0.33) return 'basic';
  if (progress <= 0.66) return 'intermediate';
  return 'advanced';
}

function getWeekTheme(dayNumber: number, themes: string[]): string {
  const weekIndex = Math.floor((dayNumber - 1) / 7);
  return themes[weekIndex % themes.length];
}

function getDayName(dayNumber: number, phase: string): string {
  const phaseNames: Record<string, string> = {
    discovery: 'Découverte',
    foundation: 'Fondation',
    activation: 'Activation',
    reinforcement: 'Renforcement',
    sculpting: 'Sculpture',
    mastery: 'Maîtrise',
  };

  return `Jour ${dayNumber} – ${phaseNames[phase]}`;
}

function getRoutineName(
  dayNumber: number,
  phase: string,
  category: 'double_chin' | 'jawline' | 'full_face'
): string {
  const namesMap = category === 'double_chin'
    ? routineNamesDoubleChin
    : category === 'jawline'
    ? routineNamesJawline
    : routineNamesFullFace;

  const names = namesMap[phase] || namesMap.discovery;
  return names[dayNumber % names.length];
}

// ============================================
// SÉLECTION DES EXERCICES
// ============================================

function selectExercisesForDay(
  exercises: Exercise[],
  dayNumber: number,
  count: number = 6
): Exercise[] {
  // Rotation des exercices basée sur le jour
  const startIndex = (dayNumber - 1) % exercises.length;
  const selected: Exercise[] = [];

  for (let i = 0; i < count; i++) {
    const index = (startIndex + i) % exercises.length;
    selected.push(exercises[index]);
  }

  return selected;
}

function selectBonusExercise(
  exercises: Exercise[],
  dayNumber: number,
  usedExerciseIds: string[]
): Exercise {
  // Choisir un exercice différent de ceux de la routine principale
  const available = exercises.filter(e => !usedExerciseIds.includes(e.id));
  const index = dayNumber % available.length;
  return available[index] || exercises[0];
}

// ============================================
// GÉNÉRATION DE ROUTINE POUR PROGRAMME 60 JOURS
// ============================================

export function generateDoubleChin60DayRoutine(dayNumber: number): DailyRoutine {
  const totalDays = 60;
  const phase = getPhaseForDay(dayNumber, totalDays);
  const level = getLevelForDay(dayNumber, totalDays);
  const weekTheme = getWeekTheme(dayNumber, weekThemes60Days);
  const dayName = getDayName(dayNumber, phase);
  const routineName = getRoutineName(dayNumber, phase, 'double_chin');

  const selectedExercises = selectExercisesForDay(doubleChinExercises, dayNumber, 6);

  const steps: DailyRoutineStep[] = selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.baseName,
    variant: exercise.variants[level],
    order: index + 1,
  }));

  const usedIds = selectedExercises.map(e => e.id);
  const bonusExercise = selectBonusExercise(doubleChinExercises, dayNumber, usedIds);

  const bonus: BonusExercise = {
    exerciseId: bonusExercise.id,
    exerciseName: bonusExercise.baseName,
    variant: createBonusVersion(bonusExercise),
  };

  const totalSeconds = steps.reduce((sum, step) => sum + step.variant.durationSeconds, 0);

  return {
    dayNumber,
    dayName,
    weekTheme,
    routineName,
    steps,
    bonus,
    totalDurationMinutes: Math.ceil(totalSeconds / 60),
    level,
  };
}

// ============================================
// GÉNÉRATION DE ROUTINE POUR PROGRAMME 90 JOURS
// ============================================

export function generateJawline90DayRoutine(dayNumber: number): DailyRoutine {
  const totalDays = 90;
  const phase = getPhaseForDay(dayNumber, totalDays);
  const level = getLevelForDay(dayNumber, totalDays);
  const weekTheme = getWeekTheme(dayNumber, weekThemes90Days);
  const dayName = getDayName(dayNumber, phase);
  const routineName = getRoutineName(dayNumber, phase, 'jawline');

  const selectedExercises = selectExercisesForDay(jawlineExercises, dayNumber, 7);

  const steps: DailyRoutineStep[] = selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.baseName,
    variant: exercise.variants[level],
    order: index + 1,
  }));

  const usedIds = selectedExercises.map(e => e.id);
  const bonusExercise = selectBonusExercise(jawlineExercises, dayNumber, usedIds);

  const bonus: BonusExercise = {
    exerciseId: bonusExercise.id,
    exerciseName: bonusExercise.baseName,
    variant: createBonusVersion(bonusExercise),
  };

  const totalSeconds = steps.reduce((sum, step) => sum + step.variant.durationSeconds, 0);

  return {
    dayNumber,
    dayName,
    weekTheme,
    routineName,
    steps,
    bonus,
    totalDurationMinutes: Math.ceil(totalSeconds / 60),
    level,
  };
}

// ============================================
// GÉNÉRATION POUR ABONNEMENTS MENSUELS (CYCLE 28 JOURS)
// ============================================

const SUBSCRIPTION_CYCLE_DAYS = 28;

export function generateDoubleChinSubscriptionRoutine(dayNumber: number): DailyRoutine {
  // Le cycle se répète tous les 28 jours
  const cycleDay = ((dayNumber - 1) % SUBSCRIPTION_CYCLE_DAYS) + 1;
  const cycleNumber = Math.floor((dayNumber - 1) / SUBSCRIPTION_CYCLE_DAYS) + 1;

  const phase = getPhaseForDay(cycleDay, SUBSCRIPTION_CYCLE_DAYS);
  const level = getLevelForDay(cycleDay, SUBSCRIPTION_CYCLE_DAYS);
  const weekTheme = getWeekTheme(cycleDay, weekThemesSubscription);

  const dayName = `Jour ${dayNumber} – Cycle ${cycleNumber}`;
  const routineName = getRoutineName(cycleDay, phase, 'double_chin');

  const selectedExercises = selectExercisesForDay(doubleChinExercises, cycleDay, 6);

  const steps: DailyRoutineStep[] = selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.baseName,
    variant: exercise.variants[level],
    order: index + 1,
  }));

  const usedIds = selectedExercises.map(e => e.id);
  const bonusExercise = selectBonusExercise(doubleChinExercises, cycleDay, usedIds);

  const bonus: BonusExercise = {
    exerciseId: bonusExercise.id,
    exerciseName: bonusExercise.baseName,
    variant: createBonusVersion(bonusExercise),
  };

  const totalSeconds = steps.reduce((sum, step) => sum + step.variant.durationSeconds, 0);

  return {
    dayNumber,
    dayName,
    weekTheme: `${weekTheme} (Cycle ${cycleNumber})`,
    routineName,
    steps,
    bonus,
    totalDurationMinutes: Math.ceil(totalSeconds / 60),
    level,
  };
}

export function generateJawlineSubscriptionRoutine(dayNumber: number): DailyRoutine {
  const cycleDay = ((dayNumber - 1) % SUBSCRIPTION_CYCLE_DAYS) + 1;
  const cycleNumber = Math.floor((dayNumber - 1) / SUBSCRIPTION_CYCLE_DAYS) + 1;

  const phase = getPhaseForDay(cycleDay, SUBSCRIPTION_CYCLE_DAYS);
  const level = getLevelForDay(cycleDay, SUBSCRIPTION_CYCLE_DAYS);
  const weekTheme = getWeekTheme(cycleDay, weekThemesSubscription);

  const dayName = `Jour ${dayNumber} – Cycle ${cycleNumber}`;
  const routineName = getRoutineName(cycleDay, phase, 'jawline');

  const selectedExercises = selectExercisesForDay(jawlineExercises, cycleDay, 7);

  const steps: DailyRoutineStep[] = selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.baseName,
    variant: exercise.variants[level],
    order: index + 1,
  }));

  const usedIds = selectedExercises.map(e => e.id);
  const bonusExercise = selectBonusExercise(jawlineExercises, cycleDay, usedIds);

  const bonus: BonusExercise = {
    exerciseId: bonusExercise.id,
    exerciseName: bonusExercise.baseName,
    variant: createBonusVersion(bonusExercise),
  };

  const totalSeconds = steps.reduce((sum, step) => sum + step.variant.durationSeconds, 0);

  return {
    dayNumber,
    dayName,
    weekTheme: `${weekTheme} (Cycle ${cycleNumber})`,
    routineName,
    steps,
    bonus,
    totalDurationMinutes: Math.ceil(totalSeconds / 60),
    level,
  };
}

// ============================================
// GÉNÉRATION POUR PROGRAMME TOUT-EN-UN
// ============================================

export function generateAllInOneRoutine(dayNumber: number): DailyRoutine {
  // Alternance: Jawline / Double Menton / Visage Complet
  const dayType = dayNumber % 3; // 0 = complet, 1 = jawline, 2 = double menton
  const cycleDay = ((dayNumber - 1) % SUBSCRIPTION_CYCLE_DAYS) + 1;
  const cycleNumber = Math.floor((dayNumber - 1) / SUBSCRIPTION_CYCLE_DAYS) + 1;

  const phase = getPhaseForDay(cycleDay, SUBSCRIPTION_CYCLE_DAYS);
  const level = getLevelForDay(cycleDay, SUBSCRIPTION_CYCLE_DAYS);
  const weekTheme = getWeekTheme(cycleDay, weekThemesSubscription);

  let category: 'jawline' | 'double_chin' | 'full_face';
  let exercises: Exercise[];
  let stepCount: number;

  if (dayType === 1) {
    category = 'jawline';
    exercises = jawlineExercises;
    stepCount = 6;
  } else if (dayType === 2) {
    category = 'double_chin';
    exercises = doubleChinExercises;
    stepCount = 5;
  } else {
    // Visage complet: mix des deux
    category = 'full_face';
    exercises = [...jawlineExercises.slice(0, 8), ...doubleChinExercises.slice(0, 6)];
    stepCount = 8;
  }

  const dayName = `Jour ${dayNumber} – ${category === 'jawline' ? 'Jawline' : category === 'double_chin' ? 'Menton' : 'Complet'}`;
  const routineName = getRoutineName(cycleDay, phase, category);

  const selectedExercises = selectExercisesForDay(exercises, dayNumber, stepCount);

  const steps: DailyRoutineStep[] = selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.baseName,
    variant: exercise.variants[level],
    order: index + 1,
  }));

  const usedIds = selectedExercises.map(e => e.id);
  // Pour le bonus, alterner entre jawline et double menton
  const bonusPool = dayType === 2 ? jawlineExercises : doubleChinExercises;
  const bonusExercise = selectBonusExercise(bonusPool, dayNumber, usedIds);

  const bonus: BonusExercise = {
    exerciseId: bonusExercise.id,
    exerciseName: bonusExercise.baseName,
    variant: createBonusVersion(bonusExercise),
  };

  const totalSeconds = steps.reduce((sum, step) => sum + step.variant.durationSeconds, 0);

  return {
    dayNumber,
    dayName,
    weekTheme: `${weekTheme} – Premium (Cycle ${cycleNumber})`,
    routineName,
    steps,
    bonus,
    totalDurationMinutes: Math.ceil(totalSeconds / 60),
    level,
  };
}

// ============================================
// FONCTION PRINCIPALE - OBTENIR LA ROUTINE DU JOUR
// ============================================

export function getDailyRoutine(planId: PlanId, dayNumber: number): DailyRoutine {
  switch (planId) {
    case 'double_60':
      return generateDoubleChin60DayRoutine(dayNumber);
    case 'jawline_90':
      return generateJawline90DayRoutine(dayNumber);
    case 'double_monthly':
      return generateDoubleChinSubscriptionRoutine(dayNumber);
    case 'jawline_monthly':
      return generateJawlineSubscriptionRoutine(dayNumber);
    case 'all_in_one':
      return generateAllInOneRoutine(dayNumber);
    default:
      // Fallback
      return generateJawline90DayRoutine(dayNumber);
  }
}

// ============================================
// HELPERS POUR L'AFFICHAGE
// ============================================

export function formatDuration(minutes: number): string {
  return `${minutes}-${minutes + 2} min`;
}

export function getLevelLabel(level: ExerciseLevel): string {
  switch (level) {
    case 'basic': return 'Débutant';
    case 'intermediate': return 'Intermédiaire';
    case 'advanced': return 'Avancé';
  }
}
