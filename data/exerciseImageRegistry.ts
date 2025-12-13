// ============================================
// REGISTRE STATIQUE DES IMAGES D'EXERCICES
// Les require() doivent être statiques pour React Native
// ============================================

import { ImageSourcePropType } from 'react-native';

type ExerciseImageRegistry = Record<string, ImageSourcePropType[]>;

// ============================================
// JAWLINE EXERCISES (jaw_1 à jaw_15)
// Dossier: public/exercises/jawline/jawline-exo-X/
// ============================================

// Pour ajouter des images, décommente les lignes require()
// et assure-toi que les fichiers existent avec le bon nom/extension

const jawlineImages: ExerciseImageRegistry = {
  // DÉCOMMENTE et adapte les extensions selon tes fichiers réels :
  jaw_1: [
    // require('../public/exercises/jawline/jawline-exo-1/1.png'),
    // require('../public/exercises/jawline/jawline-exo-1/2.PNG'),
    // require('../public/exercises/jawline/jawline-exo-1/3.PNG'),
  ],
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
// DOUBLE MENTON EXERCISES (dc_1 à dc_12)
// Dossier: public/exercises/double-menton/dm-exo-X/
// ============================================

const doubleMentonImages: ExerciseImageRegistry = {
  // DÉCOMMENTE et adapte les extensions selon tes fichiers réels :
  dc_1: [
    // require('../public/exercises/double-menton/dm-exo-1/1.jpeg'),
    // require('../public/exercises/double-menton/dm-exo-1/2.jpeg'),
  ],
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
// FONCTION PRINCIPALE
// ============================================

/**
 * Récupère les images d'un exercice depuis le registre statique
 * @param exerciseId - ID de l'exercice (ex: "jaw_1", "dc_1")
 * @returns Tableau d'ImageSourcePropType (peut être vide si pas d'images)
 */
export function getExerciseImagesFromRegistry(exerciseId: string): ImageSourcePropType[] {
  // Chercher dans jawline
  if (exerciseId.startsWith('jaw_')) {
    return jawlineImages[exerciseId] || [];
  }

  // Chercher dans double menton
  if (exerciseId.startsWith('dc_')) {
    return doubleMentonImages[exerciseId] || [];
  }

  return [];
}

/**
 * Vérifie si un exercice a des images dans le registre
 */
export function hasImagesInRegistry(exerciseId: string): boolean {
  return getExerciseImagesFromRegistry(exerciseId).length > 0;
}

// ============================================
// INSTRUCTIONS POUR AJOUTER DES IMAGES
// ============================================
/*
ÉTAPE 1 : Place tes images dans le bon dossier :
   - Jawline: public/exercises/jawline/jawline-exo-X/
   - Double menton: public/exercises/double-menton/dm-exo-X/

ÉTAPE 2 : Nomme les images 1.png, 2.png, 3.png (ou .PNG, .jpeg, .jpg)

ÉTAPE 3 : Décommente et adapte les require() correspondants :

   jaw_1: [
     require('../public/exercises/jawline/jawline-exo-1/1.png'),
     require('../public/exercises/jawline/jawline-exo-1/2.PNG'),
     require('../public/exercises/jawline/jawline-exo-1/3.PNG'),
   ],

   dc_1: [
     require('../public/exercises/double-menton/dm-exo-1/1.jpeg'),
     require('../public/exercises/double-menton/dm-exo-1/2.jpeg'),
   ],

ÉTAPE 4 : Relance Metro (npx expo start -c) pour que les nouveaux require() soient pris en compte

IMPORTANT :
- Les chemins dans require() DOIVENT être des strings littérales
- Les extensions sont sensibles à la casse (.png ≠ .PNG)
- Vérifie bien l'extension exacte de chaque fichier
*/
