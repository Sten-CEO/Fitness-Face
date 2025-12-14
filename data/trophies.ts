// ============================================
// SYSTÈME DE TROPHÉES - FITNESS FACE
// ============================================

export interface Trophy {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  order: number; // Ordre d'apparition
  condition: {
    type: 'days' | 'streak' | 'bonus';
    target: number;
  };
}

// Liste des trophées dans l'ordre de déblocage
export const TROPHIES: Trophy[] = [
  {
    id: 'trophy_3days',
    title: 'Premier pas',
    description: 'Complète 3 jours de routine',
    icon: 'footsteps-outline',
    color: '#8B5CF6',
    order: 1,
    condition: { type: 'days', target: 3 },
  },
  {
    id: 'trophy_week1',
    title: 'Première semaine',
    description: 'Complète 7 jours de routine',
    icon: 'trophy-outline',
    color: '#3B82F6',
    order: 2,
    condition: { type: 'days', target: 7 },
  },
  {
    id: 'trophy_streak3',
    title: 'Régularité',
    description: '3 jours d\'affilée',
    icon: 'flame-outline',
    color: '#EF4444',
    order: 3,
    condition: { type: 'streak', target: 3 },
  },
  {
    id: 'trophy_14days',
    title: 'Deux semaines',
    description: 'Complète 14 jours de routine',
    icon: 'calendar-outline',
    color: '#22C55E',
    order: 4,
    condition: { type: 'days', target: 14 },
  },
  {
    id: 'trophy_bonus3',
    title: 'Bonus Lover',
    description: '3 exercices bonus complétés',
    icon: 'star-outline',
    color: '#F59E0B',
    order: 5,
    condition: { type: 'bonus', target: 3 },
  },
  {
    id: 'trophy_streak7',
    title: 'En feu',
    description: '7 jours d\'affilée',
    icon: 'bonfire-outline',
    color: '#FF6B35',
    order: 6,
    condition: { type: 'streak', target: 7 },
  },
  {
    id: 'trophy_month1',
    title: 'Premier mois',
    description: 'Complète 30 jours de routine',
    icon: 'medal-outline',
    color: '#8B5CF6',
    order: 7,
    condition: { type: 'days', target: 30 },
  },
  {
    id: 'trophy_bonus10',
    title: 'Perfectionniste',
    description: '10 exercices bonus complétés',
    icon: 'ribbon-outline',
    color: '#EC4899',
    order: 8,
    condition: { type: 'bonus', target: 10 },
  },
  {
    id: 'trophy_streak14',
    title: 'Inarrêtable',
    description: '14 jours d\'affilée',
    icon: 'rocket-outline',
    color: '#06B6D4',
    order: 9,
    condition: { type: 'streak', target: 14 },
  },
  {
    id: 'trophy_45days',
    title: 'Mi-parcours',
    description: 'Complète 45 jours de routine',
    icon: 'flag-outline',
    color: '#14B8A6',
    order: 10,
    condition: { type: 'days', target: 45 },
  },
  {
    id: 'trophy_streak30',
    title: 'Légende',
    description: '30 jours d\'affilée',
    icon: 'diamond-outline',
    color: '#A855F7',
    order: 11,
    condition: { type: 'streak', target: 30 },
  },
  {
    id: 'trophy_60days',
    title: 'Deux mois',
    description: 'Complète 60 jours de routine',
    icon: 'shield-checkmark-outline',
    color: '#10B981',
    order: 12,
    condition: { type: 'days', target: 60 },
  },
  {
    id: 'trophy_bonus20',
    title: 'Maître Bonus',
    description: '20 exercices bonus complétés',
    icon: 'star',
    color: '#FBBF24',
    order: 13,
    condition: { type: 'bonus', target: 20 },
  },
  {
    id: 'trophy_90days',
    title: 'Programme terminé',
    description: 'Complète 90 jours de routine',
    icon: 'crown-outline',
    color: '#FFD700',
    order: 14,
    condition: { type: 'days', target: 90 },
  },
];

// ============================================
// HELPERS
// ============================================

interface UserProgress {
  completedDaysCount: number;
  streak: number;
  completedBonusesCount: number;
}

/**
 * Vérifie si un trophée est débloqué
 */
export function isTrophyUnlocked(trophy: Trophy, progress: UserProgress): boolean {
  const { type, target } = trophy.condition;

  switch (type) {
    case 'days':
      return progress.completedDaysCount >= target;
    case 'streak':
      return progress.streak >= target;
    case 'bonus':
      return progress.completedBonusesCount >= target;
    default:
      return false;
  }
}

/**
 * Retourne le prochain trophée à atteindre (non débloqué)
 * Retourne null si tous les trophées sont débloqués
 */
export function getActiveTrophy(progress: UserProgress): Trophy | null {
  // Trier par ordre
  const sortedTrophies = [...TROPHIES].sort((a, b) => a.order - b.order);

  for (const trophy of sortedTrophies) {
    if (!isTrophyUnlocked(trophy, progress)) {
      return trophy;
    }
  }

  // Tous les trophées sont débloqués
  return null;
}

/**
 * Retourne le dernier trophée débloqué (pour afficher "Trophée obtenu ✅")
 */
export function getLastUnlockedTrophy(progress: UserProgress): Trophy | null {
  const sortedTrophies = [...TROPHIES].sort((a, b) => b.order - a.order);

  for (const trophy of sortedTrophies) {
    if (isTrophyUnlocked(trophy, progress)) {
      return trophy;
    }
  }

  return null;
}

/**
 * Calcule la progression vers un trophée (0-100%)
 */
export function getTrophyProgress(trophy: Trophy, progress: UserProgress): number {
  const { type, target } = trophy.condition;
  let current = 0;

  switch (type) {
    case 'days':
      current = progress.completedDaysCount;
      break;
    case 'streak':
      current = progress.streak;
      break;
    case 'bonus':
      current = progress.completedBonusesCount;
      break;
  }

  return Math.min(100, (current / target) * 100);
}

/**
 * Retourne tous les trophées débloqués
 */
export function getUnlockedTrophies(progress: UserProgress): Trophy[] {
  return TROPHIES.filter(trophy => isTrophyUnlocked(trophy, progress));
}

/**
 * Compte le nombre de trophées débloqués
 */
export function countUnlockedTrophies(progress: UserProgress): number {
  return getUnlockedTrophies(progress).length;
}
