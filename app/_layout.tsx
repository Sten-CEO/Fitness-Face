import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationsProvider } from '../contexts/NotificationsContext';
import { ProgressProvider } from '../contexts/ProgressContext';
import { SubscriptionProvider } from '../contexts/SubscriptionContext';
import { UserProvider } from '../contexts/UserContext';

const backgroundImage = require('../assets/images/background.jpeg');

export default function RootLayout() {
  return (
    <AuthProvider>
      <UserProvider>
        <SubscriptionProvider>
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
        </SubscriptionProvider>
      </UserProvider>
    </AuthProvider>
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
