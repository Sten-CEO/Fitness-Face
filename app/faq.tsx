import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { LayoutAnimation, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBackground from '../components/TabBackground';
import { textColors, typography } from '../theme/typography';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const faqData: FAQItem[] = [
  // Programme
  {
    id: '1',
    category: 'Programme',
    question: 'Combien de temps dure le programme ?',
    answer:
      'Le programme Jawline Définition dure 90 jours et le programme Double Menton dure 60 jours. Chaque jour, vous avez une routine d\'environ 5-10 minutes à effectuer.',
  },
  {
    id: '2',
    category: 'Programme',
    question: 'À quelle fréquence dois-je faire les exercices ?',
    answer:
      'Nous recommandons de faire votre routine tous les jours pour une meilleure régularité. Les exercices sont conçus pour être courts, prenant environ 5-10 minutes par jour.',
  },
  {
    id: '3',
    category: 'Programme',
    question: 'Combien de temps faut-il pour créer une habitude ?',
    answer:
      'La régularité est la clé. Nous recommandons de suivre le programme complet pour intégrer cette routine dans votre quotidien. Chaque personne progresse à son propre rythme.',
  },
  // Exercices
  {
    id: '4',
    category: 'Exercices',
    question: 'Les exercices sont-ils difficiles ?',
    answer:
      'Les exercices sont progressifs. Vous commencerez par des mouvements simples et la difficulté augmentera graduellement. Chaque exercice est accompagné d\'instructions détaillées et d\'images.',
  },
  {
    id: '5',
    category: 'Exercices',
    question: 'J\'ai mal après les exercices, est-ce normal ?',
    answer:
      'Une légère fatigue musculaire est normale au début. Si vous ressentez une douleur vive, arrêtez l\'exercice et consultez un professionnel de santé. Ne forcez jamais.',
  },
  {
    id: '6',
    category: 'Exercices',
    question: 'Puis-je faire les exercices à n\'importe quel moment ?',
    answer:
      'Oui, vous pouvez faire vos exercices à n\'importe quel moment de la journée. Beaucoup préfèrent le matin ou le soir comme routine. L\'essentiel est de rester régulier.',
  },
  // Abonnement
  {
    id: '7',
    category: 'Abonnement',
    question: 'Comment annuler mon abonnement ?',
    answer:
      'Pour annuler, rendez-vous dans les réglages de votre téléphone > Votre nom (Apple ID) > Abonnements. Vous y trouverez tous vos abonnements actifs et pourrez les gérer.',
  },
  {
    id: '8',
    category: 'Abonnement',
    question: 'Puis-je changer de programme ?',
    answer:
      'Oui, vous pouvez changer de programme à tout moment. Votre progression sera sauvegardée si vous décidez de revenir à votre programme précédent.',
  },
  // Technique
  {
    id: '9',
    category: 'Technique',
    question: 'L\'application fonctionne-t-elle hors ligne ?',
    answer:
      'Oui, une fois les exercices téléchargés, vous pouvez les effectuer sans connexion internet. Votre progression sera synchronisée à la prochaine connexion.',
  },
  {
    id: '10',
    category: 'Technique',
    question: 'Comment restaurer mes achats ?',
    answer:
      'Allez dans Profil > Abonnement > Restaurer les achats. Assurez-vous d\'être connecté avec le même compte Apple/Google utilisé lors de l\'achat initial.',
  },
];

const categories = ['Tous', 'Programme', 'Exercices', 'Abonnement', 'Technique'];

function AccordionItem({
  item,
  isExpanded,
  onToggle,
}: {
  item: FAQItem;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity style={styles.accordionHeader} onPress={onToggle} activeOpacity={0.7}>
        <Text style={styles.question}>{item.question}</Text>
        <Ionicons
          name={isExpanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={textColors.tertiary}
        />
      </TouchableOpacity>
      {isExpanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.answer}>{item.answer}</Text>
        </View>
      )}
    </View>
  );
}

export default function FAQScreen() {
  const router = useRouter();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('Tous');

  const toggleAccordion = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const filteredFaq =
    selectedCategory === 'Tous'
      ? faqData
      : faqData.filter((item) => item.category === selectedCategory);

  return (
    <TabBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Aide / FAQ</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Category Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryPill,
                selectedCategory === category && styles.categoryPillActive,
              ]}
              onPress={() => {
                setSelectedCategory(category);
                setExpandedId(null);
              }}
            >
              <Text
                style={[
                  styles.categoryText,
                  selectedCategory === category && styles.categoryTextActive,
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* FAQ List */}
          {filteredFaq.map((item) => (
            <AccordionItem
              key={item.id}
              item={item}
              isExpanded={expandedId === item.id}
              onToggle={() => toggleAccordion(item.id)}
            />
          ))}

          {/* Still need help */}
          <View style={styles.helpBox}>
            <Ionicons name="chatbubbles-outline" size={32} color={textColors.accent} />
            <Text style={styles.helpTitle}>Besoin d'aide supplémentaire ?</Text>
            <Text style={styles.helpText}>
              Si vous ne trouvez pas la réponse à votre question, n'hésitez pas à nous contacter
              directement.
            </Text>
            <TouchableOpacity
              style={styles.helpButton}
              onPress={() => router.push('/contact')}
            >
              <Text style={styles.helpButtonText}>Nous contacter</Text>
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
  categoryScroll: {
    flexGrow: 0,
    marginBottom: 8,
  },
  categoryContent: {
    paddingHorizontal: 24,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoryPillActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3B82F6',
  },
  categoryText: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: textColors.accent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  accordionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  question: {
    ...typography.body,
    color: textColors.primary,
    flex: 1,
    marginRight: 12,
    fontWeight: '500',
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0,
  },
  answer: {
    ...typography.body,
    color: textColors.secondary,
    lineHeight: 22,
  },
  helpBox: {
    backgroundColor: 'rgba(59, 130, 246, 0.05)',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.15)',
  },
  helpTitle: {
    ...typography.h4,
    color: textColors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  helpText: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  helpButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  helpButtonText: {
    ...typography.body,
    color: textColors.primary,
    fontWeight: '600',
  },
  bottomSpacer: {
    height: 40,
  },
});
