// ============================================
// EXERCICES BONUS - FITNESS FACE
// 20 exercices bonus avec rotation intelligente
// ============================================

export interface BonusExerciseDefinition {
  id: string;
  name: string;
  shortInstruction: string;
  baseDuration: number; // en secondes
  category: 'relaxation' | 'stretch' | 'activation' | 'massage' | 'breathing';
}

// 20 exercices bonus variés
export const BONUS_EXERCISES: BonusExerciseDefinition[] = [
  // Relaxation (4)
  {
    id: 'bonus_1',
    name: 'Massage Tempes',
    shortInstruction: 'Masse doucement tes tempes en cercles pendant 20s',
    baseDuration: 20,
    category: 'relaxation',
  },
  {
    id: 'bonus_2',
    name: 'Relâchement Mâchoire',
    shortInstruction: 'Laisse ta mâchoire se détendre complètement, bouche légèrement ouverte',
    baseDuration: 25,
    category: 'relaxation',
  },
  {
    id: 'bonus_3',
    name: 'Pression Points Visage',
    shortInstruction: 'Presse délicatement les points autour des yeux et du front',
    baseDuration: 30,
    category: 'relaxation',
  },
  {
    id: 'bonus_4',
    name: 'Détente Nuque',
    shortInstruction: 'Laisse tomber ta tête doucement en avant, relâche la nuque',
    baseDuration: 20,
    category: 'relaxation',
  },

  // Stretch (5)
  {
    id: 'bonus_5',
    name: 'Étirement Cou Latéral',
    shortInstruction: 'Incline la tête sur le côté, oreille vers l\'épaule, maintiens',
    baseDuration: 25,
    category: 'stretch',
  },
  {
    id: 'bonus_6',
    name: 'Ouverture Bouche Max',
    shortInstruction: 'Ouvre la bouche au maximum, maintiens 3s, relâche doucement',
    baseDuration: 20,
    category: 'stretch',
  },
  {
    id: 'bonus_7',
    name: 'Rotation Tête Lente',
    shortInstruction: 'Fais des cercles lents avec la tête, 5 dans chaque sens',
    baseDuration: 30,
    category: 'stretch',
  },
  {
    id: 'bonus_8',
    name: 'Étirement Platysma',
    shortInstruction: 'Tire les coins de la bouche vers le bas en étirant le cou',
    baseDuration: 25,
    category: 'stretch',
  },
  {
    id: 'bonus_9',
    name: 'Extension Menton',
    shortInstruction: 'Pousse le menton vers le plafond en gardant les lèvres fermées',
    baseDuration: 20,
    category: 'stretch',
  },

  // Activation (4)
  {
    id: 'bonus_10',
    name: 'Sourire Large',
    shortInstruction: 'Souris au maximum en soulevant les joues vers les yeux',
    baseDuration: 20,
    category: 'activation',
  },
  {
    id: 'bonus_11',
    name: 'Moue Exagérée',
    shortInstruction: 'Fais une moue en poussant les lèvres vers l\'avant, maintiens',
    baseDuration: 20,
    category: 'activation',
  },
  {
    id: 'bonus_12',
    name: 'Gonflement Joues',
    shortInstruction: 'Gonfle les joues avec de l\'air, transfère de gauche à droite',
    baseDuration: 25,
    category: 'activation',
  },
  {
    id: 'bonus_13',
    name: 'Contraction Yeux',
    shortInstruction: 'Ferme fort les yeux 3s, puis ouvre grand, répète',
    baseDuration: 20,
    category: 'activation',
  },

  // Massage (4)
  {
    id: 'bonus_14',
    name: 'Drainage Lymphatique',
    shortInstruction: 'Glisse tes doigts du menton vers les oreilles doucement',
    baseDuration: 30,
    category: 'massage',
  },
  {
    id: 'bonus_15',
    name: 'Pincement Joues',
    shortInstruction: 'Pince légèrement les joues pour stimuler la circulation',
    baseDuration: 25,
    category: 'massage',
  },
  {
    id: 'bonus_16',
    name: 'Tapotement Front',
    shortInstruction: 'Tapote doucement le front avec les doigts',
    baseDuration: 20,
    category: 'massage',
  },
  {
    id: 'bonus_17',
    name: 'Massage Mâchoire',
    shortInstruction: 'Masse les muscles de la mâchoire en cercles profonds',
    baseDuration: 30,
    category: 'massage',
  },

  // Breathing (3)
  {
    id: 'bonus_18',
    name: 'Respiration Faciale',
    shortInstruction: 'Inspire par le nez en gonflant les joues, expire lentement',
    baseDuration: 30,
    category: 'breathing',
  },
  {
    id: 'bonus_19',
    name: 'Souffle Puissant',
    shortInstruction: 'Expire fortement comme si tu soufflais une bougie loin de toi',
    baseDuration: 20,
    category: 'breathing',
  },
  {
    id: 'bonus_20',
    name: 'Respiration Carrée',
    shortInstruction: 'Inspire 4s, retiens 4s, expire 4s, pause 4s - 3 cycles',
    baseDuration: 50,
    category: 'breathing',
  },
];

