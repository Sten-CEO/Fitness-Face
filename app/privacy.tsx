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
    title: '1. Introduction',
    content:
      'Fitness Face (ci-après "nous", "notre" ou "l\'Application") s\'engage à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons, stockons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD) et aux lois applicables.',
  },
  {
    title: '2. Responsable du traitement',
    content:
      'Le responsable du traitement de vos données personnelles est Fitness Face. Pour toute question concernant vos données, contactez-nous à : privacy@fitness-face.app',
  },
  {
    title: '3. Données collectées',
    content:
      'Nous collectons les données suivantes :\n\n• Données d\'identification : adresse email, prénom (optionnel)\n• Données de progression : jours complétés, exercices effectués, streak, trophées obtenus\n• Données techniques : type d\'appareil, système d\'exploitation, identifiants anonymes\n• Données d\'abonnement : statut d\'abonnement, date de souscription (les paiements sont gérés par Apple/Google)',
  },
  {
    title: '4. Finalités du traitement',
    content:
      'Vos données sont utilisées pour :\n\n• Fournir le service : suivi de votre progression, synchronisation entre appareils\n• Améliorer l\'application : analyses statistiques anonymisées\n• Communication : notifications de rappel (avec votre consentement)\n• Support client : répondre à vos demandes',
  },
  {
    title: '5. Base légale',
    content:
      'Le traitement de vos données repose sur :\n\n• L\'exécution du contrat : pour fournir nos services\n• Votre consentement : pour les notifications et communications marketing\n• Nos intérêts légitimes : pour améliorer notre service et assurer sa sécurité',
  },
  {
    title: '6. Partage des données',
    content:
      'Nous ne vendons jamais vos données personnelles. Vos données peuvent être partagées avec :\n\n• Supabase : hébergement sécurisé de vos données (serveurs UE)\n• Apple/Google : pour la gestion des abonnements\n\nCes partenaires sont soumis à des obligations de confidentialité strictes.',
  },
  {
    title: '7. Durée de conservation',
    content:
      'Vos données sont conservées :\n\n• Compte actif : tant que votre compte est actif\n• Après suppression : vos données sont effacées sous 30 jours\n• Données de facturation : conservées selon les obligations légales (généralement 10 ans)',
  },
  {
    title: '8. Vos droits (RGPD)',
    content:
      'Vous disposez des droits suivants :\n\n• Droit d\'accès : obtenir une copie de vos données\n• Droit de rectification : corriger vos données inexactes\n• Droit à l\'effacement : supprimer votre compte et vos données\n• Droit à la portabilité : recevoir vos données dans un format lisible\n• Droit d\'opposition : vous opposer à certains traitements\n• Droit de retrait du consentement : retirer votre consentement à tout moment\n\nPour exercer ces droits, rendez-vous dans Profil > Gérer mes données ou contactez-nous à privacy@fitness-face.app',
  },
  {
    title: '9. Sécurité des données',
    content:
      'Nous mettons en œuvre des mesures de sécurité appropriées :\n\n• Chiffrement des données en transit (TLS/SSL)\n• Chiffrement des données au repos\n• Authentification sécurisée\n• Accès restreint aux données personnelles\n• Audits de sécurité réguliers',
  },
  {
    title: '10. Transferts internationaux',
    content:
      'Vos données sont hébergées sur des serveurs situés dans l\'Union Européenne. En cas de transfert hors UE, nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, décision d\'adéquation).',
  },
  {
    title: '11. Cookies et traceurs',
    content:
      'L\'application n\'utilise pas de cookies. Nous utilisons uniquement le stockage local de votre appareil pour sauvegarder vos préférences et permettre une utilisation hors ligne.',
  },
  {
    title: '12. Mineurs',
    content:
      'L\'application n\'est pas destinée aux personnes de moins de 16 ans. Nous ne collectons pas sciemment de données concernant les mineurs. Si vous êtes parent et pensez que votre enfant nous a fourni des données, contactez-nous.',
  },
  {
    title: '13. Modifications',
    content:
      'Cette politique peut être mise à jour. En cas de modification substantielle, nous vous en informerons via l\'application. La date de dernière mise à jour est indiquée en haut de cette page.',
  },
  {
    title: '14. Contact et réclamations',
    content:
      'Pour toute question ou réclamation :\n\n• Email : privacy@fitness-face.app\n• Délégué à la protection des données : dpo@fitness-face.app\n\nVous pouvez également introduire une réclamation auprès de la CNIL (Commission Nationale de l\'Informatique et des Libertés) : www.cnil.fr',
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
            <Text style={styles.updateText}>Dernière mise à jour : 15 décembre 2024</Text>
          </View>

          {/* Intro */}
          <View style={styles.introCard}>
            <Ionicons name="shield-checkmark-outline" size={32} color={textColors.accent} />
            <Text style={styles.introTitle}>Politique de confidentialité</Text>
            <Text style={styles.introText}>
              Votre vie privée est importante pour nous. Cette politique explique comment nous
              protégeons vos données personnelles conformément au RGPD.
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
