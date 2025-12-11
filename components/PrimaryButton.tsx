import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function PrimaryButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
}: PrimaryButtonProps) {
  const buttonContent = (
    <LinearGradient
      colors={disabled ? ['#4B5563', '#374151'] : ['#60A5FA', '#3B82F6', '#2563EB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </LinearGradient>
  );

  return (
    <View style={[styles.outerWrapper, style]}>
      {/* Halo bleu */}
      {!disabled && <View style={styles.halo} />}

      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        style={[styles.wrapper, disabled && styles.disabled]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={20} tint="dark" style={styles.blurWrapper}>
            <View style={styles.glassOverlay} />
            {buttonContent}
          </BlurView>
        ) : (
          <View style={styles.androidWrapper}>
            {buttonContent}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 0,
  },
  wrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  blurWrapper: {
    overflow: 'hidden',
  },
  androidWrapper: {
    backgroundColor: 'rgba(30, 40, 60, 0.5)',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  disabled: {
    opacity: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
