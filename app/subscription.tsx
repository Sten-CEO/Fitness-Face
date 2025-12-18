import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBackground from '../components/TabBackground';
import { useProgress } from '../contexts/ProgressContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { getPlanById } from '../data/plans';
import { textColors, typography } from '../theme/typography';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { completedDaysCount, totalDays, isFixedProgram } = useProgress();
  const {
    subscriptionInfo,
    isLoading,
    openSubscriptionManagement,
    restorePurchases,
    hasActiveAccess,
  } = useSubscription();

  const plan = subscriptionInfo.planId
    ? getPlanById(subscriptionInfo.planId)
    : null;

  const handleManageSubscription = async () => {
    await openSubscriptionManagement();
  };

  const handleRestorePurchases = async () => {
    const success = await restorePurchases();
    if (success) {
      Alert.alert('Succès', 'Vos achats ont été restaurés.');
    }
  };

  const getStatusInfo = () => {
    switch (subscriptionInfo.status) {
      case 'trial':
        return {
          label: 'Essai gratuit',
          color: '#F59E0B',
          icon: 'time-outline' as const,
          description: subscriptionInfo.trialEndDate
            ? `Expire le ${new Date(subscriptionInfo.trialEndDate).toLocaleDateString('fr-FR')}`
            : 'En cours',
        };
      case 'active':
        return {
          label: 'Actif',
          color: '#22C55E',
          icon: 'checkmark-circle' as const,
          description: subscriptionInfo.expirationDate
            ? `Renouvellement le ${new Date(subscriptionInfo.expirationDate).toLocaleDateString('fr-FR')}`
            : 'Abonnement actif',
        };
      case 'cancelled':
        return {
          label: 'Annulé',
          color: '#EF4444',
          icon: 'close-circle' as const,
          description: subscriptionInfo.expirationDate
            ? `Accès jusqu'au ${new Date(subscriptionInfo.expirationDate).toLocaleDateString('fr-FR')}`
            : 'Abonnement annulé',
        };
      case 'expired':
        return {
          label: 'Expiré',
          color: '#6B7280',
          icon: 'alert-circle' as const,
          description: 'Votre abonnement a expiré',
        };
      default:
        return {
          label: 'Aucun abonnement',
          color: '#6B7280',
          icon: 'help-circle' as const,
          description: 'Vous n\'avez pas d\'abonnement actif',
        };
    }
  };

  const statusInfo = getStatusInfo();

  if (isLoading) {
    return (
      <TabBackground>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={textColors.accent} />
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        </SafeAreaView>
      </TabBackground>
    );
  }

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
            <View
              style={[
                styles.planIconContainer,
                { backgroundColor: `${statusInfo.color}20` },
              ]}
            >
              <Ionicons name={statusInfo.icon} size={32} color={statusInfo.color} />
            </View>

            <Text style={styles.planName}>
              {plan?.name || 'Aucun programme'}
            </Text>
            <Text style={styles.planType}>
              {plan?.durationLabel || '-'}
            </Text>

            {/* Progress info for fixed programs */}
            {hasActiveAccess && isFixedProgram && totalDays && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(100, (completedDaysCount / totalDays) * 100)}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedDaysCount} / {totalDays} jours complétés
                </Text>
              </View>
            )}

            {/* Status badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: `${statusInfo.color}15` },
              ]}
            >
              <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>

            {/* Status description */}
            <Text style={styles.statusDescription}>{statusInfo.description}</Text>
          </View>

          {/* Subscription Details */}
          {hasActiveAccess && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Détails de l'abonnement</Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Programme</Text>
                <Text style={styles.detailValue}>{plan?.name || '-'}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type</Text>
                <Text style={styles.detailValue}>
                  {subscriptionInfo.isCommitted
                    ? 'Avec engagement'
                    : 'Sans engagement'}
                </Text>
              </View>

              {subscriptionInfo.startDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date de début</Text>
                  <Text style={styles.detailValue}>
                    {new Date(subscriptionInfo.startDate).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              )}

              {subscriptionInfo.status === 'trial' && subscriptionInfo.trialEndDate && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fin de l'essai</Text>
                  <Text style={styles.detailValue}>
                    {new Date(subscriptionInfo.trialEndDate).toLocaleDateString('fr-FR')}
                  </Text>
                </View>
              )}

              {isFixedProgram && totalDays && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Jours restants</Text>
                  <Text style={styles.detailValue}>
                    {Math.max(0, totalDays - completedDaysCount)}
                  </Text>
                </View>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Renouvellement auto</Text>
                <Text style={styles.detailValue}>
                  {subscriptionInfo.willRenew ? 'Oui' : 'Non'}
                </Text>
              </View>
            </View>
          )}

          {/* Trial warning */}
          {subscriptionInfo.status === 'trial' && (
            <View style={styles.trialWarning}>
              <Ionicons name="information-circle" size={20} color="#F59E0B" />
              <Text style={styles.trialWarningText}>
                Vous êtes en période d'essai gratuit.{' '}
                {subscriptionInfo.isCommitted
                  ? 'Annulez avant la fin de l\'essai pour éviter tout paiement.'
                  : 'Vous pouvez annuler à tout moment.'}
              </Text>
            </View>
          )}

          {/* Commitment warning */}
          {subscriptionInfo.status === 'active' && subscriptionInfo.isCommitted && (
            <View style={styles.commitmentWarning}>
              <Ionicons name="lock-closed" size={20} color="#EF4444" />
              <Text style={styles.commitmentWarningText}>
                Votre abonnement est avec engagement. L'annulation prendra effet
                à la fin de la période d'engagement.
              </Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleManageSubscription}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="settings-outline" size={20} color={textColors.accent} />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Gérer l'abonnement</Text>
                <Text style={styles.actionDescription}>
                  Modifier ou annuler dans les réglages de l'App Store/Play Store
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleRestorePurchases}
            >
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

          {/* Legal info */}
          <View style={styles.infoBox}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={textColors.tertiary}
            />
            <Text style={styles.infoText}>
              Votre abonnement est géré par l'App Store (iOS) ou Google Play (Android).
              Pour modifier ou annuler, rendez-vous dans les paramètres de votre compte.
              {'\n\n'}
              L'essai gratuit dure 1 jour. Le paiement sera prélevé automatiquement
              après la période d'essai, sauf si vous annulez avant.
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    ...typography.body,
    color: textColors.secondary,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  statusText: {
    ...typography.bodySmall,
    fontWeight: '600',
  },
  statusDescription: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'center',
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
  trialWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  trialWarningText: {
    ...typography.bodySmall,
    color: '#F59E0B',
    flex: 1,
    lineHeight: 20,
  },
  commitmentWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  commitmentWarningText: {
    ...typography.bodySmall,
    color: '#EF4444',
    flex: 1,
    lineHeight: 20,
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
