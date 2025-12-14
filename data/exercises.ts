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
    instructions: '1. Position : tete droite, epaules detendues. 2. Avance lentement ta machoire inferieure vers l\'avant (2-3 cm). 3. Maintiens 5 secondes en contractant. 4. Reviens doucement en position. Conseil : Evite les mouvements brusques. Tu dois sentir une tension sur les cotes de la machoire.',
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
    instructions: '1. Tiens-toi droit, epaules basses. 2. Leve le menton vers le plafond en inclinant la tete en arriere. 3. Ferme la bouche et pousse la machoire vers le haut. 4. Maintiens 5-10 secondes. Conseil : Ne force pas sur la nuque. Tu dois sentir un etirement a l\'avant du cou.',
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
    instructions: '1. Place ton poing ferme sous ton menton. 2. Essaie d\'ouvrir la bouche vers le bas. 3. Resiste avec ton poing pour empecher le mouvement. 4. Maintiens la tension 5-8 secondes. Important : La machoire ne doit pas bouger, c\'est isometrique. Tu dois sentir les muscles sous le menton travailler.',
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
    instructions: '1. Bouche legerement entrouverte, machoire detendue. 2. Glisse la machoire vers la gauche au maximum. 3. Maintiens 2 secondes. 4. Glisse vers la droite. 5. Repete lentement. Conseil : Mouvement fluide, sans a-coup. Tu dois sentir un travail sur les cotes de la machoire.',
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
    instructions: '1. Ferme la bouche, dents en contact. 2. Serre progressivement les dents (pas trop fort). 3. Maintiens la contraction 5-8 secondes. 4. Relache completement. Important : Ne serre pas a 100%, garde 70-80% d\'intensite. Tu dois voir et sentir le masseter se contracter sur les cotes.',
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
    instructions: '1. Assis ou debout, dos droit, epaules relachees. 2. Incline doucement la tete vers l\'arriere. 3. Regarde le plafond, bouche fermee. 4. Etire le devant du cou, maintiens 10-15 secondes. Conseil : Mouvement lent et controle. Tu dois ressentir un etirement agreable a l\'avant du cou.',
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
    instructions: '1. Detends ton visage completement. 2. Souris largement en montrant les dents du haut. 3. Essaie de "pousser" tes joues vers tes yeux. 4. Maintiens 5 secondes, relache. Conseil : Evite de plisser les yeux excessivement. Tu dois sentir les joues se soulever.',
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
    instructions: '1. Tete droite, machoire detendue. 2. Ouvre la bouche tres lentement (5 secondes pour ouvrir). 3. Atteins l\'ouverture maximale confortable. 4. Referme aussi lentement en resistant. Important : Mouvement ultra-lent, controle total. Tu dois sentir les muscles travailler pendant tout le mouvement.',
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
    instructions: '1. Bouche legerement ouverte, detendue. 2. Dessine un cercle avec ta machoire (avant-gauche-arriere-droite). 3. Fais 5 cercles dans un sens. 4. Puis 5 cercles dans l\'autre sens. Conseil : Cercles lents et reguliers. Tu dois sentir un travail complet de l\'articulation.',
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
    instructions: '1. Bouche fermee, dents legerement ecartees. 2. Pose TOUTE ta langue contre le palais (pas juste la pointe). 3. Appuie fermement vers le haut. 4. Maintiens la pression constante. Important : Respire par le nez. Tu dois sentir une activation sous le menton et dans la machoire.',
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
    instructions: '1. Ferme la bouche, machoire serree moderement. 2. Contracte TOUS les muscles de la machoire. 3. Imagine que tu essaies de mordre dans quelque chose de dur. 4. Maintiens 8-10 secondes a intensite constante. Important : Pas de mouvement, tension pure. Tous les muscles de la machoire doivent etre engages.',
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
    instructions: '1. Incline la tete vers l\'epaule droite. 2. Contracte la machoire du cote gauche. 3. Maintiens 5 secondes. 4. Change de cote et repete. Conseil : L\'epaule ne doit pas monter vers l\'oreille. Tu dois sentir un etirement d\'un cote et une contraction de l\'autre.',
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
    instructions: '1. Epaules fixes et basses. 2. Pousse le menton vers l\'avant (comme une tortue). 3. Maintiens 3-5 secondes. 4. Reviens en position neutre. Important : Seule la tete bouge, pas les epaules. Tu dois sentir un etirement a l\'arriere du cou et une contraction a l\'avant.',
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
    instructions: '1. Machoire legerement serree. 2. Fais de mini-ouvertures rapides (5mm max). 3. Rythme rapide : 2 pulsations par seconde. 4. Continue pendant toute la duree. Important : Mouvements tres petits et rapides. Tu dois sentir les muscles fatiguer rapidement.',
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
    instructions: '1. Commence par une projection avant (2s). 2. Enchaine avec une rotation vers la gauche (2s). 3. Puis projection avant a nouveau (2s). 4. Rotation vers la droite (2s). 5. Termine par une contraction isometrique (3s). Conseil : Mouvement fluide et continu. C\'est un enchainement complet qui cible tous les muscles.',
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
    instructions: '1. Assis ou debout, dos bien droit. 2. Leve le menton vers le plafond. 3. Ferme la bouche et contracte la zone sous le menton. 4. Maintiens 8-10 secondes. 5. Reviens doucement. Conseil : Ressens l\'etirement a l\'avant du cou. Tu dois sentir une tension sous le menton.',
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
    instructions: '1. Position assise ou debout, epaules detendues. 2. Incline doucement la tete en arriere. 3. Etire le devant du cou au maximum. 4. Respire profondement et maintiens 15-20 secondes. Conseil : Mouvement doux, pas de douleur. Tu dois sentir un etirement agreable sur tout l\'avant du cou.',
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
    instructions: '1. Tete droite, epaules fixes. 2. Pousse le menton vers l\'avant (comme une tortue). 3. Maintiens 5 secondes en contractant sous le menton. 4. Reviens lentement. Conseil : Les epaules ne bougent pas. Tu dois sentir une forte contraction sous le menton.',
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
    instructions: '1. Regarde droit devant toi. 2. Pousse ta machoire inferieure vers le haut et l\'avant. 3. Tu dois sentir un etirement sous le menton. 4. Maintiens 5-8 secondes. 5. Relache doucement. Important : Ne force pas sur l\'articulation. C\'est un mouvement de "bec de canard" vers le haut.',
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
    instructions: '1. Tete droite, regard devant. 2. Rentre le menton vers la gorge (cree un "double menton" volontaire). 3. Maintiens 5 secondes. 4. Relache et reviens en position neutre. Conseil : C\'est contre-intuitif mais ca renforce les muscles profonds. Tu dois sentir une compression a l\'avant du cou.',
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
    instructions: '1. Ouvre legerement la bouche (1-2 cm). 2. Presse fermement la langue contre le palais. 3. Ressens la contraction sous le menton. 4. Maintiens 10-15 secondes. Important : La langue ENTIERE doit appuyer, pas seulement la pointe. C\'est la technique du "Mewing".',
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
    instructions: '1. Allonge-toi sur le dos, bras le long du corps. 2. Souleve la tete de 2-3 cm du sol. 3. Regarde tes pieds. 4. Maintiens 10-15 secondes. 5. Repose doucement. Important : Ne tire pas sur la nuque. Tu dois sentir les muscles a l\'avant du cou bruler.',
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
    instructions: '1. Detends ton visage. 2. Tire les coins de la bouche vers le bas (expression de degout). 3. Tu dois voir les muscles du cou se tendre. 4. Maintiens 5-8 secondes. Conseil : C\'est le muscle platysma qui travaille. Tu dois voir des "cordes" apparaitre sur ton cou.',
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
    instructions: '1. Ouvre legerement la bouche. 2. Tire fermement les coins de la bouche vers le bas. 3. Contracte le muscle du cou au maximum. 4. Maintiens 8-10 secondes. Important : C\'est un exercice intense pour le platysma. Tu dois voir les tendons du cou se dessiner nettement.',
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
    instructions: '1. Serre la machoire moderement (70%). 2. Contracte simultanement les muscles du cou. 3. Maintiens cette double tension 8-10 secondes. 4. Relache progressivement. Conseil : Respire normalement pendant l\'exercice. Tu dois sentir une activation complete de la zone menton-cou.',
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
    instructions: '1. Position droite, epaules relachees. 2. Incline la tete vers l\'arriere TRES lentement (10 secondes). 3. Controle chaque degre du mouvement. 4. Reviens aussi lentement. Important : C\'est la lenteur qui fait travailler les muscles. Tu dois sentir chaque muscle s\'engager progressivement.',
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
    instructions: '1. Commence par une elevation du menton (3s). 2. Enchaine avec une projection vers l\'avant (3s). 3. Puis un chin tuck (3s). 4. Termine par une contraction platysma (3s). 5. Repete l\'enchainement fluidement. Conseil : C\'est un flow continu sans pause. Cible tous les muscles de la zone.',
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
