import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ImageBackground, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { textColors, typography } from '../theme/typography';

// TODO: Remplacer par transition-bg.PNG quand disponible
const transitionBg = require('../assets/images/background.jpeg');

export default function TransitionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { firstName, planName } = useLocalSearchParams<{
    firstName?: string;
    planName?: string;
  }>();

  const displayName = firstName || 'vous';

  // Animation values pour texte 1 (en haut)
  const text1Opacity = useRef(new Animated.Value(0)).current;
  const text1TranslateY = useRef(new Animated.Value(30)).current;

  // Animation values pour texte 2 (arrive d'en bas)
  const text2Opacity = useRef(new Animated.Value(0)).current;
  const text2TranslateY = useRef(new Animated.Value(60)).current;

  // Animation de sortie (les deux textes glissent vers le haut)
  const exitTranslateY = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // t=0.0 : texte1 in
    Animated.parallel([
      Animated.timing(text1Opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(text1TranslateY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // t=0.4 : texte2 in
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(text2Opacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(text2TranslateY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 400);

    // t=5.6 : les deux sortent vers le haut (+2s supplémentaires)
    const exitTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(exitTranslateY, {
          toValue: -150,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(exitOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    }, 5600);

    // t=6.2 : navigate dashboard (+2s supplémentaires)
    const navTimer = setTimeout(() => {
      router.replace('/(tabs)/dashboard');
    }, 6200);

    // Cleanup des timers si l'utilisateur quitte
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(navTimer);
    };
  }, []);

  return (
    <View style={styles.container}>
      <ImageBackground
        source={transitionBg}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
      >
        <View style={styles.overlay} />
      </ImageBackground>

      <View style={[styles.content, { paddingTop: insets.top + 80 }]}>
        {/* Texte 1 - En haut */}
        <Animated.View
          style={[
            styles.text1Container,
            {
              opacity: Animated.multiply(text1Opacity, exitOpacity),
              transform: [
                { translateY: text1TranslateY },
                { translateY: exitTranslateY },
              ],
            },
          ]}
        >
          <Text style={styles.text1}>
            Merci d'avoir choisi ce programme,{' '}
            <Text style={styles.blueText}>{displayName}</Text>
          </Text>
        </Animated.View>

        {/* Texte 2 - Centre, arrive d'en bas */}
        <Animated.View
          style={[
            styles.text2Container,
            {
              opacity: Animated.multiply(text2Opacity, exitOpacity),
              transform: [
                { translateY: text2TranslateY },
                { translateY: exitTranslateY },
              ],
            },
          ]}
        >
          <Text style={styles.text2}>
            Nous preparons votre programme pour{' '}
            <Text style={styles.blueText}>vous</Text>
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
  },
  text1Container: {
    marginBottom: 60,
  },
  text1: {
    ...typography.h3,
    color: textColors.primary,
    textAlign: 'center',
    lineHeight: 32,
  },
  text2Container: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 100,
  },
  text2: {
    ...typography.h2,
    color: textColors.primary,
    textAlign: 'center',
    lineHeight: 38,
  },
  blueText: {
    color: textColors.accent,
  },
});
