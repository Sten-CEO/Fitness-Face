import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  compact?: boolean;
  selected?: boolean;
}

export default function GlassCard({
  children,
  style,
  intensity = 50,
  compact = false,
  selected = false,
}: GlassCardProps) {
  const cardContent = (
    <View style={[styles.innerContent, compact && styles.compactContent]}>
      {children}
    </View>
  );

  // Overlay gradient subtil pour effet glass iOS
  const gradientOverlay = (
    <LinearGradient
      colors={[
        'rgba(255, 255, 255, 0.12)',
        'rgba(255, 255, 255, 0.05)',
        'rgba(255, 255, 255, 0.02)',
      ]}
      locations={[0, 0.4, 1]}
      style={StyleSheet.absoluteFill}
    />
  );

  // Bordure lumineuse en haut pour effet glass
  const topHighlight = (
    <View style={styles.topHighlight} />
  );

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.cardWrapper, selected && styles.cardSelected, style]}>
        {topHighlight}
        <BlurView intensity={intensity} tint="dark" style={styles.blurView}>
          <View style={styles.innerWrapper}>
            {gradientOverlay}
            {cardContent}
          </View>
        </BlurView>
      </View>
    );
  }

  // Fallback Android avec effet similaire
  return (
    <View style={[styles.cardWrapper, styles.androidCard, selected && styles.cardSelected, style]}>
      {topHighlight}
      {gradientOverlay}
      {cardContent}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    // Bordure subtile style iOS
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    // Ombre douce
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  cardSelected: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    borderWidth: 1.5,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    zIndex: 10,
  },
  blurView: {
    overflow: 'hidden',
  },
  innerWrapper: {
    backgroundColor: 'rgba(30, 30, 35, 0.65)',
  },
  innerContent: {
    padding: 24,
    alignItems: 'center',
  },
  compactContent: {
    padding: 20,
  },
  androidCard: {
    backgroundColor: 'rgba(30, 30, 35, 0.88)',
  },
});
