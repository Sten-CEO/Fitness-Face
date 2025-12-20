import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Platform, Alert } from 'react-native';

const STORAGE_KEY = '@fitness_face_notifications';

// ============================================
// TYPES
// ============================================

interface NotificationSettings {
  // Rappel routine du jour
  routineReminderEnabled: boolean;
  routineReminderHour: number; // 0-23
  routineReminderMinute: number; // 0-59

  // Alerte perte de streak
  streakAlertEnabled: boolean;

  // Conseil du jour
  dailyTipEnabled: boolean;

  // Expo push token (pour référence)
  expoPushToken: string | null;

  // Permissions accordées
  permissionsGranted: boolean;
}

interface NotificationsContextType extends NotificationSettings {
  isLoading: boolean;

  // Actions
  setRoutineReminder: (enabled: boolean, hour?: number, minute?: number) => Promise<void>;
  setStreakAlert: (enabled: boolean) => Promise<void>;
  setDailyTip: (enabled: boolean) => Promise<void>;
  requestPermissions: () => Promise<boolean>;
}

const defaultSettings: NotificationSettings = {
  routineReminderEnabled: false,
  routineReminderHour: 19, // 19h par défaut
  routineReminderMinute: 0,
  streakAlertEnabled: false,
  dailyTipEnabled: false,
  expoPushToken: null,
  permissionsGranted: false,
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// ============================================
// CONFIGURATION NOTIFICATIONS
// ============================================

// Configure le comportement des notifications
// IMPORTANT: Wrappé dans try-catch car c'est exécuté au chargement du module
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('[Notifications] Failed to set handler:', e);
}

// ============================================
// PROVIDER
// ============================================

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount - with delay to avoid boot crash
  useEffect(() => {
    const timer = setTimeout(() => {
      loadSettings().catch((e) => {
        console.warn('[Notifications] Load failed:', e);
        setIsLoading(false);
      });
    }, 1000); // 1 seconde de délai
    return () => clearTimeout(timer);
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  };

  // ============================================
  // PERMISSIONS
  // ============================================

  const requestPermissions = async (): Promise<boolean> => {
    // Vérifier si on est sur un appareil physique
    if (!Device.isDevice) {
      Alert.alert(
        'Appareil requis',
        'Les notifications push ne fonctionnent que sur un appareil physique.'
      );
      return false;
    }

    // Vérifier les permissions existantes
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Demander les permissions si pas encore accordées
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      Alert.alert(
        'Permissions requises',
        'Veuillez activer les notifications dans les réglages de votre appareil pour recevoir des rappels.'
      );
      await saveSettings({ ...settings, permissionsGranted: false });
      return false;
    }

    // Obtenir le token push (optionnel, pour référence future)
    let token: string | null = null;
    try {
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'fitness-face', // À remplacer par votre vrai projectId
      });
      token = tokenData.data;
    } catch {
      // Pas grave si on n'obtient pas le token
    }

    // Configuration spécifique Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#3B82F6',
      });
    }

    await saveSettings({
      ...settings,
      permissionsGranted: true,
      expoPushToken: token,
    });

    return true;
  };

  // ============================================
  // NOTIFICATION SCHEDULING
  // ============================================

  const scheduleRoutineReminder = async (hour: number, minute: number) => {
    // Annuler les anciennes notifications de rappel
    await Notifications.cancelScheduledNotificationAsync('routine-reminder').catch(() => {});

    // Programmer la nouvelle notification quotidienne
    await Notifications.scheduleNotificationAsync({
      identifier: 'routine-reminder',
      content: {
        title: 'C\'est l\'heure de ta routine ! 💪',
        body: 'N\'oublie pas de faire ta routine faciale aujourd\'hui.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  };

  const cancelRoutineReminder = async () => {
    await Notifications.cancelScheduledNotificationAsync('routine-reminder').catch(() => {});
  };

  const scheduleStreakAlert = async () => {
    // Annuler les anciennes alertes streak
    await Notifications.cancelScheduledNotificationAsync('streak-alert').catch(() => {});

    // Programmer l'alerte à 21h (avant minuit pour rappeler de maintenir le streak)
    await Notifications.scheduleNotificationAsync({
      identifier: 'streak-alert',
      content: {
        title: 'Attention à ton streak ! 🔥',
        body: 'Tu n\'as pas encore fait ta routine aujourd\'hui. Ne perds pas ton streak !',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 21,
        minute: 0,
      },
    });
  };

  const cancelStreakAlert = async () => {
    await Notifications.cancelScheduledNotificationAsync('streak-alert').catch(() => {});
  };

  const scheduleDailyTip = async () => {
    // Annuler les anciens conseils
    await Notifications.cancelScheduledNotificationAsync('daily-tip').catch(() => {});

    // Programmer le conseil à 10h
    await Notifications.scheduleNotificationAsync({
      identifier: 'daily-tip',
      content: {
        title: 'Conseil du jour 💡',
        body: 'Astuce : pratique ta routine devant un miroir pour mieux suivre les mouvements.',
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 10,
        minute: 0,
      },
    });
  };

  const cancelDailyTip = async () => {
    await Notifications.cancelScheduledNotificationAsync('daily-tip').catch(() => {});
  };

  // ============================================
  // ACTIONS PUBLIQUES
  // ============================================

  const setRoutineReminder = async (enabled: boolean, hour?: number, minute?: number) => {
    const newHour = hour ?? settings.routineReminderHour;
    const newMinute = minute ?? settings.routineReminderMinute;

    if (enabled) {
      const hasPermissions = settings.permissionsGranted || await requestPermissions();
      if (!hasPermissions) return;

      await scheduleRoutineReminder(newHour, newMinute);
    } else {
      await cancelRoutineReminder();
    }

    await saveSettings({
      ...settings,
      routineReminderEnabled: enabled,
      routineReminderHour: newHour,
      routineReminderMinute: newMinute,
    });
  };

  const setStreakAlert = async (enabled: boolean) => {
    if (enabled) {
      const hasPermissions = settings.permissionsGranted || await requestPermissions();
      if (!hasPermissions) return;

      await scheduleStreakAlert();
    } else {
      await cancelStreakAlert();
    }

    await saveSettings({
      ...settings,
      streakAlertEnabled: enabled,
    });
  };

  const setDailyTip = async (enabled: boolean) => {
    if (enabled) {
      const hasPermissions = settings.permissionsGranted || await requestPermissions();
      if (!hasPermissions) return;

      await scheduleDailyTip();
    } else {
      await cancelDailyTip();
    }

    await saveSettings({
      ...settings,
      dailyTipEnabled: enabled,
    });
  };

  return (
    <NotificationsContext.Provider
      value={{
        ...settings,
        isLoading,
        setRoutineReminder,
        setStreakAlert,
        setDailyTip,
        requestPermissions,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
