import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface FeatureItemProps {
  text: string;
}

export default function FeatureItem({ text }: FeatureItemProps) {
  const checkIcon = (
    <View style={styles.checkContainer}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={35} tint="dark" style={styles.blurCheck}>
          <LinearGradient
            colors={[
              'rgba(96, 165, 250, 0.5)',
              'rgba(59, 130, 246, 0.35)',
            ]}
            style={styles.checkGradient}
          >
            {/* Reflet glass */}
            <LinearGradient
              colors={[
                'rgba(255, 255, 255, 0.3)',
                'transparent',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.checkReflection}
            />
            <Text style={styles.checkMark}>✓</Text>
          </LinearGradient>
        </BlurView>
      ) : (
        <View style={styles.androidCheck}>
          <LinearGradient
            colors={[
              'rgba(96, 165, 250, 0.4)',
              'rgba(59, 130, 246, 0.25)',
            ]}
            style={styles.checkGradient}
          >
            <Text style={styles.checkMark}>✓</Text>
          </LinearGradient>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {checkIcon}
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  checkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
    marginTop: 0,
    // Ombre subtile
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  blurCheck: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(96, 165, 250, 0.5)',
    overflow: 'hidden',
  },
  checkReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderRadius: 14,
  },
  androidCheck: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  checkMark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  text: {
    flex: 1,
    color: '#E5E7EB',
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'left',
  },
});
