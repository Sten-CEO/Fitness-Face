import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useEffect, useMemo } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CleanCard from '../components/CleanCard';
import { useProgress } from '../contexts/ProgressContext';
import {
  getDailyRoutine,
  getIntensityLabel,
  formatDuration,
  formatSeries,
  formatInstructions,
} from '../data/routineGenerator';
import { typography, textColors } from '../theme/typography';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CompletedRoutineDetailScreen() {
  const router = useRouter();
  const { dayNumber, completedAt, routineName, bonusCompleted } = useLocalSearchParams<{
    dayNumber: string;
    completedAt: string;
    routineName: string;
    bonusCompleted: string;
  }>();

  const { selectedPlanId, completedBonuses } = useProgress();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const day = parseInt(dayNumber || '1', 10);
  const hasBonusCompleted = bonusCompleted === 'true';

  // Regenerer la routine pour ce jour
  const dailyRoutine = useMemo(() => {
    if (!selectedPlanId) return null;
    return getDailyRoutine(selectedPlanId, day);
  }, [selectedPlanId, day]);

  // Trouver le bonus complete pour ce jour
  const bonusInfo = completedBonuses.find((b) => b.dayNumber === day);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!dailyRoutine) {
    return (
      <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={textColors.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Routine non disponible</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
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
                <Text style={styles.headerTitle}>Détail de la routine</Text>
                <Text style={styles.headerSubtitle}>Jour {day}</Text>
              </View>
              <View style={styles.completedBadge}>
                <Ionicons name="checkmark-circle" size={24} color="#10B981" />
              </View>
            </View>

            {/* Info Card */}
            <CleanCard style={styles.infoCard}>
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar-outline" size={20} color={textColors.accent} />
                  <Text style={styles.infoLabel}>Date</Text>
                  <Text style={styles.infoValue}>{completedAt ? formatDate(completedAt) : '-'}</Text>
                </View>
                <View style={styles.infoDivider} />
                <View style={styles.infoItem}>
                  <Ionicons name="time-outline" size={20} color={textColors.accent} />
                  <Text style={styles.infoLabel}>Heure</Text>
                  <Text style={styles.infoValue}>{completedAt ? formatTime(completedAt) : '-'}</Text>
                </View>
              </View>
            </CleanCard>

            {/* Routine Info */}
            <CleanCard style={styles.routineCard}>
              <Text style={styles.routineTitle}>{routineName || dailyRoutine.routineName}</Text>
              <View style={styles.routineMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="flame-outline" size={16} color={textColors.tertiary} />
                  <Text style={styles.metaText}>{getIntensityLabel(dailyRoutine.intensity)}</Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="timer-outline" size={16} color={textColors.tertiary} />
                  <Text style={styles.metaText}>{formatDuration(dailyRoutine.totalDurationMinutes)}</Text>
                </View>
              </View>
              <Text style={styles.weekTheme}>{dailyRoutine.weekTheme}</Text>
            </CleanCard>

            {/* Exercices */}
            <Text style={styles.sectionTitle}>Exercices réalisés</Text>
            {dailyRoutine.steps.map((step, index) => (
              <CleanCard key={index} style={styles.exerciseCard}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseNumber}>
                    <Text style={styles.exerciseNumberText}>{step.order}</Text>
                  </View>
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseName}>{step.displayName}</Text>
                    <Text style={styles.exerciseDuration}>
                      {formatSeries(step.seriesCount, step.durationPerSeries)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.exerciseInstructions}>{formatInstructions(step.instructions)}</Text>
              </CleanCard>
            ))}

            {/* Bonus Section */}
            <Text style={styles.sectionTitle}>Exercice bonus</Text>
            <CleanCard style={[styles.bonusCard, hasBonusCompleted && styles.bonusCardCompleted]}>
              <View style={styles.bonusHeader}>
                <View style={styles.bonusIconContainer}>
                  <Ionicons
                    name={hasBonusCompleted ? 'star' : 'star-outline'}
                    size={20}
                    color={hasBonusCompleted ? '#F59E0B' : textColors.tertiary}
                  />
                </View>
                <View style={styles.bonusInfo}>
                  <Text style={styles.bonusName}>{dailyRoutine.bonus.displayName}</Text>
                  <Text style={styles.bonusDuration}>
                    {formatSeries(dailyRoutine.bonus.seriesCount, dailyRoutine.bonus.durationPerSeries)}
                  </Text>
                </View>
                {hasBonusCompleted && (
                  <View style={styles.bonusCompletedBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                  </View>
                )}
              </View>
              <Text style={styles.bonusInstructions}>{formatInstructions(dailyRoutine.bonus.instructions)}</Text>
              {!hasBonusCompleted && (
                <Text style={styles.bonusNotCompleted}>Non effectué</Text>
              )}
            </CleanCard>
          </Animated.View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </View>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
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
  completedBadge: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: textColors.tertiary,
  },
  infoCard: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  infoDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  infoLabel: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  infoValue: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  routineCard: {
    marginBottom: 24,
  },
  routineTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginBottom: 12,
  },
  routineMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  weekTheme: {
    ...typography.caption,
    color: textColors.accent,
    fontStyle: 'italic',
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: textColors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  exerciseCard: {
    marginBottom: 12,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  exerciseNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  exerciseNumberText: {
    ...typography.labelSmall,
    color: textColors.accent,
    fontWeight: '700',
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  exerciseDuration: {
    ...typography.caption,
    color: textColors.accent,
  },
  exerciseInstructions: {
    ...typography.caption,
    color: textColors.secondary,
    lineHeight: 18,
  },
  bonusCard: {
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  bonusCardCompleted: {
    borderColor: 'rgba(245, 158, 11, 0.3)',
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
  },
  bonusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bonusIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bonusInfo: {
    flex: 1,
  },
  bonusName: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  bonusDuration: {
    ...typography.caption,
    color: '#F59E0B',
  },
  bonusCompletedBadge: {
    marginLeft: 8,
  },
  bonusInstructions: {
    ...typography.caption,
    color: textColors.secondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  bonusNotCompleted: {
    ...typography.caption,
    color: textColors.tertiary,
    fontStyle: 'italic',
  },
  bottomSpacer: {
    height: 40,
  },
});
