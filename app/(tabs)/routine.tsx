import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBackground from '../../components/TabBackground';
import { useProgress, CompletedRoutine } from '../../contexts/ProgressContext';
import { typography, textColors } from '../../theme/typography';

type FilterType = 'all' | 'week' | 'month';

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

function formatFullDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function isWithinDays(isoString: string, days: number): boolean {
  const date = new Date(isoString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}

function RoutineHistoryItem({
  routine,
  isFirst,
}: {
  routine: CompletedRoutine;
  isFirst: boolean;
}) {
  return (
    <View style={[styles.historyItem, isFirst && styles.historyItemFirst]}>
      <View style={styles.historyDayBadge}>
        <Text style={styles.historyDayText}>J{routine.dayNumber}</Text>
      </View>
      <View style={styles.historyContent}>
        <Text style={styles.historyTitle}>{routine.routineName}</Text>
        <Text style={styles.historyDate}>{formatFullDate(routine.completedAt)}</Text>
      </View>
      <View style={styles.historyStatus}>
        <Ionicons name="checkmark-circle" size={22} color="#22C55E" />
        {routine.bonusCompleted && (
          <View style={styles.bonusBadge}>
            <Ionicons name="star" size={12} color="#F59E0B" />
          </View>
        )}
      </View>
    </View>
  );
}

export default function RoutineHistoryScreen() {
  const { completedRoutines, completedDaysCount, streak, currentDay } = useProgress();
  const [filter, setFilter] = useState<FilterType>('all');

  // Filter and sort routines
  const filteredRoutines = useMemo(() => {
    let filtered = [...(completedRoutines || [])];

    if (filter === 'week') {
      filtered = filtered.filter((r) => isWithinDays(r.completedAt, 7));
    } else if (filter === 'month') {
      filtered = filtered.filter((r) => isWithinDays(r.completedAt, 30));
    }

    // Sort by day number descending (most recent first)
    return filtered.sort((a, b) => b.dayNumber - a.dayNumber);
  }, [completedRoutines, filter]);

  // Group by month for better display
  const groupedRoutines = useMemo(() => {
    const groups: Record<string, CompletedRoutine[]> = {};

    filteredRoutines.forEach((routine) => {
      const date = new Date(routine.completedAt);
      const monthKey = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(routine);
    });

    return Object.entries(groups);
  }, [filteredRoutines]);

  const bonusCount = (completedRoutines || []).filter((r) => r.bonusCompleted).length;

  return (
    <TabBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Historique</Text>
            <Text style={styles.subtitle}>Jour {currentDay} de ton programme</Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="checkmark-done-outline" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{completedDaysCount}</Text>
              <Text style={styles.statLabel}>Routines</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="flame-outline" size={20} color="#EF4444" />
              </View>
              <Text style={styles.statValue}>{streak}</Text>
              <Text style={styles.statLabel}>Streak</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconContainer, { backgroundColor: 'rgba(245, 158, 11, 0.15)' }]}>
                <Ionicons name="star-outline" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{bonusCount}</Text>
              <Text style={styles.statLabel}>Bonus</Text>
            </View>
          </View>

          {/* Filters */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterPill, filter === 'all' && styles.filterPillActive]}
              onPress={() => setFilter('all')}
            >
              <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                Tout
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterPill, filter === 'week' && styles.filterPillActive]}
              onPress={() => setFilter('week')}
            >
              <Text style={[styles.filterText, filter === 'week' && styles.filterTextActive]}>
                7 jours
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterPill, filter === 'month' && styles.filterPillActive]}
              onPress={() => setFilter('month')}
            >
              <Text style={[styles.filterText, filter === 'month' && styles.filterTextActive]}>
                30 jours
              </Text>
            </TouchableOpacity>
          </View>

          {/* History List */}
          {completedRoutines.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={48} color={textColors.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>Pas encore d'historique</Text>
              <Text style={styles.emptyText}>
                Complete ta première routine pour voir ton historique apparaître ici.
              </Text>
            </View>
          ) : filteredRoutines.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="search-outline" size={48} color={textColors.tertiary} />
              </View>
              <Text style={styles.emptyTitle}>Aucun résultat</Text>
              <Text style={styles.emptyText}>
                Aucune routine trouvée pour cette période. Essaie un autre filtre.
              </Text>
            </View>
          ) : (
            <>
              {groupedRoutines.map(([monthKey, routines]) => (
                <View key={monthKey} style={styles.monthGroup}>
                  <Text style={styles.monthTitle}>{monthKey}</Text>
                  {routines.map((routine, index) => (
                    <RoutineHistoryItem
                      key={`${routine.dayNumber}-${routine.completedAt}`}
                      routine={routine}
                      isFirst={index === 0}
                    />
                  ))}
                </View>
              ))}
            </>
          )}

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
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    ...typography.h3,
    color: textColors.primary,
    marginBottom: 2,
  },
  statLabel: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterPillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  filterText: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: textColors.accent,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginBottom: 8,
  },
  emptyText: {
    ...typography.body,
    color: textColors.tertiary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  monthGroup: {
    marginBottom: 24,
  },
  monthTitle: {
    ...typography.labelSmall,
    color: textColors.tertiary,
    textTransform: 'capitalize',
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  historyItemFirst: {
    borderColor: 'rgba(59, 130, 246, 0.2)',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
  },
  historyDayBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyDayText: {
    ...typography.labelSmall,
    color: textColors.accent,
    fontWeight: '700',
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    ...typography.body,
    color: textColors.primary,
    fontWeight: '500',
    marginBottom: 2,
  },
  historyDate: {
    ...typography.caption,
    color: textColors.tertiary,
    textTransform: 'capitalize',
  },
  historyStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bonusBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSpacer: {
    height: 100,
  },
});
