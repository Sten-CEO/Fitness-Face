import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CleanCard from '../../components/CleanCard';
import TabBackground from '../../components/TabBackground';
import { useProgress } from '../../contexts/ProgressContext';
import { typography, textColors } from '../../theme/typography';

// Objectifs configurables
const OBJECTIVES = [
  { id: 'week1', name: 'Première semaine', desc: 'Complète 7 jours', target: 7, type: 'days', icon: 'trophy-outline', color: '#3B82F6' },
  { id: 'month1', name: 'Premier mois', desc: 'Complète 30 jours', target: 30, type: 'days', icon: 'medal-outline', color: '#8B5CF6' },
  { id: 'streak7', name: 'En feu', desc: '7 jours d\'affilée', target: 7, type: 'streak', icon: 'flame-outline', color: '#EF4444' },
  { id: 'streak30', name: 'Inarrêtable', desc: '30 jours d\'affilée', target: 30, type: 'streak', icon: 'rocket-outline', color: '#F59E0B' },
  { id: 'bonus5', name: 'Motivé', desc: '5 exercices bonus', target: 5, type: 'bonus', icon: 'star-outline', color: '#22C55E' },
  { id: 'bonus15', name: 'Perfectionniste', desc: '15 exercices bonus', target: 15, type: 'bonus', icon: 'ribbon-outline', color: '#EC4899' },
];

export default function ProgressScreen() {
  const {
    completedDaysCount,
    completedDayNumbers,
    completedBonusesCount,
    completedBonuses,
    streak,
    totalDays,
    currentDay,
    selectedPlanName,
    isFixedProgram,
    progressPercent,
    daysRemaining,
  } = useProgress();

  // Set des jours avec bonus complété pour lookup rapide
  const bonusDays = new Set(completedBonuses.map((b) => b.dayNumber));

  // Generate 30-day grid starting from TODAY (first position)
  const generateDaysGrid = () => {
    const days = [];
    // On génère les 30 derniers jours avec aujourd'hui en position 0
    for (let i = 0; i < 30; i++) {
      const dayNumber = currentDay - i;
      if (dayNumber < 1) break;

      const isCompleted = completedDayNumbers.includes(dayNumber);
      const hasBonus = bonusDays.has(dayNumber);
      const isToday = i === 0;

      days.push({ dayNumber, isCompleted, hasBonus, isToday });
    }
    return days;
  };

  const daysGrid = generateDaysGrid();

  // Calculer la progression des objectifs
  const getObjectiveProgress = (objective: typeof OBJECTIVES[0]) => {
    let current = 0;
    if (objective.type === 'days') {
      current = completedDaysCount;
    } else if (objective.type === 'streak') {
      current = streak;
    } else if (objective.type === 'bonus') {
      current = completedBonusesCount;
    }
    const isCompleted = current >= objective.target;
    const progress = Math.min(100, (current / objective.target) * 100);
    return { current, isCompleted, progress };
  };

  return (
    <TabBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Progression</Text>
            <Text style={styles.subtitle}>{selectedPlanName || 'Programme'}</Text>
          </View>

          {/* Main stats */}
          <CleanCard style={styles.statsCard}>
            {isFixedProgram && progressPercent !== null ? (
              <>
                <View style={styles.mainStat}>
                  <Text style={styles.mainStatValue}>{Math.round(progressPercent)}%</Text>
                  <Text style={styles.mainStatLabel}>Complété</Text>
                </View>
                <View style={styles.progressBarLarge}>
                  <View style={[styles.progressBarFillLarge, { width: `${progressPercent}%` }]} />
                </View>
              </>
            ) : (
              <View style={styles.mainStat}>
                <Text style={styles.mainStatValue}>{completedDaysCount}</Text>
                <Text style={styles.mainStatLabel}>Routines complétées</Text>
              </View>
            )}

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Ionicons name="checkmark-circle-outline" size={24} color={textColors.accent} />
                <Text style={styles.statBoxValue}>{completedDaysCount}</Text>
                <Text style={styles.statBoxLabel}>
                  {isFixedProgram ? 'Jours' : 'Routines'}
                </Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="flame-outline" size={24} color="#EF4444" />
                <Text style={styles.statBoxValue}>{streak}</Text>
                <Text style={styles.statBoxLabel}>Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="star-outline" size={24} color="#F59E0B" />
                <Text style={styles.statBoxValue}>{completedBonusesCount}</Text>
                <Text style={styles.statBoxLabel}>Bonus</Text>
              </View>
              {isFixedProgram && daysRemaining !== null && (
                <View style={styles.statBox}>
                  <Ionicons name="flag-outline" size={24} color={textColors.tertiary} />
                  <Text style={styles.statBoxValue}>{daysRemaining}</Text>
                  <Text style={styles.statBoxLabel}>Restants</Text>
                </View>
              )}
            </View>
          </CleanCard>

          {/* 30-Day Calendar Grid */}
          <CleanCard style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Text style={styles.calendarTitle}>30 derniers jours</Text>
              <View style={styles.todayBadge}>
                <Text style={styles.todayBadgeText}>Jour {currentDay}</Text>
              </View>
            </View>

            <View style={styles.calendarGrid}>
              {daysGrid.map((day, index) => (
                <View
                  key={day.dayNumber}
                  style={[
                    styles.calendarDay,
                    day.isCompleted && styles.calendarDayCompleted,
                    day.hasBonus && styles.calendarDayBonus,
                    day.isToday && styles.calendarDayToday,
                  ]}
                >
                  {day.isCompleted && !day.hasBonus && (
                    <Ionicons name="checkmark" size={12} color={textColors.primary} />
                  )}
                  {day.hasBonus && (
                    <Ionicons name="star" size={12} color={textColors.primary} />
                  )}
                  {day.isToday && !day.isCompleted && (
                    <Text style={styles.calendarDayText}>{day.dayNumber}</Text>
                  )}
                </View>
              ))}
            </View>

            {/* Legend */}
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotCompleted]} />
                <Text style={styles.legendText}>Routine</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotBonus]} />
                <Text style={styles.legendText}>+ Bonus</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotToday]} />
                <Text style={styles.legendText}>Aujourd'hui</Text>
              </View>
            </View>
          </CleanCard>

          {/* Objectives */}
          <CleanCard style={styles.achievementsCard}>
            <Text style={styles.achievementsTitle}>Objectifs</Text>

            {OBJECTIVES.map((objective) => {
              const { current, isCompleted, progress } = getObjectiveProgress(objective);
              return (
                <View key={objective.id} style={styles.achievementItem}>
                  <View
                    style={[
                      styles.achievementIcon,
                      isCompleted && { backgroundColor: `${objective.color}20` },
                    ]}
                  >
                    <Ionicons
                      name={objective.icon as any}
                      size={20}
                      color={isCompleted ? objective.color : 'rgba(255, 255, 255, 0.3)'}
                    />
                  </View>
                  <View style={styles.achievementInfo}>
                    <View style={styles.achievementHeader}>
                      <Text style={styles.achievementName}>{objective.name}</Text>
                      <Text style={styles.achievementProgress}>
                        {current}/{objective.target}
                      </Text>
                    </View>
                    <Text style={styles.achievementDesc}>{objective.desc}</Text>
                    {/* Progress bar */}
                    <View style={styles.achievementProgressBar}>
                      <View
                        style={[
                          styles.achievementProgressFill,
                          { width: `${progress}%`, backgroundColor: objective.color },
                        ]}
                      />
                    </View>
                  </View>
                  {isCompleted && (
                    <Ionicons name="checkmark-circle" size={20} color={objective.color} />
                  )}
                </View>
              );
            })}
          </CleanCard>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </TabBackground>
  );
}

