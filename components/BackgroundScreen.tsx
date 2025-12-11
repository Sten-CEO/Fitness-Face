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
}

export default function BackgroundScreen({
  children,
  style,
  centered = true,
}: BackgroundScreenProps) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Overlay gradient pour faire ressortir les elements glass */}
        <LinearGradient
          colors={[
            'rgba(2, 6, 23, 0.55)',
            'rgba(2, 6, 23, 0.65)',
            'rgba(2, 6, 23, 0.75)',
          ]}
          locations={[0, 0.5, 1]}
          style={StyleSheet.absoluteFill}
        />
        {/* Vignette subtile sur les bords */}
        <LinearGradient
          colors={[
            'transparent',
            'transparent',
            'rgba(0, 0, 0, 0.4)',
          ]}
          locations={[0, 0.6, 1]}
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
    backgroundColor: '#020617',
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
