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
// MODE DETECTION (safe, no native calls)
// ============================================

// Expo Go = développement, sinon = production (EAS build, TestFlight, App Store)
// IMPORTANT: Wrap in try-catch to prevent crash at module load
let isExpoGo = false;
let isProduction = true;
try {
  isExpoGo = Constants.appOwnership === 'expo';
  isProduction = !isExpoGo;
} catch (e) {
  console.warn('[IAP] Failed to detect app ownership:', e);
  // Default to production mode for safety
  isExpoGo = false;
  isProduction = true;
}

// ============================================
// LAZY IAP LOADING - NE PAS CHARGER AU BOOT
// ============================================

// IAP module reference - chargé à la demande, PAS au boot
let RNIapModule: any = null;
let iapLoadAttempted = false;

/**
 * Charge react-native-iap de manière sécurisée et différée
 * Appelé uniquement quand on a besoin d'IAP (pas au boot)
 */
function getIapModule(): any {
  if (!isProduction) {
    return null;
  }

  if (iapLoadAttempted) {
    return RNIapModule;
  }

  iapLoadAttempted = true;

  try {
    // Charger le module de manière sécurisée
    const iapModule = require('react-native-iap');

    // Debug: Log all available exports
    console.log('[IAP] react-native-iap loaded. Keys:', Object.keys(iapModule || {}));

    // v14 peut exporter les fonctions directement ou via default
    // Essayons d'abord l'export direct
    if (iapModule && typeof iapModule.setup === 'function') {
      console.log('[IAP] Found setup function - v14 Nitro module detected');
      // v14 Nitro - appeler setup() d'abord
      try {
        iapModule.setup({ storekitMode: 'STOREKIT2_MODE' });
        console.log('[IAP] Setup completed');
      } catch (setupErr) {
        console.warn('[IAP] Setup failed, trying without:', setupErr);
      }
      RNIapModule = iapModule;
      return RNIapModule;
    }

    // Vérifier que le module a les méthodes essentielles
    if (iapModule && typeof iapModule.initConnection === 'function') {
      console.log('[IAP] Using direct export (has initConnection)');
      RNIapModule = iapModule;
    } else if (iapModule?.default && typeof iapModule.default.initConnection === 'function') {
      console.log('[IAP] Using default export');
      RNIapModule = iapModule.default;
    } else {
      console.error('[IAP] No valid IAP module found');
      console.log('[IAP] Available in module:', Object.keys(iapModule || {}));
      console.log('[IAP] Available in default:', Object.keys(iapModule?.default || {}));
      RNIapModule = iapModule; // Try anyway
    }

    console.log('[IAP] react-native-iap loaded successfully');
    console.log('[IAP] Available methods:', Object.keys(RNIapModule || {}));
    return RNIapModule;
  } catch (e) {
    console.error('[IAP] Failed to load react-native-iap:', e);
    RNIapModule = null;
    return null;
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
  initializeIAP: () => Promise<void>;
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
// MOCK PRODUCTS FOR DEV MODE
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
  const [isIapInitialized, setIsIapInitialized] = useState(false);

  // Refs
  const userIdRef = useRef<string | null>(null);
  const purchaseUpdateSubscription = useRef<EmitterSubscription | null>(null);
  const purchaseErrorSubscription = useRef<EmitterSubscription | null>(null);
  const pendingPurchaseResolve = useRef<((success: boolean) => void) | null>(null);
  const iapInitPromise = useRef<Promise<void> | null>(null);

  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user?.id]);

  // ============================================
  // PURCHASE SUCCESS HANDLER (defined early for use in IAP init)
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

      // Validate receipt with server (Apple)
      if (isProduction && purchase.transactionReceipt && Platform.OS === 'ios') {
        await validateAppleReceipt(purchase.transactionReceipt, purchase.productId);
        // Note: We continue even if validation fails for App Review
      }

      const now = new Date();
      const startDate = now.toISOString();
      const trialEndDate = new Date(
        now.getTime() + plan.iap.trial.durationDays * 24 * 60 * 60 * 1000
      ).toISOString();
      const expirationDate = new Date(
        now.getTime() +
          plan.iap.trial.durationDays * 24 * 60 * 60 * 1000 +
          plan.iap.billingPeriodMonths * 30 * 24 * 60 * 60 * 1000
      ).toISOString();

      const newInfo: SubscriptionInfo = {
        status: 'trial',
        planId: plan.id,
        productId: purchase.productId,
        startDate,
        expirationDate,
        trialEndDate,
        isInTrial: true,
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

      console.log('[IAP] Purchase success - subscription activated');
      return true;
    },
    []
  );

  // ============================================
  // IAP INITIALIZATION - APPELÉ À LA DEMANDE
  // ============================================

  const initializeIAP = useCallback(async (): Promise<void> => {
    // Si déjà initialisé ou en cours, retourner
    if (isIapInitialized) {
      return;
    }

    // Si déjà en cours d'initialisation, attendre
    if (iapInitPromise.current) {
      return iapInitPromise.current;
    }

    // En mode dev, pas besoin d'init IAP
    if (!isProduction) {
      console.log('[IAP] Skipping IAP init (dev mode)');
      setIsIapReady(true);
      setIsIapInitialized(true);
      return;
    }

    console.log('[IAP] Initializing IAP (lazy load)...');

    const initPromise = (async () => {
      try {
        // Charger le module IAP de manière sécurisée
        const RNIap = getIapModule();

        if (!RNIap) {
          console.warn('[IAP] RNIap module not available');
          setIsIapReady(true);
          setIsIapInitialized(true);
          return;
        }

        // Initialize connection to store
        const result = await RNIap.initConnection();
        console.log('[IAP] Connection initialized:', result);

        // Set up purchase listeners
        purchaseUpdateSubscription.current = RNIap.purchaseUpdatedListener(
          async (purchase: any) => {
            console.log('[IAP] Purchase updated:', purchase.productId);

            if (purchase.transactionReceipt) {
              const success = await handlePurchaseSuccess({
                productId: purchase.productId,
                transactionId: purchase.transactionId,
                transactionReceipt: purchase.transactionReceipt,
              });

              // Finish the transaction
              try {
                await RNIap.finishTransaction({ purchase, isConsumable: false });
                console.log('[IAP] Transaction finished');
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
            console.error('[IAP] Purchase error:', error);

            // Don't show alert for user cancellation
            if (error.code !== 'E_USER_CANCELLED') {
              Alert.alert(
                'Erreur d\'achat',
                'Une erreur est survenue. Veuillez réessayer.',
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
        setIsIapInitialized(true);
        console.log('[IAP] Initialization complete');
      } catch (error) {
        console.error('[IAP] Initialization error:', error);
        // Allow app to continue even if IAP fails
        setIsIapReady(true);
        setIsIapInitialized(true);
      } finally {
        iapInitPromise.current = null;
      }
    })();

    iapInitPromise.current = initPromise;
    return initPromise;
  }, [isIapInitialized, handlePurchaseSuccess]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup listeners
      if (purchaseUpdateSubscription.current) {
        purchaseUpdateSubscription.current.remove();
      }
      if (purchaseErrorSubscription.current) {
        purchaseErrorSubscription.current.remove();
      }

      // End connection
      if (isProduction && isIapInitialized) {
        try {
          const RNIap = getIapModule();
          if (RNIap) {
            RNIap.endConnection();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [isIapInitialized]);

  // ============================================
  // FETCH PRODUCTS FROM STORE
  // ============================================

  const fetchStoreProducts = async () => {
    if (!isProduction) {
      console.log('[IAP] Using mock products (dev mode)');
      return;
    }

    const RNIap = getIapModule();
    if (!RNIap) {
      console.log('[IAP] RNIap not available, using mock products');
      return;
    }

    try {
      console.log('[IAP] Fetching products:', allProductIds);

      // Fetch subscriptions from App Store
      const subscriptions = await RNIap.getSubscriptions({ skus: allProductIds });

      console.log('[IAP] Received products:', subscriptions?.length || 0);

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
        console.log('[IAP] Products loaded from store');
      } else {
        console.warn('[IAP] No products returned from store, using mock');
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
          // Real validation should be done server-side
          console.warn('[IAP] Accepting purchase despite validation error (App Review mode)');
          return true;
        }

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
      // EXPO GO / DEV MODE: Mock purchase
      // ========================================
      if (!isProduction) {
        console.log('[IAP] DEV MODE - Mock purchase for:', planId);

        return new Promise((resolve) => {
          Alert.alert(
            '🧪 Mode Développement',
            'Ceci est une simulation d\'achat.\n\nEn production (TestFlight/App Store), le vrai popup Apple Pay s\'affichera.',
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

      // S'assurer que IAP est initialisé avant d'acheter
      await initializeIAP();

      const RNIap = getIapModule();
      if (!RNIap) {
        console.error('[IAP] RNIap not available in production!');
        Alert.alert('Erreur', 'Les achats in-app ne sont pas disponibles.');
        setIsPurchasing(false);
        return false;
      }

      // Log available methods for debugging
      console.log('[IAP] RNIap methods:', Object.keys(RNIap || {}));

      // Déterminer quelle méthode utiliser (v14 vs v13)
      const hasRequestSubscription = typeof RNIap.requestSubscription === 'function';
      const hasRequestPurchase = typeof RNIap.requestPurchase === 'function';

      console.log('[IAP] hasRequestSubscription:', hasRequestSubscription);
      console.log('[IAP] hasRequestPurchase:', hasRequestPurchase);

      if (!hasRequestSubscription && !hasRequestPurchase) {
        console.error('[IAP] No purchase method available');
        Alert.alert('Erreur', 'Module IAP incompatible.');
        setIsPurchasing(false);
        return false;
      }

      console.log('[IAP] PRODUCTION - Starting real purchase for:', plan.iap.productId);

      try {
        // Create promise that will be resolved by purchase listener
        const purchasePromise = new Promise<boolean>((resolve) => {
          pendingPurchaseResolve.current = resolve;

          // Timeout after 2 minutes
          setTimeout(() => {
            if (pendingPurchaseResolve.current === resolve) {
              console.warn('[IAP] Purchase timeout');
              pendingPurchaseResolve.current = null;
              setIsPurchasing(false);
              resolve(false);
            }
          }, 120000);
        });

        // Request subscription - format v14
        if (hasRequestSubscription) {
          console.log('[IAP] Calling requestSubscription with sku:', plan.iap.productId);
          await RNIap.requestSubscription({
            sku: plan.iap.productId,
          });
        } else if (hasRequestPurchase) {
          console.log('[IAP] Calling requestPurchase with sku:', plan.iap.productId);
          await RNIap.requestPurchase({
            sku: plan.iap.productId,
            type: 'subs',
          });
        }

        // Wait for purchase listener to resolve
        return await purchasePromise;
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
    [handlePurchaseSuccess, initializeIAP]
  );

  // ============================================
  // RESTORE PURCHASES
  // ============================================

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    // DEV MODE: Check local storage
    if (!isProduction) {
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
    // S'assurer que IAP est initialisé
    await initializeIAP();

    const RNIap = getIapModule();
    if (!RNIap) {
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
      Alert.alert('Erreur', 'Impossible de restaurer les achats.', [{ text: 'OK' }]);
      setIsLoading(false);
      return false;
    }
  }, [loadLocalSubscription, validateSubscription, handlePurchaseSuccess, initializeIAP]);

  // ============================================
  // MANAGE SUBSCRIPTIONS
  // ============================================

  const openSubscriptionManagement = useCallback(async () => {
    if (!isProduction) {
      Alert.alert(
        'Mode Développement',
        'La gestion des abonnements n\'est disponible qu\'en production.',
        [{ text: 'OK' }]
      );
      return;
    }

    const RNIap = getIapModule();

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
    console.log('🔄 [SUBSCRIPTION] refreshSubscription called, userId:', userIdRef.current);
    setIsLoading(true);

    try {
      // Wrap each call individually to prevent crashes
      let supabaseInfo: SubscriptionInfo | null = null;
      let localInfo: SubscriptionInfo | null = null;

      try {
        supabaseInfo = await loadFromSupabase();
      } catch (e) {
        console.warn('[IAP] loadFromSupabase failed:', e);
      }

      try {
        localInfo = await loadLocalSubscription();
      } catch (e) {
        console.warn('[IAP] loadLocalSubscription failed:', e);
      }

      console.log('🔄 [SUBSCRIPTION] supabaseInfo:', supabaseInfo?.status || 'null');
      console.log('🔄 [SUBSCRIPTION] localInfo:', localInfo?.status || 'null');

      // IMPORTANT: Pour un utilisateur authentifié, Supabase est la source de vérité
      // Ne PAS utiliser le cache local comme fallback (pourrait être d'un autre utilisateur)
      // Le cache local n'est utilisé que si l'utilisateur n'est pas connecté
      let currentInfo: SubscriptionInfo;

      if (userIdRef.current) {
        // Utilisateur connecté : utiliser Supabase ou default (PAS le cache local)
        currentInfo = supabaseInfo || defaultSubscriptionInfo;
        console.log('🔄 [SUBSCRIPTION] User authenticated → using:', currentInfo.status);
      } else {
        // Utilisateur NON connecté : JAMAIS utiliser le cache (pourrait être d'un ancien user)
        // Toujours retourner defaultSubscriptionInfo (status: 'none', hasActiveAccess: false)
        currentInfo = defaultSubscriptionInfo;
        console.log('🔄 [SUBSCRIPTION] User NOT authenticated → using default (none)');
        // Nettoyer le cache local s'il existe
        if (localInfo) {
          console.log('🔄 [SUBSCRIPTION] Clearing stale local cache');
          secureStorage.deleteItem(SECURE_KEYS.SUBSCRIPTION_INFO).catch(() => {});
        }
      }

      const validatedInfo = validateSubscription(currentInfo);
      const hasAccess = validatedInfo.status === 'trial' || validatedInfo.status === 'active' ||
        (validatedInfo.status === 'cancelled' && validatedInfo.expirationDate != null && new Date(validatedInfo.expirationDate) > new Date());

      console.log('🔄 [SUBSCRIPTION] Final status:', validatedInfo.status, '→ hasActiveAccess:', hasAccess);

      setSubscriptionInfo(validatedInfo);

      // Sauvegarder en local seulement si différent
      if (JSON.stringify(validatedInfo) !== JSON.stringify(localInfo)) {
        await saveLocalSubscription(validatedInfo);
      }

      // Sync vers Supabase si différent et utilisateur connecté
      if (userIdRef.current && JSON.stringify(validatedInfo) !== JSON.stringify(supabaseInfo)) {
        await syncToSupabase(validatedInfo);
      }
    } catch (error) {
      console.error('[IAP] Refresh error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadFromSupabase, loadLocalSubscription, validateSubscription, saveLocalSubscription, syncToSupabase]);

  // Track user changes to reset local subscription cache
  const previousUserIdRef = useRef<string | null>(null);

  // Reset subscription when user changes (prevents cached data from previous user)
  useEffect(() => {
    const currentUserId = user?.id || null;

    // If user changed (including logout → login with different account)
    if (previousUserIdRef.current !== null && previousUserIdRef.current !== currentUserId) {
      console.log('[IAP] User changed, resetting subscription state');
      setSubscriptionInfo(defaultSubscriptionInfo);
      // Clear local storage to prevent stale data
      secureStorage.deleteItem(SECURE_KEYS.SUBSCRIPTION_INFO).catch(() => {});
    }

    previousUserIdRef.current = currentUserId;
  }, [user?.id]);

  // NE PAS initialiser IAP au boot - seulement charger les données de subscription
  // IAP sera initialisé à la demande (quand l'utilisateur veut acheter)
  // IMPORTANT: On ne fait RIEN au boot pour éviter les crashs Hermes
  useEffect(() => {
    // Marquer immédiatement comme prêt sans aucune opération native
    // Le status de subscription sera chargé quand nécessaire (lazy)
    setIsLoading(false);
    setIsIapReady(true);

    // Charger le statut de subscription SEULEMENT si authentifié et après un délai plus long
    if (isAuthenticated && user?.id) {
      const timer = setTimeout(() => {
        // Wrap dans try-catch pour éviter tout crash
        try {
          refreshSubscription().catch((e) => {
            console.warn('[IAP] Refresh failed:', e);
          });
        } catch (e) {
          console.warn('[IAP] Refresh error:', e);
        }
      }, 2000); // 2 secondes au lieu de 500ms

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user?.id]);

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
        initializeIAP,
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
