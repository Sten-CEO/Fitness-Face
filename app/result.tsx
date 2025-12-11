import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
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
import { typography, textColors } from '../theme/typography';

const { width } = Dimensions.get('window');

// Parse price info to highlight amount only
function renderPriceInfo(priceInfo: string) {
  // Match patterns like "7 € / mois" or "29 €"
  const match = priceInfo.match(/^(\d+\s*€(?:\s*\/\s*mois)?)(.*)/);
  if (match) {
    return (
      <Text style={styles.priceValue}>
        <Text style={styles.priceAmount}>{match[1]}</Text>
        <Text style={styles.priceRest}>{match[2]}</Text>
      </Text>
    );
  }
  return <Text style={styles.priceValue}>{priceInfo}</Text>;
}

export default function ResultScreen() {
  const router = useRouter();
  const { firstName } = useUser();
  const { planId } = useLocalSearchParams<{ planId: PlanId }>();

  const selectedPlanId = planId || 'jawline_90';
  const mainPlan = getPlanById(selectedPlanId);
  const alternativePlan = getAlternativePlan(selectedPlanId);

  const isMonthlyPlan = selectedPlanId.includes('monthly');
  const planMain = isMonthlyPlan ? alternativePlan : mainPlan;
  const planMonthly = isMonthlyPlan ? mainPlan : alternativePlan;

  const [activeTab, setActiveTab] = useState(isMonthlyPlan ? 'monthly' : 'main');
  const [currentPlan, setCurrentPlan] = useState(mainPlan);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTabChange = (key: string) => {
    if (key === activeTab) return;

    const slideDirection = key === 'monthly' ? -1 : 1;
    const newPlan = key === 'monthly' ? planMonthly : planMain;

    Animated.timing(slideAnim, {
      toValue: slideDirection * width * 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(key);
      setCurrentPlan(newPlan);
      slideAnim.setValue(-slideDirection * width * 0.3);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSelectPlan = (selectedPlan: Plan | undefined) => {
    if (selectedPlan) {
      console.log('Programme selectionne:', selectedPlan.name);
    }
  };

  if (!mainPlan) {
    return (
      <BackgroundScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur: Programme non trouve</Text>
        </View>
      </BackgroundScreen>
    );
  }

  const is60DayProgram = selectedPlanId.includes('double');
  const tabs = [
    { key: 'main', label: is60DayProgram ? '60 jours' : '90 jours', badge: 'Conseille' },
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
          <View style={styles.header}>
            <Text style={styles.title}>
              Ton programme{'\n'}
              <Text style={styles.titleBlue}>personnalise</Text>
            </Text>
            <Text style={styles.subtitle}>
              {firstName ? `${firstName}, voici` : 'Voici'} ce qu'on te recommande
            </Text>
          </View>

          {alternativePlan && (
            <TabSlider
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}

          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            <CleanCard style={styles.programCard}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {activeTab === 'main' ? 'Recommande' : 'Flexible'}
                </Text>
              </View>

              <Text style={styles.planName}>{currentPlan?.name}</Text>
              <Text style={styles.planDuration}>{currentPlan?.durationLabel}</Text>

              <View style={styles.separator} />

              <View style={styles.featuresList}>
                {currentPlan?.features.slice(0, 4).map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Text style={styles.featureCheck}>✓</Text>
                    </View>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.separator} />

              {currentPlan?.priceInfo && (
                <View style={styles.priceSection}>
                  <Text style={styles.priceLabel}>Tarif</Text>
                  {renderPriceInfo(currentPlan.priceInfo)}
                </View>
              )}
            </CleanCard>
          </Animated.View>

          <View style={styles.ctaContainer}>
            <PrimaryButton
              title="Continuer"
              onPress={() => handleSelectPlan(currentPlan)}
            />
          </View>

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
    ...typography.h2,
    color: textColors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  titleBlue: {
    color: textColors.accent,
  },
  subtitle: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
  },
  programCard: {
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: textColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 14,
  },
  badgeText: {
    ...typography.labelSmall,
    color: textColors.primary,
    fontSize: 11,
  },
  planName: {
    ...typography.h3,
    color: textColors.primary,
    marginBottom: 4,
  },
  planDuration: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCheck: {
    color: textColors.accent,
    fontSize: 10,
    fontWeight: '600',
  },
  featureText: {
    ...typography.bodySmall,
    flex: 1,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  priceValue: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  priceAmount: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    fontWeight: '600',
  },
  priceRest: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    fontWeight: '400',
  },
  ctaContainer: {
    marginBottom: 16,
  },
  secondaryLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryLinkText: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: '#EF4444',
    textAlign: 'center',
  },
});
