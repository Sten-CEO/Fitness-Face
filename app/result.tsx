import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import BackgroundScreen from '../components/BackgroundScreen';
import FeatureItem from '../components/FeatureItem';
import GlassCard from '../components/GlassCard';
import PrimaryGlassButton from '../components/PrimaryGlassButton';
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
      return `Voici le programme qu'on te recommande${name} pour sculpter ta machoire.`;
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
    console.log('Programme selectionne:', selectedPlan.name);
    // TODO: Naviguer vers le paiement / onboarding
  };

  // Navigation vers la version mensuelle du programme
  const handleMonthlyVersionPress = () => {
    if (alternativePlan) {
      router.push({
        pathname: '/programs',
        params: { highlightPlan: alternativePlan.id },
      });
    }
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

  // Composant pour le bloc prix avec effet glass premium
  const PriceBlock = () => {
    if (!plan.priceInfo) return null;

    const glassOverlay = (
      <LinearGradient
        colors={[
          'rgba(255, 255, 255, 0.1)',
          'rgba(255, 255, 255, 0.03)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    );

    const content = (
      <View style={styles.priceContent}>
        <Text style={styles.priceLabel}>Tarif indicatif</Text>
        <Text style={styles.priceValue}>{plan.priceInfo}</Text>
      </View>
    );

    if (Platform.OS === 'ios') {
      return (
        <View style={styles.priceWrapper}>
          <BlurView intensity={35} tint="dark" style={styles.priceBlur}>
            <View style={styles.priceInner}>
              {glassOverlay}
              {content}
            </View>
          </BlurView>
        </View>
      );
    }

    return (
      <View style={[styles.priceWrapper, styles.priceAndroid]}>
        {glassOverlay}
        {content}
      </View>
    );
  };

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
          {/* Message personnalise */}
          <Text style={styles.message}>
            {getPersonalizedMessage(selectedPlanId, firstName)}
          </Text>

          {/* Carte principale - Programme recommande */}
          <GlassCard opaque glowColor="blue">
            {/* Badge recommande avec effet glass */}
            <View style={styles.tagContainer}>
              <LinearGradient
                colors={['rgba(96, 165, 250, 0.3)', 'rgba(59, 130, 246, 0.2)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.tagGradient}
              >
                <Text style={styles.tag}>Programme recommande pour toi</Text>
              </LinearGradient>
            </View>

            {/* Titre et sous-titre */}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDuration}>{plan.durationLabel}</Text>

            {/* Description courte */}
            <Text style={styles.planDescription}>{plan.shortDescription}</Text>

            {/* Features avec checkmarks glass */}
            <View style={styles.featuresContainer}>
              {plan.features.map((feature, index) => (
                <FeatureItem key={index} text={feature.text} />
              ))}
            </View>

            {/* Prix indicatif */}
            <PriceBlock />

            {/* Bouton CTA */}
            <View style={styles.buttonContainer}>
              <PrimaryGlassButton
                title="Continuer avec ce programme"
                onPress={() => handleSelectPlan(plan)}
              />
            </View>
          </GlassCard>

          {/* Alternative mensuelle - discret */}
          {alternativePlan && (
            <View style={styles.alternativeSection}>
              <Text style={styles.alternativeLabel}>
                Tu preferes payer au mois ?{' '}
              </Text>
              <TouchableOpacity onPress={handleMonthlyVersionPress}>
                <Text style={styles.alternativeLink}>
                  Decouvre la version mensuelle.
                </Text>
              </TouchableOpacity>
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
    paddingTop: 40,
    paddingBottom: 40,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 32,
    paddingHorizontal: 8,
  },
  tagContainer: {
    alignSelf: 'center',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 22,
    // Ombre subtile
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  tagGradient: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  tag: {
    color: '#93C5FD',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  planDuration: {
    color: '#9CA3AF',
    fontSize: 15,
    marginBottom: 18,
    textAlign: 'center',
  },
  planDescription: {
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 24,
    marginBottom: 28,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 28,
    paddingHorizontal: 4,
  },
  priceWrapper: {
    alignSelf: 'stretch',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 28,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    // Ombre subtile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  priceBlur: {
    overflow: 'hidden',
  },
  priceInner: {
    backgroundColor: 'rgba(30, 30, 40, 0.5)',
    paddingVertical: 18,
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  priceAndroid: {
    backgroundColor: 'rgba(30, 30, 40, 0.7)',
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  priceContent: {
    alignItems: 'center',
  },
  priceLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  alternativeSection: {
    marginTop: 32,
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  alternativeLabel: {
    color: '#6B7280',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
  alternativeLink: {
    color: '#60A5FA',
    fontSize: 14,
    textDecorationLine: 'underline',
    lineHeight: 22,
  },
  allProgramsLink: {
    marginTop: 20,
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
