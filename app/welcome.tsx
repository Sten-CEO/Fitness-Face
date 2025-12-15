import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState(PHASE_WELCOME);

  // Build welcome text with blue word info
  const welcomePrefix = 'Bienvenue ';
  const blueWord = firstName || 'Fitness Face';
  const welcomeText = welcomePrefix + blueWord;
  const blueStartIndex = welcomePrefix.length;

  // TOP ZONE: Welcome text - starts from center, slides to fixed top position
  const welcomeOpacity = useRef(new Animated.Value(0)).current;
  // Start position: center of screen (offset from top position)
  const welcomeSlideAnim = useRef(new Animated.Value(height * 0.35)).current;

  // Animation values for letter-by-letter effect
  const charAnimations = useRef(
    welcomeText.split('').map(() => new Animated.Value(0))
  ).current;

  // CENTER ZONE: Second text block - independent animation
  const secondOpacity = useRef(new Animated.Value(0)).current;
  const secondTranslateY = useRef(new Animated.Value(60)).current;

  // Exit animation (both zones)
  const exitOpacity = useRef(new Animated.Value(1)).current;
  const exitTranslateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // PHASE 1: Welcome text appears with letter animation (centered position)
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
      // Slide welcome text to its fixed TOP position
      Animated.timing(welcomeSlideAnim, {
        toValue: 0, // Final position at top
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start(() => {
        setPhase(PHASE_SECOND_TEXT);
      });
    }

    if (phase === PHASE_SECOND_TEXT) {
      // Second text appears independently in CENTER zone
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
          toValue: -100,
          duration: 500,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(exitOpacity, {
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

  // Calculate top position for welcome text zone
  const topZonePosition = insets.top + 60;

  return (
    <TransitionBackground>
      <View style={styles.container}>
        {/* ZONE TOP - Fixed position at top */}
        <Animated.View
          style={[
            styles.topZone,
            {
              top: topZonePosition,
              opacity: Animated.multiply(welcomeOpacity, exitOpacity),
              transform: [
                { translateY: welcomeSlideAnim },
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

        {/* ZONE CENTER - Vertically centered, independent from TOP zone */}
        <Animated.View
          style={[
            styles.centerZone,
            {
              opacity: Animated.multiply(secondOpacity, exitOpacity),
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
            Réponds à quelques <Text style={styles.blueText}>questions</Text> pour commencer.
          </Text>
        </Animated.View>
      </View>
    </TransitionBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // TOP ZONE: Fixed position at top of screen
  topZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
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
  // CENTER ZONE: Vertically centered in remaining space
  centerZone: {
    position: 'absolute',
    top: '45%',
    left: 0,
    right: 0,
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
  blueText: {
    color: textColors.accent,
  },
});
