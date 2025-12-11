import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  Platform,
  TextInputProps,
  ViewStyle,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  containerStyle?: ViewStyle;
}

export default function GlassInput({
  label,
  containerStyle,
  ...props
}: GlassInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const inputContent = (
    <View style={styles.inputInner}>
      {/* Reflet subtil */}
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.08)',
          'rgba(255, 255, 255, 0.02)',
          'transparent',
        ]}
        locations={[0, 0.3, 0.7]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="rgba(255, 255, 255, 0.4)"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        {...props}
      />
    </View>
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
      ]}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={15} tint="dark" style={styles.blurView}>
            {inputContent}
          </BlurView>
        ) : (
          <View style={styles.androidWrapper}>
            {inputContent}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'left',
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    // Ombre subtile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  inputWrapperFocused: {
    borderColor: 'rgba(76, 111, 255, 0.5)',
  },
  blurView: {
    overflow: 'hidden',
  },
  androidWrapper: {
    backgroundColor: 'rgba(7, 7, 10, 0.75)',
  },
  inputInner: {
    backgroundColor: 'rgba(7, 7, 10, 0.55)',
    overflow: 'hidden',
  },
  input: {
    paddingHorizontal: 18,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 16,
    width: '100%',
  },
});
