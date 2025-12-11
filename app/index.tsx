import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <BackgroundScreen>
      <View style={styles.header}>
        <Text style={styles.appName}>Fitness Face</Text>
      </View>

      <GlassCard style={styles.card}>
        <Text style={styles.title}>
          Transforme ton visage en 5 minutes par jour
        </Text>
        <Text style={styles.subtitle}>
          Programmes guidés pour jawline, double menton et visage plus net.
        </Text>

        <PrimaryButton
          title="Commencer"
          onPress={() => router.push('/auth')}
          style={styles.button}
        />

        <Text style={styles.smallText}>
          Pas de matériel. Pas de bullshit. Juste des routines guidées.
        </Text>
      </GlassCard>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  appName: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1,
  },
  card: {
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    width: '100%',
    marginBottom: 20,
  },
  smallText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
