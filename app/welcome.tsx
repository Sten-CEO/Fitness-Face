import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';

import TransitionBackground from '../components/TransitionBackground';
import { useUser } from '../contexts/UserContext';
import { typography, textColors } from '../theme/typography';

const { height } = Dimensions.get('window');

// Animation phases
const PHASE_WELCOME = 0;
const PHASE_SLIDE_UP = 1;
const PHASE_SECOND_TEXT = 2;
const PHASE_EXIT = 3;

export default function WelcomeScreen() {
  const router = useRouter();
  const { firstName } = useUser();
  const [phase, setPhase] = useState(PHASE_WELCOME);

  // Build welcome text with blue word info
  const welcomePrefix = 'Bienvenue ';
  const blueWord = firstName || 'Fitness Face';
  const welcomeText = welcomePrefix + blueWord;
  const blueStartIndex = welcomePrefix.length;

  // Animation values for welcome text
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  const welcomeTranslateY = useRef(new Animated.Value(0)).current;
  const charAnimations = useRef(
    welcomeText.split('').map(() => new Animated.Value(0))
  ).current;

  // Animation values for second text block
  const secondOpacity = useRef(new Animated.Value(0)).current;
  const secondTranslateY = useRef(new Animated.Value(100)).current;

  // Global exit animation
  const exitTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // PHASE 1: Welcome text appears with letter animation
    const letterAnimations = charAnimations.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 50,
        delay: index * 35,
        useNativeDriver: true,
      })
    );

    Animated.parallel([
      Animated.timing(welcomeOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.stagger(35, letterAnimations),
    ]).start(() => {
      setTimeout(() => {
        setPhase(PHASE_SLIDE_UP);
      }, 800);
    });
  }, []);

  useEffect(() => {
    if (phase === PHASE_SLIDE_UP) {
      Animated.timing(welcomeTranslateY, {
        toValue: -height * 0.25,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setPhase(PHASE_SECOND_TEXT);
      });
    }

    if (phase === PHASE_SECOND_TEXT) {
      Animated.parallel([
        Animated.timing(secondOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(secondTranslateY, {
          toValue: 0,
          duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          setPhase(PHASE_EXIT);
        }, 1800);
      });
    }

    if (phase === PHASE_EXIT) {
      Animated.parallel([
        Animated.timing(exitTranslateY, {
          toValue: -height,
          duration: 500,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(welcomeOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(secondOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          router.replace('/questionnaire');
        }, 1000);
      });
    }
  }, [phase]);

  return (
    <TransitionBackground>
      <View style={styles.container}>
        {/* Welcome text - starts centered, slides to top */}
        <Animated.View
          style={[
            styles.welcomeContainer,
            {
              opacity: welcomeOpacity,
              transform: [
                { translateY: welcomeTranslateY },
                { translateY: exitTranslateY },
              ],
            },
          ]}
        >
          <View style={styles.textRow}>
            {welcomeText.split('').map((char, index) => {
              const isBlue = index >= blueStartIndex;
              return (
                <Animated.Text
                  key={index}
                  style={[
                    styles.welcomeChar,
                    isBlue && styles.blueChar,
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
              );
            })}
          </View>
        </Animated.View>

        {/* Second text block - slides in from bottom */}
        <Animated.View
          style={[
            styles.secondContainer,
            {
              opacity: secondOpacity,
              transform: [
                { translateY: secondTranslateY },
                { translateY: exitTranslateY },
              ],
            },
          ]}
        >
          <Text style={styles.secondTitle}>
            On va te proposer le programme{' '}
            <Text style={styles.blueText}>parfait</Text> pour ton visage.
          </Text>
          <Text style={styles.secondSubtitle}>
            Reponds a quelques <Text style={styles.blueText}>questions</Text> pour commencer.
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
  welcomeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  textRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeChar: {
    ...typography.h2,
    color: textColors.primary,
    textAlign: 'center',
  },
  blueChar: {
    color: textColors.accent,
  },
  blueText: {
    color: textColors.accent,
  },
  secondContainer: {
    position: 'absolute',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  secondTitle: {
    ...typography.h2,
    color: textColors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  secondSubtitle: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
  },
});
