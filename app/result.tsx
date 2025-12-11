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

  // Composant pour le bloc prix avec effet glass
  const PriceBlock = () => {
    if (!plan.priceInfo) return null;

    const content = (
      <View style={styles.priceContent}>
        <Text style={styles.priceLabel}>Tarif indicatif</Text>
        <Text style={styles.priceValue}>{plan.priceInfo}</Text>
      </View>
    );

    if (Platform.OS === 'ios') {
      return (
        <View style={styles.priceWrapper}>
          <BlurView intensity={30} tint="dark" style={styles.priceBlur}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.02)']}
              style={styles.priceGradient}
            >
              {content}
            </LinearGradient>
          </BlurView>
        </View>
      );
    }

    return (
      <View style={[styles.priceWrapper, styles.priceAndroid]}>
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
          <GlassCard opaque>
            {/* Badge recommande */}
            <View style={styles.tagContainer}>
              <Text style={styles.tag}>Programme recommande pour toi</Text>
            </View>

            {/* Titre et sous-titre */}
            <Text style={styles.planName}>{plan.name}</Text>
            <Text style={styles.planDuration}>{plan.durationLabel}</Text>

            {/* Description courte */}
            <Text style={styles.planDescription}>{plan.shortDescription}</Text>

            {/* Features avec checkmarks */}
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
    marginBottom: 24,
    lineHeight: 30,
    paddingHorizontal: 8,
  },
  tagContainer: {
    alignSelf: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  tag: {
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 6,
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
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 24,
    paddingHorizontal: 4,
  },
  priceWrapper: {
    alignSelf: 'stretch',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  priceBlur: {
    overflow: 'hidden',
  },
  priceGradient: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  priceAndroid: {
    backgroundColor: 'rgba(40, 40, 50, 0.6)',
    paddingVertical: 16,
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
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  alternativeSection: {
    marginTop: 28,
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
