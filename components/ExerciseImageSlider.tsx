import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import React, { useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  getExerciseImagesFromRegistry,
  getExerciseVideoFromRegistry,
  hasVideoInRegistry,
} from '../data/exerciseImageRegistry';
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
  const videoRef = useRef<Video>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Récupérer les images et vidéo depuis le registre statique
  const images = getExerciseImagesFromRegistry(exerciseId);
  const videoSource = getExerciseVideoFromRegistry(exerciseId);
  const hasVideo = hasVideoInRegistry(exerciseId);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SLIDER_WIDTH);
    setCurrentIndex(index);
  };

  const togglePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Si vidéo disponible → afficher la vidéo
  if (hasVideo && videoSource) {
    return (
      <View style={styles.container}>
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            source={videoSource}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            shouldPlay={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setIsPlaying(status.isPlaying);
              }
            }}
          />
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <View style={styles.playButtonInner}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color={textColors.primary}
              />
            </View>
          </TouchableOpacity>
        </View>
        <View style={styles.videoBadge}>
          <Ionicons name="videocam" size={14} color={textColors.accent} />
          <Text style={styles.videoBadgeText}>Vidéo</Text>
        </View>
      </View>
    );
  }

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
  videoContainer: {
    width: SLIDER_WIDTH,
    height: IMAGE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 16,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginTop: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  videoBadgeText: {
    ...typography.caption,
    color: textColors.accent,
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
