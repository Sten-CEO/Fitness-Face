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
import { LinearGradient } from 'expo-linear-gradient';

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

  // Input avec effet glass
  const GlassInput = ({
    label,
    placeholder,
    value,
    onChangeText,
    secureTextEntry = false,
    keyboardType = 'default' as const,
    autoCapitalize = 'none' as const,
  }: {
    label: string;
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: 'default' | 'email-address';
    autoCapitalize?: 'none' | 'words';
  }) => (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <LinearGradient
          colors={[
            'rgba(255, 255, 255, 0.08)',
            'rgba(255, 255, 255, 0.02)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="rgba(156, 163, 175, 0.6)"
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          secureTextEntry={secureTextEntry}
        />
      </View>
    </View>
  );

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
            <GlassCard glowColor="blue">
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
                <PrimaryGlassButton
                  title="Continuer"
                  onPress={handleContinue}
                />
              </View>

              <SecondaryLink
                title="Continuer sans creer de compte"
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
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 36,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 22,
    width: '100%',
  },
  label: {
    color: '#D1D5DB',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
    textAlign: 'left',
  },
  inputWrapper: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
    // Ombre subtile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  input: {
    paddingHorizontal: 18,
    paddingVertical: 18,
    color: '#FFFFFF',
    fontSize: 16,
    width: '100%',
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 12,
    width: '100%',
  },
});
