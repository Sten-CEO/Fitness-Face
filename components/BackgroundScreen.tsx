import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const backgroundImage = require('../assets/images/background.jpeg');

interface BackgroundScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  centered?: boolean;
}

export default function BackgroundScreen({
  children,
  style,
  centered = true,
}: BackgroundScreenProps) {
  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <SafeAreaView
        style={[
          styles.safeArea,
          centered && styles.centered,
          style,
        ]}
      >
        {children}
      </SafeAreaView>
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
    pointerEvents: 'none',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centered: {
    justifyContent: 'center',
  },
});
