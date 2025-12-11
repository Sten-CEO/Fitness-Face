import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import PrimaryButton from '../components/PrimaryButton';
import { typography, textColors } from '../theme/typography';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <BackgroundScreen centered={false}>
      <View style={styles.container}>
        <View style={styles.spacer} />

        <View style={styles.content}>
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
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  spacer: {
    flex: 1,
  },
  content: {
    paddingBottom: 60,
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
