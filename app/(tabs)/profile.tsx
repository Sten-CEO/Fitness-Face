import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CleanCard from '../../components/CleanCard';
import TabBackground from '../../components/TabBackground';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { useUser } from '../../contexts/UserContext';
import { typography, textColors } from '../../theme/typography';

export default function ProfileScreen() {
  const router = useRouter();
  const { firstName } = useUser();
  const { isAuthenticated, user, signOut, deleteAccount } = useAuth();
  const { selectedPlanName, completedDaysCount, streak, resetProgress, isSyncing } = useProgress();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Deconnexion',
      isAuthenticated
        ? 'Es-tu sûr de vouloir te déconnecter ? Ta progression est sauvegardée dans le cloud.'
        : 'Es-tu sûr de vouloir te déconnecter ? Ta progression locale sera perdue.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            if (isAuthenticated) {
              await signOut();
            }
            await resetProgress();
            router.replace('/');
          },
        },
      ]
    );
  };

  const handleLogin = () => {
    router.push('/auth');
  };

  const handleDeleteAccount = () => {
    if (!isAuthenticated) {
      Alert.alert(
        'Compte non connecté',
        'Connecte-toi d\'abord pour supprimer ton compte.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Supprimer mon compte',
      'Es-tu sûr de vouloir supprimer ton compte ?\n\nCette action est irréversible. Toutes tes données seront définitivement supprimées :\n• Progression\n• Historique des routines\n• Trophées\n• Paramètres',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => confirmDeleteAccount(),
        },
      ]
    );
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Confirmation finale',
      'Tape "SUPPRIMER" pour confirmer la suppression définitive de ton compte.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Je confirme',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);
            const { error } = await deleteAccount();
            setIsDeleting(false);

            if (error) {
              Alert.alert('Erreur', 'Impossible de supprimer le compte. Réessaie plus tard.');
            } else {
              await resetProgress();
              Alert.alert(
                'Compte supprimé',
                'Ton compte et toutes tes données ont été supprimés.',
                [{ text: 'OK', onPress: () => router.replace('/') }]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <TabBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Profil</Text>
          </View>

          {/* User info */}
          <CleanCard style={styles.userCard}>
            <View style={styles.avatar}>
              <Ionicons name="person-outline" size={32} color={textColors.accent} />
            </View>
            <Text style={styles.userName}>{firstName || 'Utilisateur'}</Text>
            {isAuthenticated && user?.email ? (
              <View style={styles.emailContainer}>
                <Ionicons name="checkmark-circle" size={14} color="#22C55E" />
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
            ) : (
              <TouchableOpacity style={styles.connectButton} onPress={handleLogin}>
                <Ionicons name="cloud-outline" size={14} color={textColors.accent} />
                <Text style={styles.connectText}>Se connecter pour sync cloud</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.userPlan}>{selectedPlanName || 'Programme actif'}</Text>

            <View style={styles.userStats}>
              <View style={styles.userStat}>
                <Text style={styles.userStatValue}>{completedDaysCount}</Text>
                <Text style={styles.userStatLabel}>Jours</Text>
              </View>
              <View style={styles.userStatDivider} />
              <View style={styles.userStat}>
                <Text style={styles.userStatValue}>{streak}</Text>
                <Text style={styles.userStatLabel}>Streak</Text>
              </View>
            </View>
            {isSyncing && (
              <Text style={styles.syncingText}>Synchronisation...</Text>
            )}
          </CleanCard>

          {/* Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parametres</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/notifications')}>
              <View style={styles.menuIcon}>
                <Ionicons name="notifications-outline" size={20} color={textColors.accent} />
              </View>
              <Text style={styles.menuText}>Notifications</Text>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/subscription')}>
              <View style={styles.menuIcon}>
                <Ionicons name="card-outline" size={20} color={textColors.accent} />
              </View>
              <Text style={styles.menuText}>Abonnement</Text>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Support</Text>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/faq')}>
              <View style={styles.menuIcon}>
                <Ionicons name="help-circle-outline" size={20} color={textColors.accent} />
              </View>
              <Text style={styles.menuText}>Aide / FAQ</Text>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/contact')}>
              <View style={styles.menuIcon}>
                <Ionicons name="chatbubble-outline" size={20} color={textColors.accent} />
              </View>
              <Text style={styles.menuText}>Nous contacter</Text>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/terms')}>
              <View style={styles.menuIcon}>
                <Ionicons name="document-text-outline" size={20} color={textColors.accent} />
              </View>
              <Text style={styles.menuText}>Conditions d'utilisation</Text>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/privacy')}>
              <View style={styles.menuIcon}>
                <Ionicons name="shield-checkmark-outline" size={20} color={textColors.accent} />
              </View>
              <Text style={styles.menuText}>Politique de confidentialité</Text>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Zone de danger</Text>

            <TouchableOpacity
              style={[styles.menuItem, styles.dangerItem]}
              onPress={handleDeleteAccount}
              disabled={isDeleting}
            >
              <View style={[styles.menuIcon, styles.dangerIcon]}>
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                )}
              </View>
              <Text style={[styles.menuText, styles.dangerText]}>
                {isDeleting ? 'Suppression...' : 'Supprimer mon compte'}
              </Text>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Logout */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Se deconnecter</Text>
          </TouchableOpacity>

          <Text style={styles.version}>Version 1.0.0</Text>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </SafeAreaView>
    </TabBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...typography.h2,
    color: textColors.primary,
  },
  userCard: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  userName: {
    ...typography.h3,
    color: textColors.primary,
    marginBottom: 4,
  },
  emailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  userEmail: {
    ...typography.caption,
    color: '#22C55E',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    marginBottom: 4,
  },
  connectText: {
    ...typography.caption,
    color: textColors.accent,
  },
  syncingText: {
    ...typography.caption,
    color: textColors.tertiary,
    marginTop: 8,
  },
  userPlan: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    marginBottom: 20,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
  },
  userStat: {
    alignItems: 'center',
  },
  userStatValue: {
    ...typography.h3,
    color: textColors.accent,
  },
  userStatLabel: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  userStatDivider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: textColors.tertiary,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: {
    ...typography.body,
    color: textColors.primary,
    flex: 1,
  },
  dangerItem: {
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  dangerIcon: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  dangerText: {
    color: '#EF4444',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginBottom: 24,
  },
  logoutText: {
    ...typography.body,
    color: '#EF4444',
  },
  version: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'center',
    marginBottom: 16,
  },
  bottomSpacer: {
    height: 100,
  },
});
