import React from 'react';
import {
  StyleSheet,
  View,
  StatusBar,
  ViewStyle,
  ImageBackground,
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
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <ImageBackground
        source={backgroundImage}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        {/* Overlay leger pour lisibilite */}
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
    backgroundColor: '#000000',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centered: {
    justifyContent: 'center',
  },
});
