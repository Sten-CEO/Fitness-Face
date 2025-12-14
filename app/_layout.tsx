import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { ProgressProvider } from '../contexts/ProgressContext';
import { UserProvider } from '../contexts/UserContext';

const backgroundImage = require('../assets/images/background.jpeg');

export default function RootLayout() {
  return (
    <UserProvider>
      <ProgressProvider>
        <NotificationsProvider>
          <SafeAreaProvider>
          <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
            <View style={styles.overlay} pointerEvents="none" />
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: 'transparent' },
                animation: 'fade',
                animationDuration: 250,
              }}
            />
          </ImageBackground>
          </SafeAreaProvider>
        </NotificationsProvider>
      </ProgressProvider>
    </UserProvider>
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
