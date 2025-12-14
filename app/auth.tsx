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
import { useUser } from '../contexts/UserContext';
import { typography, textColors, fontFamily } from '../theme/typography';

type AuthMode = 'login' | 'register';

export default function AuthScreen() {
  const router = useRouter();
  const { signIn, signUp, isLoading } = useAuth();
  const { setFirstName } = useUser();

  const [mode, setMode] = useState<AuthMode>('register');
  const [firstName, setFirstNameLocal] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);

  const isLogin = mode === 'login';
  const loading = isLoading || localLoading;

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async () => {
    // Validation
    if (!isLogin && !firstName.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre prénom');
      return;
    }
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('Erreur', 'Adresse email invalide');
      return;
    }
    if (!password) {
      Alert.alert('Erreur', 'Veuillez entrer votre mot de passe');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    if (!isLogin && password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    setLocalLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            Alert.alert('Erreur', 'Email ou mot de passe incorrect');
          } else {
            Alert.alert('Erreur', error.message);
          }
        }
        // Si succès, AuthContext gère la navigation via le state
      } else {
        const { error } = await signUp(email, password);
        if (error) {
          if (error.message.includes('already registered')) {
            Alert.alert('Erreur', 'Un compte existe déjà avec cette adresse email');
          } else {
            Alert.alert('Erreur', error.message);
          }
        } else {
          // Sauvegarder le prénom
          setFirstName(firstName.trim());
          Alert.alert(
            'Compte créé',
            'Vérifiez votre email pour confirmer votre compte, puis connectez-vous.',
            [{ text: 'OK', onPress: () => setMode('login') }]
          );
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
    } finally {
      setLocalLoading(false);
    }
  };

  const handleForgotPassword = () => {
    router.push('/forgot-password');
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
                {isLogin ? 'Connexion' : 'Créer un'}
                {'\n'}
                <Text style={styles.titleBlue}>{isLogin ? 'à ton compte' : 'compte'}</Text>
              </Text>
              <Text style={styles.subtitle}>
                {isLogin
                  ? 'Connecte-toi pour reprendre ta progression.'
                  : 'Sauvegarde ta progression dans le cloud.'}
              </Text>
            </View>

            {/* Mode Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, isLogin && styles.toggleButtonActive]}
                onPress={() => setMode('login')}
              >
                <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
                  Connexion
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, !isLogin && styles.toggleButtonActive]}
                onPress={() => setMode('register')}
              >
                <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
                  Inscription
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Prénom - uniquement pour l'inscription */}
              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Prénom</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="person-outline"
                      size={20}
                      color={textColors.tertiary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Ton prénom"
                      placeholderTextColor="rgba(255, 255, 255, 0.35)"
                      value={firstName}
                      onChangeText={setFirstNameLocal}
                      autoCapitalize="words"
                      autoComplete="given-name"
                      editable={!loading}
                    />
                  </View>
                </View>
              )}

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
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Mot de passe</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={textColors.tertiary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, styles.inputWithButton]}
                    placeholder="••••••••"
                    placeholderTextColor="rgba(255, 255, 255, 0.35)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                      size={20}
                      color={textColors.tertiary}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {!isLogin && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Confirmer le mot de passe</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={textColors.tertiary}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255, 255, 255, 0.35)"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showPassword}
                      autoComplete="new-password"
                      editable={!loading}
                    />
                  </View>
                </View>
              )}

              {isLogin && (
                <TouchableOpacity
                  style={styles.forgotButton}
                  onPress={handleForgotPassword}
                  disabled={loading}
                >
                  <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Submit Button */}
            <View style={styles.buttonContainer}>
              {loading ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator color={textColors.primary} />
                  <Text style={styles.loadingText}>
                    {isLogin ? 'Connexion...' : 'Création du compte...'}
                  </Text>
                </View>
              ) : (
                <PrimaryButton
                  title={isLogin ? 'Se connecter' : "S'inscrire"}
                  onPress={handleSubmit}
                />
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
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.h2,
    color: textColors.primary,
    marginBottom: 12,
  },
  titleBlue: {
    color: textColors.accent,
  },
  subtitle: {
    ...typography.body,
    color: textColors.secondary,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 24,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  toggleText: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    fontWeight: '500',
  },
  toggleTextActive: {
    color: textColors.primary,
    fontWeight: '600',
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
  inputWithButton: {
    paddingRight: 44,
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    padding: 4,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
    marginTop: 4,
  },
  forgotText: {
    ...typography.caption,
    color: textColors.accent,
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
});
