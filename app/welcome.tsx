import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';

const WELCOME_TEXT = 'Bienvenue sur Fitness Face';

export default function WelcomeScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const charAnimations = useRef(
    WELCOME_TEXT.split('').map(() => new Animated.Value(0))
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
    <BackgroundScreen>
      <View style={styles.container}>
        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          {WELCOME_TEXT.split('').map((char, index) => (
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
    </BackgroundScreen>
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
    paddingHorizontal: 20,
  },
  char: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
