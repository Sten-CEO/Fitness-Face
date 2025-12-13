import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { getExerciseImagesFromRegistry } from '../data/exerciseImageRegistry';
import { textColors, typography } from '../theme/typography';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SLIDER_WIDTH = SCREEN_WIDTH - 48;
const IMAGE_HEIGHT = 220;

interface ExerciseImageSliderProps {
  exerciseId: string;
  exerciseName?: string;
}

export default function ExerciseImageSlider({
  exerciseId,
  exerciseName,
}: ExerciseImageSliderProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Récupérer les images depuis le registre statique
  const images = getExerciseImagesFromRegistry(exerciseId);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SLIDER_WIDTH);
    setCurrentIndex(index);
  };

  // Aucune image → placeholder
  if (images.length === 0) {
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

  // Une seule image → affichage simple sans slider
  if (images.length === 1) {
    return (
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          <Image
            source={images[0]}
            style={styles.image}
            resizeMode="contain"
          />
        </View>
      </View>
    );
  }

  // Plusieurs images → slider horizontal avec swipe
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
        {images.map((imageSource, index) => (
          <View key={index} style={styles.imageContainer}>
            <Image
              source={imageSource}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
        ))}
      </ScrollView>

      {/* Points de pagination */}
      <View style={styles.pagination}>
        {images.map((_, index) => (
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
          Étape {currentIndex + 1}/{images.length}
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
