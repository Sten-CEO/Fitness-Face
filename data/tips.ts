// Types pour les conseils avec sources
export interface TipSource {
  label: string;
  url: string;
}

export interface DailyTip {
  icon: string;
  text: string;
  sources: TipSource[];
}

// Sources génériques réutilisables
const SOURCES = {
  hydration: [
    { label: 'Mayo Clinic - Water intake', url: 'https://www.mayoclinic.org/healthy-lifestyle/nutrition-and-healthy-eating/in-depth/water/art-20044256' },
  ],
  sleep: [
    { label: 'Sleep Foundation', url: 'https://www.sleepfoundation.org/how-sleep-works/why-do-we-need-sleep' },
  ],
  nutrition: [
    { label: 'Harvard Health - Nutrition', url: 'https://www.health.harvard.edu/topics/nutrition' },
  ],
  posture: [
    { label: 'Cleveland Clinic - Posture', url: 'https://my.clevelandclinic.org/health/articles/4485-back-health-and-posture' },
  ],
  skincare: [
    { label: 'American Academy of Dermatology', url: 'https://www.aad.org/public/everyday-care/skin-care-basics' },
  ],
  exercise: [
    { label: 'NHS - Exercise guidelines', url: 'https://www.nhs.uk/live-well/exercise/exercise-guidelines/' },
  ],
  stress: [
    { label: 'Mayo Clinic - Stress management', url: 'https://www.mayoclinic.org/healthy-lifestyle/stress-management/basics/stress-basics/hlv-20049495' },
  ],
  facialExercise: [
    { label: 'JAMA Dermatology - Facial exercises', url: 'https://jamanetwork.com/journals/jamadermatology/fullarticle/2666801' },
  ],
  general: [
    { label: 'WHO - Healthy lifestyle', url: 'https://www.who.int/health-topics/healthy-lifestyle' },
  ],
};

