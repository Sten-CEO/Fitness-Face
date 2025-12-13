// ============================================
// EXERCISE IMAGE UTILITIES
// ============================================

import { ImageSourcePropType } from 'react-native';

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

// In React Native, we need to statically require images
// This creates a registry of all possible exercise images
// Images should be placed in: assets/exercises/{category}/{folder}/{1,2,3}.{png,jpg,jpeg}

// Create image registry for jawline exercises
const jawlineImages: Record<string, ImageSourcePropType[]> = {};
const doubleMentonImages: Record<string, ImageSourcePropType[]> = {};

// Attempt to load images for jawline exercises (1-15)
// Since we can't dynamically require, we need to check at runtime if images exist
// For now, we'll use a placeholder system

// Placeholder for missing images
export const placeholderImage: ImageSourcePropType = require('../assets/images/icon.png');

// Get all images for an exercise (returns array of image sources)
export function getExerciseImages(exerciseId: string): ImageSourcePropType[] {
  const folder = getExerciseImageFolder(exerciseId);
  if (!folder) return [placeholderImage];

  // Check the pre-loaded registry
  if (folder.category === 'jawline' && jawlineImages[folder.folder]) {
    return jawlineImages[folder.folder];
  }
  if (folder.category === 'double-menton' && doubleMentonImages[folder.folder]) {
    return doubleMentonImages[folder.folder];
  }

  // Return placeholder if no images found
  return [placeholderImage];
}

// Check if exercise has real images (not placeholder)
export function hasExerciseImages(exerciseId: string): boolean {
  const images = getExerciseImages(exerciseId);
  return images.length > 0 && images[0] !== placeholderImage;
}

// ============================================
// STATIC IMAGE REGISTRY
// This section needs to be updated when images are added
// React Native requires static require() calls
// ============================================

// Try to require images - will fail silently if not found
function tryRequire(path: string): ImageSourcePropType | null {
  try {
    // This won't work at runtime, but keeps the structure ready
    return null;
  } catch {
    return null;
  }
}

// Initialize image registries
// When images are added, uncomment and update these sections:

/*
// Jawline Exercise 1 Images
try {
  jawlineImages['jawline-exo-1'] = [
    require('../assets/exercises/jawline/jawline-exo-1/1.png'),
    require('../assets/exercises/jawline/jawline-exo-1/2.png'),
    require('../assets/exercises/jawline/jawline-exo-1/3.png'),
  ].filter(Boolean);
} catch {}

// Repeat for jawline-exo-2 through jawline-exo-15...

// Double Menton Exercise 1 Images
try {
  doubleMentonImages['dm-exo-1'] = [
    require('../assets/exercises/double-menton/dm-exo-1/1.png'),
    require('../assets/exercises/double-menton/dm-exo-1/2.png'),
    require('../assets/exercises/double-menton/dm-exo-1/3.png'),
  ].filter(Boolean);
} catch {}

// Repeat for dm-exo-2 through dm-exo-12...
*/
