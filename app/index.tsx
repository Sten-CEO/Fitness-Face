import { useRouter } from 'expo-router';
import React from 'react';
import {
  ImageBackground,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <ImageBackground
        source={require('../assets/images/background.jpeg')}
        style={styles.background}
        resizeMode="cover"
      >
        {/* Voile sombre */}
        <View style={styles.overlay} />

        {/* Contenu */}
        <View style={styles.content}>
          <Text style={styles.appName}>Fitness Face</Text>

          <Text style={styles.title}>
            Transforme ton visage en 5 minutes par jour
          </Text>

          <Text style={styles.subtitle}>
            Programmes guidés pour jawline, double menton et visage plus net.
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log('Commencer pressé');
              // Plus tard : router.push('/questionnaire');
            }}
          >
            <Text style={styles.buttonText}>Commencer</Text>
          </TouchableOpacity>

          <Text style={styles.smallText}>
            Pas de matériel. Pas de bullshit. Juste des routines guidées.
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  appName: {
    color: '#B3B3B3',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    color: '#D0D0D0',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#0B0B0B',
    fontSize: 16,
    fontWeight: '600',
  },
  smallText: {
    color: '#8A8A8A',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
});