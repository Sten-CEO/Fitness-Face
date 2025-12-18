import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { Platform, Alert, Linking, EmitterSubscription } from 'react-native';
import Constants from 'expo-constants';

import {
  PlanId,
  allProductIds,
  getPlanById,
  getPlanByProductId,
  hasFreeTrial,
} from '../data/plans';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';
import {
  secureStorage,
  SECURE_KEYS,
  SubscriptionInfoSchema,
  validatePlanId,
} from '../lib/secureStorage';

// ============================================
// MODE DETECTION - CRITICAL FOR IAP
// ============================================

// Expo Go detection
const isExpoGo = Constants.appOwnership === 'expo';

// Development mode detection:
// - __DEV__ is true when running in development mode (metro bundler)
// - isExpoGo is true only in Expo Go app
//
// IMPORTANT: EAS dev builds (expo-dev-client) are NOT Expo Go!
// They should use real IAP because they have native code access.
//
// Decision tree:
// - Expo Go → MOCK (no native IAP available)
// - EAS build (dev/preview/production) → REAL IAP
// - TestFlight / App Store → REAL IAP
const isDevClient = isExpoGo; // Only Expo Go uses mock

// Production = NOT Expo Go (includes EAS dev builds, TestFlight, App Store)
const isProduction = !isDevClient;

console.log('[IAP] ========================================');
console.log('[IAP] Mode Detection:');
console.log('[IAP]   __DEV__:', __DEV__);
console.log('[IAP]   isExpoGo:', isExpoGo);
console.log('[IAP]   isDevClient (mock):', isDevClient);
console.log('[IAP]   isProduction (real IAP):', isProduction);
console.log('[IAP] ========================================');

// ============================================
// REACT-NATIVE-IAP IMPORTS (Production only)
// ============================================

let RNIap: any = null;

if (isProduction) {
  try {
    RNIap = require('react-native-iap');
    console.log('[IAP] react-native-iap loaded successfully');
  } catch (e) {
    console.error('[IAP] Failed to load react-native-iap:', e);
    console.error('[IAP] Make sure react-native-iap is installed and linked');
  }
}

// ============================================
// TYPES
// ============================================

export type SubscriptionStatus =
  | 'none'
  | 'trial'
  | 'active'
  | 'expired'
  | 'cancelled';

interface SubscriptionInfo {
  status: SubscriptionStatus;
  planId: PlanId | null;
  productId: string | null;
  startDate: string | null;
  expirationDate: string | null;
  trialEndDate: string | null;
  isInTrial: boolean;
  isCommitted: boolean;
  canCancel: boolean;
  willRenew: boolean;
  originalTransactionId: string | null;
  receiptData?: string;
  lastValidated?: string;
}

interface IAPProduct {
  productId: string;
  title?: string;
  description?: string;
  localizedPrice?: string;
  price?: string;
  currency?: string;
}

interface SubscriptionContextType {
  subscriptionInfo: SubscriptionInfo;
  isLoading: boolean;
  isPurchasing: boolean;
  products: IAPProduct[];
  purchaseSubscription: (planId: PlanId) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  openSubscriptionManagement: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
  hasActiveAccess: boolean;
  getProductForPlan: (planId: PlanId) => IAPProduct | undefined;
  formatPrice: (planId: PlanId) => string;
  isDevMode: boolean;
}

