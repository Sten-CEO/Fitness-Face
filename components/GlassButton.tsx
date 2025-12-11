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
  const glowAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
      }),
      Animated.timing(glowAnim, {
        toValue: 1.4,
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
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const isPrimary = variant === 'primary';

  // Gradient bleu/violet pour le fond du bouton
  const buttonGradient = (
    <LinearGradient
      colors={
        isPrimary
          ? ['rgba(76, 111, 255, 0.35)', 'rgba(159, 102, 255, 0.25)']
          : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.04)']
      }
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );

  // Reflet de lumiere en haut a gauche - effet "liquid glass"
  const glassReflection = (
    <LinearGradient
      colors={[
        'rgba(255, 255, 255, 0.20)',
        'rgba(255, 255, 255, 0.08)',
        'transparent',
      ]}
      locations={[0, 0.35, 0.7]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.reflectionOverlay}
    />
  );

  // Ligne de lumiere en haut
  const topHighlight = (
    <LinearGradient
      colors={[
        'transparent',
        'rgba(255, 255, 255, 0.30)',
        'rgba(255, 255, 255, 0.30)',
        'transparent',
      ]}
      locations={[0.05, 0.3, 0.7, 0.95]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.topHighlight}
    />
  );

  const buttonInner = (
    <View style={styles.contentWrapper}>
      {buttonGradient}
      {glassReflection}
      {topHighlight}
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

  const renderContent = () => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={20} tint="dark" style={styles.blurWrapper}>
          {buttonInner}
        </BlurView>
      );
    }
    return (
      <View style={[styles.androidWrapper, !isPrimary && styles.androidWrapperSecondary]}>
        {buttonInner}
      </View>
    );
  };

  return (
    <View style={[styles.outerWrapper, style]}>
      {/* Halo lumineux bleu/violet asymetrique - plus fort en haut a gauche */}
      {!disabled && isPrimary && (
        <Animated.View style={[styles.haloContainer, { opacity: glowAnim }]}>
          {/* Glow principal en haut a gauche */}
          <View style={styles.haloTopLeft}>
            <LinearGradient
              colors={['rgba(76, 111, 255, 0.6)', 'transparent']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
          {/* Glow secondaire violet en bas a droite */}
          <View style={styles.haloBottomRight}>
            <LinearGradient
              colors={['transparent', 'rgba(159, 102, 255, 0.35)']}
              style={StyleSheet.absoluteFill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
          </View>
        </Animated.View>
      )}

      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        disabled={disabled}
      >
        <Animated.View style={[
          styles.button,
          isPrimary ? styles.buttonPrimary : styles.buttonSecondary,
          disabled && styles.buttonDisabled,
          { transform: [{ scale: scaleAnim }] },
        ]}>
          {renderContent()}
        </Animated.View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  outerWrapper: {
    position: 'relative',
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
  },
  haloContainer: {
    position: 'absolute',
    top: -16,
    left: -16,
    right: -16,
    bottom: -16,
    borderRadius: 999,
    overflow: 'hidden',
  },
  haloTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '70%',
    height: '70%',
    borderRadius: 999,
  },
  haloBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: '60%',
    height: '60%',
    borderRadius: 999,
  },
  button: {
    borderRadius: 32,
    overflow: 'hidden',
    // Ombre portee bleu/violet
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 8,
  },
  buttonPrimary: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#4C6FFF',
    shadowOpacity: 0.5,
  },
  buttonSecondary: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
  },
  buttonDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  blurWrapper: {
    overflow: 'hidden',
    borderRadius: 32,
  },
  androidWrapper: {
    backgroundColor: 'rgba(15, 30, 55, 0.75)',
    borderRadius: 32,
  },
  androidWrapperSecondary: {
    backgroundColor: 'rgba(7, 7, 10, 0.75)',
  },
  contentWrapper: {
    paddingVertical: 18,
    paddingHorizontal: 36,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    overflow: 'hidden',
    // Fond sombre semi-transparent
    backgroundColor: 'rgba(15, 30, 55, 0.55)',
  },
  reflectionOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  textSecondary: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  textDisabled: {
    opacity: 0.5,
  },
});
