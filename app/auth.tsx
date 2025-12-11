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
import CleanCard from '../components/CleanCard';
import PrimaryButton from '../components/PrimaryButton';
import { useUser } from '../contexts/UserContext';

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
            <CleanCard>
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
            </CleanCard>

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
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  titleBlue: {
    color: '#4F46E5',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 16,
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
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 15,
    fontWeight: '500',
  },
});