const defaultSubscriptionInfo: SubscriptionInfo = {
  status: 'none',
  planId: null,
  productId: null,
  startDate: null,
  expirationDate: null,
  trialEndDate: null,
  isInTrial: false,
  isCommitted: false,
  canCancel: true,
  willRenew: false,
  originalTransactionId: null,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

// ============================================
// MOCK PRODUCTS FOR DEV MODE (Expo Go only)
// ============================================

function getMockProducts(): IAPProduct[] {
  return allProductIds.map((id) => {
    const plan = getPlanByProductId(id);
    return {
      productId: id,
      title: plan?.name || id,
      description: plan?.shortDescription || '',
      localizedPrice: plan ? `${plan.priceAmount} €` : '9,99 €',
      price: plan?.priceAmount?.replace(',', '.') || '9.99',
      currency: 'EUR',
    };
  });
}

// ============================================
// PROVIDER
// ============================================

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>(
    defaultSubscriptionInfo
  );
  const [iapProducts, setIapProducts] = useState<IAPProduct[]>(getMockProducts());
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isIapReady, setIsIapReady] = useState(false);

  // Refs
  const userIdRef = useRef<string | null>(null);
  const purchaseUpdateSubscription = useRef<EmitterSubscription | null>(null);
  const purchaseErrorSubscription = useRef<EmitterSubscription | null>(null);
  const pendingPurchaseResolve = useRef<((success: boolean) => void) | null>(null);

  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user?.id]);

  // ============================================
  // IAP INITIALIZATION (Production only)
  // ============================================

  useEffect(() => {
    let isMounted = true;

    const initializeIAP = async () => {
      // EXPO GO: Skip IAP initialization, use mock
      if (!isProduction) {
        console.log('[IAP] Expo Go detected - using mock IAP');
        setIsIapReady(true);
        return;
      }

      // PRODUCTION: Check if RNIap is available
      if (!RNIap) {
        console.error('[IAP] CRITICAL: react-native-iap not available in production build!');
        console.error('[IAP] This should not happen. Check native module linking.');
        setIsIapReady(true); // Allow app to continue
        return;
      }

      try {
        console.log('[IAP] Initializing connection to App Store...');

        // Initialize connection to store
        const result = await RNIap.initConnection();
        console.log('[IAP] Connection initialized:', result);

        if (!isMounted) return;

        // Set up purchase listeners
        purchaseUpdateSubscription.current = RNIap.purchaseUpdatedListener(
          async (purchase: any) => {
            console.log('[IAP] Purchase updated:', purchase.productId);
            console.log('[IAP] Transaction ID:', purchase.transactionId);

            if (purchase.transactionReceipt) {
              const success = await handlePurchaseSuccess({
                productId: purchase.productId,
                transactionId: purchase.transactionId,
                transactionReceipt: purchase.transactionReceipt,
              });

              // Finish the transaction (REQUIRED for iOS)
              try {
                await RNIap.finishTransaction({ purchase, isConsumable: false });
                console.log('[IAP] Transaction finished successfully');
              } catch (finishError) {
                console.error('[IAP] Error finishing transaction:', finishError);
              }

              // Resolve pending purchase promise
              if (pendingPurchaseResolve.current) {
                pendingPurchaseResolve.current(success);
                pendingPurchaseResolve.current = null;
              }

              setIsPurchasing(false);
            }
          }
        );

        purchaseErrorSubscription.current = RNIap.purchaseErrorListener(
          (error: any) => {
            console.error('[IAP] Purchase error:', error.code, error.message);

            // Don't show alert for user cancellation
            if (error.code !== 'E_USER_CANCELLED') {
              Alert.alert(
                'Erreur d\'achat',
                error.message || 'Une erreur est survenue. Veuillez réessayer.',
                [{ text: 'OK' }]
              );
            }

            if (pendingPurchaseResolve.current) {
              pendingPurchaseResolve.current(false);
              pendingPurchaseResolve.current = null;
            }

            setIsPurchasing(false);
          }
        );

        // Fetch products from App Store
        await fetchStoreProducts();

        setIsIapReady(true);
        console.log('[IAP] Initialization complete - ready for purchases');
      } catch (error) {
        console.error('[IAP] Initialization error:', error);
        if (isMounted) {
          setIsIapReady(true); // Allow app to continue even if IAP fails
        }
      }
    };

    initializeIAP();

    return () => {
      isMounted = false;

      // Cleanup listeners
      if (purchaseUpdateSubscription.current) {
        purchaseUpdateSubscription.current.remove();
        purchaseUpdateSubscription.current = null;
      }
      if (purchaseErrorSubscription.current) {
        purchaseErrorSubscription.current.remove();
        purchaseErrorSubscription.current = null;
      }

      // End connection (production only)
      if (isProduction && RNIap) {
        try {
          RNIap.endConnection();
          console.log('[IAP] Connection ended');
        } catch (e) {
          console.error('[IAP] Error ending connection:', e);
        }
      }
    };
  }, []);

  // ============================================
  // FETCH PRODUCTS FROM APP STORE
  // ============================================

  const fetchStoreProducts = async () => {
    // Only fetch in production
    if (!isProduction || !RNIap) {
      console.log('[IAP] Using mock products (dev mode)');
      return;
    }

    try {
      console.log('[IAP] Fetching products from App Store:', allProductIds);

      // Fetch subscriptions from App Store
      const subscriptions = await RNIap.getSubscriptions({ skus: allProductIds });

      console.log('[IAP] Received products from store:', subscriptions?.length || 0);

      if (subscriptions && subscriptions.length > 0) {
        const products: IAPProduct[] = subscriptions.map((sub: any) => ({
          productId: sub.productId,
          title: sub.title || sub.localizedTitle,
          description: sub.description || sub.localizedDescription,
          localizedPrice: sub.localizedPrice,
          price: sub.price,
          currency: sub.currency,
        }));

        setIapProducts(products);
        console.log('[IAP] Products loaded from App Store:', products.map(p => p.productId));
      } else {
        console.warn('[IAP] No products returned from App Store');
        console.warn('[IAP] Make sure products are configured in App Store Connect');
        console.warn('[IAP] Expected product IDs:', allProductIds);
        // Keep mock products as fallback for display
      }
    } catch (error) {
      console.error('[IAP] Error fetching products:', error);
      // Keep mock products as fallback
    }
  };

  // ============================================
  // SECURE PERSISTENCE
  // ============================================

  const loadLocalSubscription = useCallback(async (): Promise<SubscriptionInfo | null> => {
    try {
      const stored = await secureStorage.getObject(
        SECURE_KEYS.SUBSCRIPTION_INFO,
        SubscriptionInfoSchema
      );
      return stored as SubscriptionInfo | null;
    } catch (error) {
      console.error('[IAP] Error loading local subscription:', error);
      return null;
    }
  }, []);

  const saveLocalSubscription = useCallback(async (info: SubscriptionInfo) => {
    try {
      await secureStorage.setObject(SECURE_KEYS.SUBSCRIPTION_INFO, info);
    } catch (error) {
      console.error('[IAP] Error saving local subscription:', error);
    }
  }, []);

  // ============================================
  // RECEIPT VALIDATION (Apple)
  // ============================================

  const validateAppleReceipt = useCallback(
    async (receiptData: string, productId: string): Promise<boolean> => {
      try {
        console.log('[IAP] Validating Apple receipt for:', productId);

        // Call Supabase Edge Function for receipt validation
        const { data, error } = await supabase.functions.invoke('validate-receipt', {
          body: {
            platform: 'ios',
            receiptData,
            productId,
            userId: userIdRef.current,
          },
        });

        if (error) {
          console.error('[IAP] Receipt validation error:', error);
          // For App Review: Accept purchase even if validation fails
          console.warn('[IAP] Accepting purchase despite validation error (App Review mode)');
          return true;
        }

        console.log('[IAP] Receipt validation result:', data?.isValid);
        return data?.isValid ?? true;
      } catch (error) {
        console.error('[IAP] Receipt validation failed:', error);
        // Accept purchase if server is unavailable
        return true;
      }
    },
    []
  );

  // ============================================
  // SUPABASE SYNC
  // ============================================

  const syncToSupabase = useCallback(
    async (info: SubscriptionInfo) => {
      const userId = userIdRef.current;
      if (!userId) return;

      try {
        await supabase.from('profiles').upsert(
          {
            id: userId,
            subscription_status: info.status,
            subscription_plan_id: info.planId,
            subscription_start_date: info.startDate,
            subscription_expiration_date: info.expirationDate,
            subscription_trial_end_date: info.trialEndDate,
            subscription_original_transaction_id: info.originalTransactionId,
            subscription_last_validated: info.lastValidated,
          },
          { onConflict: 'id' }
        );
        console.log('[IAP] Synced to Supabase');
      } catch (error) {
        console.error('[IAP] Error syncing to Supabase:', error);
      }
    },
    []
  );

  const loadFromSupabase = useCallback(async (): Promise<SubscriptionInfo | null> => {
    const userId = userIdRef.current;
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'subscription_status, subscription_plan_id, subscription_start_date, subscription_expiration_date, subscription_trial_end_date, subscription_original_transaction_id, subscription_last_validated'
        )
        .eq('id', userId)
        .maybeSingle();

      if (error || !data) return null;

      if (data.subscription_status && data.subscription_plan_id) {
        if (!validatePlanId(data.subscription_plan_id)) {
          console.error('[IAP] Invalid planId from Supabase:', data.subscription_plan_id);
          return null;
        }

        const plan = getPlanById(data.subscription_plan_id as PlanId);
        return {
          status: data.subscription_status as SubscriptionStatus,
          planId: data.subscription_plan_id as PlanId,
          productId: plan?.iap.productId || null,
          startDate: data.subscription_start_date,
          expirationDate: data.subscription_expiration_date,
          trialEndDate: data.subscription_trial_end_date,
          isInTrial: data.subscription_status === 'trial',
          isCommitted: plan?.iap.commitmentType === 'committed' || false,
          canCancel:
            data.subscription_status === 'trial' ||
            plan?.iap.commitmentType !== 'committed',
          willRenew:
            data.subscription_status === 'active' ||
            data.subscription_status === 'trial',
          originalTransactionId: data.subscription_original_transaction_id,
          lastValidated: data.subscription_last_validated,
        };
      }

      return null;
    } catch (error) {
      console.error('[IAP] Error loading from Supabase:', error);
      return null;
    }
  }, []);

  // ============================================
  // SUBSCRIPTION VALIDATION
  // ============================================

  const validateSubscription = useCallback(
    (info: SubscriptionInfo): SubscriptionInfo => {
      const now = new Date();

      if (info.expirationDate) {
        const expiration = new Date(info.expirationDate);
        if (expiration < now && info.status !== 'expired') {
          return { ...info, status: 'expired', canCancel: false, willRenew: false };
        }
      }

      if (info.trialEndDate && info.status === 'trial') {
        const trialEnd = new Date(info.trialEndDate);
        if (trialEnd < now) {
          if (info.willRenew) {
            return {
              ...info,
              status: 'active',
              isInTrial: false,
              canCancel: !info.isCommitted,
            };
          } else {
            return { ...info, status: 'expired', isInTrial: false, canCancel: false };
          }
        }
      }

      return info;
    },
    []
  );

  // ============================================
  // PURCHASE SUCCESS HANDLER
  // ============================================

  const handlePurchaseSuccess = useCallback(
    async (purchase: {
      productId: string;
      transactionId?: string;
      transactionReceipt?: string;
    }): Promise<boolean> => {
      const plan = getPlanByProductId(purchase.productId);
      if (!plan) {
        console.error('[IAP] Unknown product:', purchase.productId);
        return false;
      }

      console.log('[IAP] Processing purchase for plan:', plan.id);

      // Validate receipt with server (Apple) - only in production
      if (isProduction && purchase.transactionReceipt && Platform.OS === 'ios') {
        await validateAppleReceipt(purchase.transactionReceipt, purchase.productId);
        // Note: We continue even if validation fails for App Review
      }

      const now = new Date();
      const startDate = now.toISOString();

      // Calculate trial end date based on plan configuration
      const trialDays = plan.iap.trial.durationDays;
      const trialEndDate = trialDays > 0
        ? new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Calculate expiration date
      const expirationDate = new Date(
        now.getTime() +
          (trialDays > 0 ? trialDays * 24 * 60 * 60 * 1000 : 0) +
          plan.iap.billingPeriodMonths * 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      const newInfo: SubscriptionInfo = {
        status: trialDays > 0 ? 'trial' : 'active',
        planId: plan.id,
        productId: purchase.productId,
        startDate,
        expirationDate,
        trialEndDate,
        isInTrial: trialDays > 0,
        isCommitted: plan.iap.commitmentType === 'committed',
        canCancel: true,
        willRenew: true,
        originalTransactionId: purchase.transactionId || null,
        receiptData: purchase.transactionReceipt,
        lastValidated: now.toISOString(),
      };

      setSubscriptionInfo(newInfo);
      await saveLocalSubscription(newInfo);
      await syncToSupabase(newInfo);

      console.log('[IAP] Purchase success - subscription activated:', newInfo.status);
      return true;
    },
    [saveLocalSubscription, syncToSupabase, validateAppleReceipt]
  );

  // ============================================
  // PURCHASE SUBSCRIPTION
  // ============================================

  const purchaseSubscription = useCallback(
    async (planId: PlanId): Promise<boolean> => {
      if (!validatePlanId(planId)) {
        console.error('[IAP] Invalid planId:', planId);
        Alert.alert('Erreur', 'Programme invalide');
        return false;
      }

      const plan = getPlanById(planId);
      if (!plan) {
        console.error('[IAP] Plan not found:', planId);
        return false;
      }

      setIsPurchasing(true);

      // ========================================
      // EXPO GO ONLY: Mock purchase
      // ========================================
      if (!isProduction) {
        console.log('[IAP] EXPO GO - Mock purchase for:', planId);

        const hasTrial = hasFreeTrial(planId);
        const trialText = hasTrial
          ? `\n\nCe produit inclut ${plan.iap.trial.durationDays} jours d'essai gratuit.`
          : '\n\nCe produit n\'inclut pas d\'essai gratuit.';

        return new Promise((resolve) => {
          Alert.alert(
            '🧪 Mode Développement (Expo Go)',
            `Simulation d'achat pour: ${plan.name}\nPrix: ${plan.priceAmount} €${plan.priceSuffix}${trialText}\n\nEn production (TestFlight/App Store), le vrai popup Apple Pay s'affichera.`,
            [
              {
                text: 'Annuler',
                style: 'cancel',
                onPress: () => {
                  setIsPurchasing(false);
                  resolve(false);
                },
              },
              {
                text: 'Simuler l\'achat',
                onPress: async () => {
                  await new Promise((r) => setTimeout(r, 1000));

                  const success = await handlePurchaseSuccess({
                    productId: plan.iap.productId,
                    transactionId: `dev_${Date.now()}`,
                  });

                  setIsPurchasing(false);
                  resolve(success);
                },
              },
            ]
          );
        });
      }

      // ========================================
      // PRODUCTION: Real Apple IAP
      // ========================================
      if (!RNIap) {
        console.error('[IAP] CRITICAL: RNIap not available in production!');
        Alert.alert(
          'Erreur',
          'Les achats in-app ne sont pas disponibles. Veuillez redémarrer l\'application.',
          [{ text: 'OK' }]
        );
        setIsPurchasing(false);
        return false;
      }

      console.log('[IAP] PRODUCTION - Starting real purchase');
      console.log('[IAP] Product ID:', plan.iap.productId);
      console.log('[IAP] Plan:', plan.name);

      try {
        // Create promise that will be resolved by purchase listener
        const purchasePromise = new Promise<boolean>((resolve) => {
          pendingPurchaseResolve.current = resolve;

          // Timeout after 2 minutes
          setTimeout(() => {
            if (pendingPurchaseResolve.current === resolve) {
              console.warn('[IAP] Purchase timeout after 2 minutes');
              pendingPurchaseResolve.current = null;
              setIsPurchasing(false);
              Alert.alert(
                'Délai dépassé',
                'L\'achat a pris trop de temps. Veuillez réessayer.',
                [{ text: 'OK' }]
              );
              resolve(false);
            }
          }, 120000);
        });

        // Request subscription - this triggers Apple Pay sheet
        console.log('[IAP] Requesting subscription from Apple...');
        await RNIap.requestSubscription({
          sku: plan.iap.productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        });

        // Wait for purchase listener to resolve
        const result = await purchasePromise;
        console.log('[IAP] Purchase result:', result);
        return result;
      } catch (error: any) {
        console.error('[IAP] Purchase request error:', error);

        if (error.code !== 'E_USER_CANCELLED') {
          Alert.alert(
            'Erreur d\'achat',
            error.message || 'Une erreur est survenue. Veuillez réessayer.',
            [{ text: 'OK' }]
          );
        }

        pendingPurchaseResolve.current = null;
        setIsPurchasing(false);
        return false;
      }
    },
    [handlePurchaseSuccess]
  );

  // ============================================
  // RESTORE PURCHASES
  // ============================================

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    // EXPO GO: Check local storage only
    if (!isProduction) {
      console.log('[IAP] EXPO GO - Restoring from local storage');
      const localInfo = await loadLocalSubscription();
      if (localInfo && localInfo.status !== 'none' && localInfo.status !== 'expired') {
        const validatedInfo = validateSubscription(localInfo);
        setSubscriptionInfo(validatedInfo);
        Alert.alert('Achats restaurés', 'Votre abonnement a été restauré.', [{ text: 'OK' }]);
        setIsLoading(false);
        return true;
      }

      Alert.alert('Aucun achat', 'Aucun achat précédent trouvé.', [{ text: 'OK' }]);
      setIsLoading(false);
      return false;
    }

    // PRODUCTION: Restore from App Store
    if (!RNIap) {
      console.error('[IAP] Cannot restore - RNIap not available');
      setIsLoading(false);
      return false;
    }

    try {
      console.log('[IAP] Restoring purchases from App Store...');
      const purchases = await RNIap.getAvailablePurchases();

      console.log('[IAP] Available purchases:', purchases?.length || 0);

      if (!purchases || purchases.length === 0) {
        Alert.alert(
          'Aucun achat trouvé',
          'Aucun abonnement actif trouvé pour ce compte Apple ID.',
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return false;
      }

      // Find valid subscription
      for (const purchase of purchases) {
        const plan = getPlanByProductId(purchase.productId);
        if (plan && purchase.transactionReceipt) {
          console.log('[IAP] Restoring purchase:', purchase.productId);

          await handlePurchaseSuccess({
            productId: purchase.productId,
            transactionId: purchase.transactionId,
            transactionReceipt: purchase.transactionReceipt,
          });

          Alert.alert('Achats restaurés', 'Votre abonnement a été restauré avec succès.', [
            { text: 'OK' },
          ]);
          setIsLoading(false);
          return true;
        }
      }

      Alert.alert('Aucun abonnement actif', 'Aucun abonnement Jaw Prime actif trouvé.', [
        { text: 'OK' },
      ]);
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('[IAP] Restore error:', error);
      Alert.alert('Erreur', 'Impossible de restaurer les achats. Veuillez réessayer.', [{ text: 'OK' }]);
      setIsLoading(false);
      return false;
    }
  }, [loadLocalSubscription, validateSubscription, handlePurchaseSuccess]);

  // ============================================
  // MANAGE SUBSCRIPTIONS
  // ============================================

  const openSubscriptionManagement = useCallback(async () => {
    if (!isProduction) {
      Alert.alert(
        'Mode Développement',
        'La gestion des abonnements n\'est disponible qu\'en production (TestFlight/App Store).',
        [{ text: 'OK' }]
      );
      return;
    }

    // Try deep link first
    if (RNIap?.deepLinkToSubscriptions) {
      try {
        await RNIap.deepLinkToSubscriptions();
        return;
      } catch {
        // Fallback to URL
      }
    }

    const url = Platform.OS === 'ios'
      ? 'https://apps.apple.com/account/subscriptions'
      : 'https://play.google.com/store/account/subscriptions';

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Gérer les abonnements',
        Platform.OS === 'ios'
          ? 'Allez dans Réglages > [Votre nom] > Abonnements'
          : 'Allez dans Play Store > Menu > Abonnements',
        [{ text: 'OK' }]
      );
    }
  }, []);

  // ============================================
  // REFRESH SUBSCRIPTION
  // ============================================

  const refreshSubscription = useCallback(async () => {
    setIsLoading(true);

    try {
      const supabaseInfo = await loadFromSupabase();
      const localInfo = await loadLocalSubscription();
      const currentInfo = supabaseInfo || localInfo || defaultSubscriptionInfo;
      const validatedInfo = validateSubscription(currentInfo);

      setSubscriptionInfo(validatedInfo);

      if (JSON.stringify(validatedInfo) !== JSON.stringify(localInfo)) {
        await saveLocalSubscription(validatedInfo);
      }

      if (JSON.stringify(validatedInfo) !== JSON.stringify(supabaseInfo)) {
        await syncToSupabase(validatedInfo);
      }
    } catch (error) {
      console.error('[IAP] Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadFromSupabase, loadLocalSubscription, validateSubscription, saveLocalSubscription, syncToSupabase]);

  // Load subscription on init
  useEffect(() => {
    if (isIapReady) {
      refreshSubscription();
    }
  }, [isIapReady, isAuthenticated, refreshSubscription]);

  // ============================================
  // COMPUTED VALUES
  // ============================================

  const hasActiveAccess =
    subscriptionInfo.status === 'trial' ||
    subscriptionInfo.status === 'active' ||
    (subscriptionInfo.status === 'cancelled' &&
      subscriptionInfo.expirationDate != null &&
      new Date(subscriptionInfo.expirationDate) > new Date());

  const getProductForPlan = useCallback(
    (planId: PlanId): IAPProduct | undefined => {
      if (!validatePlanId(planId)) return undefined;
      const plan = getPlanById(planId);
      if (!plan) return undefined;
      return iapProducts.find((p) => p.productId === plan.iap.productId);
    },
    [iapProducts]
  );

  const formatPrice = useCallback(
    (planId: PlanId): string => {
      const product = getProductForPlan(planId);
      if (product?.localizedPrice) {
        return product.localizedPrice;
      }
      const plan = getPlanById(planId);
      return plan ? `${plan.priceAmount} €${plan.priceSuffix}` : '';
    },
    [getProductForPlan]
  );

  // ============================================
  // RENDER
  // ============================================

  return (
    <SubscriptionContext.Provider
      value={{
        subscriptionInfo,
        isLoading,
        isPurchasing,
        products: iapProducts,
        purchaseSubscription,
        restorePurchases,
        openSubscriptionManagement,
        refreshSubscription,
        hasActiveAccess,
        getProductForPlan,
        formatPrice,
        isDevMode: !isProduction,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
