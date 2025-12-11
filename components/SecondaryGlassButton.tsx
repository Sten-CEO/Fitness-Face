import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';

interface SecondaryGlassButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function SecondaryGlassButton({
  title,
  onPress,
  style,
  textStyle,
}: SecondaryGlassButtonProps) {
  const buttonInner = (
    <View style={styles.contentWrapper}>
      <Text style={[styles.text, textStyle]}>{title}</Text>
    </View>
  );

  const renderContent = () => {
    if (Platform.OS === 'ios') {
      return (
        <BlurView intensity={40} tint="dark" style={styles.blurWrapper}>
          <View style={styles.innerOverlay}>{buttonInner}</View>
        </BlurView>
      );
    }
    return <View style={styles.androidWrapper}>{buttonInner}</View>;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.button, style]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 320,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  blurWrapper: {
    overflow: 'hidden',
    borderRadius: 999,
  },
  innerOverlay: {
    backgroundColor: 'rgba(40, 40, 50, 0.5)',
  },
  androidWrapper: {
    backgroundColor: 'rgba(40, 40, 50, 0.75)',
    borderRadius: 999,
  },
  contentWrapper: {
    paddingVertical: 16,
    paddingHorizontal: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#9CA3AF',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
