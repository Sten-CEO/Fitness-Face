import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getPrimaryImageURIs } from '../utils/exerciseImages';
import { textColors, typography } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48;
const IMAGE_HEIGHT = 220;

// Timeout pour le chargement des images (ms)
const LOADING_TIMEOUT = 2000;

interface ExerciseImageSliderProps {
  exerciseId: string;
  exerciseName?: string;
}

interface ImageStatus {
  uri: string;
  loaded: boolean;
  error: boolean;
}

export default function ExerciseImageSlider({
  exerciseId,
  exerciseName,
}: ExerciseImageSliderProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageStatuses, setImageStatuses] = useState<ImageStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get image URIs for this exercise
  const imageURIs = getPrimaryImageURIs(exerciseId);

  // Reset state when exercise changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsLoading(true);

    // Initialize image statuses
    setImageStatuses(
      imageURIs.map(uri => ({ uri, loaded: false, error: false }))
    );

    // Timeout de sécurité pour arrêter le loading
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, LOADING_TIMEOUT);

    return () => clearTimeout(timeoutId);
  }, [exerciseId]);

  // Check if all images have been processed
  useEffect(() => {
    const allProcessed = imageStatuses.every(s => s.loaded || s.error);
    if (allProcessed && imageStatuses.length > 0) {
      setIsLoading(false);
    }
  }, [imageStatuses]);

  const handleImageLoad = (uri: string) => {
    setImageStatuses(prev =>
      prev.map(s => (s.uri === uri ? { ...s, loaded: true } : s))
    );
  };

  const handleImageError = (uri: string) => {
    setImageStatuses(prev =>
      prev.map(s => (s.uri === uri ? { ...s, error: true } : s))
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SLIDER_WIDTH);
    setCurrentIndex(index);
  };

  // Images qui ont été chargées avec succès
  const loadedImages = imageStatuses.filter(s => s.loaded);

  // Afficher le placeholder pendant le chargement
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.placeholderContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="hourglass-outline" size={36} color={textColors.accent} />
          </View>
          <Text style={styles.placeholderText}>Chargement...</Text>
        </View>
        {/* Images cachées pour détecter le chargement */}
        <View style={styles.hiddenImagesContainer}>
          {imageURIs.map((uri) => (
            <Image
              key={uri}
              source={{ uri }}
              style={styles.hiddenImage}
              onLoad={() => handleImageLoad(uri)}
              onError={() => handleImageError(uri)}
            />
          ))}
        </View>
      </View>
    );
  }

  // Aucune image chargée → placeholder
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

  // Une seule image → pas de slider
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

  // Plusieurs images → slider horizontal
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
        {loadedImages.map((img) => (
          <View key={img.uri} style={styles.imageContainer}>
            <Image
              source={{ uri: img.uri }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>

      {/* Points de pagination */}
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

      {/* Indicateur d'étape */}
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
  hiddenImagesContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
    overflow: 'hidden',
  },
  hiddenImage: {
    width: 1,
    height: 1,
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
