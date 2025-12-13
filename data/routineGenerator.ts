// ============================================
// GÉNÉRATEUR DE ROUTINES QUOTIDIENNES
// MAX 3 exercices par routine, uniquement exercices validés
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
// EXERCICES VALIDÉS (ceux avec images)
// ============================================

// IDs des exercices jawline qui ont des images
const VALID_JAWLINE_IDS = [
  'jaw_1',  // Mewing
  'jaw_2',  // Chin Lifts
  'jaw_5',  // Fish Face
  'jaw_7',  // Jaw Forward
  'jaw_8',  // Tongue Press Palate
  'jaw_11', // Vowel Articulation
  'jaw_12', // Jaw Rotation
  'jaw_13', // Neck Flexion
  'jaw_14', // Lip Pull
  'jaw_15', // Platysma Stretch
];

// IDs des exercices double menton qui ont des images
const VALID_DOUBLE_CHIN_IDS = [
  'dc_1',  // Tongue Press
  'dc_2',  // Neck Stretch
  'dc_3',  // Jaw Jut
  'dc_5',  // Platysma Tone
  'dc_6',  // Lymphatic Drainage
  'dc_7',  // Head Tilt Back
  'dc_8',  // Kiss The Ceiling
  'dc_9',  // Chin Scoop
  'dc_10', // Tongue Out Stretch
  'dc_11', // Neck Roll
  'dc_12', // Collar Bone Backup
];

// Filtrer les exercices pour ne garder que les validés
const validJawlineExercises = jawlineExercises.filter(e => VALID_JAWLINE_IDS.includes(e.id));
const validDoubleChinExercises = doubleChinExercises.filter(e => VALID_DOUBLE_CHIN_IDS.includes(e.id));

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
// CONFIGURATION
// ============================================

const MAX_EXERCISES_PER_ROUTINE = 3;

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
// SÉLECTION DES EXERCICES (MAX 3, validés uniquement)
// ============================================

function selectExercisesForDay(
  exercises: Exercise[],
  dayNumber: number,
  count: number = MAX_EXERCISES_PER_ROUTINE
): Exercise[] {
  // Assurer qu'on ne dépasse pas MAX_EXERCISES_PER_ROUTINE
  const actualCount = Math.min(count, MAX_EXERCISES_PER_ROUTINE);

  // Rotation des exercices basée sur le jour pour varier
  const startIndex = (dayNumber - 1) % exercises.length;
  const selected: Exercise[] = [];

  for (let i = 0; i < actualCount; i++) {
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

  // Utiliser uniquement les exercices validés, max 3
  const selectedExercises = selectExercisesForDay(validDoubleChinExercises, dayNumber);

  const steps: DailyRoutineStep[] = selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.baseName,
    variant: exercise.variants[level],
    order: index + 1,
  }));

  const usedIds = selectedExercises.map(e => e.id);
  const bonusExercise = selectBonusExercise(validDoubleChinExercises, dayNumber, usedIds);

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

  // Utiliser uniquement les exercices validés, max 3
  const selectedExercises = selectExercisesForDay(validJawlineExercises, dayNumber);

  const steps: DailyRoutineStep[] = selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.baseName,
    variant: exercise.variants[level],
    order: index + 1,
  }));

  const usedIds = selectedExercises.map(e => e.id);
  const bonusExercise = selectBonusExercise(validJawlineExercises, dayNumber, usedIds);

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

  // Utiliser uniquement les exercices validés, max 3
  const selectedExercises = selectExercisesForDay(validDoubleChinExercises, cycleDay);

  const steps: DailyRoutineStep[] = selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.baseName,
    variant: exercise.variants[level],
    order: index + 1,
  }));

  const usedIds = selectedExercises.map(e => e.id);
  const bonusExercise = selectBonusExercise(validDoubleChinExercises, cycleDay, usedIds);

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

  // Utiliser uniquement les exercices validés, max 3
  const selectedExercises = selectExercisesForDay(validJawlineExercises, cycleDay);

  const steps: DailyRoutineStep[] = selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.baseName,
    variant: exercise.variants[level],
    order: index + 1,
  }));

  const usedIds = selectedExercises.map(e => e.id);
  const bonusExercise = selectBonusExercise(validJawlineExercises, cycleDay, usedIds);

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
  // Alternance: Jawline / Double Menton / Mix
  const dayType = dayNumber % 3; // 0 = mix, 1 = jawline, 2 = double menton
  const cycleDay = ((dayNumber - 1) % SUBSCRIPTION_CYCLE_DAYS) + 1;
  const cycleNumber = Math.floor((dayNumber - 1) / SUBSCRIPTION_CYCLE_DAYS) + 1;

  const phase = getPhaseForDay(cycleDay, SUBSCRIPTION_CYCLE_DAYS);
  const level = getLevelForDay(cycleDay, SUBSCRIPTION_CYCLE_DAYS);
  const weekTheme = getWeekTheme(cycleDay, weekThemesSubscription);

  let category: 'jawline' | 'double_chin' | 'full_face';
  let exercises: Exercise[];

  if (dayType === 1) {
    category = 'jawline';
    exercises = validJawlineExercises;
  } else if (dayType === 2) {
    category = 'double_chin';
    exercises = validDoubleChinExercises;
  } else {
    // Mix: alterner entre les deux pools
    category = 'full_face';
    // Prendre 2 jawline + 1 double menton (ou inverse selon le jour)
    const jawOffset = Math.floor(dayNumber / 3) % validJawlineExercises.length;
    const dcOffset = Math.floor(dayNumber / 3) % validDoubleChinExercises.length;
    exercises = [
      validJawlineExercises[jawOffset % validJawlineExercises.length],
      validDoubleChinExercises[dcOffset % validDoubleChinExercises.length],
      validJawlineExercises[(jawOffset + 1) % validJawlineExercises.length],
    ];
  }

  const dayName = `Jour ${dayNumber} – ${category === 'jawline' ? 'Jawline' : category === 'double_chin' ? 'Menton' : 'Complet'}`;
  const routineName = getRoutineName(cycleDay, phase, category);

  // Max 3 exercices
  const selectedExercises = category === 'full_face'
    ? exercises.slice(0, MAX_EXERCISES_PER_ROUTINE)
    : selectExercisesForDay(exercises, dayNumber);

  const steps: DailyRoutineStep[] = selectedExercises.map((exercise, index) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.baseName,
    variant: exercise.variants[level],
    order: index + 1,
  }));

  const usedIds = selectedExercises.map(e => e.id);
  // Pour le bonus, alterner entre jawline et double menton
  const bonusPool = dayType === 2 ? validJawlineExercises : validDoubleChinExercises;
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
  return `${minutes}-${minutes + 1} min`;
}

export function getLevelLabel(level: ExerciseLevel): string {
  switch (level) {
    case 'basic': return 'Débutant';
    case 'intermediate': return 'Intermédiaire';
    case 'advanced': return 'Avancé';
  }
}

// ============================================
// EXPORT DES LISTES VALIDÉES (pour debug/tests)
// ============================================

export { VALID_JAWLINE_IDS, VALID_DOUBLE_CHIN_IDS };
