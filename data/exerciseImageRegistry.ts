// ============================================
// REGISTRE STATIQUE DES IMAGES/VIDÉOS D'EXERCICES
// Mapping strict : exercice N → dossier exo-N
// ============================================

import { ImageSourcePropType } from 'react-native';

type ExerciseImageRegistry = Record<string, ImageSourcePropType[]>;
type ExerciseVideoRegistry = Record<string, number | null>; // require() retourne un number pour les vidéos

// ============================================
// JAWLINE EXERCISES - IMAGES (jaw_1 à jaw_15)
// ============================================

const jawlineImages: ExerciseImageRegistry = {
  jaw_1: [
    require('../public/exercises/jawline/jawline-exo-1/1.png'),
    require('../public/exercises/jawline/jawline-exo-1/2.png'),
    require('../public/exercises/jawline/jawline-exo-1/3.png'),
  ],
  jaw_2: [
    require('../public/exercises/jawline/jawline-exo-2/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-2/2.png'),
  ],
  jaw_3: [
    require('../public/exercises/jawline/jawline-exo-3/1.png'),
    require('../public/exercises/jawline/jawline-exo-3/2.png'),
  ],
  jaw_4: [],
  jaw_5: [
    require('../public/exercises/jawline/jawline-exo-5/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-5/2.jpeg'),
  ],
  jaw_6: [], // Vidéo seulement - voir jawlineVideos
  jaw_7: [
    require('../public/exercises/jawline/jawline-exo-7/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-7/2.jpeg'),
    require('../public/exercises/jawline/jawline-exo-7/3.jpeg'),
  ],
  jaw_8: [
    require('../public/exercises/jawline/jawline-exo-8/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-8/3.jpeg'),
  ],
  jaw_9: [],
  jaw_10: [],
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
    require('../public/exercises/jawline/jawline-exo-13/2.png'),
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
// JAWLINE EXERCISES - VIDÉOS
// ============================================

const jawlineVideos: ExerciseVideoRegistry = {
  jaw_1: null,
  jaw_2: null,
  jaw_3: null,
  jaw_4: null,
  jaw_5: null,
  jaw_6: require('../public/exercises/jawline/jawline-exo-6/video-exo-jaw-1.mp4'),
  jaw_7: null,
  jaw_8: null,
  jaw_9: null,
  jaw_10: null,
  jaw_11: null,
  jaw_12: null,
  jaw_13: null,
  jaw_14: null,
  jaw_15: null,
};

// ============================================
// DOUBLE MENTON EXERCISES - IMAGES (dc_1 à dc_12)
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
  dc_4: [],
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
// FONCTIONS PRINCIPALES - IMAGES
// ============================================

export function getExerciseImagesFromRegistry(exerciseId: string): ImageSourcePropType[] {
  if (exerciseId.startsWith('jaw_')) {
    return jawlineImages[exerciseId] || [];
  }
  if (exerciseId.startsWith('dc_')) {
    return doubleMentonImages[exerciseId] || [];
  }
  return [];
}

export function hasImagesInRegistry(exerciseId: string): boolean {
  return getExerciseImagesFromRegistry(exerciseId).length > 0;
}

export function getImageCount(exerciseId: string): number {
  return getExerciseImagesFromRegistry(exerciseId).length;
}

// ============================================
// FONCTIONS PRINCIPALES - VIDÉOS
// ============================================

export function getExerciseVideoFromRegistry(exerciseId: string): number | null {
  if (exerciseId.startsWith('jaw_')) {
    return jawlineVideos[exerciseId] || null;
  }
  // Pas de vidéos pour double menton pour l'instant
  return null;
}

export function hasVideoInRegistry(exerciseId: string): boolean {
  return getExerciseVideoFromRegistry(exerciseId) !== null;
}

// ============================================
// LISTE DES EXERCICES AVEC MEDIA
// ============================================

export const EXERCISES_WITH_IMAGES = {
  jawline: ['jaw_1', 'jaw_2', 'jaw_3', 'jaw_5', 'jaw_7', 'jaw_8', 'jaw_11', 'jaw_12', 'jaw_13', 'jaw_14', 'jaw_15'],
  doubleChin: ['dc_1', 'dc_2', 'dc_3', 'dc_5', 'dc_6', 'dc_7', 'dc_8', 'dc_9', 'dc_10', 'dc_11', 'dc_12'],
};

export const EXERCISES_WITH_VIDEO = {
  jawline: ['jaw_6'],
  doubleChin: [],
};
