import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Image de fond importee depuis assets
const backgroundImage = require('@/assets/images/background.jpeg');

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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050509" />
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
      >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050509',
  },
  background: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(5, 5, 9, 0.65)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centered: {
    justifyContent: 'center',
  },
});
