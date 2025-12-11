import React from 'react';
import { Text, TextProps, TextStyle, StyleSheet } from 'react-native';
import { typography, textColors } from '../theme/typography';

type TypographyVariant = keyof typeof typography;
type TextColor = keyof typeof textColors;

interface AppTextProps extends TextProps {
  variant?: TypographyVariant;
  color?: TextColor | string;
  weight?: '400' | '500' | '600';
  children: React.ReactNode;
}

export default function AppText({
  variant = 'body',
  color = 'primary',
  weight,
  style,
  children,
  ...props
}: AppTextProps) {
  const baseStyle = typography[variant];
  const textColor = textColors[color as TextColor] || color;

  const combinedStyle: TextStyle[] = [
    baseStyle,
    { color: textColor },
    weight ? { fontWeight: weight } : {},
    style as TextStyle,
  ];

  return (
    <Text style={combinedStyle} {...props}>
      {children}
    </Text>
  );
}
