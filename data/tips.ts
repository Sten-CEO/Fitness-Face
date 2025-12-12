// Daily tips that rotate based on date
export const dailyTips = [
  {
    icon: 'water-outline',
    text: "Bois au moins 2L d'eau par jour pour une peau plus ferme et des muscles bien hydratés.",
  },
  {
    icon: 'bed-outline',
    text: 'Un bon sommeil (7-8h) favorise la récupération musculaire et réduit les gonflements du visage.',
  },
  {
    icon: 'nutrition-outline',
    text: 'Réduis le sel pour éviter la rétention d\'eau et affiner naturellement ton visage.',
  },
  {
    icon: 'body-outline',
    text: 'Maintiens une bonne posture : menton relevé, épaules en arrière pour une jawline plus définie.',
  },
  {
    icon: 'sunny-outline',
    text: 'Protège ta peau du soleil pour préserver son élasticité et éviter le relâchement.',
  },
  {
    icon: 'timer-outline',
    text: 'La régularité est la clé : 5 minutes chaque jour valent mieux qu\'une longue séance occasionnelle.',
  },
  {
    icon: 'happy-outline',
    text: 'Le stress contracte les muscles du visage. Prends le temps de te détendre et de respirer.',
  },
  {
    icon: 'restaurant-outline',
    text: 'Mâche lentement et des deux côtés pour renforcer ta mâchoire de façon équilibrée.',
  },
  {
    icon: 'moon-outline',
    text: 'Évite de dormir sur le ventre : ça compresse ton visage et peut créer des asymétries.',
  },
  {
    icon: 'leaf-outline',
    text: 'Les massages lymphatiques aident à drainer et désenfler le visage naturellement.',
  },
  {
    icon: 'fitness-outline',
    text: 'Le cardio aide à réduire la graisse globale, y compris au niveau du visage.',
  },
  {
    icon: 'sparkles-outline',
    text: 'Sois patient : les résultats apparaissent progressivement, généralement après 2-3 semaines.',
  },
];

export function getTodayTip() {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = dayOfYear % dailyTips.length;
  return dailyTips[index];
}
