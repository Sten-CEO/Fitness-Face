import { Platform, TextStyle } from 'react-native';

// Font family - SF Pro on iOS, Roboto on Android
export const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

// Font weights - Maximum 600, clean modern look like Zentra
export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
};

// Base text styles
export const typography = {
  // Headings - semibold (600)
  h1: {
    fontFamily,
    fontSize: 32,
    fontWeight: fontWeights.semibold,
    letterSpacing: -0.3,
    lineHeight: 40,
  } as TextStyle,

  h2: {
    fontFamily,
    fontSize: 24,
    fontWeight: fontWeights.semibold,
    letterSpacing: -0.3,
    lineHeight: 32,
  } as TextStyle,

  h3: {
    fontFamily,
    fontSize: 20,
    fontWeight: fontWeights.semibold,
    letterSpacing: -0.2,
    lineHeight: 28,
  } as TextStyle,

  // Body text - regular (400)
  body: {
    fontFamily,
    fontSize: 15,
    fontWeight: fontWeights.regular,
    lineHeight: 22,
  } as TextStyle,

  bodySmall: {
    fontFamily,
    fontSize: 14,
    fontWeight: fontWeights.regular,
    lineHeight: 20,
  } as TextStyle,

  // Labels and buttons - medium (500)
  button: {
    fontFamily,
    fontSize: 16,
    fontWeight: fontWeights.medium,
    letterSpacing: 0.1,
  } as TextStyle,

  label: {
    fontFamily,
    fontSize: 14,
    fontWeight: fontWeights.medium,
  } as TextStyle,

  labelSmall: {
    fontFamily,
    fontSize: 12,
    fontWeight: fontWeights.medium,
  } as TextStyle,

  // Caption - regular (400)
  caption: {
    fontFamily,
    fontSize: 13,
    fontWeight: fontWeights.regular,
    lineHeight: 18,
  } as TextStyle,
};

// Colors for text
export const textColors = {
  primary: '#FFFFFF',
  secondary: 'rgba(255, 255, 255, 0.55)',
  tertiary: 'rgba(255, 255, 255, 0.45)',
  accent: '#3B82F6',
};

export default typography;
