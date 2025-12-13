// ============================================
// CATALOGUE OFFICIEL D'EXERCICES - FITNESS FACE
// 15 Jawline + 12 Double Menton (IMMUTABLE)
// ============================================

export type ExerciseCategory = 'jawline' | 'double_chin';

// Niveaux d'intensité pour le renouvellement
export type IntensityLevel = 'normal' | 'hard' | 'advanced' | 'elite';

export interface Exercise {
  id: string;
  number: number; // 1-15 pour jawline, 1-12 pour double menton
  category: ExerciseCategory;
  name: string;
  description: string;
  instructions: string;
  targetMuscles: string[];
  baseDurationSeconds: number; // 30-45s par série
  imageFolder: string; // jawline-exo-X ou dm-exo-X
}

// ============================================
// 15 EXERCICES JAWLINE (OFFICIELS)
// ============================================

export const jawlineExercises: Exercise[] = [
  {
    id: 'jaw_1',
    number: 1,
    category: 'jawline',
    name: 'Jaw Push Forward',
    description: 'Projection de la mâchoire vers l\'avant pour sculpter la ligne de mâchoire',
    instructions: 'Pousse ta mâchoire inférieure vers l\'avant, maintiens la position, puis relâche lentement',
    targetMuscles: ['masseter', 'pterygoid', 'temporal'],
    baseDurationSeconds: 45,
    imageFolder: 'jawline-exo-1',
  },
  {
    id: 'jaw_2',
    number: 2,
    category: 'jawline',
    name: 'Chin Lift Hold',
    description: 'Élévation et maintien du menton pour tonifier',
    instructions: 'Lève le menton vers le plafond, contracte les muscles du cou, maintiens la position',
    targetMuscles: ['platysma', 'sternocleidomastoid'],
    baseDurationSeconds: 45,
    imageFolder: 'jawline-exo-2',
  },
  {
    id: 'jaw_3',
    number: 3,
    category: 'jawline',
    name: 'Jaw Resistance Press',
    description: 'Pression résistée de la mâchoire pour renforcer',
    instructions: 'Place ton poing sous le menton, pousse vers le haut pendant que tu résistes avec la mâchoire',
    targetMuscles: ['masseter', 'temporal', 'suprahyoid'],
    baseDurationSeconds: 40,
    imageFolder: 'jawline-exo-3',
  },
  {
    id: 'jaw_4',
    number: 4,
    category: 'jawline',
    name: 'Side Jaw Slide',
    description: 'Glissement latéral de la mâchoire',
    instructions: 'Déplace ta mâchoire de gauche à droite lentement, en maintenant une tension constante',
    targetMuscles: ['pterygoid', 'masseter'],
    baseDurationSeconds: 35,
    imageFolder: 'jawline-exo-4',
  },
  {
    id: 'jaw_5',
    number: 5,
    category: 'jawline',
    name: 'Clenched Teeth Hold',
    description: 'Contraction isométrique des dents serrées',
    instructions: 'Serre les dents fermement, ressens la contraction du masseter, maintiens puis relâche',
    targetMuscles: ['masseter', 'temporal'],
    baseDurationSeconds: 30,
    imageFolder: 'jawline-exo-5',
  },
  {
    id: 'jaw_6',
    number: 6,
    category: 'jawline',
    name: 'Neck Extension Stretch',
    description: 'Extension du cou pour allonger et définir',
    instructions: 'Incline la tête en arrière, étire le devant du cou, maintiens la position',
    targetMuscles: ['sternocleidomastoid', 'platysma', 'scalenes'],
    baseDurationSeconds: 40,
    imageFolder: 'jawline-exo-6',
  },
  {
    id: 'jaw_7',
    number: 7,
    category: 'jawline',
    name: 'Cheek Lift Activation',
    description: 'Activation des muscles des joues pour sculpter',
    instructions: 'Souris largement en soulevant les joues vers les yeux, maintiens la contraction',
    targetMuscles: ['zygomaticus', 'buccinator'],
    baseDurationSeconds: 35,
    imageFolder: 'jawline-exo-7',
  },
  {
    id: 'jaw_8',
    number: 8,
    category: 'jawline',
    name: 'Lower Jaw Drop Control',
    description: 'Descente contrôlée de la mâchoire inférieure',
    instructions: 'Ouvre la bouche lentement en contrôlant le mouvement, puis referme avec résistance',
    targetMuscles: ['masseter', 'pterygoid', 'digastric'],
    baseDurationSeconds: 35,
    imageFolder: 'jawline-exo-8',
  },
  {
    id: 'jaw_9',
    number: 9,
    category: 'jawline',
    name: 'Jaw Circle Rotation',
    description: 'Rotation circulaire de la mâchoire',
    instructions: 'Fais des cercles lents avec la mâchoire inférieure, d\'abord dans un sens puis l\'autre',
    targetMuscles: ['masseter', 'pterygoid', 'temporal'],
    baseDurationSeconds: 40,
    imageFolder: 'jawline-exo-9',
  },
  {
    id: 'jaw_10',
    number: 10,
    category: 'jawline',
    name: 'Tongue to Palate Press',
    description: 'Pression de la langue contre le palais (Mewing)',
    instructions: 'Presse toute la surface de ta langue contre le palais, maintiens une pression constante',
    targetMuscles: ['tongue muscles', 'suprahyoid', 'masseter'],
    baseDurationSeconds: 45,
    imageFolder: 'jawline-exo-10',
  },
  {
    id: 'jaw_11',
    number: 11,
    category: 'jawline',
    name: 'Isometric Jaw Hold',
    description: 'Maintien isométrique de la mâchoire',
    instructions: 'Contracte tous les muscles de la mâchoire sans mouvement, maintiens la tension maximale',
    targetMuscles: ['masseter', 'temporal', 'pterygoid'],
    baseDurationSeconds: 30,
    imageFolder: 'jawline-exo-11',
  },
  {
    id: 'jaw_12',
    number: 12,
    category: 'jawline',
    name: 'Neck Tilt & Jaw Engage',
    description: 'Inclinaison du cou avec engagement de la mâchoire',
    instructions: 'Incline la tête sur le côté tout en contractant la mâchoire du côté opposé',
    targetMuscles: ['sternocleidomastoid', 'masseter', 'scalenes'],
    baseDurationSeconds: 40,
    imageFolder: 'jawline-exo-12',
  },
  {
    id: 'jaw_13',
    number: 13,
    category: 'jawline',
    name: 'Forward Neck Reach',
    description: 'Extension du cou vers l\'avant',
    instructions: 'Pousse le menton vers l\'avant en gardant les épaules fixes, ressens l\'étirement',
    targetMuscles: ['sternocleidomastoid', 'platysma', 'suprahyoid'],
    baseDurationSeconds: 35,
    imageFolder: 'jawline-exo-13',
  },
  {
    id: 'jaw_14',
    number: 14,
    category: 'jawline',
    name: 'Jaw Pulse Micro-Movement',
    description: 'Micro-mouvements pulsés de la mâchoire',
    instructions: 'Fais de petits mouvements rapides d\'ouverture/fermeture de la mâchoire en pulsant',
    targetMuscles: ['masseter', 'temporal', 'digastric'],
    baseDurationSeconds: 30,
    imageFolder: 'jawline-exo-14',
  },
  {
    id: 'jaw_15',
    number: 15,
    category: 'jawline',
    name: 'Full Jawline Activation Flow',
    description: 'Enchaînement complet d\'activation de la mâchoire',
    instructions: 'Combine projection, contraction et rotation en un mouvement fluide et contrôlé',
    targetMuscles: ['masseter', 'temporal', 'pterygoid', 'platysma'],
    baseDurationSeconds: 45,
    imageFolder: 'jawline-exo-15',
  },
];

