import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import TabBackground from '../components/TabBackground';
import { useNotifications } from '../contexts/NotificationsContext';
import { textColors, typography } from '../theme/typography';

export default function NotificationsScreen() {
  const router = useRouter();
  const {
    routineReminderEnabled,
    routineReminderHour,
    routineReminderMinute,
    streakAlertEnabled,
    dailyTipEnabled,
    setRoutineReminder,
    setStreakAlert,
    setDailyTip,
    isLoading,
  } = useNotifications();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(routineReminderHour);
  const [selectedMinute, setSelectedMinute] = useState(routineReminderMinute);

  const formatTime = (hour: number, minute: number) => {
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  };

  const handleTimeConfirm = async () => {
    await setRoutineReminder(routineReminderEnabled, selectedHour, selectedMinute);
    setShowTimePicker(false);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = [0, 15, 30, 45];

  if (isLoading) {
    return (
      <TabBackground>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        </SafeAreaView>
      </TabBackground>
    );
  }

  return (
    <TabBackground>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Notifications</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction */}
          <Text style={styles.intro}>
            Configure tes notifications pour ne jamais manquer une routine et maintenir ton streak.
          </Text>

          {/* Notification 1: Rappel routine */}
          <View style={styles.notificationCard}>
            <View style={styles.notificationHeader}>
              <View style={styles.notificationIconContainer}>
                <Ionicons name="time-outline" size={22} color={textColors.accent} />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Rappel routine du jour</Text>
                <Text style={styles.notificationDescription}>
                  Rappel quotidien pour faire ta routine faciale
                </Text>
              </View>
              <Switch
                value={routineReminderEnabled}
                onValueChange={(value) => setRoutineReminder(value)}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(59, 130, 246, 0.5)' }}
                thumbColor={routineReminderEnabled ? '#3B82F6' : '#888'}
              />
            </View>

            {/* Time selector */}
            {routineReminderEnabled && (
              <TouchableOpacity
                style={styles.timeSelector}
                onPress={() => {
                  setSelectedHour(routineReminderHour);
                  setSelectedMinute(routineReminderMinute);
                  setShowTimePicker(true);
                }}
              >
                <Text style={styles.timeSelectorLabel}>Heure du rappel</Text>
                <View style={styles.timeSelectorValue}>
                  <Text style={styles.timeText}>
                    {formatTime(routineReminderHour, routineReminderMinute)}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={textColors.tertiary} />
                </View>
              </TouchableOpacity>
            )}
          </View>

          {/* Notification 2: Alerte streak */}
          <View style={styles.notificationCard}>
            <View style={styles.notificationHeader}>
              <View style={[styles.notificationIconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <Ionicons name="flame-outline" size={22} color="#EF4444" />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Alerte perte de streak</Text>
                <Text style={styles.notificationDescription}>
                  Rappel à 21h si tu n'as pas fait ta routine
                </Text>
              </View>
              <Switch
                value={streakAlertEnabled}
                onValueChange={(value) => setStreakAlert(value)}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(239, 68, 68, 0.5)' }}
                thumbColor={streakAlertEnabled ? '#EF4444' : '#888'}
              />
            </View>
          </View>

          {/* Notification 3: Conseil du jour */}
          <View style={styles.notificationCard}>
            <View style={styles.notificationHeader}>
              <View style={[styles.notificationIconContainer, { backgroundColor: 'rgba(34, 197, 94, 0.15)' }]}>
                <Ionicons name="bulb-outline" size={22} color="#22C55E" />
              </View>
              <View style={styles.notificationInfo}>
                <Text style={styles.notificationTitle}>Conseil du jour</Text>
                <Text style={styles.notificationDescription}>
                  Un conseil quotidien à 10h pour t'accompagner
                </Text>
              </View>
              <Switch
                value={dailyTipEnabled}
                onValueChange={(value) => setDailyTip(value)}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(34, 197, 94, 0.5)' }}
                thumbColor={dailyTipEnabled ? '#22C55E' : '#888'}
              />
            </View>
          </View>

          {/* Info box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={20} color={textColors.tertiary} />
            <Text style={styles.infoText}>
              Les notifications nécessitent l'autorisation de ton appareil. Tu peux modifier ces
              autorisations dans les réglages de ton téléphone.
            </Text>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>

        {/* Time Picker Modal */}
        <Modal
          visible={showTimePicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowTimePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Choisir l'heure</Text>

              <View style={styles.pickerContainer}>
                {/* Hours */}
                <ScrollView
                  style={styles.pickerColumn}
                  contentContainerStyle={styles.pickerColumnContent}
                  showsVerticalScrollIndicator={false}
                >
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedHour === hour && styles.pickerItemTextSelected,
                        ]}
                      >
                        {hour.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <Text style={styles.pickerSeparator}>:</Text>

                {/* Minutes */}
                <ScrollView
                  style={styles.pickerColumn}
                  contentContainerStyle={styles.pickerColumnContent}
                  showsVerticalScrollIndicator={false}
                >
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.pickerItem,
                        selectedMinute === minute && styles.pickerItemSelected,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMinute === minute && styles.pickerItemTextSelected,
                        ]}
                      >
                        {minute.toString().padStart(2, '0')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButtonCancel}
                  onPress={() => setShowTimePicker(false)}
                >
                  <Text style={styles.modalButtonCancelText}>Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalButtonConfirm} onPress={handleTimeConfirm}>
                  <Text style={styles.modalButtonConfirmText}>Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </TabBackground>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...typography.body,
    color: textColors.tertiary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h3,
    color: textColors.primary,
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  intro: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  notificationCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
    marginRight: 12,
  },
  notificationTitle: {
    ...typography.body,
    color: textColors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  notificationDescription: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    lineHeight: 18,
  },
  timeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.06)',
  },
  timeSelectorLabel: {
    ...typography.body,
    color: textColors.secondary,
  },
  timeSelectorValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    ...typography.body,
    color: textColors.accent,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    gap: 12,
  },
  infoText: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    flex: 1,
    lineHeight: 20,
  },
  bottomSpacer: {
    height: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 320,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalTitle: {
    ...typography.h3,
    color: textColors.primary,
    textAlign: 'center',
    marginBottom: 24,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    marginBottom: 24,
  },
  pickerColumn: {
    flex: 1,
    maxWidth: 80,
  },
  pickerColumnContent: {
    paddingVertical: 60,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  pickerItemText: {
    ...typography.h3,
    color: textColors.tertiary,
    textAlign: 'center',
  },
  pickerItemTextSelected: {
    color: textColors.accent,
    fontWeight: '700',
  },
  pickerSeparator: {
    ...typography.h2,
    color: textColors.primary,
    marginHorizontal: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  modalButtonCancelText: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
    fontWeight: '600',
  },
  modalButtonConfirm: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
  },
  modalButtonConfirmText: {
    ...typography.body,
    color: textColors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
});
