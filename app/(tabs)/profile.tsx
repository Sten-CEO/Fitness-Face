import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CleanCard from '../../components/CleanCard';
import TabBackground from '../../components/TabBackground';
import { useProgress } from '../../contexts/ProgressContext';
import { useUser } from '../../contexts/UserContext';
import { typography, textColors } from '../../theme/typography';

export default function ProfileScreen() {
  const router = useRouter();
  const { firstName } = useUser();
  const { selectedPlanName, completedDaysCount, streak, resetProgress } = useProgress();

  const handleLogout = () => {
    Alert.alert(
      'Deconnexion',
      'Es-tu sur de vouloir te deconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Deconnecter',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            router.replace('/');
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
