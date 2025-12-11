import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import PrimaryButton from '../components/PrimaryButton';
import {
  addScores,
  calculateRecommendedPlan,
  createInitialScores,
  questions,
  ScoreBuckets,
} from '../data/questions';
import { typography, textColors, fontFamily } from '../theme/typography';

const { width } = Dimensions.get('window');

export default function QuestionnaireScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [scores, setScores] = useState<ScoreBuckets>(createInitialScores());

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex + 1) / questions.length;

  const animateTransition = (direction: 'next' | 'back', callback: () => void) => {
    const toValue = direction === 'next' ? -width : width;

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      callback();
      slideAnim.setValue(direction === 'next' ? width : -width);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const optionScores = currentQuestion.options[selectedOption].scores;
    const newScores = addScores(scores, optionScores);

    if (currentIndex < questions.length - 1) {
      animateTransition('next', () => {
        setScores(newScores);
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
      });
    } else {
      const recommendedPlan = calculateRecommendedPlan(newScores);
      router.push({
        pathname: '/processing',
        params: { planId: recommendedPlan },
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      animateTransition('back', () => {
        setCurrentIndex(currentIndex - 1);
        setSelectedOption(null);
      });
    }
  };

  return (
    <BackgroundScreen centered={false}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.questionCount}>
            Question {currentIndex + 1}/{questions.length}
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.questionContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateX: slideAnim }],
              },
            ]}
          >
            <Text style={styles.questionTitle}>{currentQuestion.title}</Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedOption === index;
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => setSelectedOption(index)}
                    activeOpacity={0.8}
                    style={[
                      styles.optionCard,
                      isSelected && styles.optionCardSelected,
                    ]}
                  >
                    <View style={[
                      styles.radioOuter,
                      isSelected && styles.radioOuterSelected,
                    ]}>
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                    <Text style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}>
                      {option.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Animated.View>
        </ScrollView>

        <View style={styles.footer}>
          {currentIndex > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          )}
          <View style={styles.nextButtonContainer}>
            <PrimaryButton
              title={currentIndex === questions.length - 1 ? 'Voir mon resultat' : 'Suivant'}
              onPress={handleNext}
              disabled={selectedOption === null}
            />
          </View>
        </View>
      </View>
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  questionCount: {
    ...typography.caption,
    color: textColors.tertiary,
    marginBottom: 16,
  },
  progressBarBg: {
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: textColors.accent,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 8,
  },
  questionContainer: {
    paddingBottom: 16,
  },
  questionTitle: {
    ...typography.h3,
    color: textColors.primary,
    textAlign: 'center',
    marginBottom: 32,
  },
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionCardSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: textColors.accent,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: textColors.accent,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: textColors.accent,
  },
  optionText: {
    ...typography.body,
    flex: 1,
    color: 'rgba(255, 255, 255, 0.65)',
  },
  optionTextSelected: {
    color: textColors.primary,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingTop: 12,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButtonText: {
    ...typography.body,
    color: textColors.tertiary,
  },
  nextButtonContainer: {
    flex: 1,
  },
});