// 90 conseils du jour - rotation basée sur le jour du programme
export const dailyTips: DailyTip[] = [
  // Semaine 1 (Jours 1-7) - Fondamentaux
  {
    icon: 'water-outline',
    text: "Bois au moins 2L d'eau par jour pour une peau plus ferme et des muscles bien hydratés.",
    sources: SOURCES.hydration,
  },
  {
    icon: 'bed-outline',
    text: "Un bon sommeil (7-8h) favorise la récupération musculaire et réduit les gonflements du visage.",
    sources: SOURCES.sleep,
  },
  {
    icon: 'nutrition-outline',
    text: "Réduis le sel pour éviter la rétention d'eau et affiner naturellement ton visage.",
    sources: SOURCES.nutrition,
  },
  {
    icon: 'body-outline',
    text: "Maintiens une bonne posture : menton relevé, épaules en arrière pour une jawline plus définie.",
    sources: SOURCES.posture,
  },
  {
    icon: 'sunny-outline',
    text: "Protège ta peau du soleil pour préserver son élasticité et éviter le relâchement.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'timer-outline',
    text: "La régularité est la clé : 5 minutes chaque jour valent mieux qu'une longue séance occasionnelle.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'happy-outline',
    text: "Le stress contracte les muscles du visage. Prends le temps de te détendre et de respirer.",
    sources: SOURCES.stress,
  },

  // Semaine 2 (Jours 8-14) - Alimentation
  {
    icon: 'restaurant-outline',
    text: "Mâche lentement et des deux côtés pour renforcer ta mâchoire de façon équilibrée.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'moon-outline',
    text: "Évite de dormir sur le ventre : ça compresse ton visage et peut créer des asymétries.",
    sources: SOURCES.sleep,
  },
  {
    icon: 'leaf-outline',
    text: "Les massages lymphatiques aident à drainer et désenfler le visage naturellement.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'fitness-outline',
    text: "Le cardio aide à réduire la graisse globale, y compris au niveau du visage.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'sparkles-outline',
    text: "Sois patient : la constance est la clé. Continue ta routine jour après jour.",
    sources: SOURCES.general,
  },
  {
    icon: 'cafe-outline',
    text: "Limite le café et l'alcool qui déshydratent et peuvent gonfler le visage.",
    sources: SOURCES.hydration,
  },
  {
    icon: 'fish-outline',
    text: "Les oméga-3 (poisson, noix) renforcent l'élasticité de la peau.",
    sources: SOURCES.nutrition,
  },

  // Semaine 3 (Jours 15-21) - Technique
  {
    icon: 'hand-left-outline',
    text: "Masse ton visage toujours vers le haut et l'extérieur pour stimuler le drainage.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'eye-outline',
    text: "Regarde droit devant toi pendant les exercices pour aligner correctement ta mâchoire.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'pulse-outline',
    text: "Respire profondément entre chaque série pour oxygéner tes muscles faciaux.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'refresh-outline',
    text: "Alterne les exercices pour ne pas sur-solliciter les mêmes muscles.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'thermometer-outline',
    text: "Une douche froide sur le visage tonifie la peau et resserre les pores.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'hourglass-outline',
    text: "Tiens chaque position le temps indiqué - la durée fait la différence.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'mirror-outline',
    text: "Fais tes exercices devant un miroir pour vérifier ta posture.",
    sources: SOURCES.facialExercise,
  },

  // Semaine 4 (Jours 22-28) - Lifestyle
  {
    icon: 'phone-portrait-outline',
    text: "Le \"tech neck\" (regarder son téléphone) accentue le double menton. Lève ton écran !",
    sources: SOURCES.posture,
  },
  {
    icon: 'wine-outline',
    text: "L'alcool déshydrate et favorise le stockage de graisse au niveau du visage.",
    sources: SOURCES.nutrition,
  },
  {
    icon: 'ice-cream-outline',
    text: "Le sucre raffiné accélère le vieillissement cutané - limite-le.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'walk-outline',
    text: "La marche quotidienne est excellente pour ton bien-être général.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'glasses-outline',
    text: "Si tu portes des lunettes, vérifie qu'elles ne créent pas de tension sur ton visage.",
    sources: SOURCES.general,
  },
  {
    icon: 'musical-notes-outline',
    text: "Chanter sollicite les muscles du cou et de la mâchoire - un bonus agréable !",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'headset-outline',
    text: "Évite de coincer ton téléphone entre ton oreille et ton épaule.",
    sources: SOURCES.posture,
  },

  // Semaine 5 (Jours 29-35) - Soins
  {
    icon: 'snow-outline',
    text: "Un glaçon sur le visage le matin réduit les gonflements et tonifie la peau.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'flask-outline',
    text: "Les crèmes à la caféine peuvent aider à drainer et tonifier temporairement.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'rose-outline',
    text: "L'huile de rose musquée favorise l'élasticité et la fermeté de la peau.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'color-palette-outline',
    text: "Les masques à l'argile purifient et resserrent les pores.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'water-outline',
    text: "Le jade roller est un outil agréable pour compléter ta routine bien-être.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'medkit-outline',
    text: "Le rétinol stimule le collagène et raffermit la peau du visage.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'sunny-outline',
    text: "La vitamine C protège la peau et booste la production de collagène.",
    sources: SOURCES.skincare,
  },

  // Semaine 6 (Jours 36-42) - Motivation
  {
    icon: 'camera-outline',
    text: "Prends des photos régulières pour suivre tes progrès - ils sont parfois subtils.",
    sources: SOURCES.general,
  },
  {
    icon: 'trophy-outline',
    text: "Chaque jour compte ! Tu construis une habitude durable pour ton bien-être.",
    sources: SOURCES.general,
  },
  {
    icon: 'calendar-outline',
    text: "Fixe-toi des objectifs réalistes et célèbre chaque semaine de régularité.",
    sources: SOURCES.general,
  },
  {
    icon: 'people-outline',
    text: "Partage tes objectifs avec un ami pour rester motivé.",
    sources: SOURCES.general,
  },
  {
    icon: 'star-outline',
    text: "Félicite-toi pour ta régularité - c'est déjà une victoire !",
    sources: SOURCES.general,
  },
  {
    icon: 'rocket-outline',
    text: "Tu es à mi-chemin de ton programme ! Continue, tu as déjà fait un super travail.",
    sources: SOURCES.general,
  },
  {
    icon: 'heart-outline',
    text: "Aime ton visage aujourd'hui tout en travaillant pour demain.",
    sources: SOURCES.general,
  },

  // Semaine 7 (Jours 43-49) - Avancé
  {
    icon: 'barbell-outline',
    text: "Augmente progressivement l'intensité de tes exercices pour continuer à progresser.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'stopwatch-outline',
    text: "Essaie d'ajouter 5 secondes de plus à chaque exercice cette semaine.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'layers-outline',
    text: "Combine plusieurs exercices pour un entraînement plus complet.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'cellular-outline',
    text: "La progression est parfois invisible mais toujours présente. Fais confiance au processus.",
    sources: SOURCES.general,
  },
  {
    icon: 'analytics-outline',
    text: "Note tes sensations après chaque séance pour identifier ce qui fonctionne.",
    sources: SOURCES.general,
  },
  {
    icon: 'flame-outline',
    text: "Les muscles faciaux récupèrent vite - tu peux t'entraîner chaque jour.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'trending-up-outline',
    text: "Compare tes photos du jour 1 à maintenant - tu verras le chemin parcouru.",
    sources: SOURCES.general,
  },

  // Semaine 8 (Jours 50-56) - Prévention
  {
    icon: 'shield-outline',
    text: "Les exercices faciaux préviennent aussi le relâchement futur.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'umbrella-outline',
    text: "Protège ton visage du vent et du froid qui assèchent la peau.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'warning-outline',
    text: "Évite de frotter tes yeux - la peau y est très fragile.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'bandage-outline',
    text: "Si tu ressens une douleur inhabituelle, fais une pause et consulte.",
    sources: SOURCES.general,
  },
  {
    icon: 'accessibility-outline',
    text: "Étire doucement ton cou avant chaque séance pour éviter les tensions.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'contrast-outline',
    text: "L'alternance chaud/froid sur le visage stimule la circulation.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'help-outline',
    text: "En cas de doute sur un exercice, ralentis et concentre-toi sur la forme.",
    sources: SOURCES.exercise,
  },

  // Semaine 9 (Jours 57-63) - Bien-être
  {
    icon: 'flower-outline',
    text: "La méditation réduit les tensions faciales liées au stress.",
    sources: SOURCES.stress,
  },
  {
    icon: 'cloudy-outline',
    text: "Une bonne humidification de l'air aide ta peau à rester souple.",
    sources: SOURCES.skincare,
  },
  {
    icon: 'color-wand-outline',
    text: "Souris plus souvent - ça muscle naturellement et libère des endorphines.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'volume-high-outline',
    text: "Le chewing-gum sans sucre peut compléter ton entraînement de mâchoire.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'globe-outline',
    text: "Inspire par le nez, expire par la bouche pour une meilleure oxygénation.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'infinite-outline',
    text: "Ces exercices sont pour la vie - tu acquiers des habitudes durables.",
    sources: SOURCES.general,
  },
  {
    icon: 'thumbs-up-outline',
    text: "Tu fais partie des 10% qui tiennent leur programme - bravo !",
    sources: SOURCES.general,
  },

  // Semaine 10 (Jours 64-70) - Expertise
  {
    icon: 'school-outline',
    text: "Tu maîtrises maintenant les bases - concentre-toi sur la précision.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'bulb-outline',
    text: "Écoute ton corps : certains exercices te conviennent mieux que d'autres.",
    sources: SOURCES.general,
  },
  {
    icon: 'construct-outline',
    text: "Personnalise ta routine en insistant sur tes zones prioritaires.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'desktop-outline',
    text: "Si tu travailles sur écran, fais des pauses pour relâcher ta mâchoire.",
    sources: SOURCES.posture,
  },
  {
    icon: 'git-branch-outline',
    text: "Varie l'ordre des exercices pour surprendre tes muscles.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'bookmark-outline',
    text: "Note tes exercices préférés pour créer ta routine personnalisée.",
    sources: SOURCES.general,
  },
  {
    icon: 'dice-outline',
    text: "Essaie de faire certains exercices les yeux fermés pour plus de concentration.",
    sources: SOURCES.facialExercise,
  },

  // Semaine 11 (Jours 71-77) - Optimisation
  {
    icon: 'speedometer-outline',
    text: "L'intensité compte plus que la durée - contracte bien à chaque répétition.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'battery-charging-outline',
    text: "Un visage reposé progresse mieux - ne néglige pas ton sommeil.",
    sources: SOURCES.sleep,
  },
  {
    icon: 'sync-outline',
    text: "La symétrie est importante : travaille les deux côtés équitablement.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'options-outline',
    text: "Ajuste la difficulté selon ta forme du jour - c'est intelligent, pas faible.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'time-outline',
    text: "Le meilleur moment pour s'entraîner ? Celui où tu le feras vraiment.",
    sources: SOURCES.general,
  },
  {
    icon: 'locate-outline',
    text: "Concentre-toi sur le muscle ciblé - la connexion esprit-muscle est réelle.",
    sources: SOURCES.exercise,
  },
  {
    icon: 'ribbon-outline',
    text: "Tu approches de la fin du programme - félicitations pour ta persévérance !",
    sources: SOURCES.general,
  },

  // Semaine 12 (Jours 78-84) - Maintenance
  {
    icon: 'repeat-outline',
    text: "Après le programme, 3-4 séances par semaine suffisent pour maintenir.",
    sources: SOURCES.facialExercise,
  },
  {
    icon: 'copy-outline',
    text: "Transmets ce que tu as appris - enseigner renforce ta propre pratique.",
    sources: SOURCES.general,
  },
  {
    icon: 'archive-outline',
    text: "Garde tes photos de progression - elles te motiveront plus tard.",
    sources: SOURCES.general,
  },
  {
    icon: 'link-outline',
    text: "Les habitudes que tu as créées dureront toute ta vie.",
    sources: SOURCES.general,
  },
  {
    icon: 'arrow-redo-outline',
    text: "Tu peux recommencer le programme pour renforcer tes acquis.",
    sources: SOURCES.general,
  },
  {
    icon: 'chatbubbles-outline',
    text: "Partage ton parcours - tu inspireras d'autres personnes à prendre soin d'elles.",
    sources: SOURCES.general,
  },
  {
    icon: 'telescope-outline',
    text: "Regarde le chemin parcouru depuis le jour 1 - tu as créé une vraie routine bien-être.",
    sources: SOURCES.general,
  },

  // Semaine 13 (Jours 85-90) - Célébration
  {
    icon: 'medal-outline',
    text: "Tu es dans la dernière ligne droite ! Chaque jour compte.",
    sources: SOURCES.general,
  },
  {
    icon: 'flag-outline',
    text: "Bientôt la fin du programme - mais ce n'est que le début de ton nouveau visage.",
    sources: SOURCES.general,
  },
  {
    icon: 'gift-outline',
    text: "Offre-toi quelque chose pour célébrer ta persévérance.",
    sources: SOURCES.general,
  },
  {
    icon: 'diamond-outline',
    text: "Tu as prouvé que la discipline crée des habitudes durables.",
    sources: SOURCES.general,
  },
  {
    icon: 'crown-outline',
    text: "Félicitations ! Tu fais partie de l'élite qui termine son programme.",
    sources: SOURCES.general,
  },
  {
    icon: 'sparkles-outline',
    text: "Programme terminé ! Bravo pour ton engagement. Continue d'entretenir tes bonnes habitudes.",
    sources: SOURCES.general,
  },
];

/**
 * Retourne le conseil du jour basé sur le jour du programme
 * @param programDay - Le jour actuel du programme (1, 2, 3...)
 * @returns Le conseil correspondant au jour (boucle tous les 90 jours)
 */
export function getTodayTip(programDay: number = 1): DailyTip {
  // Rotation sur 90 jours : jour 1 = index 0, jour 91 = index 0, etc.
  const index = ((programDay - 1) % 90 + 90) % 90; // Gère aussi les nombres négatifs
  return dailyTips[index];
}
