import React, { useRef } from 'react';
import {
  Animated,
  TouchableWithoutFeedback,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface SecondaryGlassButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function SecondaryGlassButton({
  title,
  onPress,
  style,
  textStyle,
}: SecondaryGlassButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };

  // Reflet liquid glass subtil
  const glassReflection = (
    <LinearGradient
      colors={[
        'rgba(255, 255, 255, 0.15)',
        'rgba(255, 255, 255, 0.05)',
        'transparent',
      ]}
      locations={[0, 0.3, 1]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );

  const buttonInner = (
    <View style={styles.contentWrapper}>
      {glassReflection}
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </View>
  );

  const renderContent = () => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={40} tint="dark" style={styles.blurWrapper}>
          <View style={styles.innerOverlay}>{buttonInner}</View>
        </BlurView>
      );
    }
    return <View style={styles.androidWrapper}>{buttonInner}</View>;
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
    >
      <Animated.View style={[
        styles.button,
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}>
        {renderContent()}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    // Ombre subtile
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  blurWrapper: {
    overflow: 'hidden',
    borderRadius: 999,
  },
  innerOverlay: {
    backgroundColor: 'rgba(30, 30, 40, 0.5)',
  },
  androidWrapper: {
    backgroundColor: 'rgba(30, 30, 40, 0.75)',
    borderRadius: 999,
  },
  contentWrapper: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 54,
    overflow: 'hidden',
  },
  text: {
    color: '#B4B4B4',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
