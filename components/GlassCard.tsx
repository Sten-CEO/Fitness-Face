import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
  compact?: boolean;
}

export default function GlassCard({
  children,
  style,
  intensity = 40,
  compact = false,
}: GlassCardProps) {
  const cardContent = (
    <View style={[styles.innerContent, compact && styles.compactContent]}>
      {children}
    </View>
  );

  const gradientOverlay = (
    <LinearGradient
      colors={[
        'rgba(255, 255, 255, 0.08)',
        'rgba(255, 255, 255, 0.02)',
        'rgba(0, 0, 0, 0.05)',
      ]}
      locations={[0, 0.5, 1]}
      style={StyleSheet.absoluteFill}
    />
  );

  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.cardWrapper, style]}>
        <BlurView intensity={intensity} tint="dark" style={styles.blurView}>
          {gradientOverlay}
          <View style={styles.innerWrapper}>{cardContent}</View>
        </BlurView>
      </View>
    );
  }

  // Fallback Android avec effet similaire
  return (
    <View style={[styles.cardWrapper, styles.androidCard, style]}>
      {gradientOverlay}
      {cardContent}
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  blurView: {
    overflow: 'hidden',
  },
  innerWrapper: {
    backgroundColor: 'rgba(15, 15, 20, 0.55)',
  },
  innerContent: {
    padding: 28,
    alignItems: 'center',
  },
  compactContent: {
    padding: 20,
  },
  androidCard: {
    backgroundColor: 'rgba(15, 15, 20, 0.85)',
  },
});
