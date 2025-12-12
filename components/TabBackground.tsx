import React from 'react';
import { ImageBackground, StyleSheet, View, ViewStyle } from 'react-native';

const backgroundImage = require('../assets/images/background.jpeg');

interface TabBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function TabBackground({ children, style }: TabBackgroundProps) {
  return (
    <ImageBackground
      source={backgroundImage}
      style={[styles.background, style]}
      resizeMode="cover"
    >
      <View style={styles.overlay} pointerEvents="none" />
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});
