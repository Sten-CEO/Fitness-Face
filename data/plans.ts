export type PlanId =
  | 'jawline_90'
  | 'jawline_monthly'
  | 'double_60'
  | 'double_monthly'
  | 'all_in_one';

export interface PlanFeature {
  text: string;
}

export interface Plan {
  id: PlanId;
  name: string;
  durationLabel: string;
  tag: string;
  shortDescription: string;
  features: PlanFeature[];
  badges: string[];
  priceInfo?: string;
  alternativeId?: PlanId;
  isMainProgram: boolean;
}

export const plans: Plan[] = [
  {
    id: 'jawline_90',
    name: 'Jawline 90 jours',
    durationLabel: 'Programme guidé sur 3 mois',
    tag: 'Recommandé',
    shortDescription:
      'Sculpte ta mâchoire avec un programme progressif conçu pour des résultats durables.',
    features: [
      { text: 'Séances guidées de 5 à 7 min par jour' },
      { text: 'Exercices ciblés pour définir la jawline' },
      { text: 'Progression planifiée sur 90 jours' },
      { text: 'Compatible avec un emploi du temps chargé' },
      { text: 'Routines bonus pour entretenir tes résultats' },
    ],
    badges: ['Résultat durable', 'Mâchoire sculptée'],
    priceInfo: '7 € / mois pendant 3 mois (21 € au total)',
    alternativeId: 'jawline_monthly',
    isMainProgram: true,
  },
  {
    id: 'jawline_monthly',
    name: 'Jawline mensuel',
    durationLabel: 'Sans engagement – Mois par mois',
    tag: 'Flexible',
    shortDescription:
      'Travaille ta jawline à ton rythme, sans engagement. Idéal pour tester ou maintenir tes acquis.',
    features: [
      { text: 'Accès mensuel renouvelable' },
      { text: 'Exercices ciblés mâchoire et posture' },
      { text: 'Résiliable à tout moment' },
    ],
    badges: ['Sans engagement', 'Flexible'],
    priceInfo: '9 € / mois sans engagement',
    isMainProgram: false,
  },
  {
    id: 'double_60',
    name: 'Double menton 60 jours',
    durationLabel: 'Programme guidé sur 2 mois',
    tag: 'Recommandé',
    shortDescription:
      'Affine ton cou et réduis ton double menton avec un programme ciblé de 60 jours.',
    features: [
      { text: 'Séances quotidiennes de 5 à 8 min' },
      { text: 'Exercices de drainage et renforcement' },
      { text: 'Résultats visibles dès les premières semaines' },
      { text: 'Posture tête/cou optimisée' },
      { text: 'Programme adapté à tous les niveaux' },
    ],
    badges: ['Résultat durable', 'Cou affiné'],
    priceInfo: '7 € / mois pendant 2 mois (14 € au total)',
    alternativeId: 'double_monthly',
    isMainProgram: true,
  },
  {
    id: 'double_monthly',
    name: 'Double menton mensuel',
    durationLabel: 'Sans engagement – Mois par mois',
    tag: 'Flexible',
    shortDescription:
      'Travaille ton cou et ton double menton sans engagement. Parfait pour débuter ou entretenir.',
    features: [
      { text: 'Accès mensuel renouvelable' },
      { text: 'Exercices ciblés cou et menton' },
      { text: 'Résiliable à tout moment' },
    ],
    badges: ['Sans engagement', 'Flexible'],
    priceInfo: '9 € / mois sans engagement',
    isMainProgram: false,
  },
  {
    id: 'all_in_one',
    name: 'Pack Tout-en-un',
    durationLabel: 'Transformation complète du visage',
    tag: 'Le plus complet',
    shortDescription:
      'Le programme ultime pour transformer tout ton visage : mâchoire, cou, joues, ovale.',
    features: [
      { text: 'Tous les exercices jawline + double menton' },
      { text: 'Routines complètes visage et ovale' },
      { text: 'Drainage et raffermissement global' },
      { text: 'Accès illimité à tous les contenus' },
      { text: 'Mises à jour et nouveaux exercices inclus' },
    ],
    badges: ['Transformation globale', 'Le plus populaire'],
    priceInfo: '29 € (accès à vie)',
    isMainProgram: true,
  },
];

export const mainPrograms = plans.filter((p) => p.isMainProgram);

export function getPlanById(id: PlanId): Plan | undefined {
  return plans.find((p) => p.id === id);
}

export function getAlternativePlan(id: PlanId): Plan | undefined {
  const plan = getPlanById(id);
  if (plan?.alternativeId) {
    return getPlanById(plan.alternativeId);
  }
  return undefined;
}
