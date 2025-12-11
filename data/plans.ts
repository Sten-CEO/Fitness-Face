export type PlanId =
  | 'jawline_90'
  | 'jawline_monthly'
  | 'double_60'
  | 'double_monthly'
  | 'all_in_one_monthly';

export interface Plan {
  id: PlanId;
  name: string;
  durationLabel: string;
  tag: string;
  shortDescription: string;
  badges: string[];
  alternativeId?: PlanId; // Pack alternatif mensuel
}

export const plans: Plan[] = [
  {
    id: 'jawline_90',
    name: 'Jawline 90 jours',
    durationLabel: 'Programme guidé sur 90 jours',
    tag: 'Résultat durable',
    shortDescription:
      'Sculpte ta mâchoire avec un programme progressif de 3 mois. Exercices ciblés pour un résultat visible et durable.',
    badges: ['Résultat durable', 'Mâchoire sculptée'],
    alternativeId: 'jawline_monthly',
  },
  {
    id: 'jawline_monthly',
    name: 'Jawline mensuel',
    durationLabel: 'Sans engagement – Mois par mois',
    tag: 'Sans engagement',
    shortDescription:
      'Travaille ta jawline à ton rythme, sans engagement. Parfait pour tester ou maintenir tes résultats.',
    badges: ['Sans engagement', 'Flexible'],
  },
  {
    id: 'double_60',
    name: 'Double menton 60 jours',
    durationLabel: 'Programme guidé sur 60 jours',
    tag: 'Résultat durable',
    shortDescription:
      'Élimine ton double menton en 2 mois avec des exercices ciblés pour affiner ton cou et redessiner ton ovale.',
    badges: ['Résultat durable', 'Cou affiné'],
    alternativeId: 'double_monthly',
  },
  {
    id: 'double_monthly',
    name: 'Double menton mensuel',
    durationLabel: 'Sans engagement – Mois par mois',
    tag: 'Sans engagement',
    shortDescription:
      'Travaille ton cou et ton double menton sans engagement. Idéal pour entretenir ou découvrir.',
    badges: ['Sans engagement', 'Flexible'],
  },
  {
    id: 'all_in_one_monthly',
    name: 'Tout-en-un mensuel',
    durationLabel: 'Programme complet – Sans engagement',
    tag: 'Le plus complet',
    shortDescription:
      'Le programme ultime : mâchoire, cou, joues, tout le visage. Pour ceux qui veulent tout transformer.',
    badges: ['Tout le visage', 'Complet', 'Sans engagement'],
  },
];

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
