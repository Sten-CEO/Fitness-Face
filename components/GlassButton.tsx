import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface GlassButtonProps {
  label: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export default function GlassButton({
  label,
  onPress,
  style,
  textStyle,
  disabled = false,
  variant = 'primary',
}: GlassButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.65)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(glowAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(glowAnim, {
        toValue: 0.65,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const isPrimary = variant === 'primary';

  // Halo colore a l'interieur du bouton - degrade bleu/violet diagonal
  const innerHaloGradient = isPrimary ? (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: glowAnim }]}>
      <LinearGradient
        colors={['rgba(80, 140, 255, 0.9)', 'rgba(168, 85, 247, 0.9)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  ) : null;

  // Reflet de lumiere en haut - effet verre
  const glassReflection = (
    <LinearGradient
      colors={[
        'rgba(255, 255, 255, 0.18)',
        'rgba(255, 255, 255, 0.06)',
        'transparent',
      ]}
      locations={[0, 0.4, 0.8]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.reflectionOverlay}
    />
  );

  // Ligne de lumiere en haut du bouton
  const topHighlight = (
    <LinearGradient
      colors={[
        'transparent',
        'rgba(255, 255, 255, 0.35)',
        'rgba(255, 255, 255, 0.35)',
        'transparent',
      ]}
      locations={[0.05, 0.3, 0.7, 0.95]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.topHighlight}
    />
  );

  const buttonContent = (
    <View style={styles.contentWrapper}>
      {/* Halo degrade a l'interieur */}
      {innerHaloGradient}
      {/* Reflet glass */}
      {glassReflection}
      {/* Ligne de lumiere en haut */}
      {topHighlight}
      {/* Texte du bouton */}
      <Text style={[
        styles.text,
        !isPrimary && styles.textSecondary,
        disabled && styles.textDisabled,
        textStyle,
      ]}>
        {label}
      </Text>
    </View>
  );

  const renderBlurContent = () => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={50} tint="dark" style={styles.blurWrapper}>
          {buttonContent}
        </BlurView>
      );
    }
    // Fallback Android - pas de blur
    return (
      <View style={[styles.androidWrapper, !isPrimary && styles.androidWrapperSecondary]}>
        {buttonContent}
      </View>
    );
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[
        styles.outerWrapper,
        isPrimary && styles.outerWrapperPrimary,
        disabled && styles.buttonDisabled,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}>
        {renderBlurContent()}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    // Ombre portee subtile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 8,
  },
  outerWrapperPrimary: {
    // Glow bleu/violet autour du bouton
    shadowColor: '#508CFF',
    shadowOpacity: 0.4,
    shadowRadius: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  blurWrapper: {
    overflow: 'hidden',
    borderRadius: 999,
  },
  androidWrapper: {
    backgroundColor: 'rgba(10, 10, 15, 0.65)',
    borderRadius: 999,
    overflow: 'hidden',
  },
  androidWrapperSecondary: {
    backgroundColor: 'rgba(10, 10, 15, 0.75)',
  },
  contentWrapper: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    overflow: 'hidden',
    // Fond sombre verre
    backgroundColor: 'rgba(10, 10, 15, 0.65)',
  },
  reflectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    height: 1,
    zIndex: 2,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
    zIndex: 3,
  },
  textSecondary: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  textDisabled: {
    opacity: 0.5,
  },
});
