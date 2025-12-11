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
        <BlurView intensity={30} tint="dark" style={styles.blurCheck}>
          <LinearGradient
            colors={['rgba(59, 130, 246, 0.4)', 'rgba(37, 99, 235, 0.3)']}
            style={styles.checkGradient}
          >
            <Text style={styles.checkMark}>✓</Text>
          </LinearGradient>
        </BlurView>
      ) : (
        <View style={styles.androidCheck}>
          <Text style={styles.checkMark}>✓</Text>
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
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkContainer: {
    width: 26,
    height: 26,
    borderRadius: 13,
    overflow: 'hidden',
    marginRight: 14,
    marginTop: 1,
  },
  blurCheck: {
    flex: 1,
    borderRadius: 13,
    overflow: 'hidden',
  },
  checkGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  androidCheck: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    borderRadius: 13,
    borderWidth: 0.5,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  checkMark: {
    color: '#60A5FA',
    fontSize: 14,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    color: '#E5E7EB',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'left',
  },
});
