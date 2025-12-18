import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBackground from '../components/TabBackground';
import { textColors, typography } from '../theme/typography';

interface PrivacySection {
  title: string;
  content: string;
}

const privacyData: PrivacySection[] = [
  {
    title: '1. Données collectées',
    content:
      'Jaw Prime collecte les données suivantes :\n\n• Adresse email (pour l\'authentification)\n• Données de progression (jours complétés, exercices effectués)\n• Préférences utilisateur (rappels, langue)\n\n⚠️ Aucune donnée biométrique, photo ou vidéo n\'est collectée par l\'application.',
  },
  {
    title: '2. Utilisation des données',
    content:
      'Les données collectées sont utilisées pour :\n\n• Permettre l\'accès à l\'application et la synchronisation entre appareils\n• Suivre votre progression dans le programme\n• Personnaliser votre expérience utilisateur\n• Envoyer des rappels (si activés)',
  },
  {
    title: '3. Stockage des données',
    content:
      'Les données sont stockées de manière sécurisée via Supabase, avec chiffrement en transit et au repos.\n\nLes serveurs sont situés dans l\'Union Européenne.',
  },
  {
    title: '4. Partage des données',
    content:
      'Jaw Prime ne vend ni ne partage vos données personnelles à des tiers à des fins commerciales.\n\nLes seuls partenaires techniques sont :\n• Supabase (hébergement sécurisé)\n• Apple/Google (gestion des abonnements)',
  },
  {
    title: '5. Notifications',
    content:
      'Si vous activez les rappels, nous utilisons uniquement les notifications locales de votre appareil.\n\nVous pouvez désactiver les rappels à tout moment depuis l\'application.',
  },
  {
    title: '6. Vos droits (RGPD)',
    content:
      'Conformément au RGPD, vous disposez des droits suivants :\n\n• Accès à vos données\n• Rectification de vos données\n• Suppression de votre compte\n• Portabilité de vos données\n• Opposition au traitement\n\nPour exercer vos droits, contactez-nous à support@jaw-app.com',
  },
  {
    title: '7. Âge minimum',
    content:
      'L\'application est destinée aux personnes âgées de 12 ans et plus.\n\nEn utilisant Jaw Prime, vous confirmez avoir l\'âge minimum requis ou avoir obtenu l\'accord d\'un parent/tuteur.',
  },
  {
    title: '8. Contact',
    content:
      'Pour toute question relative à vos données personnelles :\n\n📧 support@jaw-app.com',
  },
  {
    title: '9. Modifications',
    content:
      'Cette politique peut être mise à jour.\n\nEn cas de modification majeure, vous serez informé via l\'application.',
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <TabBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Confidentialité</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Last Update */}
          <View style={styles.updateBadge}>
            <Ionicons name="calendar-outline" size={14} color={textColors.tertiary} />
            <Text style={styles.updateText}>Dernière mise à jour : Décembre 2024</Text>
          </View>

          {/* Intro */}
          <View style={styles.introCard}>
            <Ionicons name="shield-checkmark-outline" size={32} color={textColors.accent} />
            <Text style={styles.introTitle}>Politique de confidentialité</Text>
            <Text style={styles.introText}>
              Jaw Prime s'engage à protéger vos données personnelles conformément au RGPD.
            </Text>
          </View>

          {/* Sections */}
          {privacyData.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}

          {/* Actions rapides */}
          <View style={styles.actionsCard}>
            <Text style={styles.actionsTitle}>Gérer vos données</Text>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/contact')}
            >
              <Ionicons name="download-outline" size={20} color={textColors.accent} />
              <Text style={styles.actionText}>Demander mes données</Text>
              <Ionicons name="chevron-forward" size={16} color={textColors.tertiary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push('/contact')}
            >
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={[styles.actionText, { color: '#EF4444' }]}>Supprimer mon compte</Text>
              <Ionicons name="chevron-forward" size={16} color={textColors.tertiary} />
            </TouchableOpacity>
          </View>

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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h4,
    color: textColors.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  updateText: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  introCard: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  introTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  introText: {
    ...typography.bodySmall,
    color: textColors.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.labelSmall,
    color: textColors.accent,
    marginBottom: 8,
    fontWeight: '600',
  },
  sectionContent: {
    ...typography.bodySmall,
    color: textColors.secondary,
    lineHeight: 22,
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  actionsTitle: {
    ...typography.labelSmall,
    color: textColors.tertiary,
    marginBottom: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 12,
  },
  actionText: {
    ...typography.body,
    color: textColors.primary,
    flex: 1,
  },
  bottomSpacer: {
    height: 40,
  },
});
