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
import ExerciseImageSlider from '../components/ExerciseImageSlider';
import PrimaryButton from '../components/PrimaryButton';
import { useProgress } from '../contexts/ProgressContext';
import { getDailyRoutine, getIntensityLabel, formatDuration, formatSeries } from '../data/routineGenerator';
import { typography, textColors } from '../theme/typography';

export default function RoutineDetailScreen() {
  const router = useRouter();
  const {
    selectedPlanId,
    currentDay,
    completeDay,
    completeBonusExercise,
    hasCompletedTodayRoutine,
    hasCompletedTodayBonus,
  } = useProgress();

  // Générer la routine dynamique pour le jour actuel
  const dailyRoutine = selectedPlanId
    ? getDailyRoutine(selectedPlanId, currentDay)
    : null;

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [seconds, setSeconds] = useState(
    dailyRoutine ? dailyRoutine.totalDurationMinutes * 60 : 300
  );
  const [isComplete, setIsComplete] = useState(false);
  const [showBonusSection, setShowBonusSection] = useState(false);

  // Active exercise for image slider (defaults to first exercise)
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);

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
    setSeconds(dailyRoutine ? dailyRoutine.totalDurationMinutes * 60 : 300);
    setIsComplete(false);
  };

  const handleCompleteSession = async () => {
    if (dailyRoutine) {
      await completeDay(currentDay, dailyRoutine.routineName);
    }
    setShowBonusSection(true);
  };

  const handleCompleteBonus = async () => {
    if (dailyRoutine) {
      await completeBonusExercise(currentDay, dailyRoutine.bonus.baseName);
    }
    router.replace('/(tabs)/dashboard');
  };

  const handleSkipBonus = () => {
    router.replace('/(tabs)/dashboard');
  };

  if (!dailyRoutine) {
    return (
      <BackgroundScreen centered={true}>
        <Text style={styles.errorText}>Aucune routine disponible</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Retour</Text>
        </TouchableOpacity>
      </BackgroundScreen>
    );
  }

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
              <Text style={styles.headerTitle}>{dailyRoutine.routineName}</Text>
              <Text style={styles.headerSubtitle}>
                {dailyRoutine.dayName} • {getIntensityLabel(dailyRoutine.intensity)}
                {hasCompletedTodayRoutine ? ' – terminé' : ''}
              </Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          {/* Week theme badge */}
          <View style={styles.themeBadge}>
            <Ionicons name="calendar-outline" size={14} color={textColors.accent} />
            <Text style={styles.themeBadgeText}>{dailyRoutine.weekTheme}</Text>
          </View>

          {/* Intensity indicator */}
          <View style={styles.levelBadge}>
            <Ionicons name="flame-outline" size={14} color={textColors.tertiary} />
            <Text style={styles.levelBadgeText}>
              Intensité : {getIntensityLabel(dailyRoutine.intensity)}
            </Text>
          </View>

          {/* Exercise Image Slider */}
          {dailyRoutine.steps[activeExerciseIndex] && (
            <View style={styles.imageSliderSection}>
              <ExerciseImageSlider
                exerciseId={dailyRoutine.steps[activeExerciseIndex].exerciseId}
                exerciseName={dailyRoutine.steps[activeExerciseIndex].displayName}
              />
              <Text style={styles.activeExerciseName}>
                {dailyRoutine.steps[activeExerciseIndex].displayName}
              </Text>
              <Text style={styles.activeExerciseHint}>
                {formatSeries(dailyRoutine.steps[activeExerciseIndex].seriesCount, dailyRoutine.steps[activeExerciseIndex].durationPerSeries)}
              </Text>
            </View>
          )}

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

          {/* Steps - Dynamic exercises */}
          <CleanCard style={styles.stepsCard}>
            <View style={styles.stepsHeader}>
              <Text style={styles.stepsTitle}>Exercices</Text>
              <Text style={styles.stepsDuration}>
                {formatDuration(dailyRoutine.totalDurationMinutes)}
              </Text>
            </View>
            {dailyRoutine.steps.map((step, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.stepItem,
                  activeExerciseIndex === index && styles.stepItemActive,
                ]}
                onPress={() => setActiveExerciseIndex(index)}
                activeOpacity={0.7}
              >
                <View style={[
                  styles.stepNumber,
                  activeExerciseIndex === index && styles.stepNumberActive,
                ]}>
                  <Text style={[
                    styles.stepNumberText,
                    activeExerciseIndex === index && styles.stepNumberTextActive,
                  ]}>{step.order}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepText,
                    activeExerciseIndex === index && styles.stepTextActive,
                  ]}>{step.displayName}</Text>
                  <Text style={styles.stepInstructions}>{step.instructions}</Text>
                  <Text style={styles.stepDuration}>
                    {formatSeries(step.seriesCount, step.durationPerSeries)}
                  </Text>
                </View>
                {activeExerciseIndex === index && (
                  <View style={styles.activeIndicator}>
                    <Ionicons name="image-outline" size={16} color={textColors.accent} />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </CleanCard>

          {/* Complete button or Bonus section */}
          {!showBonusSection && !hasCompletedTodayRoutine ? (
            <View style={styles.completeSection}>
              <PrimaryButton
                title="Terminer la routine"
                onPress={handleCompleteSession}
              />
              {isComplete && (
                <Text style={styles.completeMessage}>
                  Bravo ! Tu as termine ta seance du jour.
                </Text>
              )}
            </View>
          ) : (
            /* Bonus Exercise Section */
            <CleanCard style={styles.bonusCard}>
              <View style={styles.bonusHeader}>
                <View style={styles.bonusIconContainer}>
                  <Ionicons name="star-outline" size={24} color="#FFD700" />
                </View>
                <View style={styles.bonusHeaderText}>
                  <Text style={styles.bonusTitle}>Exercice Bonus</Text>
                  <Text style={styles.bonusSubtitle}>Facultatif - Version douce</Text>
                </View>
                {hasCompletedTodayBonus && (
                  <View style={styles.bonusCompletedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                )}
              </View>

              <View style={styles.bonusContent}>
                <Text style={styles.bonusExerciseName}>
                  {dailyRoutine.bonus.displayName}
                </Text>
                <Text style={styles.bonusInstructions}>
                  {dailyRoutine.bonus.instructions}
                </Text>
                <Text style={styles.bonusDuration}>
                  {formatSeries(dailyRoutine.bonus.seriesCount, dailyRoutine.bonus.durationPerSeries)}
                </Text>
              </View>

              {!hasCompletedTodayBonus ? (
                <View style={styles.bonusActions}>
                  <TouchableOpacity
                    style={styles.bonusSkipButton}
                    onPress={handleSkipBonus}
                  >
                    <Text style={styles.bonusSkipText}>Passer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.bonusCompleteButton}
                    onPress={handleCompleteBonus}
                  >
                    <Ionicons name="checkmark" size={18} color={textColors.primary} />
                    <Text style={styles.bonusCompleteText}>J'ai fait le bonus</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.bonusCompletedMessage}>
                  <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  <Text style={styles.bonusCompletedText}>Exercice bonus effectue !</Text>
                </View>
              )}
            </CleanCard>
          )}

          {/* Back to dashboard if already completed */}
          {(hasCompletedTodayRoutine || showBonusSection) && (
            <TouchableOpacity
              style={styles.backToDashboard}
              onPress={() => router.replace('/(tabs)/dashboard')}
            >
              <Ionicons name="home-outline" size={18} color={textColors.tertiary} />
              <Text style={styles.backToDashboardText}>Retour au dashboard</Text>
            </TouchableOpacity>
          )}
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
    marginBottom: 16,
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
  themeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    gap: 6,
  },
  themeBadgeText: {
    ...typography.caption,
    color: textColors.accent,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    gap: 6,
    marginBottom: 16,
  },
  levelBadgeText: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  imageSliderSection: {
    marginBottom: 16,
    alignItems: 'center',
  },
  activeExerciseName: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
  },
  activeExerciseHint: {
    ...typography.caption,
    color: textColors.tertiary,
    marginTop: 4,
    textAlign: 'center',
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
  stepsCard: {
    marginBottom: 24,
  },
  stepsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepsTitle: {
    ...typography.h4,
    color: textColors.primary,
  },
  stepsDuration: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 8,
  },
  stepItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    borderWidth: 1,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(59, 130, 246, 0.3)',
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
  stepNumberActive: {
    backgroundColor: textColors.accent,
  },
  stepNumberTextActive: {
    color: textColors.primary,
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepTextActive: {
    color: textColors.accent,
  },
  activeIndicator: {
    marginLeft: 8,
    alignSelf: 'center',
  },
  stepInstructions: {
    ...typography.caption,
    color: textColors.secondary,
    marginBottom: 4,
    lineHeight: 18,
  },
  stepDuration: {
    ...typography.caption,
    color: textColors.accent,
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
  // Bonus Exercise Styles
  bonusCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bonusIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bonusHeaderText: {
    flex: 1,
  },
  bonusTitle: {
    ...typography.h4,
    color: '#FFD700',
    marginBottom: 2,
  },
  bonusSubtitle: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  bonusCompletedBadge: {
    marginLeft: 8,
  },
  bonusContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  bonusExerciseName: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  bonusInstructions: {
    ...typography.caption,
    color: textColors.secondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  bonusDuration: {
    ...typography.caption,
    color: textColors.accent,
  },
  bonusActions: {
    flexDirection: 'row',
    gap: 12,
  },
  bonusSkipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
  },
  bonusSkipText: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  bonusCompleteButton: {
    flex: 2,
    flexDirection: 'row',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bonusCompleteText: {
    ...typography.bodySmall,
    color: '#FFD700',
    fontWeight: '600',
  },
  bonusCompletedMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  bonusCompletedText: {
    ...typography.bodySmall,
    color: '#10B981',
  },
  backToDashboard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  backToDashboardText: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  errorText: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  backLink: {
    ...typography.bodySmall,
    color: textColors.accent,
    textAlign: 'center',
  },
});
