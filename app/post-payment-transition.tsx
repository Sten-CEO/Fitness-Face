import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useUser } from '../contexts/UserContext';
import { typography, textColors } from '../theme/typography';

export default function PostPaymentTransitionScreen() {
  const router = useRouter();
  const { firstName } = useUser();
  const { planName } = useLocalSearchParams<{ planName: string }>();

  const slideAnim = useRef(new Animated.Value(100)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  const displayName = firstName || 'toi';
  const displayPlan = planName || 'ton programme';

  useEffect(() => {
    console.log('POST_PAYMENT_TRANSITION mounted');

    // Slide in from bottom + fade in
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Pause ~1s for reading
      setTimeout(() => {
        // Slide out to top + fade out
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          console.log('Navigating to dashboard...');
          // Navigate to dashboard tabs
          router.replace('/(tabs)/dashboard');
        });
      }, 1000);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ translateY: slideAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Text style={styles.thankYouText}>
          Merci d'avoir choisi
        </Text>
        <Text style={styles.planText}>
          {displayPlan}
        </Text>
        <Text style={styles.nameText}>
          {displayName}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  thankYouText: {
    ...typography.body,
    color: textColors.secondary,
    marginBottom: 8,
  },
  planText: {
    ...typography.h2,
    color: textColors.accent,
    textAlign: 'center',
    marginBottom: 4,
  },
  nameText: {
    ...typography.h3,
    color: textColors.primary,
  },
});
