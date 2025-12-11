import React from 'react';
import {
  ImageBackground,
  StyleSheet,
  View,
  StatusBar,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// Image de fond importee depuis assets
const backgroundImage = require('../assets/images/background.jpeg');

interface BackgroundScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  centered?: boolean;
  darkerOverlay?: boolean;
}

export default function BackgroundScreen({
  children,
  style,
  centered = true,
  darkerOverlay = false,
}: BackgroundScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#050508" />
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Overlay leger - on garde le fond visible comme sur les mockups glass */}
        <LinearGradient
          colors={
            darkerOverlay
              ? ['rgba(5, 5, 8, 0.55)', 'rgba(5, 5, 8, 0.65)', 'rgba(5, 5, 8, 0.70)']
              : ['rgba(5, 5, 8, 0.35)', 'rgba(5, 5, 8, 0.45)', 'rgba(5, 5, 8, 0.55)']
          }
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Vignette tres subtile en bas */}
        <LinearGradient
          colors={[
            'transparent',
            'transparent',
            'rgba(0, 0, 0, 0.20)',
          ]}
          locations={[0, 0.75, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
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
    backgroundColor: '#050508',
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centered: {
    justifyContent: 'center',
  },
});
