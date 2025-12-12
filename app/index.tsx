import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '../components/PrimaryButton';
import { typography, textColors } from '../theme/typography';

const firstPageBg = require('../assets/images/first-page.png');

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ImageBackground source={firstPageBg} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.spacer} />

          <View style={styles.content}>
            {/* Label Jaw */}
            <View style={styles.labelContainer}>
              <Ionicons name="diamond-outline" size={18} color="rgba(255, 255, 255, 0.9)" />
              <Text style={styles.labelText}>Jaw</Text>
            </View>

            <Text style={styles.title}>
              Transforme ton{'\n'}
              <Text style={styles.titleBlue}>visage</Text> en 5 min{'\n'}
              par jour.
            </Text>

            <Text style={styles.subtitle}>
              Programmes guides pour jawline, double menton et un visage plus sculpte.
            </Text>

            <PrimaryButton
              title="Commencer"
              onPress={() => router.push('/auth')}
            />
          </View>
        </View>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  container: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  content: {
    paddingBottom: 60,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  labelText: {
    fontSize: 17,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: 1.5,
  },
  title: {
    ...typography.h1,
    color: textColors.primary,
    textAlign: 'left',
    marginBottom: 16,
  },
  titleBlue: {
    color: textColors.accent,
  },
  subtitle: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'left',
    marginBottom: 32,
  },
});
