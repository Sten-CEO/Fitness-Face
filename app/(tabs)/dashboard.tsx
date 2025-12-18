import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CleanCard from '../../components/CleanCard';
import TabBackground from '../../components/TabBackground';
import { useProgress } from '../../contexts/ProgressContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useUser } from '../../contexts/UserContext';
import { getRoutineForPlan } from '../../data/routines';
import { getTodayTip } from '../../data/tips';
import { getActiveTrophy, getTrophyProgress } from '../../data/trophies';
import { typography, textColors } from '../../theme/typography';

export default function DashboardScreen() {
  const router = useRouter();
  const { firstName } = useUser();
  const { hasActiveAccess, isLoading: subscriptionLoading } = useSubscription();
  const {
    selectedPlanId,
    currentDay,
    totalDays,
    completedDaysCount,
    completedBonusesCount,
    streak,
    isFixedProgram,
    progressPercent,
    daysRemaining,
    hasCompletedTodayRoutine,
    completedRoutines,
    isLoading: progressLoading,
  } = useProgress();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnims = useRef([
    new Animated.Value(30),
    new Animated.Value(30),
    new Animated.Value(30),
    new Animated.Value(30),
    new Animated.Value(30),
  ]).current;

  const routine = selectedPlanId ? getRoutineForPlan(selectedPlanId) : null;
  const todayTip = getTodayTip(currentDay);

  // Rediriger vers la page d'achat si pas d'abonnement actif
  // hasActiveAccess est la source de vérité (pas selectedPlanId qui peut être en cache)
  useEffect(() => {
    if (!subscriptionLoading && !progressLoading && !hasActiveAccess) {
      router.replace('/result');
    }
  }, [hasActiveAccess, subscriptionLoading, progressLoading, router]);

  // Trophy system
  const userProgress = { completedDaysCount, streak, completedBonusesCount };
  const activeTrophy = getActiveTrophy(userProgress);
  const trophyProgress = activeTrophy ? getTrophyProgress(activeTrophy, userProgress) : 100;
  const allTrophiesUnlocked = activeTrophy === null;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();

    // Staggered animation for modules
    slideAnims.forEach((anim, index) => {
      Animated.timing(anim, {
        toValue: 0,
        duration: 400,
        delay: index * 100,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  // Afficher un loader pendant le chargement
  if (subscriptionLoading || progressLoading) {
    return (
      <TabBackground>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={textColors.accent} />
          </View>
        </SafeAreaView>
      </TabBackground>
    );
  }

  return (
    <TabBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={{ opacity: fadeAnim }}>
            {/* Header */}
            <View style={styles.header}>
              <View>
                <Text style={styles.greeting}>
                  Bonjour{firstName ? `, ${firstName}` : ''}
                </Text>
                <Text style={styles.subtitle}>
                  {hasCompletedTodayRoutine
                    ? `Jour ${currentDay} – terminé`
                    : `Jour ${currentDay} de ton programme`}
                </Text>
              </View>
              <View style={styles.streakBadge}>
                <Ionicons name="flame-outline" size={18} color="#FF6B35" />
                <Text style={styles.streakText}>{streak}</Text>
              </View>
            </View>

            {/* Module A: Routine du jour */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnims[0] }],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/routine-detail')}
              >
                <CleanCard style={styles.routineCard}>
                  <View style={styles.routineHeader}>
                    <View style={styles.routineBadge}>
                      <Text style={styles.routineBadgeText}>
                        {hasCompletedTodayRoutine ? 'Routine terminée' : 'Routine du jour'}
                      </Text>
                    </View>
                    <Ionicons
                      name={hasCompletedTodayRoutine ? 'checkmark-circle' : 'play-circle-outline'}
                      size={28}
                      color={hasCompletedTodayRoutine ? '#10B981' : textColors.accent}
                    />
                  </View>

                  <Text style={styles.routineTitle}>{routine?.name || 'Routine'}</Text>
                  <Text style={styles.routineInfo}>
                    Jour {currentDay} - {routine?.duration || '5-7 min'}
                  </Text>

                  <View style={styles.routineCta}>
                    <View style={[
                      styles.routineCtaButton,
                      hasCompletedTodayRoutine && styles.routineCtaButtonCompleted
                    ]}>
                      <Text style={styles.routineCtaText}>
                        {hasCompletedTodayRoutine ? 'Revoir' : 'Commencer'}
                      </Text>
                      <Ionicons
                        name={hasCompletedTodayRoutine ? 'refresh-outline' : 'arrow-forward'}
                        size={16}
                        color={textColors.primary}
                      />
                    </View>
                  </View>
                </CleanCard>
              </TouchableOpacity>
            </Animated.View>

            {/* Module B: Trophy / Prochain Trophée */}
            {!allTrophiesUnlocked && activeTrophy && (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnims[1] }],
                }}
              >
                <CleanCard style={styles.trophyCard}>
                  <View style={styles.trophyHeader}>
                    <View style={[styles.trophyIconContainer, { backgroundColor: `${activeTrophy.color}20` }]}>
                      <Ionicons
                        name={activeTrophy.icon as keyof typeof Ionicons.glyphMap}
                        size={22}
                        color={activeTrophy.color}
                      />
                    </View>
                    <View style={styles.trophyInfo}>
                      <Text style={styles.trophyLabel}>Prochain trophee</Text>
                      <Text style={styles.trophyTitle}>{activeTrophy.title}</Text>
                      <Text style={styles.trophyDesc}>{activeTrophy.description}</Text>
                    </View>
                  </View>
                  <View style={styles.trophyProgressBar}>
                    <View
                      style={[
                        styles.trophyProgressFill,
                        { width: `${trophyProgress}%`, backgroundColor: activeTrophy.color },
                      ]}
                    />
                  </View>
                  <Text style={styles.trophyProgressText}>
                    {Math.round(trophyProgress)}% complete
                  </Text>
                </CleanCard>
              </Animated.View>
            )}

            {/* Module C: Conseil du jour */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnims[2] }],
              }}
            >
              <CleanCard style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <Text style={styles.tipLabel}>Conseil du jour</Text>
                  <Ionicons
                    name={todayTip.icon as keyof typeof Ionicons.glyphMap}
                    size={20}
                    color={textColors.accent}
                  />
                </View>
                <Text style={styles.tipText}>{todayTip.text}</Text>
              </CleanCard>
            </Animated.View>

            {/* Module D: Suivi de progression */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnims[3] }],
              }}
            >
              <CleanCard style={styles.progressCard}>
                <Text style={styles.progressTitle}>Ta progression</Text>

                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{completedDaysCount}</Text>
                    <Text style={styles.statLabel}>
                      {isFixedProgram ? 'Jours completes' : 'Routines faites'}
                    </Text>
                  </View>
                  <View style={styles.statDivider} />
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{streak}</Text>
                    <Text style={styles.statLabel}>Jours d'affilee</Text>
                  </View>
                  {/* Afficher jours restants SEULEMENT pour programmes à durée fixe */}
                  {isFixedProgram && daysRemaining !== null && (
                    <>
                      <View style={styles.statDivider} />
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{daysRemaining}</Text>
                        <Text style={styles.statLabel}>Jours restants</Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Barre de progression SEULEMENT pour programmes à durée fixe */}
                {isFixedProgram && totalDays !== null && progressPercent !== null && (
                  <>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBarBg}>
                        <View
                          style={[styles.progressBarFill, { width: `${progressPercent}%` }]}
                        />
                      </View>
                      <Text style={styles.progressPercent}>
                        {Math.round(progressPercent)}%
                      </Text>
                    </View>

                    <Text style={styles.progressGoal}>
                      Objectif : {totalDays} jours
                    </Text>
                  </>
                )}

                {/* Message pour abonnements */}
                {!isFixedProgram && (
                  <Text style={styles.subscriptionNote}>
                    Abonnement sans limite - Continue à ton rythme !
                  </Text>
                )}
              </CleanCard>
            </Animated.View>

            {/* Module E: Routines terminées */}
            <Animated.View
              style={{
                opacity: fadeAnim,
                transform: [{ translateY: slideAnims[4] }],
              }}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => router.push('/completed-routines')}
              >
                <CleanCard style={styles.completedCard}>
                  <View style={styles.completedHeader}>
                    <View style={styles.completedIconContainer}>
                      <Ionicons name="list-outline" size={22} color={textColors.accent} />
                    </View>
                    <View style={styles.completedInfo}>
                      <Text style={styles.completedTitle}>Routines terminées</Text>
                      <Text style={styles.completedSubtitle}>
                        {completedRoutines.length} routine{completedRoutines.length > 1 ? 's' : ''} au total
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
                  </View>
                </CleanCard>
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>

          {/* Bottom spacer for tab bar */}
          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </TabBackground>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  greeting: {
    ...typography.h2,
    color: textColors.primary,
    marginBottom: 4,
  },
  subtitle: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 53, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  streakText: {
    ...typography.labelSmall,
    color: '#FF6B35',
    fontWeight: '600',
  },
  routineCard: {
    marginBottom: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  routineBadge: {
    backgroundColor: textColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  routineBadgeText: {
    ...typography.labelSmall,
    color: textColors.primary,
    fontSize: 11,
  },
  routineTitle: {
    ...typography.h3,
    color: textColors.primary,
    marginBottom: 4,
  },
  routineInfo: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    marginBottom: 16,
  },
  routineCta: {
    alignItems: 'flex-start',
  },
  routineCtaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: textColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  routineCtaButtonCompleted: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  routineCtaText: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
  },
  trophyCard: {
    marginBottom: 16,
  },
  trophyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  trophyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trophyInfo: {
    flex: 1,
  },
  trophyLabel: {
    ...typography.caption,
    color: textColors.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  trophyTitle: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  trophyDesc: {
    ...typography.caption,
    color: textColors.secondary,
  },
  trophyProgressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  trophyProgressFill: {
    height: '100%',
    borderRadius: 3,
  },
  trophyProgressText: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'right',
  },
  tipCard: {
    marginBottom: 16,
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  tipLabel: {
    ...typography.labelSmall,
    color: textColors.tertiary,
    letterSpacing: 0.5,
  },
  tipText: {
    ...typography.body,
    color: textColors.secondary,
    lineHeight: 22,
  },
  progressCard: {
    marginBottom: 16,
  },
  progressTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: textColors.accent,
    marginBottom: 4,
  },
  statLabel: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  progressBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: textColors.accent,
    borderRadius: 4,
  },
  progressPercent: {
    ...typography.bodySmall,
    color: textColors.accent,
    fontWeight: '600',
    minWidth: 40,
    textAlign: 'right',
  },
  progressGoal: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'center',
  },
  subscriptionNote: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  completedCard: {
    marginBottom: 16,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  completedIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedInfo: {
    flex: 1,
  },
  completedTitle: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  completedSubtitle: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  bottomSpacer: {
    height: 100,
  },
});
