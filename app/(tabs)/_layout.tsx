import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useProgress } from '../../contexts/ProgressContext';
import { textColors } from '../../theme/typography';

const TAB_BAR_HEIGHT = 60;
const ICON_SIZE = 44;

export default function TabLayout() {
  const { isLoading: authLoading } = useAuth();
  const { selectedPlanId, isLoading: progressLoading } = useProgress();

  // Attendre que les états soient chargés
  if (authLoading || progressLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={textColors.accent} />
      </View>
    );
  }

  // Rediriger vers l'accueil si aucun plan sélectionné
  if (!selectedPlanId) {
    return <Redirect href="/" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: textColors.primary,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarShowLabel: false,
        // IMPORTANT: Force le fond transparent pour éviter le fond blanc
        sceneContainerStyle: { backgroundColor: 'transparent' },
        tabBarBackground: () => (
          <View style={styles.tabBarBackground} />
        ),
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <Ionicons name="home-outline" size={22} color={color} />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <Ionicons name="time-outline" size={22} color={color} />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <Ionicons name="stats-chart-outline" size={22} color={color} />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.tabIconContainer}>
              <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
                <Ionicons name="person-outline" size={22} color={color} />
              </View>
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabBar: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 20,
    right: 20,
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    paddingBottom: 0,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 15, 25, 0.95)',
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tabIconContainer: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  iconWrapper: {
    width: ICON_SIZE,
    height: ICON_SIZE,
    borderRadius: ICON_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconWrapperActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
  },
});
