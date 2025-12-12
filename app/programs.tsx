import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
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
import { Plan, plans } from '../data/plans';
import { typography, textColors } from '../theme/typography';

// Additional benefits to show on all plans
const additionalBenefits = [
  'Guide vidéo',
  'Suivi journalier des progrès',
  'Conseils journaliers',
];

// Get icon based on plan type
function getPlanIconName(planId: string): keyof typeof Ionicons.glyphMap {
  if (planId.includes('jawline')) {
    return 'fitness-outline';
  } else if (planId.includes('double')) {
    return 'body-outline';
  } else {
    return 'star-outline';
  }
}

// Parse price info to highlight amount only
function renderPriceInfo(priceInfo: string) {
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

export default function ProgramsScreen() {
  const router = useRouter();
  const { highlightPlan } = useLocalSearchParams<{ highlightPlan?: string }>();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    router.push({
      pathname: '/result',
      params: { planId: plan.id },
    });
  };

  return (
    <BackgroundScreen centered={false}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backButtonText}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              Tous les{'\n'}
              <Text style={styles.titleBlue}>programmes</Text>
            </Text>
            <Text style={styles.subtitle}>
              Choisis celui qui correspond a tes objectifs
            </Text>
          </View>

          <View style={styles.programsList}>
            {plans.map((plan, index) => {
              const isHighlighted = highlightPlan === plan.id || plan.isMainProgram;
              const planIconName = getPlanIconName(plan.id);

              return (
                <Animated.View
                  key={plan.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20 + index * 8, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <CleanCard style={styles.programCard}>
                    {/* Card header with badge and icon */}
                    <View style={styles.cardHeader}>
                      <View style={[
                        styles.badge,
                        isHighlighted && styles.badgeHighlight
                      ]}>
                        <Text style={styles.badgeText}>{plan.tag}</Text>
                      </View>
                      <Ionicons name={planIconName} size={32} color={textColors.accent} />
                    </View>

                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDuration}>{plan.durationLabel}</Text>

                    <Text style={styles.planDescription}>
                      {plan.shortDescription}
                    </Text>

                    {isHighlighted && plan.features.length > 0 && (
                      <>
                        <View style={styles.separator} />
                        <View style={styles.featuresList}>
                          {plan.features.slice(0, 3).map((feature, idx) => (
                            <View key={idx} style={styles.featureItem}>
                              <View style={styles.featureIcon}>
                                <Text style={styles.featureCheck}>✓</Text>
                              </View>
                              <Text style={styles.featureText}>{feature.text}</Text>
                            </View>
                          ))}
                          {additionalBenefits.map((benefit, idx) => (
                            <View key={`extra-${idx}`} style={styles.featureItem}>
                              <View style={styles.featureIcon}>
                                <Text style={styles.featureCheck}>✓</Text>
                              </View>
                              <Text style={styles.featureText}>{benefit}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}

                    {plan.priceInfo && (
                      <>
                        <View style={styles.separator} />
                        <View style={styles.priceSection}>
                          <View style={styles.priceRow}>
                            <Text style={styles.priceLabel}>Tarif</Text>
                            {renderPriceInfo(plan.priceInfo)}
                          </View>
                          <Text style={styles.tryFreeText}>essayer gratuitement</Text>
                        </View>
                      </>
                    )}

                    <View style={styles.buttonContainer}>
                      <PrimaryButton
                        title="Choisir"
                        onPress={() => handleSelectPlan(plan)}
                      />
                      <Text style={styles.trialDisclaimer}>essai gratuit sans engagement</Text>
                    </View>
                  </CleanCard>
                </Animated.View>
              );
            })}
          </View>
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
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
    paddingVertical: 8,
  },
  backButtonText: {
    ...typography.body,
    color: textColors.tertiary,
  },
  title: {
    ...typography.h2,
    color: textColors.primary,
    marginBottom: 12,
  },
  titleBlue: {
    color: textColors.accent,
  },
  subtitle: {
    ...typography.body,
    color: textColors.secondary,
  },
  programsList: {
    gap: 20,
  },
  programCard: {},
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeHighlight: {
    backgroundColor: textColors.accent,
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
    marginBottom: 12,
  },
  planDescription: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
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
    gap: 8,
  },
  priceRow: {
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
  tryFreeText: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'right',
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  trialDisclaimer: {
    ...typography.caption,
    color: textColors.tertiary,
    marginTop: 10,
  },
});
