export type PlanId =
  | 'jawline_90'
  | 'jawline_monthly'
  | 'double_60'
  | 'double_monthly'
  | 'all_in_one';

// Type de programme: fixed = durée définie, subscription = abonnement sans fin
export type ProgramType = 'fixed' | 'subscription';

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
  priceAmount: string; // Ex: "8,99"
  priceSuffix: string; // Ex: "/mois"
  priceDetails?: string; // Ex: "pendant 3 mois (26,97 € au total)"
  engagementLabel?: string; // Ex: "Abonnement avec engagement"
  alternativeId?: PlanId;
  isMainProgram: boolean;
  // Durée en jours (null = abonnement sans durée fixe)
  durationDays: number | null;
  // Type de programme
  programType: ProgramType;
}

export const plans: Plan[] = [
  {
    id: 'jawline_90',
    name: 'Jawline 90 jours',
    durationLabel: 'Programme guidé sur 3 mois',
    tag: 'Recommandé',
    shortDescription:
      'Sculpte ta mâchoire avec un programme progressif conçu pour des résultats durables et visibles.',
    features: [
      { text: 'Séances guidées de 5 à 7 min par jour' },
      { text: 'Exercices ciblés pour définir ta jawline' },
      { text: 'Progression planifiée sur 90 jours' },
      { text: 'Explications claires et précises des exercices' },
      { text: 'Guides visuels pour chaque mouvement' },
      { text: 'Suivi journalier de tes progrès' },
      { text: 'Conseils personnalisés chaque jour' },
    ],
    badges: ['Résultat durable', 'Mâchoire sculptée'],
    priceAmount: '8,99',
    priceSuffix: '/mois',
    priceDetails: 'pendant 3 mois (26,97 € au total)',
    engagementLabel: 'Abonnement avec engagement',
    alternativeId: 'jawline_monthly',
    isMainProgram: true,
    durationDays: 90,
    programType: 'fixed',
  },
  {
    id: 'jawline_monthly',
    name: 'Jawline mensuel',
    durationLabel: 'Sans engagement – Mois par mois',
    tag: 'Flexible',
    shortDescription:
      'Travaille ta jawline à ton rythme, sans engagement. Parfait pour tester ou entretenir tes résultats.',
    features: [
      { text: 'Accès mensuel renouvelable automatiquement' },
      { text: 'Exercices ciblés mâchoire et posture' },
      { text: 'Résiliable à tout moment en un clic' },
      { text: 'Guides visuels pour chaque mouvement' },
      { text: 'Suivi journalier de tes progrès' },
      { text: 'Conseils personnalisés chaque jour' },
    ],
    badges: ['Sans engagement', 'Flexible'],
    priceAmount: '10,99',
    priceSuffix: '/mois',
    priceDetails: 'sans engagement',
    isMainProgram: false,
    durationDays: null,
    programType: 'subscription',
  },
  {
    id: 'double_60',
    name: 'Double menton 60 jours',
    durationLabel: 'Programme guidé sur 2 mois',
    tag: 'Recommandé',
    shortDescription:
      'Affine ton cou et réduis ton double menton avec un programme ciblé de 60 jours aux résultats prouvés.',
    features: [
      { text: 'Séances quotidiennes de 5 à 8 min' },
      { text: 'Exercices de drainage et renforcement' },
      { text: 'Résultats visibles dès les premières semaines' },
      { text: 'Posture tête et cou optimisée' },
      { text: 'Guides visuels pour chaque mouvement' },
      { text: 'Suivi journalier de tes progrès' },
      { text: 'Conseils personnalisés chaque jour' },
    ],
    badges: ['Résultat durable', 'Cou affiné'],
    priceAmount: '9,99',
    priceSuffix: '/mois',
    priceDetails: 'pendant 2 mois (19,98 € au total)',
    engagementLabel: 'Abonnement avec engagement',
    alternativeId: 'double_monthly',
    isMainProgram: true,
    durationDays: 60,
    programType: 'fixed',
  },
  {
    id: 'double_monthly',
    name: 'Double menton mensuel',
    durationLabel: 'Sans engagement – Mois par mois',
    tag: 'Flexible',
    shortDescription:
      'Travaille ton cou et ton double menton sans engagement. Parfait pour débuter ou entretenir tes acquis.',
    features: [
      { text: 'Accès mensuel renouvelable automatiquement' },
      { text: 'Exercices ciblés cou et menton' },
      { text: 'Résiliable à tout moment en un clic' },
      { text: 'Guides visuels pour chaque mouvement' },
      { text: 'Suivi journalier de tes progrès' },
      { text: 'Conseils personnalisés chaque jour' },
    ],
    badges: ['Sans engagement', 'Flexible'],
    priceAmount: '10,99',
    priceSuffix: '/mois',
    priceDetails: 'sans engagement',
    isMainProgram: false,
    durationDays: null,
    programType: 'subscription',
  },
  {
    id: 'all_in_one',
    name: 'Pack Tout-en-un',
    durationLabel: 'Transformation complète du visage',
    tag: 'Le plus complet',
    shortDescription:
      'Le programme ultime pour transformer tout ton visage : mâchoire, cou, joues, ovale. Résultats garantis.',
    features: [
      { text: 'Tous les exercices jawline + double menton' },
      { text: 'Routines complètes visage et ovale' },
      { text: 'Drainage lymphatique et raffermissement global' },
      { text: 'Accès illimité à tous les contenus' },
      { text: 'Mises à jour et nouveaux exercices inclus' },
      { text: 'Guides visuels pour chaque mouvement' },
      { text: 'Suivi journalier de tes progrès' },
      { text: 'Conseils personnalisés chaque jour' },
    ],
    badges: ['Transformation globale', 'Le plus populaire'],
    priceAmount: '14,99',
    priceSuffix: '/mois',
    priceDetails: 'sans engagement',
    isMainProgram: true,
    durationDays: null,
    programType: 'subscription',
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

// Helper: récupère la durée du programme (null si abonnement)
export function getPlanDuration(planId: PlanId): number | null {
  const plan = getPlanById(planId);
  return plan?.durationDays ?? null;
}

// Helper: vérifie si c'est un programme à durée fixe
export function isFixedDurationPlan(planId: PlanId): boolean {
  const plan = getPlanById(planId);
  return plan?.programType === 'fixed';
}
