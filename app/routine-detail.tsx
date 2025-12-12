import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import CleanCard from '../components/CleanCard';
import PrimaryButton from '../components/PrimaryButton';
import { useProgress } from '../contexts/ProgressContext';
import { getRoutineForPlan, routines } from '../data/routines';
import { typography, textColors } from '../theme/typography';

export default function RoutineDetailScreen() {
  const router = useRouter();
  const { selectedPlanId, completedDays, completeDay } = useProgress();

  const routine = selectedPlanId ? getRoutineForPlan(selectedPlanId) : routines[0];
  const currentDay = completedDays.length + 1;

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(routine.durationMinutes * 60);
  const [isComplete, setIsComplete] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isRunning && seconds > 0) {
      timerInterval.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            setIsComplete(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }

    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isRunning]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(routine.durationMinutes * 60);
    setIsComplete(false);
  };

  const handleCompleteSession = async () => {
    await completeDay(currentDay);
    router.replace('/(tabs)/dashboard');
  };

  return (
    <BackgroundScreen centered={false} style={styles.safeArea}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={textColors.primary} />
              </TouchableOpacity>
              <View style={styles.headerInfo}>
                <Text style={styles.headerTitle}>{routine.name}</Text>
                <Text style={styles.headerSubtitle}>Jour {currentDay}</Text>
              </View>
              <View style={styles.headerSpacer} />
            </View>

            {/* Video placeholder */}
            <CleanCard style={styles.videoCard}>
              <View style={styles.videoPlaceholder}>
                <View style={styles.videoIconContainer}>
                  <Ionicons name="videocam-outline" size={48} color="rgba(255, 255, 255, 0.3)" />
                </View>
                <Text style={styles.videoPlaceholderText}>Video bientot disponible</Text>
                <Text style={styles.videoPlaceholderSubtext}>
                  En attendant, suis les instructions ci-dessous
                </Text>
              </View>
            </CleanCard>

            {/* Timer */}
            <CleanCard style={styles.timerCard}>
              <Text style={styles.timerLabel}>Timer</Text>
              <Text style={styles.timerValue}>{formatTime(seconds)}</Text>

              <View style={styles.timerControls}>
                <TouchableOpacity
                  style={[styles.timerButton, styles.timerButtonSecondary]}
                  onPress={handleReset}
                >
                  <Ionicons name="refresh-outline" size={22} color={textColors.tertiary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.timerButton,
                    styles.timerButtonPrimary,
                    isRunning && styles.timerButtonPause,
                  ]}
                  onPress={handleStartPause}
                >
                  <Ionicons
                    name={isRunning ? 'pause' : 'play'}
                    size={28}
                    color={textColors.primary}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.timerButton, styles.timerButtonSecondary]}
                  onPress={() => setSeconds((prev) => Math.max(0, prev - 30))}
                >
                  <Text style={styles.skipText}>-30s</Text>
                </TouchableOpacity>
              </View>
            </CleanCard>

            {/* Description */}
            <CleanCard style={styles.descriptionCard}>
              <Text style={styles.descriptionTitle}>Instructions</Text>
              <Text style={styles.descriptionText}>{routine.description}</Text>
            </CleanCard>

            {/* Steps */}
            <CleanCard style={styles.stepsCard}>
              <Text style={styles.stepsTitle}>Etapes</Text>
              {routine.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.stepContent}>
                    <Text style={styles.stepText}>{step.title}</Text>
                    <Text style={styles.stepDuration}>{step.duration}</Text>
                  </View>
                </View>
              ))}
            </CleanCard>

            {/* Complete button */}
            <View style={styles.completeSection}>
              <PrimaryButton
                title="Terminer la seance"
                onPress={handleCompleteSession}
              />
              {isComplete && (
                <Text style={styles.completeMessage}>
                  Bravo ! Tu as termine ta seance du jour.
                </Text>
              )}
            </View>
          </Animated.View>
        </ScrollView>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h4,
    color: textColors.primary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  headerSpacer: {
    width: 40,
  },
  videoCard: {
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  videoPlaceholder: {
    aspectRatio: 16 / 9,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  videoIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  videoPlaceholderText: {
    ...typography.body,
    color: textColors.secondary,
    marginBottom: 4,
  },
  videoPlaceholderSubtext: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  timerCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  timerLabel: {
    ...typography.labelSmall,
    color: textColors.tertiary,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  timerValue: {
    fontSize: 56,
    fontWeight: '700',
    color: textColors.primary,
    fontVariant: ['tabular-nums'],
    marginBottom: 20,
  },
  timerControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  timerButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerButtonPrimary: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: textColors.accent,
  },
  timerButtonPause: {
    backgroundColor: '#FF6B35',
  },
  timerButtonSecondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  skipText: {
    ...typography.labelSmall,
    color: textColors.tertiary,
  },
  descriptionCard: {
    marginBottom: 16,
  },
  descriptionTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginBottom: 12,
  },
  descriptionText: {
    ...typography.body,
    color: textColors.secondary,
    lineHeight: 22,
  },
  stepsCard: {
    marginBottom: 24,
  },
  stepsTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    ...typography.labelSmall,
    color: textColors.accent,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    ...typography.bodySmall,
    color: textColors.primary,
    marginBottom: 2,
  },
  stepDuration: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  completeSection: {
    alignItems: 'center',
  },
  completeMessage: {
    ...typography.bodySmall,
    color: textColors.accent,
    marginTop: 12,
    textAlign: 'center',
  },
});
