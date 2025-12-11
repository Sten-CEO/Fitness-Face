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
import { LinearGradient } from 'expo-linear-gradient';

import BackgroundScreen from '../components/BackgroundScreen';
import PrimaryGlassButton from '../components/PrimaryGlassButton';
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

    // Reflet glass pour les options
    const optionGlassOverlay = (
      <LinearGradient
        colors={[
          isSelected ? 'rgba(96, 165, 250, 0.15)' : 'rgba(255, 255, 255, 0.08)',
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    );

    const content = (
      <View style={styles.optionContent}>
        <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
          {isSelected && (
            <View style={styles.radioInner}>
              <LinearGradient
                colors={['#60A5FA', '#3B82F6']}
                style={styles.radioGradient}
              />
            </View>
          )}
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
          <BlurView intensity={45} tint="dark" style={styles.optionBlur}>
            <View style={[styles.optionInner, isSelected && styles.optionInnerSelected]}>
              {optionGlassOverlay}
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
        {optionGlassOverlay}
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
            Question {currentIndex + 1} sur {questions.length}
          </Text>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={['#60A5FA', '#3B82F6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
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
            <PrimaryGlassButton
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
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 14,
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
    borderRadius: 2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 16,
    justifyContent: 'center',
  },
  questionContainer: {
    paddingBottom: 20,
  },
  questionTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 34,
    paddingHorizontal: 8,
  },
  optionsContainer: {
    gap: 14,
  },
  optionWrapper: {
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    // Ombre subtile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  optionWrapperSelected: {
    borderColor: 'rgba(96, 165, 250, 0.5)',
    borderWidth: 1.5,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
  },
  optionBlur: {
    overflow: 'hidden',
  },
  optionInner: {
    backgroundColor: 'rgba(25, 25, 35, 0.5)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 68,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  optionInnerSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  optionAndroid: {
    backgroundColor: 'rgba(25, 25, 35, 0.8)',
    paddingVertical: 20,
    paddingHorizontal: 20,
    minHeight: 68,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  optionAndroidSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.18)',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  radioOuterSelected: {
    borderColor: '#60A5FA',
    borderWidth: 2,
  },
  radioInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    overflow: 'hidden',
  },
  radioGradient: {
    flex: 1,
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
    marginTop: 24,
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
