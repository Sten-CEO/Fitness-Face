// ============================================
// REGISTRE STATIQUE DES IMAGES D'EXERCICES
// Mapping strict : exercice N → dossier exo-N
// ============================================

import { ImageSourcePropType } from 'react-native';

type ExerciseImageRegistry = Record<string, ImageSourcePropType[]>;

// ============================================
// JAWLINE EXERCISES (jaw_1 à jaw_15)
// Dossier: public/exercises/jawline/jawline-exo-X/
// ============================================

const jawlineImages: ExerciseImageRegistry = {
  jaw_1: [
    require('../public/exercises/jawline/jawline-exo-1/1.png'),
    // Images supplémentaires si disponibles
  ],
  jaw_2: [
    require('../public/exercises/jawline/jawline-exo-2/1.jpeg'),
  ],
  jaw_3: [
    // Dossier vide ou images corrompues - placeholder
  ],
  jaw_4: [
    // Dossier vide - placeholder
  ],
  jaw_5: [
    require('../public/exercises/jawline/jawline-exo-5/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-5/2.jpeg'),
  ],
  jaw_6: [
    // Seulement vidéo - placeholder
  ],
  jaw_7: [
    require('../public/exercises/jawline/jawline-exo-7/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-7/2.jpeg'),
    require('../public/exercises/jawline/jawline-exo-7/3.jpeg'),
  ],
  jaw_8: [
    require('../public/exercises/jawline/jawline-exo-8/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-8/3.jpeg'),
  ],
  jaw_9: [
    // Dossier vide - placeholder
  ],
  jaw_10: [
    // Dossier vide - placeholder
  ],
  jaw_11: [
    require('../public/exercises/jawline/jawline-exo-11/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-11/2.jpeg'),
    require('../public/exercises/jawline/jawline-exo-11/3.jpeg'),
  ],
  jaw_12: [
    require('../public/exercises/jawline/jawline-exo-12/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-12/2.jpeg'),
    require('../public/exercises/jawline/jawline-exo-12/3.jpeg'),
  ],
  jaw_13: [
    require('../public/exercises/jawline/jawline-exo-13/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-13/3.jpeg'),
  ],
  jaw_14: [
    require('../public/exercises/jawline/jawline-exo-14/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-14/2.jpeg'),
    require('../public/exercises/jawline/jawline-exo-14/3.jpeg'),
  ],
  jaw_15: [
    require('../public/exercises/jawline/jawline-exo-15/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-15/2.jpeg'),
    require('../public/exercises/jawline/jawline-exo-15/3.jpeg'),
  ],
};

// ============================================
// DOUBLE MENTON EXERCISES (dc_1 à dc_12)
// Dossier: public/exercises/double-menton/dm-exo-X/
// ============================================

const doubleMentonImages: ExerciseImageRegistry = {
  dc_1: [
    require('../public/exercises/double-menton/dm-exo-1/1.jpeg'),
    require('../public/exercises/double-menton/dm-exo-1/2.jpeg'),
  ],
  dc_2: [
    require('../public/exercises/double-menton/dm-exo-2/1.jpeg'),
    require('../public/exercises/double-menton/dm-exo-2/2.jpeg'),
  ],
  dc_3: [
    require('../public/exercises/double-menton/dm-exo-3/1.jpeg'),
    require('../public/exercises/double-menton/dm-exo-3/2.jpeg'),
  ],
  dc_4: [
    // Dossier vide - placeholder
  ],
  dc_5: [
    require('../public/exercises/double-menton/dm-exo-5/1.jpeg'),
    require('../public/exercises/double-menton/dm-exo-5/2.jpeg'),
    require('../public/exercises/double-menton/dm-exo-5/3.jpeg'),
  ],
  dc_6: [
    require('../public/exercises/double-menton/dm-exo-6/1.jpeg'),
    require('../public/exercises/double-menton/dm-exo-6/2.jpeg'),
  ],
  dc_7: [
    require('../public/exercises/double-menton/dm-exo-7/1.jpeg'),
    require('../public/exercises/double-menton/dm-exo-7/2.jpeg'),
  ],
  dc_8: [
    require('../public/exercises/double-menton/dm-exo-8/1.jpeg'),
    require('../public/exercises/double-menton/dm-exo-8/2.jpeg'),
  ],
  dc_9: [
    require('../public/exercises/double-menton/dm-exo-9/1.jpeg'),
  ],
  dc_10: [
    require('../public/exercises/double-menton/dm-exo-10/1.jpeg'),
    require('../public/exercises/double-menton/dm-exo-10/2.jpeg'),
  ],
  dc_11: [
    require('../public/exercises/double-menton/dm-exo-11/1.jpeg'),
    require('../public/exercises/double-menton/dm-exo-11/2.jpeg'),
  ],
  dc_12: [
    require('../public/exercises/double-menton/dm-exo-12/1.jpeg'),
    require('../public/exercises/double-menton/dm-exo-12/2.jpeg'),
    require('../public/exercises/double-menton/dm-exo-12/3.jpeg'),
  ],
};

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Récupère les images pour un exercice donné
 * @param exerciseId - ID de l'exercice (jaw_1, dc_1, etc.)
 * @returns Array d'images ou tableau vide si aucune image
 */
export function getExerciseImagesFromRegistry(exerciseId: string): ImageSourcePropType[] {
  if (exerciseId.startsWith('jaw_')) {
    return jawlineImages[exerciseId] || [];
  }
  if (exerciseId.startsWith('dc_')) {
    return doubleMentonImages[exerciseId] || [];
  }
  return [];
}

/**
 * Vérifie si un exercice a des images dans le registre
 * @param exerciseId - ID de l'exercice
 * @returns true si des images existent
 */
export function hasImagesInRegistry(exerciseId: string): boolean {
  return getExerciseImagesFromRegistry(exerciseId).length > 0;
}

/**
 * Compte le nombre d'images pour un exercice
 * @param exerciseId - ID de l'exercice
 * @returns Nombre d'images
 */
export function getImageCount(exerciseId: string): number {
  return getExerciseImagesFromRegistry(exerciseId).length;
}

// ============================================
// LISTE DES EXERCICES AVEC IMAGES VALIDÉES
// ============================================

export const EXERCISES_WITH_IMAGES = {
  jawline: ['jaw_1', 'jaw_2', 'jaw_5', 'jaw_7', 'jaw_8', 'jaw_11', 'jaw_12', 'jaw_13', 'jaw_14', 'jaw_15'],
  doubleChin: ['dc_1', 'dc_2', 'dc_3', 'dc_5', 'dc_6', 'dc_7', 'dc_8', 'dc_9', 'dc_10', 'dc_11', 'dc_12'],
};
