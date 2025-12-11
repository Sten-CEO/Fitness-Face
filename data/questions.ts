export type ScoreKey = 'jawline' | 'doubleChin' | 'fullFace' | 'fast' | 'durable';

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
        scores: { jawline: 2 },
      },
      {
        text: 'Mon double menton / cou',
        scores: { doubleChin: 2 },
      },
      {
        text: 'Mon visage de manière générale (gonflements, manque de structure)',
        scores: { fullFace: 2 },
      },
    ],
  },
  {
    id: 2,
    title: 'Quel type de résultat tu recherches ?',
    options: [
      {
        text: 'Un changement visible rapidement',
        scores: { fast: 2 },
      },
      {
        text: "Un résultat plus durable même si c'est un peu plus long",
        scores: { durable: 2 },
      },
    ],
  },
  {
    id: 3,
    title: 'Combien de temps par jour tu es prêt à y consacrer ?',
    options: [
      {
        text: '5 minutes ou moins',
        scores: { fast: 1 },
      },
      {
        text: '5–10 minutes',
        scores: { durable: 1 },
      },
      {
        text: 'Plus de 10 minutes',
        scores: { durable: 2, fullFace: 1 },
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
    fast: 0,
    durable: 0,
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
    fast: current.fast + (toAdd.fast ?? 0),
    durable: current.durable + (toAdd.durable ?? 0),
  };
}

export type PlanId =
  | 'jawline_90'
  | 'jawline_monthly'
  | 'double_60'
  | 'double_monthly'
  | 'all_in_one_monthly';

export function calculateRecommendedPlan(scores: ScoreBuckets): PlanId {
  const { jawline, doubleChin, fullFace, fast, durable } = scores;

  // Si fullFace est clairement dominant
  if (fullFace >= jawline && fullFace >= doubleChin && fullFace >= 3) {
    return 'all_in_one_monthly';
  }

  // Sinon, on compare jawline vs doubleChin
  if (jawline >= doubleChin) {
    // Pack jawline
    return durable >= fast ? 'jawline_90' : 'jawline_monthly';
  } else {
    // Pack double menton
    return durable >= fast ? 'double_60' : 'double_monthly';
  }
}
