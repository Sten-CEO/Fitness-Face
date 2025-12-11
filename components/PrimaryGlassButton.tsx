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

interface PrimaryGlassButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export default function PrimaryGlassButton({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
}: PrimaryGlassButtonProps) {
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
        toValue: 1.3,
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

  // Reflet diagonal liquid glass
  const liquidGlassReflection = (
    <>
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.25)',
          'rgba(255, 255, 255, 0.1)',
          'transparent',
        ]}
        locations={[0, 0.4, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.reflectionOverlay}
      />
      {/* Ligne de lumiere superieure */}
      <LinearGradient
        colors={[
          'transparent',
          'rgba(255, 255, 255, 0.4)',
          'rgba(255, 255, 255, 0.2)',
          'transparent',
        ]}
        locations={[0.1, 0.35, 0.65, 0.9]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topHighlight}
      />
    </>
  );

  const buttonInner = (
    <View style={styles.contentWrapper}>
      {/* Gradient interne bleu */}
      {!disabled && (
        <LinearGradient
          colors={[
            'rgba(96, 165, 250, 0.35)',
            'rgba(59, 130, 246, 0.25)',
            'rgba(37, 99, 235, 0.2)',
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {liquidGlassReflection}
      <Text style={[styles.text, disabled && styles.textDisabled, textStyle]}>
        {title}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={50} tint="dark" style={styles.blurWrapper}>
          {buttonInner}
        </BlurView>
      );
    }
    return (
      <View style={styles.androidWrapper}>
        {buttonInner}
      </View>
    );
  };

  return (
    <View style={[styles.outerWrapper, style]}>
      {/* Halo lumineux externe anime */}
      {!disabled && (
        <Animated.View style={[
          styles.haloContainer,
          { opacity: glowAnim },
        ]}>
          <LinearGradient
            colors={[
              'rgba(96, 165, 250, 0.5)',
              'rgba(59, 130, 246, 0.3)',
              'rgba(37, 99, 235, 0.15)',
              'transparent',
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.haloGradient}
          />
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
    maxWidth: 320,
  },
  haloContainer: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 999,
    overflow: 'hidden',
  },
  haloGradient: {
    flex: 1,
    borderRadius: 999,
    // Ombre externe pour le glow
    shadowColor: '#60A5FA',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 25,
  },
  button: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.45)',
    // Ombre du bouton lui-meme
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowOpacity: 0,
  },
  blurWrapper: {
    overflow: 'hidden',
    borderRadius: 999,
  },
  androidWrapper: {
    backgroundColor: 'rgba(40, 60, 100, 0.7)',
    borderRadius: 999,
  },
  contentWrapper: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
    overflow: 'hidden',
  },
  reflectionOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    height: 1,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textDisabled: {
    opacity: 0.5,
  },
});
