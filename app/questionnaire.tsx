import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';

import BackgroundScreen from '../components/BackgroundScreen';
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

  const renderOptionCard = (option: { text: string }, index: number) => {
    const isSelected = selectedOption === index;

    const content = (
      <View style={styles.optionContent}>
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
        <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
          {option.text}
        </Text>
      </View>
    );

    if (Platform.OS === 'ios') {
      return (
        <TouchableOpacity
          key={index}
          onPress={() => setSelectedOption(index)}
          activeOpacity={0.8}
          style={[styles.optionWrapper, isSelected && styles.optionWrapperSelected]}
        >
          <BlurView intensity={40} tint="dark" style={styles.optionBlur}>
            <View style={[styles.optionInner, isSelected && styles.optionInnerSelected]}>
              {content}
            </View>
          </BlurView>
        </TouchableOpacity>
      );
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={() => setSelectedOption(index)}
        activeOpacity={0.8}
        style={[
          styles.optionWrapper,
          styles.optionAndroid,
          isSelected && styles.optionWrapperSelected,
          isSelected && styles.optionAndroidSelected,
        ]}
      >
        {content}
      </TouchableOpacity>
    );
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

        {/* Question animee */}
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
              {currentQuestion.options.map((option, index) =>
                renderOptionCard(option, index)
              )}
            </View>
          </Animated.View>
        </ScrollView>

        {/* Footer avec boutons */}
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
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  questionContainer: {
    flex: 1,
  },
  questionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 32,
    paddingHorizontal: 8,
  },
  optionsContainer: {
    gap: 14,
  },
  optionWrapper: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionWrapperSelected: {
    borderColor: 'rgba(59, 130, 246, 0.5)',
    borderWidth: 1.5,
  },
  optionBlur: {
    overflow: 'hidden',
  },
  optionInner: {
    backgroundColor: 'rgba(30, 30, 35, 0.5)',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  optionInnerSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  optionAndroid: {
    backgroundColor: 'rgba(30, 30, 35, 0.8)',
    paddingVertical: 18,
    paddingHorizontal: 18,
  },
  optionAndroidSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
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
    fontSize: 16,
    lineHeight: 24,
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
    marginTop: 20,
    paddingTop: 16,
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
