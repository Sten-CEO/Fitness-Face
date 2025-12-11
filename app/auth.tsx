import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import { useUser } from '../contexts/UserContext';

export default function AuthScreen() {
  const router = useRouter();
  const { setFirstName } = useUser();
  const [firstName, setFirstNameLocal] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    // Sauvegarder le prenom dans le contexte
    if (firstName.trim()) {
      setFirstName(firstName.trim());
    }
    router.push('/welcome');
  };

  const handleSkip = () => {
    router.push('/welcome');
  };

  return (
    <BackgroundScreen centered={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            <GlassCard>
              <Text style={styles.title}>Cree ton compte</Text>
              <Text style={styles.subtitle}>
                Ou connecte-toi pour reprendre ta progression.
              </Text>

              <GlassInput
                label="Prenom"
                placeholder="Ton prenom"
                value={firstName}
                onChangeText={setFirstNameLocal}
                autoCapitalize="words"
              />

              <GlassInput
                label="Adresse e-mail (optionnel)"
                placeholder="exemple@email.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <GlassInput
                label="Mot de passe (optionnel)"
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <View style={styles.buttonContainer}>
                <GlassButton
                  label="Continuer"
                  onPress={handleContinue}
                />
              </View>

              <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                <Text style={styles.skipText}>
                  Continuer sans creer de compte
                </Text>
              </TouchableOpacity>
            </GlassCard>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.72)',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  buttonContainer: {
    marginTop: 12,
    marginBottom: 16,
    width: '100%',
  },
  skipButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
