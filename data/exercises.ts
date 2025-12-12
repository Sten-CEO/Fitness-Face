// ============================================
// CATALOGUE D'EXERCICES - FITNESS FACE
// ============================================

export type ExerciseCategory = 'jawline' | 'double_chin';
export type ExerciseLevel = 'basic' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  category: ExerciseCategory;
  baseName: string; // Nom de base de l'exercice
  description: string;
  targetMuscles: string[];
  // Variantes par niveau
  variants: {
    basic: ExerciseVariant;
    intermediate: ExerciseVariant;
    advanced: ExerciseVariant;
  };
}

export interface ExerciseVariant {
  name: string; // Nom affiché (peut différer selon le niveau)
  duration: string;
  durationSeconds: number;
  instructions: string;
  intensity: number; // 1-10
}

// ============================================
// 15 EXERCICES JAWLINE
// ============================================
export const jawlineExercises: Exercise[] = [
  {
    id: 'jaw_1',
    category: 'jawline',
    baseName: 'Mewing',
    description: 'Posture de la langue contre le palais pour restructurer la mâchoire',
    targetMuscles: ['masseter', 'temporal', 'langue'],
    variants: {
      basic: {
        name: 'Mewing Découverte',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Place doucement la langue contre le palais, respire normalement',
        intensity: 3,
      },
      intermediate: {
        name: 'Mewing Tenue',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Maintiens la pression de la langue contre le palais avec force modérée',
        intensity: 5,
      },
      advanced: {
        name: 'Mewing Intensif',
        duration: '90s',
        durationSeconds: 90,
        instructions: 'Pression maximale de la langue, engage les muscles du plancher buccal',
        intensity: 8,
      },
    },
  },
  {
    id: 'jaw_2',
    category: 'jawline',
    baseName: 'Chin Lifts',
    description: 'Élévation du menton pour tonifier la ligne de mâchoire',
    targetMuscles: ['platysma', 'sternocleidomastoid'],
    variants: {
      basic: {
        name: 'Chin Lift Doux',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Lève doucement le menton vers le plafond, maintiens 3 secondes',
        intensity: 2,
      },
      intermediate: {
        name: 'Chin Lift Contrôlé',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Lève le menton en contractant les muscles du cou, tiens 5 secondes',
        intensity: 5,
      },
      advanced: {
        name: 'Chin Lift Puissance',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Extension maximale avec résistance de la main sous le menton',
        intensity: 8,
      },
    },
  },
  {
    id: 'jaw_3',
    category: 'jawline',
    baseName: 'Jaw Clenches',
    description: 'Contractions isométriques de la mâchoire',
    targetMuscles: ['masseter', 'temporal'],
    variants: {
      basic: {
        name: 'Contraction Légère',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Serre légèrement les dents 3 secondes, relâche 2 secondes',
        intensity: 3,
      },
      intermediate: {
        name: 'Contraction Soutenue',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Serre fermement les dents 5 secondes, contrôle le relâchement',
        intensity: 6,
      },
      advanced: {
        name: 'Contraction Maximale',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Contraction puissante avec tenue de 8 secondes, séries rapides',
        intensity: 9,
      },
    },
  },
  {
    id: 'jaw_4',
    category: 'jawline',
    baseName: 'Neck Resistance',
    description: 'Résistance latérale pour sculpter le cou et la mâchoire',
    targetMuscles: ['sternocleidomastoid', 'scalenes', 'platysma'],
    variants: {
      basic: {
        name: 'Résistance Douce',
        duration: '40s',
        durationSeconds: 40,
        instructions: 'Main contre la tempe, pousse doucement, résiste avec le cou',
        intensity: 3,
      },
      intermediate: {
        name: 'Résistance Équilibrée',
        duration: '50s',
        durationSeconds: 50,
        instructions: 'Augmente la pression, maintiens 5 secondes de chaque côté',
        intensity: 6,
      },
      advanced: {
        name: 'Résistance Maximale',
        duration: '70s',
        durationSeconds: 70,
        instructions: 'Pression forte, résistance totale, alterne rapidement',
        intensity: 8,
      },
    },
  },
  {
    id: 'jaw_5',
    category: 'jawline',
    baseName: 'Fish Face',
    description: 'Joues creusées pour définir les pommettes et la mâchoire',
    targetMuscles: ['buccinator', 'zygomaticus'],
    variants: {
      basic: {
        name: 'Fish Face Relax',
        duration: '25s',
        durationSeconds: 25,
        instructions: 'Aspire les joues légèrement, tiens 3 secondes',
        intensity: 2,
      },
      intermediate: {
        name: 'Fish Face Tenue',
        duration: '35s',
        durationSeconds: 35,
        instructions: 'Aspire fermement les joues, maintiens 5 secondes',
        intensity: 5,
      },
      advanced: {
        name: 'Fish Face Sculpté',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Aspiration maximale avec sourire, tenue de 8 secondes',
        intensity: 7,
      },
    },
  },
  {
    id: 'jaw_6',
    category: 'jawline',
    baseName: 'Jaw Slides',
    description: 'Glissement latéral de la mâchoire',
    targetMuscles: ['pterygoid', 'masseter'],
    variants: {
      basic: {
        name: 'Glissement Doux',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Déplace la mâchoire de gauche à droite lentement',
        intensity: 2,
      },
      intermediate: {
        name: 'Glissement Contrôlé',
        duration: '40s',
        durationSeconds: 40,
        instructions: 'Mouvement plus ample avec pause aux extrémités',
        intensity: 5,
      },
      advanced: {
        name: 'Glissement Résisté',
        duration: '50s',
        durationSeconds: 50,
        instructions: 'Ajoute une résistance avec la main, amplitude maximale',
        intensity: 7,
      },
    },
  },
  {
    id: 'jaw_7',
    category: 'jawline',
    baseName: 'Jaw Forward',
    description: 'Projection de la mâchoire vers l\'avant',
    targetMuscles: ['pterygoid', 'masseter', 'temporal'],
    variants: {
      basic: {
        name: 'Projection Légère',
        duration: '25s',
        durationSeconds: 25,
        instructions: 'Avance la mâchoire inférieure doucement, tiens 3 secondes',
        intensity: 3,
      },
      intermediate: {
        name: 'Projection Marquée',
        duration: '35s',
        durationSeconds: 35,
        instructions: 'Projection plus prononcée avec tenue de 5 secondes',
        intensity: 5,
      },
      advanced: {
        name: 'Projection Power',
        duration: '50s',
        durationSeconds: 50,
        instructions: 'Extension maximale, tenue de 8 secondes, répétitions rapides',
        intensity: 8,
      },
    },
  },
  {
    id: 'jaw_8',
    category: 'jawline',
    baseName: 'Tongue Press Palate',
    description: 'Pression de la langue contre le palais dur',
    targetMuscles: ['tongue muscles', 'suprahyoid'],
    variants: {
      basic: {
        name: 'Pression Douce',
        duration: '35s',
        durationSeconds: 35,
        instructions: 'Appuie la langue contre le palais, maintiens légèrement',
        intensity: 2,
      },
      intermediate: {
        name: 'Pression Soutenue',
        duration: '50s',
        durationSeconds: 50,
        instructions: 'Pression modérée avec engagement du plancher buccal',
        intensity: 5,
      },
      advanced: {
        name: 'Pression Maximale',
        duration: '70s',
        durationSeconds: 70,
        instructions: 'Force maximale, langue entière plaquée, respiration contrôlée',
        intensity: 8,
      },
    },
  },
  {
    id: 'jaw_9',
    category: 'jawline',
    baseName: 'Cheek Puff',
    description: 'Gonflement des joues pour travailler les muscles faciaux',
    targetMuscles: ['buccinator', 'orbicularis oris'],
    variants: {
      basic: {
        name: 'Gonflement Léger',
        duration: '25s',
        durationSeconds: 25,
        instructions: 'Gonfle les joues doucement, tiens 3 secondes, relâche',
        intensity: 2,
      },
      intermediate: {
        name: 'Gonflement Alterné',
        duration: '40s',
        durationSeconds: 40,
        instructions: 'Alterne l\'air d\'une joue à l\'autre avec contrôle',
        intensity: 4,
      },
      advanced: {
        name: 'Gonflement Résisté',
        duration: '55s',
        durationSeconds: 55,
        instructions: 'Gonflement maximum, résiste avec les doigts sur les joues',
        intensity: 7,
      },
    },
  },
  {
    id: 'jaw_10',
    category: 'jawline',
    baseName: 'Smile Resistance',
    description: 'Sourire contre résistance pour sculpter',
    targetMuscles: ['zygomaticus', 'risorius', 'masseter'],
    variants: {
      basic: {
        name: 'Sourire Doux',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Souris largement, tiens 3 secondes, relâche',
        intensity: 2,
      },
      intermediate: {
        name: 'Sourire Forcé',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Sourire maximal avec contraction des joues, tenue 5 secondes',
        intensity: 5,
      },
      advanced: {
        name: 'Sourire Power',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Sourire contre les doigts qui résistent, tenue 8 secondes',
        intensity: 8,
      },
    },
  },
  {
    id: 'jaw_11',
    category: 'jawline',
    baseName: 'Vowel Articulation',
    description: 'Articulation exagérée des voyelles',
    targetMuscles: ['orbicularis oris', 'buccinator', 'mentalis'],
    variants: {
      basic: {
        name: 'Voyelles Douces',
        duration: '35s',
        durationSeconds: 35,
        instructions: 'Prononce A-E-I-O-U lentement avec amplitude modérée',
        intensity: 2,
      },
      intermediate: {
        name: 'Voyelles Amplifiées',
        duration: '50s',
        durationSeconds: 50,
        instructions: 'Exagère chaque voyelle, tiens la position 3 secondes',
        intensity: 5,
      },
      advanced: {
        name: 'Voyelles Extrêmes',
        duration: '65s',
        durationSeconds: 65,
        instructions: 'Amplitude maximale, tenue 5 secondes par voyelle',
        intensity: 7,
      },
    },
  },
  {
    id: 'jaw_12',
    category: 'jawline',
    baseName: 'Jaw Rotation',
    description: 'Rotation circulaire de la mâchoire',
    targetMuscles: ['masseter', 'pterygoid', 'temporal'],
    variants: {
      basic: {
        name: 'Rotation Douce',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Fais des cercles lents avec la mâchoire inférieure',
        intensity: 2,
      },
      intermediate: {
        name: 'Rotation Ample',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Cercles plus larges avec contrôle, inverse le sens',
        intensity: 5,
      },
      advanced: {
        name: 'Rotation Complète',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Amplitude maximale, pause aux points cardinaux',
        intensity: 7,
      },
    },
  },
  {
    id: 'jaw_13',
    category: 'jawline',
    baseName: 'Neck Flexion',
    description: 'Flexion du cou pour engager les muscles sous-mentonniers',
    targetMuscles: ['sternocleidomastoid', 'scalenes', 'suprahyoid'],
    variants: {
      basic: {
        name: 'Flexion Légère',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Penche la tête en avant doucement, menton vers poitrine',
        intensity: 2,
      },
      intermediate: {
        name: 'Flexion Tenue',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Flexion avec résistance de la main sur le front',
        intensity: 5,
      },
      advanced: {
        name: 'Flexion Puissance',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Résistance forte, isométrie maximale',
        intensity: 8,
      },
    },
  },
  {
    id: 'jaw_14',
    category: 'jawline',
    baseName: 'Lip Pull',
    description: 'Traction des lèvres vers le haut',
    targetMuscles: ['levator labii', 'zygomaticus', 'mentalis'],
    variants: {
      basic: {
        name: 'Traction Douce',
        duration: '25s',
        durationSeconds: 25,
        instructions: 'Pousse la lèvre inférieure vers le haut doucement',
        intensity: 2,
      },
      intermediate: {
        name: 'Traction Marquée',
        duration: '40s',
        durationSeconds: 40,
        instructions: 'Force la lèvre vers le haut, engage le menton',
        intensity: 5,
      },
      advanced: {
        name: 'Traction Maximale',
        duration: '55s',
        durationSeconds: 55,
        instructions: 'Extension maximale avec contraction de tout le bas du visage',
        intensity: 8,
      },
    },
  },
  {
    id: 'jaw_15',
    category: 'jawline',
    baseName: 'Platysma Stretch',
    description: 'Étirement du muscle platysma',
    targetMuscles: ['platysma', 'sternocleidomastoid'],
    variants: {
      basic: {
        name: 'Étirement Doux',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Tire les coins de la bouche vers le bas, ressens l\'étirement',
        intensity: 2,
      },
      intermediate: {
        name: 'Étirement Profond',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Accentue l\'étirement, tête légèrement en arrière',
        intensity: 5,
      },
      advanced: {
        name: 'Étirement Intense',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Traction maximale avec respiration contrôlée',
        intensity: 7,
      },
    },
  },
];

