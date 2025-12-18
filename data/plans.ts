export type PlanId =
  | 'jawline_90'
  | 'jawline_monthly'
  | 'double_60'
  | 'double_monthly'
  | 'all_in_one';

// Type de programme: fixed = durée définie, subscription = abonnement sans fin
export type ProgramType = 'fixed' | 'subscription';

// Type d'engagement: none = sans engagement, committed = avec engagement
export type CommitmentType = 'none' | 'committed';

export interface PlanFeature {
  text: string;
}

// Configuration de l'essai gratuit
export interface TrialConfig {
  durationDays: number; // Durée de l'essai (1 jour par défaut)
  canCancelDuringTrial: boolean; // Peut résilier pendant l'essai (toujours true)
}

// Configuration In-App Purchase
export interface IAPConfig {
  // Product IDs pour les stores (identiques sur iOS et Android pour simplifier)
  productId: string;
  // Période de facturation en mois (1 = mensuel, 3 = trimestriel, etc.)
  billingPeriodMonths: number;
  // Configuration de l'essai gratuit
  trial: TrialConfig;
  // Type d'engagement après paiement
  commitmentType: CommitmentType;
  // Nombre de mois d'engagement (null si sans engagement)
  commitmentMonths: number | null;
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
  // Configuration In-App Purchase
  iap: IAPConfig;
}

export const plans: Plan[] = [
  {
    id: 'jawline_90',
    name: 'Jawline 90 jours',
    durationLabel: 'Programme guidé sur 3 mois',
    tag: 'Recommandé',
    shortDescription:
      'Un programme progressif de 90 jours pour intégrer une routine quotidienne ciblée sur la mâchoire.',
    features: [
      { text: 'Séances guidées de 5 à 7 min par jour' },
      { text: 'Exercices ciblés pour travailler ta jawline' },
      { text: 'Progression planifiée sur 90 jours' },
      { text: 'Explications claires et précises des exercices' },
      { text: 'Guides visuels pour chaque mouvement' },
      { text: 'Suivi journalier de ta progression' },
      { text: 'Conseils personnalisés chaque jour' },
    ],
    badges: ['Programme complet', '90 jours'],
    priceAmount: '8,99',
    priceSuffix: '/mois',
    priceDetails: 'pendant 3 mois (26,97 € au total)',
    engagementLabel: 'Abonnement avec engagement',
    alternativeId: 'jawline_monthly',
    isMainProgram: true,
    durationDays: 90,
    programType: 'fixed',
    iap: {
      productId: 'com.jaw.jawline_90',
      billingPeriodMonths: 1,
      trial: {
        durationDays: 1,
        canCancelDuringTrial: true,
      },
      commitmentType: 'committed',
      commitmentMonths: 3,
    },
  },
  {
    id: 'jawline_monthly',
    name: 'Jawline mensuel',
    durationLabel: 'Sans engagement – Mois par mois',
    tag: 'Flexible',
    shortDescription:
      'Travaille ta jawline à ton rythme, sans engagement. Parfait pour tester ou maintenir ta routine.',
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
    iap: {
      productId: 'com.jaw.jawline_monthly',
      billingPeriodMonths: 1,
      trial: {
        durationDays: 1,
        canCancelDuringTrial: true,
      },
      commitmentType: 'none',
      commitmentMonths: null,
    },
  },
  {
    id: 'double_60',
    name: 'Double menton 60 jours',
    durationLabel: 'Programme guidé sur 2 mois',
    tag: 'Recommandé',
    shortDescription:
      'Un programme de 60 jours avec des exercices ciblés pour la zone du cou et du menton.',
    features: [
      { text: 'Séances quotidiennes de 5 à 8 min' },
      { text: 'Exercices de drainage et renforcement' },
      { text: 'Programme progressif adapté à ton niveau' },
      { text: 'Posture tête et cou optimisée' },
      { text: 'Guides visuels pour chaque mouvement' },
      { text: 'Suivi journalier de ta progression' },
      { text: 'Conseils personnalisés chaque jour' },
    ],
    badges: ['Programme ciblé', '60 jours'],
    priceAmount: '9,99',
    priceSuffix: '/mois',
    priceDetails: 'pendant 2 mois (19,98 € au total)',
    engagementLabel: 'Abonnement avec engagement',
    alternativeId: 'double_monthly',
    isMainProgram: true,
    durationDays: 60,
    programType: 'fixed',
    iap: {
      productId: 'com.jaw.double_60',
      billingPeriodMonths: 1,
      trial: {
        durationDays: 1,
        canCancelDuringTrial: true,
      },
      commitmentType: 'committed',
      commitmentMonths: 2,
    },
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
    iap: {
      productId: 'com.jaw.double_monthly',
      billingPeriodMonths: 1,
      trial: {
        durationDays: 1,
        canCancelDuringTrial: true,
      },
      commitmentType: 'none',
      commitmentMonths: null,
    },
  },
  {
    id: 'all_in_one',
    name: 'Pack Tout-en-un',
    durationLabel: 'Programme complet pour tout le visage',
    tag: 'Le plus complet',
    shortDescription:
      'Le programme le plus complet : routines pour la mâchoire, le cou, les joues et l\'ovale du visage.',
    features: [
      { text: 'Tous les exercices jawline + double menton' },
      { text: 'Routines complètes visage et ovale' },
      { text: 'Drainage lymphatique et exercices de tonification' },
      { text: 'Accès illimité à tous les contenus' },
      { text: 'Mises à jour et nouveaux exercices inclus' },
      { text: 'Guides visuels pour chaque mouvement' },
      { text: 'Suivi journalier de ta progression' },
      { text: 'Conseils personnalisés chaque jour' },
    ],
    badges: ['Tout inclus', 'Le plus populaire'],
    priceAmount: '14,99',
    priceSuffix: '/mois',
    priceDetails: 'sans engagement',
    isMainProgram: true,
    durationDays: null,
    programType: 'subscription',
    iap: {
      productId: 'com.jaw.all_in_one',
      billingPeriodMonths: 1,
      trial: {
        durationDays: 1,
        canCancelDuringTrial: true,
      },
      commitmentType: 'none',
      commitmentMonths: null,
    },
  },
];

// Liste de tous les product IDs pour l'initialisation IAP
export const allProductIds = plans.map((p) => p.iap.productId);

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

// Helper: récupère le plan par product ID
export function getPlanByProductId(productId: string): Plan | undefined {
  return plans.find((p) => p.iap.productId === productId);
}

// Helper: vérifie si c'est un plan avec engagement
export function isCommittedPlan(planId: PlanId): boolean {
  const plan = getPlanById(planId);
  return plan?.iap.commitmentType === 'committed';
}

// Helper: récupère la durée de l'engagement en mois
export function getCommitmentMonths(planId: PlanId): number | null {
  const plan = getPlanById(planId);
  return plan?.iap.commitmentMonths ?? null;
}

// Helper: récupère la durée de l'essai gratuit en jours
export function getTrialDays(planId: PlanId): number {
  const plan = getPlanById(planId);
  return plan?.iap.trial.durationDays ?? 1;
}
