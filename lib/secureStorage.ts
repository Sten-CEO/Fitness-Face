import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { z } from 'zod';

// ============================================
// SECURE STORAGE UTILITY
// ============================================

// Utilise SecureStore pour iOS/Android, AsyncStorage en fallback pour web
const isSecureStoreAvailable = Platform.OS !== 'web';

/**
 * Stockage sécurisé pour données sensibles
 * - iOS: Keychain
 * - Android: Keystore
 * - Web: AsyncStorage (fallback)
 */
export const secureStorage = {
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(`@secure_${key}`, value);
      }
    } catch (error) {
      console.error('[SecureStorage] Error setting item:', error);
      throw error;
    }
  },

  async getItem(key: string): Promise<string | null> {
    try {
      if (isSecureStoreAvailable) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(`@secure_${key}`);
      }
    } catch (error) {
      console.error('[SecureStorage] Error getting item:', error);
      return null;
    }
  },

  async deleteItem(key: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(`@secure_${key}`);
      }
    } catch (error) {
      console.error('[SecureStorage] Error deleting item:', error);
    }
  },

  async setObject<T>(key: string, value: T): Promise<void> {
    await this.setItem(key, JSON.stringify(value));
  },

  async getObject<T>(key: string, schema?: z.ZodSchema<T>): Promise<T | null> {
    try {
      const value = await this.getItem(key);
      if (!value) return null;

      const parsed = JSON.parse(value);

      // Validate with Zod schema if provided
      if (schema) {
        const result = schema.safeParse(parsed);
        if (!result.success) {
          console.error('[SecureStorage] Validation failed:', result.error);
          return null;
        }
        return result.data;
      }

      return parsed;
    } catch (error) {
      console.error('[SecureStorage] Error parsing object:', error);
      return null;
    }
  },
};

// ============================================
// ZOD SCHEMAS FOR VALIDATION
// ============================================

export const SubscriptionInfoSchema = z.object({
  status: z.enum(['none', 'trial', 'active', 'expired', 'cancelled']),
  planId: z.string().nullable(),
  productId: z.string().nullable(),
  startDate: z.string().nullable(),
  expirationDate: z.string().nullable(),
  trialEndDate: z.string().nullable(),
  isInTrial: z.boolean(),
  isCommitted: z.boolean(),
  canCancel: z.boolean(),
  willRenew: z.boolean(),
  originalTransactionId: z.string().nullable(),
  // Receipt data for validation
  receiptData: z.string().optional(),
  lastValidated: z.string().optional(),
});

export type ValidatedSubscriptionInfo = z.infer<typeof SubscriptionInfoSchema>;

export const PlanIdSchema = z.enum([
  'jawline_guided',
  'jaw_prime_monthly',
  'double_guided',
  'double_monthly',
  'all_in_one',
]);

export const ProgressDataSchema = z.object({
  isPaid: z.boolean(),
  selectedPlanId: PlanIdSchema.nullable(),
  selectedPlanName: z.string(),
  programStartDate: z.string().nullable(),
  completedRoutines: z.array(z.object({
    routineName: z.string(),
    dayNumber: z.number(),
    completedAt: z.string(),
    bonusCompleted: z.boolean().optional(),
  })),
  completedBonuses: z.array(z.object({
    dayNumber: z.number(),
    exerciseName: z.string(),
    completedAt: z.string(),
  })),
  streak: z.number(),
  lastCompletedParisDate: z.string().nullable(),
});

export type ValidatedProgressData = z.infer<typeof ProgressDataSchema>;

// ============================================
// STORAGE KEYS
// ============================================

export const SECURE_KEYS = {
  SUBSCRIPTION_INFO: 'jaw_subscription_info',
  TRANSACTION_RECEIPT: 'jaw_transaction_receipt',
  USER_SESSION: 'jaw_user_session',
} as const;

export const STORAGE_KEYS = {
  PROGRESS: '@fitness_face_progress',
  NOTIFICATIONS: '@jaw_notifications',
} as const;

// ============================================
// HELPER FOR INPUT VALIDATION
// ============================================

export function validatePlanId(planId: unknown): planId is string {
  const result = PlanIdSchema.safeParse(planId);
  return result.success;
}

export function sanitizeString(input: string, maxLength: number = 255): string {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).trim();
}
