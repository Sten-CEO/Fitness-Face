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

// Render price with proper formatting: bold for amount and /mois, normal for decimals
function renderPriceInfo(plan: Plan) {
  const [intPart, decPart] = plan.priceAmount.split(',');

  return (
    <View style={styles.priceContainer}>
      <View style={styles.priceMainRow}>
        <Text style={styles.priceIntPart}>{intPart}</Text>
        <Text style={styles.priceDecPart}>,{decPart} €</Text>
        <Text style={styles.priceSuffix}>{plan.priceSuffix}</Text>
      </View>
      {plan.priceDetails && (
        <Text style={styles.priceDetails}>{plan.priceDetails}</Text>
      )}
    </View>
  );
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
              Choisis celui qui correspond à tes objectifs
            </Text>
          </View>

          <View style={styles.programsList}>
            {plans.map((plan, index) => {
              const isHighlighted = highlightPlan === plan.id || plan.isMainProgram;

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
                      <Ionicons name="diamond-outline" size={32} color={textColors.accent} />
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
                          {plan.features.slice(0, 6).map((feature, idx) => (
                            <View key={idx} style={styles.featureItem}>
                              <View style={styles.featureIcon}>
                                <Ionicons name="diamond" size={10} color={textColors.accent} />
                              </View>
                              <Text style={styles.featureText}>{feature.text}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}

                    <View style={styles.separator} />

                    {/* Price section */}
                    <View style={styles.priceSection}>
                      <Text style={styles.priceLabel}>Tarif</Text>
                      {renderPriceInfo(plan)}
                      <Text style={styles.tryFreeText}>essayer gratuitement</Text>
                      {plan.engagementLabel && (
                        <Text style={styles.engagementText}>{plan.engagementLabel}</Text>
                      )}
                    </View>

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
  featureText: {
    ...typography.bodySmall,
    flex: 1,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  priceSection: {
    gap: 6,
  },
  priceLabel: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    marginBottom: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceIntPart: {
    fontSize: 24,
    fontWeight: '700',
    color: textColors.accent,
  },
  priceDecPart: {
    fontSize: 16,
    fontWeight: '400',
    color: textColors.accent,
  },
  priceSuffix: {
    fontSize: 16,
    fontWeight: '700',
    color: textColors.accent,
    marginLeft: 2,
  },
  priceDetails: {
    ...typography.caption,
    color: textColors.tertiary,
    marginTop: 2,
  },
  tryFreeText: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'right',
  },
  engagementText: {
    ...typography.caption,
    color: '#F59E0B',
    textAlign: 'right',
    fontWeight: '500',
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
