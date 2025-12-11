import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  intensity?: number;
  compact?: boolean;
  selected?: boolean;
  noPadding?: boolean;
  gradientBorder?: boolean; // Bordure degradee bleu/violet
}

export default function GlassCard({
  children,
  style,
  contentStyle,
  intensity = 20,
  compact = false,
  selected = false,
  noPadding = false,
  gradientBorder = false,
}: GlassCardProps) {
  const cardContent = (
    <View style={[
      styles.innerContent,
      compact && styles.compactContent,
      noPadding && styles.noPaddingContent,
      contentStyle,
    ]}>
      {children}
    </View>
  );

  // Reflet subtil en haut a gauche - style "Glass Morphism mockup"
  const glassReflection = (
    <LinearGradient
      colors={[
        'rgba(255, 255, 255, 0.10)',
        'rgba(255, 255, 255, 0.03)',
        'transparent',
      ]}
      locations={[0, 0.3, 0.7]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.reflectionOverlay}
    />
  );

  // Ligne de lumiere en haut
  const topHighlight = (
    <LinearGradient
      colors={[
        'rgba(255, 255, 255, 0.01)',
        'rgba(255, 255, 255, 0.12)',
        'rgba(255, 255, 255, 0.12)',
        'rgba(255, 255, 255, 0.01)',
      ]}
      locations={[0, 0.2, 0.8, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.topHighlight}
    />
  );

  const cardInner = Platform.OS === 'ios' ? (
    <View style={[
      styles.cardWrapper,
      selected && styles.cardSelected,
      gradientBorder && styles.cardGradientBorder,
    ]}>
      <BlurView intensity={intensity} tint="dark" style={styles.blurView}>
        <View style={styles.innerWrapper}>
          {glassReflection}
          {topHighlight}
          {cardContent}
        </View>
      </BlurView>
    </View>
  ) : (
    <View style={[
      styles.cardWrapper,
      styles.androidCard,
      selected && styles.cardSelected,
      gradientBorder && styles.cardGradientBorder,
    ]}>
      {glassReflection}
      {topHighlight}
      {cardContent}
    </View>
  );

  // Si bordure degradee, on entoure la card d'un wrapper LinearGradient
  if (gradientBorder) {
    return (
      <View style={[styles.shadowWrapper, styles.gradientShadow, style]}>
        <LinearGradient
          colors={['#4f46e5', '#a855f7', '#4f46e5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientBorderWrapper}
        >
          {cardInner}
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={[styles.shadowWrapper, style]}>
      {cardInner}
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    // Ombre douce flottante
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 24,
    elevation: 12,
  },
  gradientShadow: {
    // Glow colore pour les cartes avec bordure degradee
    shadowColor: '#6366f1',
    shadowOpacity: 0.35,
    shadowRadius: 28,
  },
  gradientBorderWrapper: {
    borderRadius: 30,
    padding: 2, // Epaisseur de la bordure degradee
  },
  cardWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
    // Bordure fine style glass mockup
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  cardSelected: {
    borderColor: 'rgba(76, 111, 255, 0.5)',
    borderWidth: 1.5,
  },
  cardGradientBorder: {
    // Pas de bordure quand on utilise le gradient wrapper
    borderWidth: 0,
  },
  blurView: {
    overflow: 'hidden',
  },
  innerWrapper: {
    // Fond sombre semi-transparent - comme reference
    backgroundColor: 'rgba(8, 8, 10, 0.72)',
  },
  reflectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 2,
  },
  innerContent: {
    padding: 28,
    alignItems: 'center',
    zIndex: 3,
  },
  compactContent: {
    padding: 20,
  },
  noPaddingContent: {
    padding: 0,
  },
  androidCard: {
    backgroundColor: 'rgba(8, 8, 10, 0.85)',
  },
});