// ============================================
// 12 EXERCICES DOUBLE MENTON (OFFICIELS)
// ============================================

export const doubleChinExercises: Exercise[] = [
  {
    id: 'dc_1',
    number: 1,
    category: 'double_chin',
    name: 'Chin Lift Hold',
    description: 'Élévation et maintien du menton pour réduire le double menton',
    instructions: 'Lève le menton vers le plafond, contracte la zone sous le menton, maintiens',
    targetMuscles: ['suprahyoid', 'platysma', 'sternocleidomastoid'],
    baseDurationSeconds: 45,
    imageFolder: 'dm-exo-1',
  },
  {
    id: 'dc_2',
    number: 2,
    category: 'double_chin',
    name: 'Neck Extension Stretch',
    description: 'Extension du cou pour étirer et tonifier',
    instructions: 'Incline la tête en arrière, étire le devant du cou au maximum, respire profondément',
    targetMuscles: ['sternocleidomastoid', 'platysma', 'scalenes'],
    baseDurationSeconds: 40,
    imageFolder: 'dm-exo-2',
  },
  {
    id: 'dc_3',
    number: 3,
    category: 'double_chin',
    name: 'Forward Neck Reach',
    description: 'Extension du cou vers l\'avant pour engager les muscles',
    instructions: 'Pousse le menton vers l\'avant, ressens la contraction sous le menton',
    targetMuscles: ['suprahyoid', 'geniohyoid', 'platysma'],
    baseDurationSeconds: 35,
    imageFolder: 'dm-exo-3',
  },
  {
    id: 'dc_4',
    number: 4,
    category: 'double_chin',
    name: 'Upward Jaw Tilt',
    description: 'Inclinaison de la mâchoire vers le haut',
    instructions: 'Incline la mâchoire vers le haut en poussant, maintiens la tension',
    targetMuscles: ['suprahyoid', 'mylohyoid', 'digastric'],
    baseDurationSeconds: 40,
    imageFolder: 'dm-exo-4',
  },
  {
    id: 'dc_5',
    number: 5,
    category: 'double_chin',
    name: 'Chin Tuck Compression',
    description: 'Compression par rentrée du menton',
    instructions: 'Rentre le menton vers la gorge en créant un "double menton volontaire", puis relâche',
    targetMuscles: ['suprahyoid', 'infrahyoid', 'sternocleidomastoid'],
    baseDurationSeconds: 35,
    imageFolder: 'dm-exo-5',
  },
  {
    id: 'dc_6',
    number: 6,
    category: 'double_chin',
    name: 'Suprahyoid Activation Hold',
    description: 'Activation et maintien des muscles suprahyoïdiens',
    instructions: 'Ouvre légèrement la bouche, pousse la langue contre le palais, ressens la contraction',
    targetMuscles: ['suprahyoid', 'geniohyoid', 'mylohyoid'],
    baseDurationSeconds: 45,
    imageFolder: 'dm-exo-6',
  },
  {
    id: 'dc_7',
    number: 7,
    category: 'double_chin',
    name: 'Neck Lift Isometric',
    description: 'Levée isométrique du cou',
    instructions: 'Allongé sur le dos, soulève légèrement la tête en contractant le cou, maintiens',
    targetMuscles: ['sternocleidomastoid', 'suprahyoid', 'platysma'],
    baseDurationSeconds: 30,
    imageFolder: 'dm-exo-7',
  },
  {
    id: 'dc_8',
    number: 8,
    category: 'double_chin',
    name: 'Lower Face Stretch',
    description: 'Étirement du bas du visage',
    instructions: 'Étire les coins de la bouche vers le bas, ressens l\'étirement du cou et du menton',
    targetMuscles: ['platysma', 'depressor anguli oris', 'mentalis'],
    baseDurationSeconds: 35,
    imageFolder: 'dm-exo-8',
  },
  {
    id: 'dc_9',
    number: 9,
    category: 'double_chin',
    name: 'Platysma Tightening',
    description: 'Resserrement du muscle platysma',
    instructions: 'Contracte le muscle du cou en tirant les coins de la bouche vers le bas fermement',
    targetMuscles: ['platysma', 'sternocleidomastoid'],
    baseDurationSeconds: 40,
    imageFolder: 'dm-exo-9',
  },
  {
    id: 'dc_10',
    number: 10,
    category: 'double_chin',
    name: 'Jaw & Neck Lock',
    description: 'Verrouillage mâchoire et cou',
    instructions: 'Serre la mâchoire et contracte le cou simultanément, maintiens la tension',
    targetMuscles: ['masseter', 'sternocleidomastoid', 'platysma'],
    baseDurationSeconds: 35,
    imageFolder: 'dm-exo-10',
  },
  {
    id: 'dc_11',
    number: 11,
    category: 'double_chin',
    name: 'Controlled Head Tilt Back',
    description: 'Inclinaison contrôlée de la tête en arrière',
    instructions: 'Incline lentement la tête en arrière en contrôlant chaque degré du mouvement',
    targetMuscles: ['sternocleidomastoid', 'scalenes', 'suprahyoid'],
    baseDurationSeconds: 40,
    imageFolder: 'dm-exo-11',
  },
  {
    id: 'dc_12',
    number: 12,
    category: 'double_chin',
    name: 'Full Neck & Chin Activation Flow',
    description: 'Enchaînement complet d\'activation cou et menton',
    instructions: 'Combine élévation, contraction et étirement en un mouvement fluide',
    targetMuscles: ['suprahyoid', 'platysma', 'sternocleidomastoid', 'digastric'],
    baseDurationSeconds: 45,
    imageFolder: 'dm-exo-12',
  },
];

