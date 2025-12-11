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
import GlassButton from '../components/GlassButton';
import GlassCard from '../components/GlassCard';
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
          isSelected ? 'rgba(76, 111, 255, 0.12)' : 'rgba(255, 255, 255, 0.06)',
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
                colors={['#4C6FFF', '#9F66FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
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
          <BlurView intensity={18} tint="dark" style={styles.optionBlur}>
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
              colors={['#4C6FFF', '#9F66FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progress * 100}%` }]}
            />
          </View>
        </View>

        {/* Question animee dans une GlassCard */}
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
            <GlassCard contentStyle={styles.questionCardContent}>
              <Text style={styles.questionTitle}>{currentQuestion.title}</Text>

              <View style={styles.optionsContainer}>
                {currentQuestion.options.map((option, index) =>
                  renderOptionCard(option, index)
                )}
              </View>
            </GlassCard>
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
            <GlassButton
              label={currentIndex === questions.length - 1 ? 'Voir mon resultat' : 'Suivant'}
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
    marginBottom: 28,
    alignItems: 'center',
  },
  questionCount: {
    color: 'rgba(255, 255, 255, 0.55)',
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
    paddingVertical: 8,
    justifyContent: 'center',
  },
  questionContainer: {
    paddingBottom: 16,
  },
  questionCardContent: {
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  questionTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 32,
    paddingHorizontal: 4,
  },
  optionsContainer: {
    gap: 12,
    width: '100%',
  },
  optionWrapper: {
    borderRadius: 20,
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
    borderColor: 'rgba(76, 111, 255, 0.5)',
    borderWidth: 1,
    shadowColor: '#4C6FFF',
    shadowOpacity: 0.25,
  },
  optionBlur: {
    overflow: 'hidden',
  },
  optionInner: {
    backgroundColor: 'rgba(7, 7, 10, 0.55)',
    paddingVertical: 18,
    paddingHorizontal: 18,
    minHeight: 64,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  optionInnerSelected: {
    backgroundColor: 'rgba(76, 111, 255, 0.12)',
  },
  optionAndroid: {
    backgroundColor: 'rgba(7, 7, 10, 0.75)',
    paddingVertical: 18,
    paddingHorizontal: 18,
    minHeight: 64,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  optionAndroidSelected: {
    backgroundColor: 'rgba(76, 111, 255, 0.15)',
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
    borderColor: 'rgba(255, 255, 255, 0.22)',
    marginRight: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  radioOuterSelected: {
    borderColor: '#4C6FFF',
    borderWidth: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    overflow: 'hidden',
  },
  radioGradient: {
    flex: 1,
  },
  optionText: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.72)',
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
    marginTop: 20,
    paddingTop: 12,
  },
  backButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  nextButtonContainer: {
    flex: 1,
  },
});
