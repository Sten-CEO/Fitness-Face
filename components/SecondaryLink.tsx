import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

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
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.container, style]}
    >
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  text: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '500',
    textDecorationLine: 'underline',
    textDecorationColor: 'rgba(156, 163, 175, 0.5)',
  },
});