// ============================================
// HELPERS
// ============================================

export function getExerciseById(id: string): Exercise | undefined {
  return [...jawlineExercises, ...doubleChinExercises].find(e => e.id === id);
}

export function getExerciseByNumber(category: ExerciseCategory, number: number): Exercise | undefined {
  const exercises = category === 'jawline' ? jawlineExercises : doubleChinExercises;
  return exercises.find(e => e.number === number);
}

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return category === 'jawline' ? jawlineExercises : doubleChinExercises;
}

// Nom intensifié selon le niveau
export function getIntensifiedName(baseName: string, level: IntensityLevel): string {
  switch (level) {
    case 'normal':
      return baseName;
    case 'hard':
      return `${baseName} (Hard)`;
    case 'advanced':
      return `${baseName} (Advanced)`;
    case 'elite':
      return `${baseName} (Elite)`;
  }
}

// Nombre de séries selon le niveau
export function getSeriesCount(level: IntensityLevel): number {
  switch (level) {
    case 'normal':
      return 3;
    case 'hard':
      return 4;
    case 'advanced':
      return 5;
    case 'elite':
      return 6;
  }
}

// Niveau d'intensité selon la progression du programme
export function getIntensityLevel(dayNumber: number, totalDays: number): IntensityLevel {
  const progress = dayNumber / totalDays;

  if (progress <= 0.25) return 'normal';
  if (progress <= 0.50) return 'hard';
  if (progress <= 0.75) return 'advanced';
  return 'elite';
}
