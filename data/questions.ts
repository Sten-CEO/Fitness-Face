export type ScoreKey = 'jawline' | 'doubleChin' | 'fullFace';

export type ScoreBuckets = Record<ScoreKey, number>;

export interface AnswerOption {
  text: string;
  scores: Partial<ScoreBuckets>;
}

export interface Question {
  id: number;
  title: string;
  icon: string; // Ionicons icon name
  options: AnswerOption[];
  isPersonalization?: boolean;
}

export const questions: Question[] = [
  // Personalization question 1: Age
  {
    id: 1,
    title: 'Quel est ton âge ?',
    icon: 'calendar-outline',
    options: [
      { text: '- de 18 ans', scores: {} },
      { text: '18–25 ans', scores: {} },
      { text: '25–31 ans', scores: {} },
      { text: '31–40 ans', scores: {} },
      { text: '+ de 40 ans', scores: {} },
    ],
    isPersonalization: true,
  },
  // Personalization question 2: Motivation
  {
    id: 2,
    title: "Qu'est-ce qui te motive le plus ?",
    icon: 'flag-outline',
    options: [
      { text: 'Me sentir mieux dans ma peau', scores: {} },
      { text: 'Avoir un visage plus défini sur les photos', scores: {} },
      { text: 'Ralentir les effets du temps', scores: {} },
      { text: 'Simple curiosité, je veux tester', scores: {} },
    ],
    isPersonalization: true,
  },
  // Personalization question 3: Routine
  {
    id: 3,
    title: 'Comment décrirais-tu ta routine actuelle ?',
    icon: 'repeat-outline',
    options: [
      { text: "Je n'ai aucune routine beauté/soin", scores: {} },
      { text: "J'ai quelques habitudes basiques", scores: {} },
      { text: "J'ai une routine bien établie", scores: {} },
      { text: 'Je suis déjà très rigoureux(se)', scores: {} },
    ],
    isPersonalization: true,
  },
  // Original scoring questions
  {
    id: 4,
    title: "Qu'est-ce qui te complexe le plus sur ton visage ?",
    icon: 'scan-outline',
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
    id: 5,
    title: 'Quel est ton objectif principal ?',
    icon: 'sparkles-outline',
    options: [
      {
        text: 'Travailler une zone précise de mon visage',
        scores: { jawline: 1, doubleChin: 1 },
      },
      {
        text: 'Intégrer une routine complète pour tout le visage',
        scores: { fullFace: 2 },
      },
    ],
  },
  {
    id: 6,
    title: 'Combien de temps par jour tu es prêt à y consacrer ?',
    icon: 'time-outline',
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
    id: 7,
    title: 'Tu veux travailler uniquement une zone ou tout le visage ?',
    icon: 'person-outline',
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
    id: 8,
    title: 'Tu préfères :',
    icon: 'list-outline',
    options: [
      {
        text: 'Un programme ciblé sur un point précis',
        scores: { jawline: 1, doubleChin: 1 },
      },
      {
        text: 'Un programme plus complet pour tout le visage',
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
  | 'jawline_guided'
  | 'jaw_prime_monthly'
  | 'double_guided'
  | 'double_monthly'
  | 'all_in_one';

export function calculateRecommendedPlan(scores: ScoreBuckets): PlanId {
  const { jawline, doubleChin, fullFace } = scores;

  if (fullFace >= jawline && fullFace >= doubleChin && fullFace >= 3) {
    return 'all_in_one';
  }

  if (jawline >= doubleChin) {
    return 'jawline_guided';
  } else {
    return 'double_guided';
  }
}
