import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CleanCard from '../../components/CleanCard';
import { useProgress } from '../../contexts/ProgressContext';
import { getRoutineForPlan, routines } from '../../data/routines';
import { typography, textColors } from '../../theme/typography';

export default function RoutineScreen() {
  const router = useRouter();
  const { selectedPlanId, currentDay, hasCompletedTodayRoutine } = useProgress();

  const currentRoutine = selectedPlanId ? getRoutineForPlan(selectedPlanId) : routines[0];

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Tes routines</Text>
            <Text style={styles.subtitle}>Jour {currentDay}</Text>
          </View>

          {/* Current routine */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push('/routine-detail')}
          >
            <CleanCard style={styles.mainCard}>
              <View style={styles.cardBadge}>
                <Text style={styles.cardBadgeText}>Routine actuelle</Text>
              </View>

              <View style={styles.cardContent}>
                <View style={styles.cardIcon}>
                  <Ionicons name="fitness-outline" size={28} color={textColors.accent} />
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{currentRoutine.name}</Text>
                  <Text style={styles.cardDuration}>{currentRoutine.duration}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={textColors.tertiary} />
              </View>

              <Text style={styles.cardDescription}>{currentRoutine.description}</Text>
            </CleanCard>
          </TouchableOpacity>

          {/* Steps preview */}
          <View style={styles.stepsSection}>
            <Text style={styles.sectionTitle}>Etapes de la routine</Text>
            {currentRoutine.steps.map((step, index) => (
              <View key={index} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepDuration}>{step.duration}</Text>
                </View>
              </View>
            ))}
          </View>

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
    marginBottom: 24,
  },
  title: {
    ...typography.h2,
    color: textColors.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  mainCard: {
    marginBottom: 24,
  },
  cardBadge: {
    backgroundColor: textColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  cardBadgeText: {
    ...typography.labelSmall,
    color: textColors.primary,
    fontSize: 11,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginBottom: 2,
  },
  cardDuration: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  cardDescription: {
    ...typography.bodySmall,
    color: textColors.secondary,
    lineHeight: 20,
  },
  sectionTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginBottom: 16,
  },
  stepsSection: {
    marginBottom: 24,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
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
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    ...typography.bodySmall,
    color: textColors.primary,
    marginBottom: 2,
  },
  stepDuration: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  bottomSpacer: {
    height: 100,
  },
});
