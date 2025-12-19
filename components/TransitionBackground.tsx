import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Utilise le background commun de l'app
const transitionBg = require('../assets/images/background.jpeg');

interface TransitionBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurRadius?: number;
}

export default function TransitionBackground({
  children,
  style,
  blurRadius = 0,
}: TransitionBackgroundProps) {
  return (
    <View style={styles.root}>
      <ImageBackground
        source={transitionBg}
        style={StyleSheet.absoluteFillObject}
        resizeMode="cover"
        blurRadius={blurRadius}
      >
        <View style={styles.overlay} />
      </ImageBackground>
      <SafeAreaView style={[styles.content, style]}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
});
