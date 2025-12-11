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
  TextInput,
} from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import PrimaryButton from '../components/PrimaryButton';
import { useUser } from '../contexts/UserContext';

const fontFamily = Platform.select({ ios: 'System', android: 'Roboto', default: 'System' });

export default function AuthScreen() {
  const router = useRouter();
  const { setFirstName } = useUser();
  const [firstName, setFirstNameLocal] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleContinue = () => {
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
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                Cree ton{'\n'}
                <Text style={styles.titleBlue}>compte</Text>
              </Text>
              <Text style={styles.subtitle}>
                Ou connecte-toi pour reprendre ta progression.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Prenom</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ton prenom"
                  placeholderTextColor="rgba(255, 255, 255, 0.35)"
                  value={firstName}
                  onChangeText={setFirstNameLocal}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adresse e-mail (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="exemple@email.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.35)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255, 255, 255, 0.35)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonContainer}>
              <PrimaryButton
                title="Continuer"
                onPress={handleContinue}
              />
            </View>

            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipText}>
                Continuer sans compte
              </Text>
            </TouchableOpacity>
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
  header: {
    marginBottom: 32,
  },
  title: {
    fontFamily,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 12,
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  titleBlue: {
    color: '#3B82F6',
  },
  subtitle: {
    fontFamily,
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 15,
    fontWeight: '400',
  },
  formContainer: {
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontFamily,
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 8,
  },
  input: {
    fontFamily,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '400',
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipText: {
    fontFamily,
    color: 'rgba(255, 255, 255, 0.45)',
    fontSize: 14,
    fontWeight: '400',
  },
});
