import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
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

const { width } = Dimensions.get('window');
const fontFamily = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

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

          {/* Tab slider */}
          {alternativePlan && (
            <TabSlider
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}

          {/* Carte programme */}
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
                  <Text style={styles.priceValue}>{currentPlan.priceInfo}</Text>
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
    fontFamily,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  titleBlue: {
    color: '#3B82F6',
  },
  subtitle: {
    fontFamily,
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '400',
  },
  programCard: {
    marginBottom: 24,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    marginBottom: 14,
  },
  badgeText: {
    fontFamily,
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '500',
  },
  planName: {
    fontFamily,
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  planDuration: {
    fontFamily,
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    marginBottom: 16,
    fontWeight: '400',
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
    color: '#3B82F6',
    fontSize: 10,
    fontWeight: '600',
  },
  featureText: {
    fontFamily,
    flex: 1,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontFamily,
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    fontWeight: '400',
  },
  priceValue: {
    fontFamily,
    color: '#FFFFFF',
    fontSize: 17,
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
    fontFamily,
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    fontWeight: '400',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontFamily,
    color: '#EF4444',
    fontSize: 15,
    textAlign: 'center',
    fontWeight: '400',
  },
});