// ============================================
// ROTATION INTELLIGENTE
// ============================================

const MIN_SPACING_DAYS = 5; // Éviter de répéter un bonus pendant X jours

interface BonusHistory {
  dayNumber: number;
  bonusId: string;
}

/**
 * Génère un seed stable basé sur le jour du programme
 */
function getDaySeed(dayNumber: number): number {
  // Utiliser une formule pour générer un nombre pseudo-aléatoire stable
  const seed = (dayNumber * 2654435761) % (2 ** 32);
  return seed;
}

/**
 * Sélectionne un exercice bonus pour le jour donné
 * Évite les bonus utilisés dans les MIN_SPACING_DAYS derniers jours
 */
export function pickBonusForDay(
  dayNumber: number,
  recentBonusHistory: BonusHistory[] = []
): BonusExerciseDefinition {
  // IDs des bonus récemment utilisés (à éviter)
  const recentBonusIds = new Set(
    recentBonusHistory
      .filter(h => dayNumber - h.dayNumber < MIN_SPACING_DAYS)
      .map(h => h.bonusId)
  );

  // Filtrer les bonus disponibles
  let availableBonuses = BONUS_EXERCISES.filter(b => !recentBonusIds.has(b.id));

  // Si tous sont récents, prendre tous les bonus
  if (availableBonuses.length === 0) {
    availableBonuses = [...BONUS_EXERCISES];
  }

  // Sélection déterministe basée sur le jour
  const seed = getDaySeed(dayNumber);
  const index = seed % availableBonuses.length;

  return availableBonuses[index];
}

/**
 * Calcule les séries et durée du bonus selon la progression
 */
export function getBonusConfig(dayNumber: number, totalDays: number): {
  seriesCount: number;
  durationPerSeries: number;
} {
  const progress = dayNumber / totalDays;

  if (progress <= 0.33) {
    return { seriesCount: 2, durationPerSeries: 20 };
  } else if (progress <= 0.66) {
    return { seriesCount: 2, durationPerSeries: 25 };
  } else {
    return { seriesCount: 3, durationPerSeries: 25 };
  }
}

/**
 * Génère l'exercice bonus complet pour un jour donné
 */
export function generateBonusExercise(
  dayNumber: number,
  totalDays: number,
  recentBonusHistory: BonusHistory[] = []
): {
  exerciseId: string;
  name: string;
  displayName: string;
  instruction: string;
  seriesCount: number;
  durationPerSeries: number;
  category: string;
} {
  const bonus = pickBonusForDay(dayNumber, recentBonusHistory);
  const config = getBonusConfig(dayNumber, totalDays);

  return {
    exerciseId: bonus.id,
    name: bonus.name,
    displayName: `${bonus.name} (Bonus)`,
    instruction: bonus.shortInstruction,
    seriesCount: config.seriesCount,
    durationPerSeries: config.durationPerSeries,
    category: bonus.category,
  };
}
