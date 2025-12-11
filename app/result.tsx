import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import SecondaryLink from '../components/SecondaryLink';
import { useUser } from '../contexts/UserContext';
import {
  getAlternativePlan,
  getPlanById,
  Plan,
  PlanId,
} from '../data/plans';

function getPersonalizedMessage(planId: PlanId, firstName: string): string {
  const name = firstName ? `, ${firstName}` : '';

  switch (planId) {
    case 'jawline_90':
    case 'jawline_monthly':
      return `Voici le programme qu'on te recommande${name} pour sculpter ta mâchoire.`;
    case 'double_60':
    case 'double_monthly':
      return `Voici le programme qu'on te recommande${name} pour affiner ton cou.`;
    case 'all_in_one':
      return `Voici le programme qu'on te recommande${name} pour transformer tout ton visage.`;
    default:
      return `Voici le programme parfait pour toi${name}.`;
  }
}

export default function ResultScreen() {
  const router = useRouter();
  const { firstName } = useUser();
  const { planId } = useLocalSearchParams<{ planId: PlanId }>();

  const selectedPlanId = planId || 'all_in_one';
  const plan = getPlanById(selectedPlanId);
  const alternativePlan = getAlternativePlan(selectedPlanId);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSelectPlan = (selectedPlan: Plan) => {
    console.log('Programme sélectionné:', selectedPlan.name);
    // TODO: Naviguer vers le paiement / onboarding
  };

  if (!plan) {
    return (
      <BackgroundScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur: Programme non trouvé</Text>
        </View>
      </BackgroundScreen>
    );
  }

  return (
    <BackgroundScreen centered={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Message personnalisé */}
          <Text style={styles.message}>
            {getPersonalizedMessage(selectedPlanId, firstName)}
          </Text>

          {/* Carte principale - Programme recommandé */}
          <GlassCard>
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>Programme recommandé pour toi</Text>
            </View>

            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDuration}>{plan.durationLabel}</Text>
            <Text style={styles.planDescription}>{plan.shortDescription}</Text>

            <View style={styles.badgesContainer}>
              {plan.badges.map((badge, index) => (
                <View key={index} style={styles.badge}>
                  <Text style={styles.badgeText}>{badge}</Text>
                </View>
              ))}
            </View>

            <PrimaryButton
              title="Continuer avec ce programme"
              onPress={() => handleSelectPlan(plan)}
              style={styles.mainButton}
            />
          </GlassCard>

          {/* Alternative mensuelle */}
          {alternativePlan && (
            <View style={styles.alternativeSection}>
              <Text style={styles.alternativeLabel}>
                Tu préfères payer au mois ?{'\n'}Découvre la version mensuelle de ce programme.
              </Text>
              <GlassCard compact>
                <Text style={styles.altPlanName}>{alternativePlan.name}</Text>
                <Text style={styles.altPlanDuration}>
                  {alternativePlan.durationLabel}
                </Text>
                <Text style={styles.altPlanDescription}>
                  {alternativePlan.shortDescription}
                </Text>

                <SecondaryLink
                  title="Choisir ce programme"
                  onPress={() => handleSelectPlan(alternativePlan)}
                  style={styles.altButton}
                />
              </GlassCard>
            </View>
          )}

          {/* Lien vers tous les programmes */}
          <SecondaryLink
            title="Voir tous les programmes disponibles"
            onPress={() => router.push('/programs')}
            style={styles.allProgramsLink}
          />
        </Animated.View>
      </ScrollView>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 40,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 32,
  },
  tagContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginBottom: 20,
  },
  tag: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  planDuration: {
    color: '#9CA3AF',
    fontSize: 15,
    marginBottom: 16,
    textAlign: 'center',
  },
  planDescription: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 20,
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  mainButton: {
    marginTop: 4,
    width: '100%',
  },
  alternativeSection: {
    marginTop: 28,
    marginBottom: 20,
  },
  alternativeLabel: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  altPlanName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  altPlanDuration: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  altPlanDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 12,
    textAlign: 'center',
  },
  altButton: {
    alignSelf: 'center',
  },
  allProgramsLink: {
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    textAlign: 'center',
  },
});
