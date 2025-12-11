import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import GlassButton from '../components/GlassButton';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <BackgroundScreen>
      <View style={styles.container}>
        {/* Header avec nom de l'app - style label discret */}
        <View style={styles.header}>
          <Text style={styles.appName}>FITNESS FACE</Text>
        </View>

        {/* Contenu central - directement sur le fond glass */}
        <View style={styles.centerContent}>
          <Text style={styles.title}>
            Transforme ton visage{'\n'}en 5 minutes par jour
          </Text>

          <Text style={styles.subtitle}>
            Programmes guides pour jawline,{'\n'}double menton et visage plus net.
          </Text>

          <View style={styles.buttonContainer}>
            <GlassButton
              label="Commencer"
              onPress={() => router.push('/auth')}
            />
          </View>
        </View>

        {/* Footer - phrase d'accroche */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Pas de materiel. Pas de bullshit.{'\n'}Juste des routines guidees.
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
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  appName: {
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 4,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 42,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.65)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 26,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  footer: {
    paddingBottom: 48,
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.35)',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
});