const styles = StyleSheet.create({
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
  statsCard: {
    marginBottom: 16,
    alignItems: 'center',
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 20,
  },
  mainStatValue: {
    fontSize: 48,
    fontWeight: '700',
    color: textColors.accent,
  },
  mainStatLabel: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  progressBarLarge: {
    width: '100%',
    height: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 24,
  },
  progressBarFillLarge: {
    height: '100%',
    backgroundColor: textColors.accent,
    borderRadius: 5,
  },
  statsGrid: {
    flexDirection: 'row',
    width: '100%',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  statBoxValue: {
    ...typography.h3,
    color: textColors.primary,
    marginTop: 8,
    marginBottom: 2,
  },
  statBoxLabel: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'center',
  },
  calendarCard: {
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    ...typography.h4,
    color: textColors.primary,
  },
  todayBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayBadgeText: {
    ...typography.caption,
    color: textColors.accent,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  calendarDay: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarDayCompleted: {
    backgroundColor: '#3B82F6', // Bleu pour routine complétée
  },
  calendarDayBonus: {
    backgroundColor: '#F59E0B', // Or pour routine + bonus
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: textColors.accent,
  },
  calendarDayText: {
    ...typography.caption,
    color: textColors.accent,
    fontWeight: '700',
    fontSize: 10,
  },
  calendarLegend: {
    flexDirection: 'row',
    gap: 16,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 4,
  },
  legendDotCompleted: {
    backgroundColor: '#3B82F6',
  },
  legendDotBonus: {
    backgroundColor: '#F59E0B',
  },
  legendDotToday: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: textColors.accent,
  },
  legendText: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  achievementsCard: {
    marginBottom: 16,
  },
  achievementsTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginBottom: 16,
  },
  achievementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementName: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementProgress: {
    ...typography.caption,
    color: textColors.accent,
    fontWeight: '600',
  },
  achievementDesc: {
    ...typography.caption,
    color: textColors.tertiary,
    marginBottom: 6,
  },
  achievementProgressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  achievementProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  bottomSpacer: {
    height: 100,
  },
});
