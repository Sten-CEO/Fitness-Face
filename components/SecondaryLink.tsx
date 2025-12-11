import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';

interface SecondaryLinkProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function SecondaryLink({
  title,
  onPress,
  style,
  textStyle,
}: SecondaryLinkProps) {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      activeOpacity={1}
      style={[styles.container, style]}
    >
      <Text
        style={[
          styles.text,
          isPressed && styles.textPressed,
          textStyle,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#7DD3FC',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(125, 211, 252, 0.4)',
  },
  textPressed: {
    opacity: 0.7,
  },
});
