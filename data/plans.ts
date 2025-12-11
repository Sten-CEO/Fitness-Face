export type PlanId =
  | 'jawline_90'
  | 'jawline_monthly'
  | 'double_60'
  | 'double_monthly'
  | 'all_in_one';

export interface Plan {
  id: PlanId;
  name: string;
  durationLabel: string;
  tag: string;
  shortDescription: string;
  badges: string[];
  alternativeId?: PlanId;
  isMainProgram: boolean;
}

export const plans: Plan[] = [
  {
    id: 'jawline_90',
    name: 'Jawline 90 jours',
    durationLabel: 'Programme guidé sur 3 mois',
    tag: 'Résultat durable',
    shortDescription:
      'Sculpte ta mâchoire avec un programme progressif de 90 jours. Séances courtes mais régulières, ciblées sur la définition de la jawline, la posture et le déstockage localisé. Pensé pour être faisable même avec un emploi du temps chargé.',
    badges: ['Résultat durable', 'Mâchoire sculptée'],
    alternativeId: 'jawline_monthly',
    isMainProgram: true,
  },
  {
    id: 'jawline_monthly',
    name: 'Jawline mensuel',
    durationLabel: 'Sans engagement – Mois par mois',
    tag: 'Sans engagement',
    shortDescription:
      'Travaille ta jawline à ton rythme, sans engagement. Idéal pour tester le programme ou maintenir tes résultats sur le long terme.',
    badges: ['Sans engagement', 'Flexible'],
    isMainProgram: false,
  },
  {
    id: 'double_60',
    name: 'Double menton 60 jours',
    durationLabel: 'Programme guidé sur 2 mois',
    tag: 'Résultat durable',
    shortDescription:
      'Affine ton cou et réduis ton double menton en 60 jours. Exercices ciblés pour le drainage, la posture tête/cou et le renforcement musculaire de la zone. Résultats visibles dès les premières semaines.',
    badges: ['Résultat durable', 'Cou affiné'],
    alternativeId: 'double_monthly',
    isMainProgram: true,
  },
  {
    id: 'double_monthly',
    name: 'Double menton mensuel',
    durationLabel: 'Sans engagement – Mois par mois',
    tag: 'Sans engagement',
    shortDescription:
      'Travaille ton cou et ton double menton sans engagement. Parfait pour démarrer en douceur ou entretenir tes acquis.',
    badges: ['Sans engagement', 'Flexible'],
    isMainProgram: false,
  },
  {
    id: 'all_in_one',
    name: 'Pack Tout-en-un',
    durationLabel: 'Transformation globale du visage',
    tag: 'Le plus complet',
    shortDescription:
      'Le programme ultime pour transformer tout ton visage : mâchoire, cou, joues, ovale. Combine les meilleures routines pour un résultat global. Idéal si tu veux tout travailler sans te poser de questions.',
    badges: ['Tout le visage', 'Complet', 'Le plus populaire'],
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
