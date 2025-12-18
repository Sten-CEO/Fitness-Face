import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import TransitionBackground from '../components/TransitionBackground';
import type { PlanId } from '../data/plans';
import { useOnboardingRouter } from '../hooks/useOnboardingRouter';
import { typography, textColors } from '../theme/typography';

export default function ProcessingScreen() {
  const { planId } = useLocalSearchParams<{ planId: PlanId }>();
  const { isReady, subscriptionLoading, hasActiveAccess, routeAfterOnboarding } = useOnboardingRouter();
  const [animationDone, setAnimationDone] = useState(false);
  const hasRoutedRef = useRef(false);

  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Animation effect
  useEffect(() => {
    console.log('🟡 [PROCESSING] Screen mounted with planId:', planId);

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

    // Timer minimum d'animation (2.5s)
    const timeout = setTimeout(() => {
      console.log('🟢 [PROCESSING] Animation timer done');
      setAnimationDone(true);
    }, 2500);

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      clearTimeout(timeout);
    };
  }, [planId]);

  // Navigation effect: route quand animation ET subscription sont prêts
  useEffect(() => {
    console.log('🟢 [PROCESSING] Check routing - animationDone:', animationDone, 'isReady:', isReady, 'hasRouted:', hasRoutedRef.current);

    if (animationDone && isReady && !hasRoutedRef.current) {
      hasRoutedRef.current = true;
      console.log('🟢 [PROCESSING] Calling routeAfterOnboarding with planId:', planId || 'jawline_guided');
      console.log('🟢 [PROCESSING] subscriptionLoading:', subscriptionLoading, 'hasActiveAccess:', hasActiveAccess);
      routeAfterOnboarding(planId || 'jawline_guided');
    }
  }, [animationDone, isReady, planId, routeAfterOnboarding, subscriptionLoading, hasActiveAccess]);

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
