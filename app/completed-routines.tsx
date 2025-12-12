import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useRef, useEffect } from 'react';
import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CleanCard from '../components/CleanCard';
import { useProgress, CompletedRoutine } from '../contexts/ProgressContext';
import { typography, textColors } from '../theme/typography';

// Formatte une date ISO en format lisible
function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CompletedRoutinesScreen() {
  const router = useRouter();
  const { completedRoutines } = useProgress();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Trier par date (plus récent en premier)
  const sortedRoutines = [...completedRoutines].sort((a, b) => {
    return new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime();
  });

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const renderRoutineItem = ({ item, index }: { item: CompletedRoutine; index: number }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [20, 0],
          }),
        }],
      }}
    >
      <CleanCard style={styles.routineItem}>
        <View style={styles.routineContent}>
          <View style={styles.dayBadge}>
            <Text style={styles.dayBadgeText}>Jour {item.dayNumber}</Text>
          </View>
          <View style={styles.routineDetails}>
            <Text style={styles.routineName}>{item.routineName}</Text>
            <Text style={styles.routineDate}>
              {formatDate(item.completedAt)} à {formatTime(item.completedAt)}
            </Text>
          </View>
          <View style={styles.checkIcon}>
            <Ionicons name="checkmark-circle" size={24} color="#10B981" />
          </View>
        </View>
      </CleanCard>
    </Animated.View>
  );

  const ListEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="fitness-outline" size={64} color="rgba(255, 255, 255, 0.2)" />
      <Text style={styles.emptyTitle}>Aucune routine terminée</Text>
      <Text style={styles.emptySubtitle}>
        Complète ta première routine pour la voir apparaître ici
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={textColors.primary} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>Routines terminées</Text>
              <Text style={styles.headerSubtitle}>
                {completedRoutines.length} routine{completedRoutines.length > 1 ? 's' : ''} au total
              </Text>
            </View>
            <View style={styles.headerSpacer} />
          </View>

          {/* Liste des routines */}
          <FlatList
            data={sortedRoutines}
            renderItem={renderRoutineItem}
            keyExtractor={(item, index) => `${item.dayNumber}-${index}`}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={ListEmptyComponent}
          />
        </Animated.View>
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
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h4,
    color: textColors.primary,
  },
  headerSubtitle: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  routineItem: {
    marginBottom: 12,
  },
  routineContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dayBadge: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 70,
    alignItems: 'center',
  },
  dayBadgeText: {
    ...typography.labelSmall,
    color: textColors.accent,
    fontWeight: '600',
  },
  routineDetails: {
    flex: 1,
  },
  routineName: {
    ...typography.bodySmall,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 2,
  },
  routineDate: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  checkIcon: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
  },
  emptyTitle: {
    ...typography.h4,
    color: textColors.secondary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
});
