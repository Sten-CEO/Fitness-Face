import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
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
import PrimaryButton from '../components/PrimaryButton';
import TabSlider from '../components/TabSlider';
import { useUser } from '../contexts/UserContext';
import {
  getAlternativePlan,
  getPlanById,
  Plan,
  PlanId,
} from '../data/plans';

export default function ResultScreen() {
  const router = useRouter();
  const { firstName } = useUser();
  const { planId } = useLocalSearchParams<{ planId: PlanId }>();

  const selectedPlanId = planId || 'jawline_90';
  const plan = getPlanById(selectedPlanId);
  const alternativePlan = getAlternativePlan(selectedPlanId);

  // Tab state: '90_days' ou 'monthly'
  const isMonthlyPlan = selectedPlanId.includes('monthly');
  const [activeTab, setActiveTab] = useState(isMonthlyPlan ? 'monthly' : '90_days');

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Changer de plan selon l'onglet
  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'monthly' && alternativePlan) {
      router.replace({
        pathname: '/result',
        params: { planId: alternativePlan.id },
      });
    } else if (key === '90_days' && plan?.alternativeId) {
      // Revenir au plan principal
      const mainPlanId = selectedPlanId.replace('_monthly', '_90');
      router.replace({
        pathname: '/result',
        params: { planId: mainPlanId },
      });
    }
  };

  const handleSelectPlan = (selectedPlan: Plan) => {
    console.log('Programme selectionne:', selectedPlan.name);
    // TODO: Naviguer vers le paiement
  };

  if (!plan) {
    return (
      <BackgroundScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur: Programme non trouve</Text>
        </View>
      </BackgroundScreen>
    );
  }

  const tabs = [
    { key: '90_days', label: '90 jours', badge: 'Conseille' },
    { key: 'monthly', label: 'Mensuel' },
  ];

  return (
    <BackgroundScreen centered={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Ton programme{'\n'}
              <Text style={styles.titleBlue}>personnalise</Text>
            </Text>
            <Text style={styles.subtitle}>
              {firstName ? `${firstName}, voici` : 'Voici'} ce qu'on te recommande
            </Text>
          </View>

          {/* Tab slider Premium/Monthly */}
          {alternativePlan && (
            <TabSlider
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}

          {/* Carte programme */}
          <CleanCard style={styles.programCard}>
            {/* Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Recommande</Text>
            </View>

            {/* Nom du programme */}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDuration}>{plan.durationLabel}</Text>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Features list */}
            <View style={styles.featuresList}>
              {plan.features.slice(0, 4).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureIcon}>
                    <Text style={styles.featureCheck}>✓</Text>
                  </View>
                  <Text style={styles.featureText}>{feature.text}</Text>
                </View>
              ))}
            </View>

            {/* Separator */}
            <View style={styles.separator} />

            {/* Prix */}
            {plan.priceInfo && (
              <View style={styles.priceSection}>
                <Text style={styles.priceLabel}>Tarif</Text>
                <Text style={styles.priceValue}>{plan.priceInfo}</Text>
              </View>
            )}
          </CleanCard>

          {/* Bouton CTA */}
          <View style={styles.ctaContainer}>
            <PrimaryButton
              title="Continuer"
              onPress={() => handleSelectPlan(plan)}
            />
          </View>

          {/* Lien secondaire */}
          <TouchableOpacity
            onPress={() => router.push('/programs')}
            style={styles.secondaryLink}
          >
            <Text style={styles.secondaryLinkText}>
              Voir tous les programmes
            </Text>
          </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  titleBlue: {
    color: '#3B82F6',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
  },
  programCard: {
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  planDuration: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  featuresList: {
    gap: 14,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCheck: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 15,
    lineHeight: 22,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  ctaContainer: {
    marginBottom: 16,
  },
  secondaryLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryLinkText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 15,
    fontWeight: '500',
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
