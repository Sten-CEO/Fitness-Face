// ============================================
// REGISTRE STATIQUE DES IMAGES D'EXERCICES
// NOTE: Les fichiers .PNG avec métadonnées C2PA sont exclus (corrompus)
// ============================================

import { ImageSourcePropType } from 'react-native';

type ExerciseImageRegistry = Record<string, ImageSourcePropType[]>;

// ============================================
// JAWLINE EXERCISES (jaw_1 à jaw_15)
// NOTE: Fichiers .PNG exclus car corrompus par métadonnées C2PA
// ============================================

const jawlineImages: ExerciseImageRegistry = {
  jaw_1: [
    require('../public/exercises/jawline/jawline-exo-1/1.png'),
    // 2.PNG et 3.PNG exclus - métadonnées C2PA corrompues
  ],
  jaw_2: [
    require('../public/exercises/jawline/jawline-exo-2/1.jpeg'),
    // 2.PNG exclu - métadonnées C2PA corrompues
  ],
  jaw_3: [
    // 1.PNG et 2.PNG exclus - métadonnées C2PA corrompues
    // 3.HEIC non supporté par React Native
  ],
  jaw_4: [],
  jaw_5: [
    require('../public/exercises/jawline/jawline-exo-5/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-5/2.jpeg'),
  ],
  jaw_6: [], // Seulement vidéo (video-exo-jaw-1.mp4)
  jaw_7: [
    require('../public/exercises/jawline/jawline-exo-7/1.jpeg'),
    require('../public/exercises/jawline/jawline-exo-7/2.jpeg'),
    require('../public/exercises/jawline/jawline-exo-7/3.jpeg'),
  ],
  jaw_8: [
    require('../public/exercises/jawline/jawline-exo-8/1.jpeg'),
    // 2.PNG exclu - métadonnées C2PA corrompues
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
    // 2.PNG exclu - métadonnées C2PA corrompues
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
    // 2.PNG exclu - métadonnées C2PA potentiellement corrompues
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
// FONCTION PRINCIPALE
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
