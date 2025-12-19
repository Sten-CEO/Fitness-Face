import { PlanId } from './plans';

export interface RoutineStep {
  title: string;
  duration: string;
}

export interface Routine {
  id: string;
  planType: 'jawline' | 'double_chin' | 'full_face';
  name: string;
  duration: string;
  durationMinutes: number;
  description: string;
  steps: RoutineStep[];
}

export const routines: Routine[] = [
  {
    id: 'jawline_routine',
    planType: 'jawline',
    name: 'Routine Jawline',
    duration: '5-7 min',
    durationMinutes: 6,
    description: 'Cette routine cible les muscles de la mâchoire pour sculpter et définir ta jawline. Effectue chaque exercice lentement et avec contrôle.',
    steps: [
      { title: 'Échauffement : rotations douces de la mâchoire', duration: '30s' },
      { title: 'Mewing : langue pressée contre le palais', duration: '60s' },
      { title: 'Chin lifts : menton vers le plafond', duration: '45s' },
      { title: 'Jaw clenches : contractions de la mâchoire', duration: '45s' },
      { title: 'Neck resistance : pression latérale', duration: '60s' },
      { title: 'Fish face : joues creusées', duration: '30s' },
      { title: 'Étirements finaux', duration: '30s' },
    ],
  },
  {
    id: 'double_chin_routine',
    planType: 'double_chin',
    name: 'Routine Double Menton',
    duration: '5-8 min',
    durationMinutes: 7,
    description: 'Cette routine cible la zone du cou et du menton avec des exercices de renforcement et de drainage. Concentre-toi sur la qualité des mouvements.',
    steps: [
      { title: 'Échauffement : cercles du cou', duration: '30s' },
      { title: 'Tongue press : langue contre le palais', duration: '45s' },
      { title: 'Neck stretch : étirement latéral', duration: '60s' },
      { title: 'Jaw jut : mâchoire en avant', duration: '45s' },
      { title: 'Ball exercise : compression sous le menton', duration: '60s' },
      { title: 'Platysma stretch : tension du cou', duration: '45s' },
      { title: 'Drainage lymphatique : massage descendant', duration: '45s' },
      { title: 'Relaxation finale', duration: '30s' },
    ],
  },
  {
    id: 'full_face_routine',
    planType: 'full_face',
    name: 'Routine Visage Complet',
    duration: '8-10 min',
    durationMinutes: 9,
    description: 'Une routine complète qui travaille tous les muscles du visage. Prends ton temps et ressens chaque exercice.',
    steps: [
      { title: 'Échauffement : massage facial', duration: '45s' },
      { title: 'Mewing avancé', duration: '60s' },
      { title: 'Exercices jawline', duration: '90s' },
      { title: 'Travail du double menton', duration: '90s' },
      { title: 'Lift des joues', duration: '60s' },
      { title: 'Exercices du front', duration: '45s' },
      { title: 'Contour des yeux', duration: '45s' },
      { title: 'Drainage complet', duration: '60s' },
      { title: 'Relaxation et respiration', duration: '45s' },
    ],
  },
];

export function getRoutineForPlan(planId: PlanId): Routine {
  // Guard contre null/undefined pour éviter crash Hermes
  const safePlanId = typeof planId === 'string' ? planId : '';

  if (safePlanId.includes('jawline')) {
    return routines.find(r => r.planType === 'jawline')!;
  } else if (safePlanId.includes('double')) {
    return routines.find(r => r.planType === 'double_chin')!;
  } else {
    return routines.find(r => r.planType === 'full_face')!;
  }
}
