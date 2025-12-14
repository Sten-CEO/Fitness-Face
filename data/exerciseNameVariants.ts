// ============================================
// VARIANTES DE NOMS D'EXERCICES - FITNESS FACE
// Synonymes/variantes pour chaque exercice
// ============================================

import { IntensityLevel } from './exercises';

// Variantes pour chaque exercice (id -> array de noms alternatifs)
export const EXERCISE_NAME_VARIANTS: Record<string, string[]> = {
  // JAWLINE (15 exercices)
  jaw_1: ['Jaw Push Forward', 'Forward Jaw Drive', 'Mandible Push', 'Projection Mâchoire'],
  jaw_2: ['Chin Lift Hold', 'Menton Levé', 'Chin Elevation', 'Levée Menton'],
  jaw_3: ['Jaw Resistance Press', 'Pression Résistée', 'Resistance Jaw', 'Push Mâchoire'],
  jaw_4: ['Side Jaw Slide', 'Glissement Latéral', 'Lateral Jaw Move', 'Slide Mâchoire'],
  jaw_5: ['Clenched Teeth Hold', 'Mâchoire Serrée', 'Teeth Clench', 'Contraction Dentaire'],
  jaw_6: ['Neck Extension Stretch', 'Extension Cou', 'Neck Stretch', 'Étirement Cervical'],
  jaw_7: ['Cheek Lift Activation', 'Activation Joues', 'Cheek Raise', 'Levée Joues'],
  jaw_8: ['Lower Jaw Drop Control', 'Descente Contrôlée', 'Jaw Drop', 'Ouverture Mâchoire'],
  jaw_9: ['Jaw Circle Rotation', 'Rotation Circulaire', 'Circular Jaw', 'Cercle Mâchoire'],
  jaw_10: ['Tongue to Palate Press', 'Langue au Palais', 'Mewing Press', 'Pression Linguale'],
  jaw_11: ['Isometric Jaw Hold', 'Maintien Isométrique', 'Static Jaw Hold', 'Tension Mâchoire'],
  jaw_12: ['Neck Tilt & Jaw Engage', 'Inclinaison Active', 'Tilt & Engage', 'Cou-Mâchoire'],
  jaw_13: ['Forward Neck Reach', 'Extension Avant', 'Neck Forward', 'Avancée Cou'],
  jaw_14: ['Jaw Pulse Micro-Movement', 'Micro-Pulsations', 'Pulse Jaw', 'Pulsations Mâchoire'],
  jaw_15: ['Full Jawline Activation Flow', 'Flow Complet', 'Total Jaw Flow', 'Enchaînement Mâchoire'],

  // DOUBLE MENTON (12 exercices)
  dc_1: ['Chin Lift Hold', 'Élévation Menton', 'Lift & Hold', 'Maintien Menton'],
  dc_2: ['Neck Extension Stretch', 'Extension Cervicale', 'Neck Extend', 'Étirement Cou'],
  dc_3: ['Forward Neck Reach', 'Projection Avant', 'Reach Forward', 'Avancée Cou'],
  dc_4: ['Upward Jaw Tilt', 'Inclinaison Haute', 'Tilt Up', 'Menton Haut'],
  dc_5: ['Chin Tuck Compression', 'Compression Menton', 'Tuck & Press', 'Rentrée Menton'],
  dc_6: ['Suprahyoid Activation Hold', 'Activation Suprahyoïd', 'Deep Hold', 'Maintien Profond'],
  dc_7: ['Neck Lift Isometric', 'Levée Isométrique', 'Isometric Lift', 'Lift Statique'],
  dc_8: ['Lower Face Stretch', 'Étirement Facial', 'Face Stretch', 'Stretch Bas Visage'],
  dc_9: ['Platysma Tightening', 'Resserrement Platysma', 'Platysma Work', 'Travail Platysma'],
  dc_10: ['Jaw & Neck Lock', 'Verrouillage Complet', 'Lock Position', 'Position Verrouillée'],
  dc_11: ['Controlled Head Tilt Back', 'Bascule Contrôlée', 'Slow Tilt', 'Inclinaison Lente'],
  dc_12: ['Full Neck & Chin Activation Flow', 'Flow Total', 'Complete Flow', 'Enchaînement Complet'],
};

