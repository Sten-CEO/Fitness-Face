import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBackground from '../components/TabBackground';
import { textColors, typography } from '../theme/typography';

interface TermsSection {
  title: string;
  content: string;
}

const termsData: TermsSection[] = [
  {
    title: '1. Présentation',
    content:
      'L\'application Jaw Prime est une application mobile dédiée au bien-être et à l\'amélioration de la routine faciale (jawline, cou, menton), à travers des exercices guidés et des conseils quotidiens.\n\nL\'application est accessible aux utilisateurs âgés de 12 ans minimum.',
  },
  {
    title: '2. Accès à l\'application',
    content:
      'L\'accès à certaines fonctionnalités de Jaw Prime est gratuit.\n\nL\'accès complet aux programmes nécessite la souscription à un abonnement payant via les systèmes de paiement intégrés d\'Apple (App Store) ou Google (Google Play).',
  },
  {
    title: '3. Comptes utilisateurs',
    content:
      'Pour utiliser l\'application, l\'utilisateur doit créer un compte personnel.\n\nL\'utilisateur est responsable de la confidentialité de ses identifiants et de toute activité effectuée depuis son compte.',
  },
  {
    title: '4. Abonnements et paiements',
    content:
      '4.1 Types d\'abonnements\nJaw Prime propose plusieurs abonnements, avec ou sans engagement, selon le programme choisi.\n\n4.2 Paiement\nLes paiements sont effectués exclusivement via Apple App Store ou Google Play. Jaw Prime n\'a aucun accès aux données bancaires de l\'utilisateur.\n\n4.3 Résiliation\n• Les abonnements sans engagement peuvent être résiliés à tout moment depuis les réglages de votre appareil (App Store ou Google Play)\n• Les abonnements avec engagement restent dus jusqu\'à la fin de la période engagée\n\nAucune résiliation ne peut être effectuée depuis l\'application elle-même.',
  },
  {
    title: '5. Absence de conseil médical',
    content:
      'Jaw Prime est une application de bien-être.\n\n⚠️ Elle ne remplace en aucun cas un avis médical.\n⚠️ Les contenus proposés ne constituent ni un diagnostic, ni un traitement médical.\n⚠️ En cas de douleur, problème de santé ou doute, l\'utilisateur doit consulter un professionnel de santé.',
  },
  {
    title: '6. Responsabilité',
    content:
      'L\'utilisateur reconnaît utiliser l\'application sous sa seule responsabilité.\n\nJaw Prime ne saurait être tenue responsable de tout dommage résultant d\'une mauvaise utilisation de l\'application ou du non-respect des consignes.',
  },
  {
    title: '7. Propriété intellectuelle',
    content:
      'L\'ensemble des contenus (textes, exercices, images, structure, design) est la propriété exclusive de Jaw Prime.\n\nToute reproduction ou utilisation non autorisée est interdite.',
  },
  {
    title: '8. Support',
    content:
      'Pour toute question ou demande d\'assistance :\n\n📧 support@jaw-app.com',
  },
  {
    title: '9. Modification des conditions',
    content:
      'Jaw Prime se réserve le droit de modifier les présentes conditions à tout moment.\n\nL\'utilisateur sera informé en cas de modification majeure.',
  },
];

export default function TermsScreen() {
  const router = useRouter();

  return (
    <TabBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Conditions</Text>
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

          {/* Introduction */}
          <Text style={styles.intro}>
            Bienvenue sur Jaw Prime. Veuillez lire attentivement les conditions d'utilisation
            suivantes avant d'utiliser notre application.
          </Text>

          {/* Terms Sections */}
          {termsData.map((section, index) => (
            <View key={index} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionContent}>{section.content}</Text>
            </View>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              En utilisant Jaw Prime, vous reconnaissez avoir lu et accepté ces conditions
              d'utilisation.
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    ...typography.h3,
    color: textColors.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  updateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  updateText: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  intro: {
    ...typography.body,
    color: textColors.secondary,
    lineHeight: 22,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...typography.body,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionContent: {
    ...typography.body,
    color: textColors.secondary,
    lineHeight: 22,
  },
  footer: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  footerText: {
    ...typography.bodySmall,
    color: textColors.secondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
});
