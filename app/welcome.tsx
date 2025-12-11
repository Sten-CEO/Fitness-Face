import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import TransitionBackground from '../components/TransitionBackground';
import { useUser } from '../contexts/UserContext';

const fontFamily = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

export default function WelcomeScreen() {
  const router = useRouter();
  const { firstName } = useUser();

  const welcomeText = firstName
    ? `Bienvenue ${firstName}`
    : 'Bienvenue sur Fitness Face';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const charAnimations = useRef(
    welcomeText.split('').map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animation des lettres une par une
    const animations = charAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 50,
        delay: index * 40,
        useNativeDriver: true,
      })
    );

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.stagger(40, animations),
    ]).start();

    // Navigation automatique après 3 secondes
    const timeout = setTimeout(() => {
      router.replace('/question-intro');
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <TransitionBackground>
      <View style={styles.container}>
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          {welcomeText.split('').map((char, index) => (
            <Animated.Text
              key={index}
              style={[
                styles.char,
                {
                  opacity: charAnimations[index],
                  transform: [
                    {
                      translateY: charAnimations[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {char === ' ' ? '\u00A0' : char}
            </Animated.Text>
          ))}
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  char: {
    fontFamily,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
});