// ============================================
// 12 EXERCICES DOUBLE MENTON
// ============================================
export const doubleChinExercises: Exercise[] = [
  {
    id: 'dc_1',
    category: 'double_chin',
    baseName: 'Tongue Press',
    description: 'Pression de la langue vers le haut pour engager les muscles sous-mentonniers',
    targetMuscles: ['suprahyoid', 'geniohyoid', 'mylohyoid'],
    variants: {
      basic: {
        name: 'Pression Langue Initiation',
        duration: '35s',
        durationSeconds: 35,
        instructions: 'Presse la langue contre le palais, ressens la contraction sous le menton',
        intensity: 3,
      },
      intermediate: {
        name: 'Pression Langue Renforce',
        duration: '50s',
        durationSeconds: 50,
        instructions: 'Pression soutenue avec engagement actif des muscles du plancher',
        intensity: 5,
      },
      advanced: {
        name: 'Pression Langue Maximale',
        duration: '70s',
        durationSeconds: 70,
        instructions: 'Force maximale, ajoute une élévation du menton',
        intensity: 8,
      },
    },
  },
  {
    id: 'dc_2',
    category: 'double_chin',
    baseName: 'Neck Stretch',
    description: 'Étirement latéral du cou pour allonger et affiner',
    targetMuscles: ['sternocleidomastoid', 'scalenes', 'trapezius'],
    variants: {
      basic: {
        name: 'Étirement Cou Doux',
        duration: '40s',
        durationSeconds: 40,
        instructions: 'Incline la tête sur le côté, maintiens 5 secondes de chaque côté',
        intensity: 2,
      },
      intermediate: {
        name: 'Étirement Cou Profond',
        duration: '55s',
        durationSeconds: 55,
        instructions: 'Étirement plus ample avec légère traction de la main',
        intensity: 5,
      },
      advanced: {
        name: 'Étirement Cou Complet',
        duration: '70s',
        durationSeconds: 70,
        instructions: 'Étirement maximal avec rotation, tenue prolongée',
        intensity: 7,
      },
    },
  },
  {
    id: 'dc_3',
    category: 'double_chin',
    baseName: 'Jaw Jut',
    description: 'Projection de la mâchoire pour réduire le double menton',
    targetMuscles: ['pterygoid', 'masseter', 'suprahyoid'],
    variants: {
      basic: {
        name: 'Projection Découverte',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Avance la mâchoire inférieure, tiens 3 secondes',
        intensity: 3,
      },
      intermediate: {
        name: 'Projection Contrôlée',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Projection avec élévation du menton, tenue de 5 secondes',
        intensity: 5,
      },
      advanced: {
        name: 'Projection Maximale',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Extension complète avec contraction visible, tenue 8 secondes',
        intensity: 8,
      },
    },
  },
  {
    id: 'dc_4',
    category: 'double_chin',
    baseName: 'Ball Exercise',
    description: 'Compression d\'une balle sous le menton',
    targetMuscles: ['suprahyoid', 'infrahyoid', 'platysma'],
    variants: {
      basic: {
        name: 'Compression Douce',
        duration: '35s',
        durationSeconds: 35,
        instructions: 'Presse une balle sous le menton 3 secondes, relâche',
        intensity: 3,
      },
      intermediate: {
        name: 'Compression Rythmée',
        duration: '50s',
        durationSeconds: 50,
        instructions: 'Compressions rythmées de 5 secondes avec pauses courtes',
        intensity: 6,
      },
      advanced: {
        name: 'Compression Intensive',
        duration: '70s',
        durationSeconds: 70,
        instructions: 'Compressions puissantes de 8 secondes, rythme soutenu',
        intensity: 8,
      },
    },
  },
  {
    id: 'dc_5',
    category: 'double_chin',
    baseName: 'Platysma Tone',
    description: 'Tonification du muscle platysma',
    targetMuscles: ['platysma', 'depressor anguli oris'],
    variants: {
      basic: {
        name: 'Platysma Éveil',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Tire les coins de la bouche vers le bas, ressens le cou',
        intensity: 2,
      },
      intermediate: {
        name: 'Platysma Activation',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Contraction visible du cou, maintiens 5 secondes',
        intensity: 5,
      },
      advanced: {
        name: 'Platysma Sculpt',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Contraction maximale avec tête en arrière, tenue 8 secondes',
        intensity: 8,
      },
    },
  },
  {
    id: 'dc_6',
    category: 'double_chin',
    baseName: 'Lymphatic Drainage',
    description: 'Massage drainant pour réduire la rétention',
    targetMuscles: ['lymph nodes', 'facial muscles'],
    variants: {
      basic: {
        name: 'Drainage Léger',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Mouvements doux du menton vers les oreilles',
        intensity: 1,
      },
      intermediate: {
        name: 'Drainage Complet',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Pression modérée, mouvements plus amples vers le cou',
        intensity: 3,
      },
      advanced: {
        name: 'Drainage Profond',
        duration: '90s',
        durationSeconds: 90,
        instructions: 'Technique complète avec points de pression spécifiques',
        intensity: 5,
      },
    },
  },
  {
    id: 'dc_7',
    category: 'double_chin',
    baseName: 'Head Tilt Back',
    description: 'Inclinaison de la tête en arrière',
    targetMuscles: ['sternocleidomastoid', 'scalenes', 'platysma'],
    variants: {
      basic: {
        name: 'Inclinaison Douce',
        duration: '25s',
        durationSeconds: 25,
        instructions: 'Penche la tête doucement en arrière, regarde le plafond',
        intensity: 2,
      },
      intermediate: {
        name: 'Inclinaison Tenue',
        duration: '40s',
        durationSeconds: 40,
        instructions: 'Inclinaison avec poussée du menton vers le haut',
        intensity: 5,
      },
      advanced: {
        name: 'Inclinaison Puissance',
        duration: '55s',
        durationSeconds: 55,
        instructions: 'Extension maximale avec contraction active du cou',
        intensity: 7,
      },
    },
  },
  {
    id: 'dc_8',
    category: 'double_chin',
    baseName: 'Kiss The Ceiling',
    description: 'Mouvement de bisou vers le plafond',
    targetMuscles: ['orbicularis oris', 'platysma', 'suprahyoid'],
    variants: {
      basic: {
        name: 'Bisou Léger',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Tête en arrière, fais un mouvement de bisou vers le haut',
        intensity: 3,
      },
      intermediate: {
        name: 'Bisou Prononcé',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Exagère le mouvement, tiens 5 secondes',
        intensity: 5,
      },
      advanced: {
        name: 'Bisou Intense',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Projection maximale des lèvres, tenue 8 secondes',
        intensity: 7,
      },
    },
  },
  {
    id: 'dc_9',
    category: 'double_chin',
    baseName: 'Chin Scoop',
    description: 'Mouvement de ramassage avec le menton',
    targetMuscles: ['suprahyoid', 'infrahyoid', 'digastric'],
    variants: {
      basic: {
        name: 'Scoop Initiation',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Ouvre la bouche, remonte la mâchoire inférieure comme une pelle',
        intensity: 3,
      },
      intermediate: {
        name: 'Scoop Contrôlé',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Mouvement plus lent et contrôlé, ressens la contraction',
        intensity: 5,
      },
      advanced: {
        name: 'Scoop Power',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Amplitude maximale avec résistance de la main',
        intensity: 8,
      },
    },
  },
  {
    id: 'dc_10',
    category: 'double_chin',
    baseName: 'Tongue Out Stretch',
    description: 'Extension de la langue vers l\'extérieur',
    targetMuscles: ['genioglossus', 'hyoglossus', 'suprahyoid'],
    variants: {
      basic: {
        name: 'Langue Sortie Douce',
        duration: '25s',
        durationSeconds: 25,
        instructions: 'Tire la langue doucement, pointe vers le menton',
        intensity: 2,
      },
      intermediate: {
        name: 'Langue Extension',
        duration: '40s',
        durationSeconds: 40,
        instructions: 'Extension plus loin, tiens 5 secondes',
        intensity: 5,
      },
      advanced: {
        name: 'Langue Maximale',
        duration: '55s',
        durationSeconds: 55,
        instructions: 'Extension complète vers le menton, tenue 8 secondes',
        intensity: 7,
      },
    },
  },
  {
    id: 'dc_11',
    category: 'double_chin',
    baseName: 'Neck Roll',
    description: 'Rotation complète du cou',
    targetMuscles: ['sternocleidomastoid', 'scalenes', 'trapezius', 'splenius'],
    variants: {
      basic: {
        name: 'Rotation Lente',
        duration: '35s',
        durationSeconds: 35,
        instructions: 'Fais des cercles lents avec la tête, respire profondément',
        intensity: 1,
      },
      intermediate: {
        name: 'Rotation Complète',
        duration: '50s',
        durationSeconds: 50,
        instructions: 'Cercles plus amples, pause aux points cardinaux',
        intensity: 3,
      },
      advanced: {
        name: 'Rotation Résistée',
        duration: '65s',
        durationSeconds: 65,
        instructions: 'Ajoute une résistance de la main à certains points',
        intensity: 5,
      },
    },
  },
  {
    id: 'dc_12',
    category: 'double_chin',
    baseName: 'Collar Bone Backup',
    description: 'Tête en arrière avec épaules basses',
    targetMuscles: ['platysma', 'sternocleidomastoid', 'scalenes'],
    variants: {
      basic: {
        name: 'Backup Découverte',
        duration: '30s',
        durationSeconds: 30,
        instructions: 'Abaisse les épaules, tire la tête en arrière doucement',
        intensity: 2,
      },
      intermediate: {
        name: 'Backup Tenu',
        duration: '45s',
        durationSeconds: 45,
        instructions: 'Accentue l\'étirement, maintiens 5 secondes',
        intensity: 5,
      },
      advanced: {
        name: 'Backup Intense',
        duration: '60s',
        durationSeconds: 60,
        instructions: 'Extension maximale avec contraction du platysma visible',
        intensity: 7,
      },
    },
  },
];

// ============================================
// HELPERS
// ============================================
export function getExerciseById(id: string): Exercise | undefined {
  return [...jawlineExercises, ...doubleChinExercises].find(e => e.id === id);
}

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  if (category === 'jawline') return jawlineExercises;
  return doubleChinExercises;
}

export function getExerciseVariant(exercise: Exercise, level: ExerciseLevel): ExerciseVariant {
  return exercise.variants[level];
}

// Crée une version bonus (plus douce) d'un exercice
export function createBonusVersion(exercise: Exercise): ExerciseVariant {
  const basic = exercise.variants.basic;
  return {
    name: `${basic.name} (Bonus)`,
    duration: `${Math.round(basic.durationSeconds * 0.6)}s`,
    durationSeconds: Math.round(basic.durationSeconds * 0.6),
    instructions: `Version douce : ${basic.instructions}`,
    intensity: Math.max(1, basic.intensity - 2),
  };
}
