import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';

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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
    >
      <Animated.View style={[
        styles.buttonWrapper,
        disabled && styles.buttonDisabled,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}>
        <View style={styles.buttonInner}>
          <Text style={[styles.text, textStyle]}>
            {title}
          </Text>
        </View>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  buttonWrapper: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 340,
    borderRadius: 14,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInner: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    borderRadius: 14,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
