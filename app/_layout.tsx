import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProgressProvider } from '../contexts/ProgressContext';
import { UserProvider } from '../contexts/UserContext';

const backgroundImage = require('../assets/images/background.jpeg');

export default function RootLayout() {
  return (
    <UserProvider>
      <ProgressProvider>
        <SafeAreaProvider>
          <View style={styles.container}>
            {/* Background image visible pendant les transitions - pointerEvents none to allow taps */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <ImageBackground
                source={backgroundImage}
                style={StyleSheet.absoluteFill}
                resizeMode="cover"
              >
                <View style={styles.overlay} />
              </ImageBackground>
            </View>
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'fade',
                animationDuration: 250,
              }}
            />
          </View>
        </SafeAreaProvider>
      </ProgressProvider>
    </UserProvider>
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
});
