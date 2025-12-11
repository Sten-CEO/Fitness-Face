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
  const buttonInner = (
    <View style={styles.contentWrapper}>
      {/* Halo gradient interne bleu */}
      {!disabled && (
        <LinearGradient
          colors={[
            'rgba(96, 165, 250, 0.25)',
            'rgba(59, 130, 246, 0.15)',
            'rgba(37, 99, 235, 0.1)',
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      <Text style={[styles.text, disabled && styles.textDisabled, textStyle]}>
        {title}
      </Text>
    </View>
  );

  const renderContent = () => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={60} tint="dark" style={styles.blurWrapper}>
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
      {/* Halo lumineux externe */}
      {!disabled && (
        <View style={styles.haloContainer}>
          <LinearGradient
            colors={[
              'rgba(96, 165, 250, 0.35)',
              'rgba(59, 130, 246, 0.2)',
              'rgba(37, 99, 235, 0.1)',
            ]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            style={styles.haloGradient}
          />
        </View>
      )}

      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.8}
        style={[styles.button, disabled && styles.buttonDisabled]}
      >
        {renderContent()}
      </TouchableOpacity>
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
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  haloGradient: {
    flex: 1,
    borderRadius: 999,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
  },
  button: {
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  buttonDisabled: {
    opacity: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  blurWrapper: {
    overflow: 'hidden',
    borderRadius: 999,
  },
  androidWrapper: {
    backgroundColor: 'rgba(30, 40, 70, 0.75)',
    borderRadius: 999,
  },
  contentWrapper: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  textDisabled: {
    opacity: 0.5,
  },
});
