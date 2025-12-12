import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { textColors } from '../../theme/typography';

const backgroundImage = require('../../assets/images/background.jpeg');

export default function TabLayout() {
  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: textColors.primary,
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
          tabBarShowLabel: false,
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
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <Ionicons name="home-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="routine"
        options={{
          title: 'Routine',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <Ionicons name="fitness-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <Ionicons name="stats-chart-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.tabItem, focused && styles.tabItemActive]}>
              <Ionicons name="person-outline" size={24} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
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
  tabBar: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderTopWidth: 0,
    elevation: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    paddingHorizontal: 8,
  },
  tabBarBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(20, 20, 30, 0.95)',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
});
