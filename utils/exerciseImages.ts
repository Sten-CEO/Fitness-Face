// ============================================
// EXERCISE IMAGE UTILITIES
// Images served from public/exercises/
// ============================================

import { ImageSourcePropType } from 'react-native';

// Supported image extensions (in order of priority)
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

// Generate image URIs for an exercise from public/exercises/
// Returns array of possible image URIs (1.png, 2.png, 3.png or .jpeg variants)
export function getExerciseImageURIs(exerciseId: string): string[] {
  const folder = getExerciseImageFolder(exerciseId);
  if (!folder) return [];

  const uris: string[] = [];

  // Generate URIs for images 1, 2, 3 with all possible extensions
  for (let i = 1; i <= MAX_IMAGES_PER_EXERCISE; i++) {
    // For each image number, we'll try different extensions
    // The actual availability will be checked by the Image component or a validator
    for (const ext of IMAGE_EXTENSIONS) {
      uris.push(`/exercises/${folder.category}/${folder.folder}/${i}.${ext}`);
    }
  }

  return uris;
}

// Get primary image URIs (one per image number, prioritizing common extensions)
export function getPrimaryImageURIs(exerciseId: string): string[] {
  const folder = getExerciseImageFolder(exerciseId);
  if (!folder) return [];

  const uris: string[] = [];

  // Generate URIs for images 1, 2, 3 with primary extension
  for (let i = 1; i <= MAX_IMAGES_PER_EXERCISE; i++) {
    // Jawline uses .png, double-menton uses .jpeg
    const ext = folder.category === 'jawline' ? 'png' : 'jpeg';
    uris.push(`/exercises/${folder.category}/${folder.folder}/${i}.${ext}`);
  }

  return uris;
}

// Image sources for the slider component
export interface ExerciseImageSource {
  uri: string;
  index: number;
}

// Get image sources for an exercise (ready for Image component)
export function getExerciseImages(exerciseId: string): ImageSourcePropType[] {
  const uris = getPrimaryImageURIs(exerciseId);

  if (uris.length === 0) {
    return [];
  }

  // Return image sources with URIs
  return uris.map(uri => ({ uri }));
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

// Registry to track which images have been validated as existing
// This gets populated at runtime when images load successfully
const validatedImages: Record<string, string[]> = {};

// Mark an image as validated (exists and loaded successfully)
export function markImageAsValid(exerciseId: string, uri: string): void {
  if (!validatedImages[exerciseId]) {
    validatedImages[exerciseId] = [];
  }
  if (!validatedImages[exerciseId].includes(uri)) {
    validatedImages[exerciseId].push(uri);
  }
}

// Get only validated images for an exercise
export function getValidatedImages(exerciseId: string): string[] {
  return validatedImages[exerciseId] || [];
}

// Check if any images have been validated for an exercise
export function hasValidatedImages(exerciseId: string): boolean {
  return (validatedImages[exerciseId]?.length || 0) > 0;
}
