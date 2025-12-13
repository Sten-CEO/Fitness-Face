// ============================================
// EXERCISE IMAGE UTILITIES
// Images served from public/exercises/
// ============================================

// All possible image extensions (lowercase and uppercase)
const IMAGE_EXTENSIONS = ['png', 'PNG', 'jpeg', 'JPEG', 'jpg', 'JPG'];

// Maximum number of images per exercise
const MAX_IMAGES_PER_EXERCISE = 3;

// Map exercise IDs to folder names
export function getExerciseImageFolder(exerciseId: string): { category: string; folder: string } | null {
  // Jawline exercises: jaw_1 → jawline-exo-1, jaw_2 → jawline-exo-2, etc.
  if (exerciseId.startsWith('jaw_')) {
    const num = exerciseId.replace('jaw_', '');
    return {
      category: 'jawline',
      folder: `jawline-exo-${num}`,
    };
  }

  // Double chin exercises: dc_1 → dm-exo-1, dc_2 → dm-exo-2, etc.
  if (exerciseId.startsWith('dc_')) {
    const num = exerciseId.replace('dc_', '');
    return {
      category: 'double-menton',
      folder: `dm-exo-${num}`,
    };
  }

  return null;
}

// Get all possible URIs for an exercise (trying all extensions for each image number)
// Returns array grouped by image number: [[1.png, 1.PNG, 1.jpeg...], [2.png, 2.PNG...], ...]
export function getAllPossibleImageURIs(exerciseId: string): string[][] {
  const folder = getExerciseImageFolder(exerciseId);
  if (!folder) return [];

  const uriGroups: string[][] = [];

  for (let i = 1; i <= MAX_IMAGES_PER_EXERCISE; i++) {
    const variants: string[] = [];
    for (const ext of IMAGE_EXTENSIONS) {
      variants.push(`/exercises/${folder.category}/${folder.folder}/${i}.${ext}`);
    }
    uriGroups.push(variants);
  }

  return uriGroups;
}

// Get flat list of primary URIs (one per image, first extension that matches)
// Used for backwards compatibility
export function getPrimaryImageURIs(exerciseId: string): string[] {
  const folder = getExerciseImageFolder(exerciseId);
  if (!folder) return [];

  const uris: string[] = [];

  for (let i = 1; i <= MAX_IMAGES_PER_EXERCISE; i++) {
    // Try all extensions for each image number
    for (const ext of IMAGE_EXTENSIONS) {
      uris.push(`/exercises/${folder.category}/${folder.folder}/${i}.${ext}`);
    }
  }

  return uris;
}

// Check if exercise might have images (based on folder mapping)
export function hasExerciseImages(exerciseId: string): boolean {
  const folder = getExerciseImageFolder(exerciseId);
  return folder !== null;
}

// Get the base path for exercise images
export function getExerciseImageBasePath(exerciseId: string): string | null {
  const folder = getExerciseImageFolder(exerciseId);
  if (!folder) return null;
  return `/exercises/${folder.category}/${folder.folder}`;
}
