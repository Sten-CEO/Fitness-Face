import { useRouter } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import PrimaryButton from '../components/PrimaryButton';

const fontFamily = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

export default function HomeScreen() {
  const router = useRouter();

  return (
    <BackgroundScreen centered={false}>
      <View style={styles.container}>
        {/* Spacer pour pousser le contenu vers le bas */}
        <View style={styles.spacer} />

        {/* Contenu principal - aligne a gauche */}
        <View style={styles.content}>
          {/* Titre avec mot cle en bleu */}
          <Text style={styles.title}>
            Transforme ton{'\n'}
            <Text style={styles.titleBlue}>visage</Text> en 5 min{'\n'}
            par jour.
          </Text>

          {/* Sous-titre */}
          <Text style={styles.subtitle}>
            Programmes guides pour jawline, double menton et un visage plus sculpte.
          </Text>

          {/* Bouton */}
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
    fontFamily,
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '600',
    textAlign: 'left',
    marginBottom: 16,
    lineHeight: 40,
    letterSpacing: -0.3,
  },
  titleBlue: {
    color: '#3B82F6',
  },
  subtitle: {
    fontFamily,
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 15,
    textAlign: 'left',
    marginBottom: 32,
    lineHeight: 22,
    fontWeight: '400',
  },
});
