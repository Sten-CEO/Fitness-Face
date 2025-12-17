import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBackground from '../components/TabBackground';
import { textColors, typography } from '../theme/typography';

const SUPPORT_EMAIL = 'support@jaw-app.com';

export default function ContactScreen() {
  const router = useRouter();

  const handleEmailPress = async () => {
    const subject = encodeURIComponent('Support Fitness Face');
    const body = encodeURIComponent(
      '\n\n---\nAppareil: \nVersion app: 1.0.0\n'
    );
    const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        Alert.alert(
          'Email non disponible',
          `Vous pouvez nous écrire directement à ${SUPPORT_EMAIL}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert(
        'Erreur',
        `Impossible d'ouvrir l'application mail. Écrivez-nous à ${SUPPORT_EMAIL}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <TabBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Nous contacter</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.heroSection}>
            <View style={styles.heroIconContainer}>
              <Ionicons name="chatbubbles-outline" size={40} color={textColors.accent} />
            </View>
            <Text style={styles.heroTitle}>Comment pouvons-nous vous aider ?</Text>
            <Text style={styles.heroText}>
              Notre équipe est là pour répondre à toutes vos questions. Choisissez le moyen de
              contact qui vous convient le mieux.
            </Text>
          </View>

          {/* Contact Options */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Options de contact</Text>

            {/* Email */}
            <TouchableOpacity style={styles.contactCard} onPress={handleEmailPress}>
              <View style={[styles.contactIconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.15)' }]}>
                <Ionicons name="mail-outline" size={24} color="#3B82F6" />
              </View>
              <View style={styles.contactContent}>
                <Text style={styles.contactTitle}>Email</Text>
                <Text style={styles.contactValue}>{SUPPORT_EMAIL}</Text>
                <Text style={styles.contactDescription}>
                  Réponse sous 24-48h en jours ouvrés
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={textColors.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Response Time */}
          <View style={styles.infoCard}>
            <Ionicons name="time-outline" size={24} color={textColors.accent} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Temps de réponse</Text>
              <Text style={styles.infoText}>
                Notre équipe répond généralement dans les 24 à 48 heures ouvrées.
              </Text>
            </View>
          </View>

          {/* FAQ Link */}
          <TouchableOpacity style={styles.faqLink} onPress={() => router.push('/faq')}>
            <Ionicons name="help-circle-outline" size={20} color={textColors.accent} />
            <Text style={styles.faqLinkText}>Consultez d'abord notre FAQ</Text>
            <Ionicons name="arrow-forward" size={16} color={textColors.accent} />
          </TouchableOpacity>

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
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  heroIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    ...typography.h3,
    color: textColors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroText: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
    lineHeight: 22,
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
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  contactContent: {
    flex: 1,
  },
  contactTitle: {
    ...typography.body,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  contactValue: {
    ...typography.bodySmall,
    color: textColors.accent,
    marginBottom: 4,
  },
  contactDescription: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  infoContent: {
    flex: 1,
    marginLeft: 14,
  },
  infoTitle: {
    ...typography.body,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoText: {
    ...typography.bodySmall,
    color: textColors.secondary,
    lineHeight: 20,
  },
  faqLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  faqLinkText: {
    ...typography.body,
    color: textColors.accent,
    fontWeight: '500',
  },
  bottomSpacer: {
    height: 40,
  },
});
