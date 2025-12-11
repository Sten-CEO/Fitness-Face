import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import GlassCard from '../components/GlassCard';
import PrimaryButton from '../components/PrimaryButton';
import {
  addScores,
  calculateRecommendedPlan,
  createInitialScores,
  questions,
  ScoreBuckets,
} from '../data/questions';

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
      // Dernière question - calculer le plan et naviguer
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
        {/* Header avec progression */}
        <View style={styles.header}>
          <Text style={styles.questionCount}>
            Question {currentIndex + 1} / {questions.length}
          </Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          </View>
        </View>

        {/* Question animée */}
        <Animated.View
          style={[
            styles.questionContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <GlassCard>
            <Text style={styles.questionTitle}>{currentQuestion.title}</Text>

            <View style={styles.optionsContainer}>
              {currentQuestion.options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.optionButton,
                    selectedOption === index && styles.optionSelected,
                  ]}
                  onPress={() => setSelectedOption(index)}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.radioOuter,
                      selectedOption === index && styles.radioOuterSelected,
                    ]}
                  >
                    {selectedOption === index && <View style={styles.radioInner} />}
                  </View>
                  <Text
                    style={[
                      styles.optionText,
                      selectedOption === index && styles.optionTextSelected,
                    ]}
                  >
                    {option.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Footer avec boutons */}
        <View style={styles.footer}>
          {currentIndex > 0 && (
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>Retour</Text>
            </TouchableOpacity>
          )}
          <View style={styles.nextButtonContainer}>
            <PrimaryButton
              title={currentIndex === questions.length - 1 ? 'Voir mon résultat' : 'Suivant'}
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  questionCount: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 2,
  },
  questionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 30,
  },
  optionsContainer: {
    gap: 12,
    width: '100%',
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 18,
    paddingHorizontal: 16,
  },
  optionSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    borderColor: '#3B82F6',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: '#3B82F6',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6',
  },
  optionText: {
    flex: 1,
    color: '#D1D5DB',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
  },
  optionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  nextButtonContainer: {
    flex: 1,
  },
});
