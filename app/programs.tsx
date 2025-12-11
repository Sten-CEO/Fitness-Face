import { useRouter } from 'expo-router';
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
import GlassCard from '../components/GlassCard';
import { Plan, plans } from '../data/plans';

export default function ProgramsScreen() {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSelectPlan = (plan: Plan) => {
    console.log('Programme sélectionné:', plan.name);
    // TODO: Naviguer vers le paiement / onboarding
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
            <Text style={styles.title}>Tous les programmes</Text>
            <Text style={styles.subtitle}>Fitness Face</Text>
          </View>

          {/* Liste des programmes */}
          <View style={styles.programsList}>
            {plans.map((plan, index) => (
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
                <GlassCard style={styles.programCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.tagContainer}>
                      <Text style={styles.tag}>{plan.tag}</Text>
                    </View>
                  </View>

                  <Text style={styles.planName}>{plan.name}</Text>
                  <Text style={styles.planDuration}>{plan.durationLabel}</Text>
                  <Text style={styles.planDescription}>
                    {plan.shortDescription}
                  </Text>

                  <View style={styles.badgesContainer}>
                    {plan.badges.map((badge, badgeIndex) => (
                      <View key={badgeIndex} style={styles.badge}>
                        <Text style={styles.badgeText}>{badge}</Text>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => handleSelectPlan(plan)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.selectButtonText}>
                      Choisir ce programme
                    </Text>
                  </TouchableOpacity>
                </GlassCard>
              </Animated.View>
            ))}
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 28,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  programsList: {
    gap: 16,
  },
  programCard: {
    marginBottom: 0,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tagContainer: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tag: {
    color: '#60A5FA',
    fontSize: 12,
    fontWeight: '600',
  },
  planName: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },
  planDuration: {
    color: '#9CA3AF',
    fontSize: 14,
    marginBottom: 12,
  },
  planDescription: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '500',
  },
  selectButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    paddingVertical: 14,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#60A5FA',
    fontSize: 15,
    fontWeight: '600',
  },
});
