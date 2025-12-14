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
    title: '1. Acceptation des conditions',
    content:
      'En téléchargeant et en utilisant l\'application Fitness Face, vous acceptez d\'être lié par les présentes conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser l\'application.',
  },
  {
    title: '2. Description du service',
    content:
      'Fitness Face est une application de fitness facial proposant des programmes d\'exercices pour tonifier et sculpter les muscles du visage. Les programmes incluent des routines quotidiennes avec des instructions visuelles et des suivis de progression.',
  },
  {
    title: '3. Utilisation du service',
    content:
      'Vous vous engagez à utiliser l\'application de manière responsable et conformément à sa destination. Les exercices proposés sont à titre informatif et ne remplacent pas un avis médical professionnel. Consultez un médecin avant de commencer tout programme d\'exercices.',
  },
  {
    title: '4. Compte utilisateur',
    content:
      'Vous êtes responsable de la confidentialité de vos informations de connexion et de toutes les activités effectuées sur votre compte. Vous devez nous informer immédiatement de toute utilisation non autorisée de votre compte.',
  },
  {
    title: '5. Abonnements et paiements',
    content:
      'Les abonnements sont gérés par l\'App Store (Apple) ou Google Play. Les prix sont affichés dans l\'application et peuvent varier selon votre pays. Les abonnements se renouvellent automatiquement sauf annulation au moins 24h avant la fin de la période en cours.',
  },
  {
    title: '6. Politique de remboursement',
    content:
      'Les remboursements sont gérés par Apple ou Google selon leurs politiques respectives. Pour toute demande de remboursement, veuillez contacter directement l\'App Store ou Google Play.',
  },
  {
    title: '7. Propriété intellectuelle',
    content:
      'Tous les contenus de l\'application (textes, images, vidéos, logos, exercices) sont la propriété de Fitness Face et protégés par les lois sur la propriété intellectuelle. Toute reproduction sans autorisation est interdite.',
  },
  {
    title: '8. Limitation de responsabilité',
    content:
      'Fitness Face ne peut être tenu responsable des résultats obtenus suite à l\'utilisation de l\'application. Les résultats peuvent varier selon les individus. En cas de douleur ou d\'inconfort, arrêtez immédiatement les exercices et consultez un professionnel de santé.',
  },
  {
    title: '9. Protection des données',
    content:
      'Vos données personnelles sont traitées conformément à notre politique de confidentialité et au RGPD. Nous ne vendons ni ne partageons vos données avec des tiers sans votre consentement explicite.',
  },
  {
    title: '10. Modifications',
    content:
      'Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prennent effet dès leur publication dans l\'application. Votre utilisation continue de l\'application après modification vaut acceptation des nouvelles conditions.',
  },
  {
    title: '11. Résiliation',
    content:
      'Nous pouvons suspendre ou résilier votre accès à l\'application en cas de violation des présentes conditions. Vous pouvez résilier votre compte à tout moment en nous contactant.',
  },
  {
    title: '12. Contact',
    content:
      'Pour toute question concernant ces conditions d\'utilisation, contactez-nous à support@fitness-face.app.',
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
            Bienvenue sur Fitness Face. Veuillez lire attentivement les conditions d'utilisation
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
              En utilisant Fitness Face, vous reconnaissez avoir lu et accepté ces conditions
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
