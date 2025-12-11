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
  opaque?: boolean;
  glowColor?: 'blue' | 'none';
}

export default function GlassCard({
  children,
  style,
  contentStyle,
  intensity = 60,
  compact = false,
  selected = false,
  opaque = false,
  glowColor = 'none',
}: GlassCardProps) {
  const cardContent = (
    <View style={[styles.innerContent, compact && styles.compactContent, contentStyle]}>
      {children}
    </View>
  );

  // Reflet diagonal type "liquid glass" iOS 18
  const liquidGlassOverlay = (
    <>
      {/* Reflet principal en haut a gauche */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.18)',
          'rgba(255, 255, 255, 0.08)',
          'rgba(255, 255, 255, 0.02)',
          'transparent',
        ]}
        locations={[0, 0.2, 0.5, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Ligne de reflet superieure */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(255, 255, 255, 0.25)',
          'rgba(255, 255, 255, 0.15)',
          'transparent',
        ]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topReflection}
      />
    </>
  );

  // Bordure lumineuse type verre
  const glassHighlightBorder = (
    <View style={styles.highlightBorderWrapper}>
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.35)',
          'rgba(255, 255, 255, 0.1)',
          'rgba(255, 255, 255, 0.05)',
          'rgba(255, 255, 255, 0.15)',
        ]}
        locations={[0, 0.3, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.highlightBorder}
      />
    </View>
  );

  const hasBlueGlow = glowColor === 'blue' || selected;

  if (Platform.OS === 'ios') {
    return (
      <View style={[
        styles.shadowWrapper,
        hasBlueGlow && styles.blueGlowShadow,
        style,
      ]}>
        <View style={[
          styles.cardWrapper,
          selected && styles.cardSelected,
        ]}>
          {glassHighlightBorder}
          <BlurView intensity={intensity} tint="dark" style={styles.blurView}>
            <View style={[styles.innerWrapper, opaque && styles.innerWrapperOpaque]}>
              {liquidGlassOverlay}
              {cardContent}
            </View>
          </BlurView>
        </View>
      </View>
    );
  }

  // Fallback Android avec effet similaire
  return (
    <View style={[
      styles.shadowWrapper,
      hasBlueGlow && styles.blueGlowShadow,
      style,
    ]}>
      <View style={[
        styles.cardWrapper,
        styles.androidCard,
        opaque && styles.androidCardOpaque,
        selected && styles.cardSelected,
      ]}>
        {glassHighlightBorder}
        {liquidGlassOverlay}
        {cardContent}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrapper: {
    // Ombre douce par defaut
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 8,
  },
  blueGlowShadow: {
    // Halo bleu subtil
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
  },
  cardWrapper: {
    borderRadius: 28,
    overflow: 'hidden',
    // Bordure subtile style iOS glass
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  cardSelected: {
    borderColor: 'rgba(96, 165, 250, 0.5)',
    borderWidth: 1.5,
  },
  highlightBorderWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 10,
    overflow: 'hidden',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  highlightBorder: {
    flex: 1,
  },
  topReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  blurView: {
    overflow: 'hidden',
  },
  innerWrapper: {
    backgroundColor: 'rgba(20, 20, 30, 0.55)',
  },
  innerWrapperOpaque: {
    backgroundColor: 'rgba(15, 15, 22, 0.75)',
  },
  innerContent: {
    padding: 28,
    alignItems: 'center',
  },
  compactContent: {
    padding: 20,
  },
  androidCard: {
    backgroundColor: 'rgba(20, 20, 30, 0.85)',
  },
  androidCardOpaque: {
    backgroundColor: 'rgba(15, 15, 22, 0.92)',
  },
});
