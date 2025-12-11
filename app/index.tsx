import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import PrimaryButton from '../components/PrimaryButton';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <BackgroundScreen>
      <View style={styles.container}>
        {/* Contenu central - texte direct sur fond */}
        <View style={styles.centerContent}>
          {/* Titre avec mot cle en bleu */}
          <Text style={styles.title}>
            Transforme ton{'\n'}
            <Text style={styles.titleBlue}>visage</Text> en 5 min{'\n'}
            par jour
          </Text>

          {/* Sous-titre leger */}
          <Text style={styles.subtitle}>
            Programmes guides pour jawline, double menton{'\n'}et un visage plus sculpte.
          </Text>

          {/* Progress dots - onboarding */}
          <View style={styles.dotsContainer}>
            <View style={[styles.dot, styles.dotActive]} />
            <View style={styles.dot} />
            <View style={styles.dot} />
          </View>
        </View>

        {/* Footer avec boutons */}
        <View style={styles.footer}>
          <PrimaryButton
            title="Commencer"
            onPress={() => router.push('/auth')}
          />

          {/* Lien Skip */}
          <TouchableOpacity
            onPress={() => router.push('/auth')}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Passer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 46,
    letterSpacing: -0.5,
  },
  titleBlue: {
    color: '#3B82F6',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
    fontWeight: '400',
  },
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  dotActive: {
    backgroundColor: '#3B82F6',
    width: 24,
  },
  footer: {
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  skipButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 16,
    fontWeight: '500',
  },
});
