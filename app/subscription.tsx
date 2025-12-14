import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBackground from '../components/TabBackground';
import { useProgress } from '../contexts/ProgressContext';
import { textColors, typography } from '../theme/typography';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { selectedPlanName, selectedPlanId, completedDaysCount, totalDays, isFixedProgram } =
    useProgress();

  const handleManageSubscription = async () => {
    // Ouvrir les réglages d'abonnement iOS/Android
    // Sur iOS: Réglages > Apple ID > Abonnements
    // Sur Android: Play Store > Abonnements
    try {
      await Linking.openURL('https://apps.apple.com/account/subscriptions');
    } catch {
      // Fallback si le lien ne fonctionne pas
    }
  };

  const handleRestorePurchases = () => {
    // TODO: Implémenter la restauration des achats avec RevenueCat ou similaire
  };

  const getPlanInfo = () => {
    if (selectedPlanId === 'jawline_90') {
      return {
        name: 'Jawline Définition 90 jours',
        duration: '90 jours',
        type: 'Programme fixe',
        icon: 'fitness-outline' as const,
        color: '#3B82F6',
      };
    } else if (selectedPlanId === 'double_chin_60') {
      return {
        name: 'Double Menton 60 jours',
        duration: '60 jours',
        type: 'Programme fixe',
        icon: 'body-outline' as const,
        color: '#8B5CF6',
      };
    } else if (selectedPlanId === 'subscription') {
      return {
        name: 'Abonnement Complet',
        duration: 'Illimité',
        type: 'Abonnement mensuel',
        icon: 'infinite-outline' as const,
        color: '#22C55E',
      };
    }
    return {
      name: selectedPlanName || 'Aucun programme',
      duration: '-',
      type: '-',
      icon: 'help-outline' as const,
      color: textColors.tertiary,
    };
  };

  const planInfo = getPlanInfo();

  return (
    <TabBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Abonnement</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Current Plan Card */}
          <View style={styles.planCard}>
            <View style={[styles.planIconContainer, { backgroundColor: `${planInfo.color}20` }]}>
              <Ionicons name={planInfo.icon} size={32} color={planInfo.color} />
            </View>

            <Text style={styles.planName}>{planInfo.name}</Text>
            <Text style={styles.planType}>{planInfo.type}</Text>

            {/* Progress info for fixed programs */}
            {isFixedProgram && totalDays && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(100, (completedDaysCount / totalDays) * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedDaysCount} / {totalDays} jours complétés
                </Text>
              </View>
            )}

            {/* Status badge */}
            <View style={styles.statusBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
              <Text style={styles.statusText}>Actif</Text>
            </View>
          </View>

          {/* Plan Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Détails du programme</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Programme</Text>
              <Text style={styles.detailValue}>{planInfo.name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Durée</Text>
              <Text style={styles.detailValue}>{planInfo.duration}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Jours complétés</Text>
              <Text style={styles.detailValue}>{completedDaysCount}</Text>
            </View>

            {isFixedProgram && totalDays && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Jours restants</Text>
                <Text style={styles.detailValue}>{Math.max(0, totalDays - completedDaysCount)}</Text>
              </View>
            )}
          </View>

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>

            <TouchableOpacity style={styles.actionButton} onPress={handleManageSubscription}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="settings-outline" size={20} color={textColors.accent} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Gérer l'abonnement</Text>
                <Text style={styles.actionDescription}>
                  Modifier ou annuler dans les réglages
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleRestorePurchases}>
              <View style={styles.actionIconContainer}>
                <Ionicons name="refresh-outline" size={20} color={textColors.accent} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Restaurer les achats</Text>
                <Text style={styles.actionDescription}>
                  Récupérer un achat sur un nouvel appareil
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={textColors.tertiary} />
            <Text style={styles.infoText}>
              Votre abonnement est géré par l'App Store ou Google Play. Pour modifier ou annuler,
              rendez-vous dans les paramètres de votre compte.
            </Text>
          </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: textColors.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  planIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    ...typography.h3,
    color: textColors.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  planType: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 3,
  },
  progressText: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    ...typography.bodySmall,
    color: '#22C55E',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: textColors.tertiary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  detailLabel: {
    ...typography.body,
    color: textColors.secondary,
  },
  detailValue: {
    ...typography.body,
    color: textColors.primary,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    ...typography.body,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  actionDescription: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  infoText: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
