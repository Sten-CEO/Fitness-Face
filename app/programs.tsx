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
import FeatureItem from '../components/FeatureItem';
import GlassCard from '../components/GlassCard';
import PrimaryGlassButton from '../components/PrimaryGlassButton';
import SecondaryGlassButton from '../components/SecondaryGlassButton';
import { Plan, plans } from '../data/plans';

export default function ProgramsScreen() {
  const router = useRouter();
  const { highlightPlan } = useLocalSearchParams<{ highlightPlan?: string }>();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    console.log('Programme selectionne:', plan.name);
    // TODO: Naviguer vers le paiement / onboarding
  };

  return (
    <BackgroundScreen centered={false}>
      <ScrollView
        ref={scrollViewRef}
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
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
            <Text style={styles.title}>Tous les programmes</Text>
            <Text style={styles.subtitle}>
              Choisis celui qui correspond le mieux a tes objectifs
            </Text>
          </View>

          {/* Liste des programmes */}
          <View style={styles.programsList}>
            {plans.map((plan, index) => {
              const isHighlighted = highlightPlan === plan.id;

              return (
                <Animated.View
                  key={plan.id}
                  style={{
                    opacity: fadeAnim,
                    transform: [
                      {
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20 + index * 10, 0],
                        }),
                      },
                    ],
                  }}
                >
                  <GlassCard opaque={plan.isMainProgram || isHighlighted}>
                    {/* Tag */}
                    <View style={styles.cardHeader}>
                      <View
                        style={[
                          styles.tagContainer,
                          plan.isMainProgram && styles.tagMain,
                        ]}
                      >
                        <Text style={[styles.tag, !plan.isMainProgram && styles.tagSecondary]}>
                          {plan.tag}
                        </Text>
                      </View>
                    </View>

                    {/* Titre et duree */}
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDuration}>{plan.durationLabel}</Text>

                    {/* Description */}
                    <Text style={styles.planDescription}>
                      {plan.shortDescription}
                    </Text>

                    {/* Features avec checkmarks pour les programmes principaux */}
                    {plan.isMainProgram && plan.features.length > 0 && (
                      <View style={styles.featuresContainer}>
                        {plan.features.slice(0, 3).map((feature, featureIndex) => (
                          <FeatureItem key={featureIndex} text={feature.text} />
                        ))}
                      </View>
                    )}

                    {/* Prix */}
                    {plan.priceInfo && (
                      <View style={styles.priceContainer}>
                        <Text style={styles.priceValue}>{plan.priceInfo}</Text>
                      </View>
                    )}

                    {/* Bouton */}
                    {plan.isMainProgram ? (
                      <PrimaryGlassButton
                        title="Choisir ce programme"
                        onPress={() => handleSelectPlan(plan)}
                      />
                    ) : (
                      <SecondaryGlassButton
                        title="Choisir ce programme"
                        onPress={() => handleSelectPlan(plan)}
                      />
                    )}
                  </GlassCard>
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
    marginBottom: 28,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 20,
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    color: '#60A5FA',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  programsList: {
    gap: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  tagContainer: {
    backgroundColor: 'rgba(107, 114, 128, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(107, 114, 128, 0.3)',
  },
  tagMain: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  tag: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tagSecondary: {
    color: '#9CA3AF',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  planDuration: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 14,
    textAlign: 'center',
  },
  planDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 18,
    textAlign: 'center',
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 18,
  },
  priceContainer: {
    alignSelf: 'stretch',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 18,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
