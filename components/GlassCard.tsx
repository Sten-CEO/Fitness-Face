import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  intensity?: number;
}

export default function GlassCard({
  children,
  style,
  intensity = 25,
}: GlassCardProps) {
  if (Platform.OS === 'ios') {
    return (
      <BlurView intensity={intensity} tint="dark" style={[styles.card, style]}>
        <View style={styles.innerContent}>{children}</View>
      </BlurView>
    );
  }

  // Fallback pour Android (BlurView peut être moins performant)
  return (
    <View style={[styles.card, styles.androidFallback, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  innerContent: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  androidFallback: {
    backgroundColor: 'rgba(30, 30, 40, 0.85)',
    padding: 24,
  },
});
