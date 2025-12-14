import { Ionicons } from '@expo/vector-icons';
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
  ActivityIndicator,
  Alert,
} from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../contexts/AuthContext';
import { typography, textColors, fontFamily } from '../theme/typography';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleReset = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Erreur', 'Adresse email invalide');
      return;
    }

    setLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        Alert.alert('Erreur', error.message);
      } else {
        setSent(true);
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (sent) {
    return (
      <BackgroundScreen centered>
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <Ionicons name="mail-outline" size={48} color={textColors.accent} />
          </View>
          <Text style={styles.successTitle}>Email envoyé !</Text>
          <Text style={styles.successText}>
            Un lien de réinitialisation a été envoyé à{'\n'}
            <Text style={styles.emailHighlight}>{email}</Text>
          </Text>
          <Text style={styles.successNote}>
            Vérifie tes spams si tu ne le vois pas dans ta boîte de réception.
          </Text>
          <TouchableOpacity style={styles.backToLogin} onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color={textColors.accent} />
            <Text style={styles.backToLoginText}>Retour à la connexion</Text>
          </TouchableOpacity>
        </View>
      </BackgroundScreen>
    );
  }

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
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color={textColors.primary} />
            </TouchableOpacity>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={32} color={textColors.accent} />
              </View>
              <Text style={styles.title}>
                Mot de passe{'\n'}
                <Text style={styles.titleBlue}>oublié ?</Text>
              </Text>
              <Text style={styles.subtitle}>
                Entre ton adresse email et nous t'enverrons un lien pour réinitialiser ton mot de
                passe.
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adresse e-mail</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={textColors.tertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="exemple@email.com"
                    placeholderTextColor="rgba(255, 255, 255, 0.35)"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoFocus
                    editable={!loading}
                  />
                </View>
              </View>
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              {loading ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator color={textColors.primary} />
                  <Text style={styles.loadingText}>Envoi en cours...</Text>
                </View>
              ) : (
                <PrimaryButton title="Envoyer le lien" onPress={handleReset} />
              )}
            </View>
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
  backButton: {
    position: 'absolute',
    top: 16,
    left: 0,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...typography.h2,
    color: textColors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  titleBlue: {
    color: textColors.accent,
  },
  subtitle: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  formContainer: {
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    ...typography.bodySmall,
    color: textColors.secondary,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  inputIcon: {
    paddingLeft: 14,
  },
  input: {
    flex: 1,
    fontFamily,
    paddingHorizontal: 12,
    paddingVertical: 14,
    color: textColors.primary,
    fontSize: 15,
    fontWeight: '400',
  },
  buttonContainer: {
    marginTop: 24,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  loadingText: {
    ...typography.body,
    color: textColors.primary,
    fontWeight: '600',
  },
  // Success state
  successContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    ...typography.h3,
    color: textColors.primary,
    marginBottom: 12,
  },
  successText: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },
  emailHighlight: {
    color: textColors.accent,
    fontWeight: '600',
  },
  successNote: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'center',
    marginTop: 16,
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  backToLoginText: {
    ...typography.body,
    color: textColors.accent,
    fontWeight: '500',
  },
});
