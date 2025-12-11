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
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.appName}>Fitness Face</Text>
        </View>

        <GlassCard>
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
            Pas de matériel. Pas de bullshit.{'\n'}Juste des routines guidées.
          </Text>
        </GlassCard>
      </View>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingTop: 20,
  },
  appName: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    textAlign: 'center',
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
    marginBottom: 24,
  },
  smallText: {
    color: '#6B7280',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
