import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import GlassCard from '../components/GlassCard';
import PrimaryGlassButton from '../components/PrimaryGlassButton';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <BackgroundScreen>
      <View style={styles.container}>
        {/* Header avec nom de l'app */}
        <View style={styles.header}>
          <Text style={styles.appName}>Fitness Face</Text>
        </View>

        {/* Contenu central */}
        <View style={styles.centerContent}>
          <GlassCard style={styles.mainCard} glowColor="blue">
            <Text style={styles.title}>
              Transforme ton visage{'\n'}en 5 minutes par jour
            </Text>

            <Text style={styles.subtitle}>
              Programmes guides pour jawline,{'\n'}double menton et visage plus net.
            </Text>

            <View style={styles.buttonContainer}>
              <PrimaryGlassButton
                title="Commencer"
                onPress={() => router.push('/auth')}
              />
            </View>

            <Text style={styles.smallText}>
              Pas de materiel. Pas de bullshit.{'\n'}Juste des routines guidees.
            </Text>
          </GlassCard>
        </View>

        {/* Footer subtle */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Des resultats visibles en 30 jours
          </Text>
        </View>
      </View>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 32,
    alignItems: 'center',
  },
  appName: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  mainCard: {
    marginHorizontal: -4,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 38,
  },
  subtitle: {
    color: '#A0AEC0',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 26,
    paddingHorizontal: 8,
  },
  buttonContainer: {
    width: '100%',
    marginBottom: 32,
  },
  smallText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
});
