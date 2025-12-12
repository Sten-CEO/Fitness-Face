import React from 'react';
import {
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
      <SafeAreaView
        style={[
          styles.safeArea,
          centered && styles.centered,
          style,
        ]}
      >
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centered: {
    justifyContent: 'center',
  },
});
