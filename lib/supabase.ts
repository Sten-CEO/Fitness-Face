import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Récupérer les variables d'environnement Expo
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Vérifier la configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase non configuré. Ajoutez EXPO_PUBLIC_SUPABASE_URL et EXPO_PUBLIC_SUPABASE_ANON_KEY dans votre fichier .env'
  );
}

// Créer le client Supabase avec persistance de session via AsyncStorage
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important pour React Native
  },
});

// Types pour la base de données
export interface Profile {
  id: string;
  created_at: string;
  email: string;
  program_type: string | null;
  start_date: string | null;
  timezone: string;
}

export interface UserProgress {
  user_id: string;
  current_day: number;
  streak: number;
  last_completed_date: string | null;
  days_completed: number[];
  bonus_completed: number[];
  updated_at: string;
}

export interface RoutineHistory {
  id: string;
  user_id: string;
  day_index: number;
  program_type: string;
  routine_name: string;
  completed_at: string;
  exercises: object;
  bonus: object | null;
}

export interface UserSettings {
  user_id: string;
  notif_daily: boolean;
  notif_streak_lost: boolean;
  notif_tip: boolean;
  daily_notif_time: string;
  updated_at: string;
}
