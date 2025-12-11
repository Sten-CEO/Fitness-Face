import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, View } from 'react-native';

import TransitionBackground from '../components/TransitionBackground';

const fontFamily = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

export default function QuestionIntroScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigation automatique après 2.5 secondes
    const timeout = setTimeout(() => {
      router.replace('/questionnaire');
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <TransitionBackground>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.textContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <Text style={styles.title}>
            On va te proposer le programme parfait pour ton visage.
          </Text>
          <Text style={styles.subtitle}>
            Reponds a quelques questions pour commencer.
          </Text>
        </Animated.View>
      </View>
    </TransitionBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontFamily,
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 34,
  },
  subtitle: {
    fontFamily,
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
