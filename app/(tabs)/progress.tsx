import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CleanCard from '../../components/CleanCard';
import { useProgress } from '../../contexts/ProgressContext';
import { typography, textColors } from '../../theme/typography';

export default function ProgressScreen() {
  const { completedDays, streak, totalDays, selectedPlanName } = useProgress();

  const progressPercent = (completedDays.length / totalDays) * 100;
  const daysRemaining = totalDays - completedDays.length;

  // Generate calendar-like grid for last 30 days
  const generateDaysGrid = () => {
    const today = new Date();
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayNumber = 30 - i;
      const isCompleted = completedDays.includes(dayNumber);
      days.push({ dayNumber, isCompleted, isToday: i === 0 });
    }
    return days;
  };

  const daysGrid = generateDaysGrid();

  return (
    <View style={styles.container}>
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
            <View style={styles.mainStat}>
              <Text style={styles.mainStatValue}>{Math.round(progressPercent)}%</Text>
              <Text style={styles.mainStatLabel}>Complete</Text>
            </View>

            <View style={styles.progressBarLarge}>
              <View style={[styles.progressBarFillLarge, { width: `${progressPercent}%` }]} />
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Ionicons name="checkmark-circle-outline" size={24} color={textColors.accent} />
                <Text style={styles.statBoxValue}>{completedDays.length}</Text>
                <Text style={styles.statBoxLabel}>Jours{'\n'}completes</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="flame-outline" size={24} color="#FF6B35" />
                <Text style={styles.statBoxValue}>{streak}</Text>
                <Text style={styles.statBoxLabel}>Jours{'\n'}d'affilee</Text>
              </View>
              <View style={styles.statBox}>
                <Ionicons name="flag-outline" size={24} color={textColors.tertiary} />
                <Text style={styles.statBoxValue}>{daysRemaining}</Text>
                <Text style={styles.statBoxLabel}>Jours{'\n'}restants</Text>
              </View>
            </View>
          </CleanCard>

          {/* Calendar grid */}
          <CleanCard style={styles.calendarCard}>
            <Text style={styles.calendarTitle}>30 derniers jours</Text>
            <View style={styles.calendarGrid}>
              {daysGrid.map((day, index) => (
                <View
                  key={index}
                  style={[
                    styles.calendarDay,
                    day.isCompleted && styles.calendarDayCompleted,
                    day.isToday && styles.calendarDayToday,
                  ]}
                >
                  {day.isCompleted && (
                    <Ionicons name="checkmark" size={12} color={textColors.primary} />
                  )}
                </View>
              ))}
            </View>
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotCompleted]} />
                <Text style={styles.legendText}>Complete</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, styles.legendDotToday]} />
                <Text style={styles.legendText}>Aujourd'hui</Text>
              </View>
            </View>
          </CleanCard>

          {/* Achievements preview */}
          <CleanCard style={styles.achievementsCard}>
            <Text style={styles.achievementsTitle}>Prochains objectifs</Text>

            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, completedDays.length >= 7 && styles.achievementIconUnlocked]}>
                <Ionicons
                  name="trophy-outline"
                  size={20}
                  color={completedDays.length >= 7 ? textColors.accent : 'rgba(255, 255, 255, 0.3)'}
                />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>Premiere semaine</Text>
                <Text style={styles.achievementDesc}>Complete 7 jours</Text>
              </View>
              {completedDays.length >= 7 && (
                <Ionicons name="checkmark-circle" size={20} color={textColors.accent} />
              )}
            </View>

            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, completedDays.length >= 30 && styles.achievementIconUnlocked]}>
                <Ionicons
                  name="medal-outline"
                  size={20}
                  color={completedDays.length >= 30 ? textColors.accent : 'rgba(255, 255, 255, 0.3)'}
                />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>Premier mois</Text>
                <Text style={styles.achievementDesc}>Complete 30 jours</Text>
              </View>
              {completedDays.length >= 30 && (
                <Ionicons name="checkmark-circle" size={20} color={textColors.accent} />
              )}
            </View>

            <View style={styles.achievementItem}>
              <View style={[styles.achievementIcon, streak >= 7 && styles.achievementIconUnlocked]}>
                <Ionicons
                  name="flame-outline"
                  size={20}
                  color={streak >= 7 ? '#FF6B35' : 'rgba(255, 255, 255, 0.3)'}
                />
              </View>
              <View style={styles.achievementInfo}>
                <Text style={styles.achievementName}>En feu</Text>
                <Text style={styles.achievementDesc}>7 jours d'affilee</Text>
              </View>
              {streak >= 7 && (
                <Ionicons name="checkmark-circle" size={20} color="#FF6B35" />
              )}
            </View>
          </CleanCard>

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
    marginBottom: 4,
  },
  statBoxLabel: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'center',
  },
  calendarCard: {
    marginBottom: 16,
  },
  calendarTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginBottom: 16,
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
    backgroundColor: textColors.accent,
  },
  calendarDayToday: {
    borderWidth: 2,
    borderColor: textColors.accent,
  },
  calendarLegend: {
    flexDirection: 'row',
    gap: 20,
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
    backgroundColor: textColors.accent,
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
  achievementIconUnlocked: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  achievementInfo: {
    flex: 1,
  },
  achievementName: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  achievementDesc: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  bottomSpacer: {
    height: 100,
  },
});
