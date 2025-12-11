import React from 'react';
import { StyleSheet, Text, View, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface GlassPillProps {
  text: string;
  icon?: string;
}

export default function GlassPill({ text, icon = '✓' }: GlassPillProps) {
  // Icone check en verre bleu
  const checkIcon = (
    <View style={styles.iconContainer}>
      {Platform.OS === 'ios' ? (
        <BlurView intensity={15} tint="dark" style={styles.iconBlur}>
          <LinearGradient
            colors={['rgba(76, 111, 255, 0.5)', 'rgba(159, 102, 255, 0.4)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            {/* Reflet sur l'icone */}
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.25)', 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.iconReflection}
            />
            <Text style={styles.iconText}>{icon}</Text>
          </LinearGradient>
        </BlurView>
      ) : (
        <View style={styles.iconAndroid}>
          <LinearGradient
            colors={['rgba(76, 111, 255, 0.5)', 'rgba(159, 102, 255, 0.4)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.iconGradient}
          >
            <Text style={styles.iconText}>{icon}</Text>
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
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    marginRight: 14,
    // Halo subtil bleu
    shadowColor: '#4C6FFF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBlur: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  iconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  iconReflection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    borderRadius: 14,
  },
  iconAndroid: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: 'rgba(76, 111, 255, 0.3)',
  },
  iconText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
  },
});
