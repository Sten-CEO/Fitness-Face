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
import { LinearGradient } from 'expo-linear-gradient';

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
              const isMainOrHighlighted = plan.isMainProgram || isHighlighted;

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
                  <GlassCard
                    opaque={isMainOrHighlighted}
                    glowColor={isMainOrHighlighted ? 'blue' : 'none'}
                  >
                    {/* Tag avec effet glass */}
                    <View style={styles.cardHeader}>
                      <View style={[
                        styles.tagContainer,
                        isMainOrHighlighted && styles.tagMain,
                      ]}>
                        <LinearGradient
                          colors={isMainOrHighlighted
                            ? ['rgba(96, 165, 250, 0.25)', 'rgba(59, 130, 246, 0.15)']
                            : ['rgba(107, 114, 128, 0.2)', 'rgba(107, 114, 128, 0.1)']
                          }
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.tagGradient}
                        >
                          <Text style={[
                            styles.tag,
                            !isMainOrHighlighted && styles.tagSecondary
                          ]}>
                            {plan.tag}
                          </Text>
                        </LinearGradient>
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
                    {isMainOrHighlighted && plan.features.length > 0 && (
                      <View style={styles.featuresContainer}>
                        {plan.features.slice(0, 3).map((feature, featureIndex) => (
                          <FeatureItem key={featureIndex} text={feature.text} />
                        ))}
                      </View>
                    )}

                    {/* Prix */}
                    {plan.priceInfo && (
                      <View style={styles.priceContainer}>
                        <LinearGradient
                          colors={[
                            'rgba(255, 255, 255, 0.08)',
                            'rgba(255, 255, 255, 0.02)',
                          ]}
                          start={{ x: 0, y: 0 }}
                          end={{ x: 1, y: 1 }}
                          style={styles.priceGradient}
                        >
                          <Text style={styles.priceValue}>{plan.priceInfo}</Text>
                        </LinearGradient>
                      </View>
                    )}

                    {/* Bouton */}
                    {isMainOrHighlighted ? (
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
    marginBottom: 32,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 24,
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
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  programsList: {
    gap: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  tagContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    // Ombre subtile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  tagMain: {
    shadowColor: '#3B82F6',
    shadowOpacity: 0.2,
  },
  tagGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tag: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tagSecondary: {
    color: '#9CA3AF',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  planDuration: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 16,
    textAlign: 'center',
  },
  planDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  featuresContainer: {
    alignSelf: 'stretch',
    marginBottom: 20,
  },
  priceContainer: {
    alignSelf: 'stretch',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  priceGradient: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  priceValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
