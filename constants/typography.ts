import { Platform, TextStyle } from 'react-native';

// SF Pro est la police systeme sur iOS
// Sur Android on utilise Roboto qui est similaire
const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

// SF Pro Display pour les titres (grandes tailles)
// SF Pro Text pour le corps de texte (petites tailles)
export const fonts = {
  // Display - pour titres et grands textes
  displayBold: {
    fontFamily,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  displaySemiBold: {
    fontFamily,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  displayMedium: {
    fontFamily,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  displayRegular: {
    fontFamily,
    fontWeight: '400' as TextStyle['fontWeight'],
  },

  // Text - pour corps de texte
  textBold: {
    fontFamily,
    fontWeight: '700' as TextStyle['fontWeight'],
  },
  textSemiBold: {
    fontFamily,
    fontWeight: '600' as TextStyle['fontWeight'],
  },
  textMedium: {
    fontFamily,
    fontWeight: '500' as TextStyle['fontWeight'],
  },
  textRegular: {
    fontFamily,
    fontWeight: '400' as TextStyle['fontWeight'],
  },
};

// Tailles de texte standardisees
export const fontSize = {
  // Display sizes
  hero: 42,
  title1: 36,
  title2: 32,
  title3: 28,
  title4: 24,

  // Text sizes
  large: 18,
  body: 16,
  callout: 15,
  subhead: 14,
  footnote: 13,
  caption: 12,
  small: 11,
};

// Line heights
export const lineHeight = {
  hero: 50,
  title1: 44,
  title2: 40,
  title3: 36,
  title4: 32,
  large: 26,
  body: 24,
  callout: 22,
  subhead: 20,
  footnote: 18,
  caption: 16,
  small: 14,
};
