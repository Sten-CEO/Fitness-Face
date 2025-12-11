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
      <Text style={[styles.text, disabled && styles.textDisabled, textStyle]}>
        {title}
      </Text>
    </LinearGradient>
  );

  return (
    <View style={[styles.outerWrapper, style]}>
      {/* Halo bleu lumineux - style iOS */}
      {!disabled && (
        <View style={styles.haloOuter}>
          <View style={styles.haloInner} />
        </View>
      )}

      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.85}
        style={[styles.wrapper, disabled && styles.disabled]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView intensity={25} tint="dark" style={styles.blurWrapper}>
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
    maxWidth: 340,
    alignSelf: 'center',
    width: '100%',
  },
  haloOuter: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 32,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  haloInner: {
    flex: 1,
    borderRadius: 32,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 0,
  },
  wrapper: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
  },
  blurWrapper: {
    overflow: 'hidden',
  },
  androidWrapper: {
    backgroundColor: 'rgba(30, 58, 138, 0.6)',
  },
  glassOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  gradient: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  textDisabled: {
    opacity: 0.6,
  },
  disabled: {
    opacity: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
});
