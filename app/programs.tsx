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
          {/* Header */}
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

          {/* Liste des programmes */}
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
                    {/* Badge */}
                    <View style={[
                      styles.badge,
                      isHighlighted && styles.badgeHighlight
                    ]}>
                      <Text style={styles.badgeText}>{plan.tag}</Text>
                    </View>

                    {/* Nom et duree */}
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDuration}>{plan.durationLabel}</Text>

                    {/* Description */}
                    <Text style={styles.planDescription}>
                      {plan.shortDescription}
                    </Text>

                    {/* Features pour les programmes principaux */}
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
                        </View>
                      </>
                    )}

                    {/* Prix */}
                    {plan.priceInfo && (
                      <>
                        <View style={styles.separator} />
                        <View style={styles.priceRow}>
                          <Text style={styles.priceLabel}>Tarif</Text>
                          <Text style={styles.priceValue}>{plan.priceInfo}</Text>
                        </View>
                      </>
                    )}

                    {/* Bouton */}
                    <View style={styles.buttonContainer}>
                      <PrimaryButton
                        title="Choisir"
                        onPress={() => handleSelectPlan(plan)}
                      />
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
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  titleBlue: {
    color: '#4F46E5',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  programsList: {
    gap: 20,
  },
  programCard: {
    // pas de style supplementaire
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
  },
  badgeHighlight: {
    backgroundColor: '#4F46E5',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  planDuration: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginBottom: 12,
  },
  planDescription: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 22,
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
    backgroundColor: 'rgba(79, 70, 229, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureCheck: {
    color: '#4F46E5',
    fontSize: 10,
    fontWeight: '700',
  },
  featureText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    lineHeight: 20,
  },
  priceRow: {
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
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: 20,
  },
});
