export type ScoreKey = 'jawline' | 'doubleChin' | 'fullFace';

export type ScoreBuckets = Record<ScoreKey, number>;

export interface AnswerOption {
  text: string;
  scores: Partial<ScoreBuckets>;
}

export interface Question {
  id: number;
  title: string;
  options: AnswerOption[];
}

export const questions: Question[] = [
  {
    id: 1,
    title: "Qu'est-ce qui te complexe le plus sur ton visage ?",
    options: [
      {
        text: 'Ma jawline / mâchoire pas assez dessinée',
        scores: { jawline: 3 },
      },
      {
        text: 'Mon double menton / cou',
        scores: { doubleChin: 3 },
      },
      {
        text: 'Mon visage de manière générale (gonflements, manque de structure)',
        scores: { fullFace: 3 },
      },
    ],
  },
  {
    id: 2,
    title: 'Quel type de résultat tu recherches ?',
    options: [
      {
        text: 'Un changement visible rapidement sur une zone précise',
        scores: { jawline: 1, doubleChin: 1 },
      },
      {
        text: 'Une transformation globale de mon visage',
        scores: { fullFace: 2 },
      },
    ],
  },
  {
    id: 3,
    title: 'Combien de temps par jour tu es prêt à y consacrer ?',
    options: [
      {
        text: '5 minutes ou moins',
        scores: {},
      },
      {
        text: '5–10 minutes',
        scores: {},
      },
      {
        text: 'Plus de 10 minutes',
        scores: { fullFace: 1 },
      },
    ],
  },
  {
    id: 4,
    title: 'Tu veux travailler uniquement une zone ou tout le visage ?',
    options: [
      {
        text: 'Principalement la mâchoire',
        scores: { jawline: 2 },
      },
      {
        text: 'Principalement le cou / double menton',
        scores: { doubleChin: 2 },
      },
      {
        text: 'Tout le visage',
        scores: { fullFace: 2 },
      },
    ],
  },
  {
    id: 5,
    title: 'Tu préfères :',
    options: [
      {
        text: 'Un programme ciblé sur un point précis',
        scores: { jawline: 1, doubleChin: 1 },
      },
      {
        text: 'Un programme plus complet pour tout améliorer',
        scores: { fullFace: 2 },
      },
    ],
  },
];

export function createInitialScores(): ScoreBuckets {
  return {
    jawline: 0,
    doubleChin: 0,
    fullFace: 0,
  };
}

export function addScores(
  current: ScoreBuckets,
  toAdd: Partial<ScoreBuckets>
): ScoreBuckets {
  return {
    jawline: current.jawline + (toAdd.jawline ?? 0),
    doubleChin: current.doubleChin + (toAdd.doubleChin ?? 0),
    fullFace: current.fullFace + (toAdd.fullFace ?? 0),
  };
}

export type PlanId =
  | 'jawline_90'
  | 'jawline_monthly'
  | 'double_60'
  | 'double_monthly'
  | 'all_in_one';

export function calculateRecommendedPlan(scores: ScoreBuckets): PlanId {
  const { jawline, doubleChin, fullFace } = scores;

  // Si fullFace est clairement dominant ou égal aux autres
  if (fullFace >= jawline && fullFace >= doubleChin && fullFace >= 3) {
    return 'all_in_one';
  }

  // Sinon, on compare jawline vs doubleChin
  // On recommande TOUJOURS les programmes principaux (90 jours ou 60 jours)
  // jamais les versions mensuelles
  if (jawline >= doubleChin) {
    return 'jawline_90';
  } else {
    return 'double_60';
  }
}
