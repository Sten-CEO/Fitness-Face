// ============================================
// REGISTRE STATIQUE DES IMAGES/VIDÉOS D'EXERCICES
// Mapping strict : exercice N → dossier exo-N
// ============================================
// NOTE: Les images doivent être ajoutées dans public/exercises/
// Structure: public/exercises/jawline/jawline-exo-N/1.png, 2.png, etc.
// Structure: public/exercises/double-menton/dm-exo-N/1.jpeg, 2.jpeg, etc.
// ============================================

import { ImageSourcePropType } from 'react-native';

type ExerciseImageRegistry = Record<string, ImageSourcePropType[]>;
type ExerciseVideoRegistry = Record<string, number | null>;

// ============================================
// JAWLINE EXERCISES - IMAGES (jaw_1 à jaw_15)
// Images temporairement désactivées - ajouter les fichiers dans public/exercises/
// ============================================

const jawlineImages: ExerciseImageRegistry = {
  jaw_1: [],
  jaw_2: [],
  jaw_3: [],
  jaw_4: [],
  jaw_5: [],
  jaw_6: [],
  jaw_7: [],
  jaw_8: [],
  jaw_9: [],
  jaw_10: [],
  jaw_11: [],
  jaw_12: [],
  jaw_13: [],
  jaw_14: [],
  jaw_15: [],
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
  jaw_6: null, // Vidéo désactivée - ajouter public/exercises/jawline/jawline-exo-6/video-exo-jaw-1.mp4
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
// Images temporairement désactivées - ajouter les fichiers dans public/exercises/
// ============================================

const doubleMentonImages: ExerciseImageRegistry = {
  dc_1: [],
  dc_2: [],
  dc_3: [],
  dc_4: [],
  dc_5: [],
  dc_6: [],
  dc_7: [],
  dc_8: [],
  dc_9: [],
  dc_10: [],
  dc_11: [],
  dc_12: [],
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
// Temporairement vide - sera rempli quand les images seront ajoutées
// ============================================

export const EXERCISES_WITH_IMAGES = {
  jawline: [] as string[],
  doubleChin: [] as string[],
};

export const EXERCISES_WITH_VIDEO = {
  jawline: [] as string[],
  doubleChin: [] as string[],
};
