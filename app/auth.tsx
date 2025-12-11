import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import GlassCard from '../components/GlassCard';
import PrimaryGlassButton from '../components/PrimaryGlassButton';
import SecondaryLink from '../components/SecondaryLink';
import { useUser } from '../contexts/UserContext';

export default function AuthScreen() {
  const router = useRouter();
  const { setFirstName } = useUser();
  const [firstName, setFirstNameLocal] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
    // Sauvegarder le prénom dans le contexte
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
              <Text style={styles.title}>Crée ton compte</Text>
              <Text style={styles.subtitle}>
                Ou connecte-toi pour reprendre ta progression.
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Prénom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ton prénom"
                  placeholderTextColor="#6B7280"
                  value={firstName}
                  onChangeText={setFirstNameLocal}
                  autoCapitalize="words"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Adresse e-mail (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="exemple@email.com"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Mot de passe (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#6B7280"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>

              <View style={styles.buttonContainer}>
                <PrimaryGlassButton
                  title="Continuer"
                  onPress={handleContinue}
                />
              </View>

              <SecondaryLink
                title="Continuer sans créer de compte"
                onPress={handleSkip}
              />
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
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'left',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#FFFFFF',
    fontSize: 16,
    width: '100%',
  },
  buttonContainer: {
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
  },
});
