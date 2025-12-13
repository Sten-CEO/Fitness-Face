import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  ImageSourcePropType,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getPrimaryImageURIs, markImageAsValid } from '../utils/exerciseImages';
import { textColors, typography } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48; // Account for padding
const IMAGE_HEIGHT = 220;

interface ExerciseImageSliderProps {
  exerciseId: string;
  exerciseName?: string;
}

interface LoadedImage {
  uri: string;
  index: number;
}

export default function ExerciseImageSlider({
  exerciseId,
  exerciseName,
}: ExerciseImageSliderProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<LoadedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attemptedURIs, setAttemptedURIs] = useState<Set<string>>(new Set());

  // Get image URIs for this exercise
  const imageURIs = getPrimaryImageURIs(exerciseId);

  // Reset state when exercise changes
  useEffect(() => {
    setLoadedImages([]);
    setIsLoading(true);
    setAttemptedURIs(new Set());
    setCurrentIndex(0);
  }, [exerciseId]);

  // Check when all images have been attempted
  useEffect(() => {
    if (attemptedURIs.size >= imageURIs.length) {
      setIsLoading(false);
    }
  }, [attemptedURIs.size, imageURIs.length]);

  const handleImageLoad = useCallback((uri: string, index: number) => {
    setLoadedImages(prev => {
      // Avoid duplicates
      if (prev.some(img => img.uri === uri)) return prev;
      const newImages = [...prev, { uri, index }];
      // Sort by index to maintain order
      return newImages.sort((a, b) => a.index - b.index);
    });
    setAttemptedURIs(prev => new Set(prev).add(uri));
    markImageAsValid(exerciseId, uri);
  }, [exerciseId]);

  const handleImageError = useCallback((uri: string) => {
    setAttemptedURIs(prev => new Set(prev).add(uri));
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SLIDER_WIDTH);
    setCurrentIndex(index);
  };

  // Show placeholder while loading
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="hourglass-outline" size={36} color={textColors.accent} />
          </View>
          <Text style={styles.placeholderText}>Chargement...</Text>
        </View>
        {/* Hidden images for loading detection */}
        {imageURIs.map((uri, index) => (
          <Image
            key={uri}
            source={{ uri }}
            style={styles.hiddenImage}
            onLoad={() => handleImageLoad(uri, index)}
            onError={() => handleImageError(uri)}
          />
        ))}
      </View>
    );
  }

  // Show placeholder if no images loaded
  if (loadedImages.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="fitness-outline" size={48} color={textColors.accent} />
          </View>
          <Text style={styles.placeholderText}>
            {exerciseName || 'Exercice'}
          </Text>
          <Text style={styles.placeholderSubtext}>
            Images bientôt disponibles
          </Text>
        </View>
      </View>
    );
  }

  // Show single image without slider if only one image
  if (loadedImages.length === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: loadedImages[0].uri }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  // Show slider for multiple images
  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={SLIDER_WIDTH}
        contentContainerStyle={styles.scrollContent}
      >
        {loadedImages.map((img, displayIndex) => (
          <View key={img.uri} style={styles.imageContainer}>
            <Image
              source={{ uri: img.uri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {loadedImages.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <Text style={styles.stepText}>
          Étape {currentIndex + 1}/{loadedImages.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 16,
  },
  scrollContent: {
    alignItems: 'center',
  },
  imageContainer: {
    width: SLIDER_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  hiddenImage: {
    width: 1,
    height: 1,
    position: 'absolute',
    opacity: 0,
  },
  placeholderContainer: {
    width: '100%',
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderStyle: 'dashed',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderText: {
    ...typography.bodySmall,
    color: textColors.secondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  placeholderSubtext: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: textColors.accent,
    width: 24,
  },
  stepIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stepText: {
    ...typography.caption,
    color: textColors.primary,
    fontSize: 11,
  },
});
