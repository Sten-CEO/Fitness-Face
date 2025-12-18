import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Alert, Animated, Easing, StyleSheet, Text, View } from 'react-native';

import TransitionBackground from '../components/TransitionBackground';
import type { PlanId } from '../data/plans';
import { typography, textColors } from '../theme/typography';

export default function ProcessingScreen() {
  const router = useRouter();
  const { planId } = useLocalSearchParams<{ planId: PlanId }>();

  console.log('[NAVIGATION] ProcessingScreen mounted, planId:', planId);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // DEBUG ALERT
    Alert.alert('DEBUG Processing', `Processing screen loaded!\nplanId: ${planId}`);
    console.log('[NAVIGATION] ProcessingScreen useEffect running');

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    const animateDot = (dot: Animated.Value, delay: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, {
            toValue: 1,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 400,
            easing: Easing.ease,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const anim1 = animateDot(dot1, 0);
    const anim2 = animateDot(dot2, 150);
    const anim3 = animateDot(dot3, 300);

    anim1.start();
    anim2.start();
    anim3.start();

    const timeout = setTimeout(() => {
      console.log('[NAVIGATION] ProcessingScreen -> navigating to /result with planId:', planId || 'all_in_one');
      router.replace({
        pathname: '/result',
        params: { planId: planId || 'all_in_one' },
      });
    }, 2500);

    return () => {
      console.log('[NAVIGATION] ProcessingScreen cleanup');
      anim1.stop();
      anim2.stop();
      anim3.stop();
      clearTimeout(timeout);
    };
  }, [planId]);

  const renderDot = (anim: Animated.Value) => (
    <Animated.View
      style={[
        styles.dot,
        {
          opacity: anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
          }),
          transform: [
            {
              scale: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [1, 1.3],
              }),
            },
          ],
        },
      ]}
    />
  );

  return (
    <TransitionBackground>
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <Text style={styles.title}>Analyse de tes réponses en cours</Text>
        <Text style={styles.subtitle}>
          On réfléchit au meilleur programme pour toi...
        </Text>

        <View style={styles.dotsContainer}>
          {renderDot(dot1)}
          {renderDot(dot2)}
          {renderDot(dot3)}
        </View>
      </Animated.View>
    </TransitionBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: textColors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: textColors.accent,
  },
});