// Suffixes d'intensité (plus variés que juste "Hard")
const INTENSITY_SUFFIXES: Record<IntensityLevel, string[]> = {
  normal: ['', '', ''], // Pas de suffixe pour normal
  hard: ['— Intense', '— Power', '— Force'],
  advanced: ['— Advanced', '— Pro', '— Expert'],
  elite: ['— Elite', '— Master', '— Ultimate'],
};

/**
 * Génère un seed stable basé sur le jour et l'exercice
 */
function getVariantSeed(exerciseId: string, dayNumber: number): number {
  // Hash simple mais stable
  let hash = 0;
  const str = `${exerciseId}-${dayNumber}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Retourne un nom d'exercice avec variante et suffixe d'intensité
 * Le nom est stable pour un jour donné (ne change pas pendant la routine)
 */
export function getExerciseDisplayName(
  exerciseId: string,
  intensity: IntensityLevel,
  dayNumber: number
): string {
  const variants = EXERCISE_NAME_VARIANTS[exerciseId];

  if (!variants || variants.length === 0) {
    // Fallback: retourner l'id formaté
    return exerciseId;
  }

  // Sélection déterministe de la variante
  const seed = getVariantSeed(exerciseId, dayNumber);
  const variantIndex = seed % variants.length;
  const baseName = variants[variantIndex];

  // Ajouter le suffixe d'intensité si pas normal
  if (intensity === 'normal') {
    return baseName;
  }

  const suffixes = INTENSITY_SUFFIXES[intensity];
  const suffixIndex = seed % suffixes.length;
  const suffix = suffixes[suffixIndex];

  return `${baseName} ${suffix}`.trim();
}

// ============================================
// NOMS DE ROUTINES VARIÉS
// ============================================

const ROUTINE_NAME_POOLS = {
  jawline: [
    'Jawline Sculpt', 'Définition Mâchoire', 'Power Jaw', 'Contour Facial', 'Jawline Flow',
    'Jaw Sculptor', 'Mâchoire Express', 'Jaw Definition', 'Contour Pro', 'Jawline Boost',
    'Sculpt Session', 'Jaw Power', 'Face Contour', 'Jawline Lift', 'Chin & Jaw',
    'Jaw Tone', 'Mâchoire Intense', 'Sharp Jaw', 'Jaw Builder', 'Angular Face',
  ],
  double_chin: [
    'Chin Lift', 'Neck Define', 'Menton Sculpt', 'Cervical Power', 'Double Chin Flow',
    'Neck Tone', 'Chin Reduction', 'Neck Sculptor', 'Slim Chin', 'Neck Flow',
    'Under Chin', 'Cervical Tone', 'Chin Lift Pro', 'Neck Shape', 'Chin Burn',
    'Neck Contour', 'Chin Sculpt', 'Jawline Under', 'Neck Tight', 'Double Chin Blast',
  ],
  all_in_one: [
    'Full Face', 'Total Sculpt', 'Complete Flow', 'Harmonie Faciale', 'Power Combo',
    'Face Complete', 'Total Face', 'Full Sculpt', 'Complete Tone', 'Face Fusion',
    'All-in-One', 'Total Power', 'Face Master', 'Complete Shape', 'Full Tone',
    'Combo Face', 'Total Flow', 'Face 360', 'Complete Face', 'Ultimate Face',
  ],
};

/**
 * Génère un nom de routine unique et stable pour un jour donné
 * @param dayNumber - Numéro du jour dans le programme
 * @param programType - Type de programme
 * @param programStartDate - Date de début (pour seed stable)
 */
export function generateRoutineName(
  dayNumber: number,
  programType: 'jawline' | 'double_chin' | 'all_in_one',
  programStartDate?: string
): string {
  const pool = ROUTINE_NAME_POOLS[programType];

  // Seed basé sur le jour et la date de début (pour stabilité)
  let seed = dayNumber * 31;
  if (programStartDate) {
    // Ajouter un hash de la date pour variété entre utilisateurs
    for (let i = 0; i < programStartDate.length; i++) {
      seed += programStartDate.charCodeAt(i);
    }
  }

  const index = seed % pool.length;
  return pool[index];
}
