import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
  useRef,
} from 'react';
import { Platform, Alert, Linking } from 'react-native';
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
// MODE DETECTION
// ============================================

const isExpoGo = Constants.appOwnership === 'expo';

// Import dynamique de react-native-iap uniquement en production
let useIAP: any = null;
let initConnection: any = null;
let endConnection: any = null;
let deepLinkToSubscriptions: any = null;
let requestSubscription: any = null;
let getAvailablePurchases: any = null;
let finishTransaction: any = null;
let purchaseUpdatedListener: any = null;
let purchaseErrorListener: any = null;

if (!isExpoGo) {
  try {
    const iap = require('react-native-iap');
    useIAP = iap.useIAP;
    initConnection = iap.initConnection;
    endConnection = iap.endConnection;
    deepLinkToSubscriptions = iap.deepLinkToSubscriptions;
    requestSubscription = iap.requestSubscription;
    getAvailablePurchases = iap.getAvailablePurchases;
    finishTransaction = iap.finishTransaction;
    purchaseUpdatedListener = iap.purchaseUpdatedListener;
    purchaseErrorListener = iap.purchaseErrorListener;
  } catch (e) {
    console.warn('[IAP] react-native-iap not available, using mock mode');
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

interface ReceiptValidationResult {
  isValid: boolean;
  expirationDate?: string;
  productId?: string;
  originalTransactionId?: string;
  error?: string;
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
// MOCK IAP HOOK FOR EXPO GO
// ============================================

function useMockIAP() {
  const [products] = useState<IAPProduct[]>(
    allProductIds.map((id) => {
      const plan = getPlanByProductId(id);
      return {
        productId: id,
        title: plan?.name || id,
        description: plan?.shortDescription || '',
        localizedPrice: plan ? `${plan.priceAmount} €` : '9,99 €',
        price: plan?.priceAmount?.replace(',', '.') || '9.99',
        currency: 'EUR',
      };
    })
  );

  return {
    connected: true,
    products,
    subscriptions: products,
    availablePurchases: [],
    fetchProducts: async () => {},
    getAvailablePurchases: async () => [],
    requestPurchase: async () => null,
    finishTransaction: async () => {},
  };
}

// ============================================
// PROVIDER
// ============================================

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo>(
    defaultSubscriptionInfo
  );
  const [iapProducts, setIapProducts] = useState<IAPProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Use ref for user ID to avoid stale closures
  const userIdRef = useRef<string | null>(null);
  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user?.id]);

  // Use real IAP or mock based on environment
  const mockIAP = useMockIAP();
  const iapHook = isExpoGo || !useIAP ? mockIAP : mockIAP;

  const {
    connected,
    products,
    subscriptions,
    fetchProducts,
    availablePurchases,
  } = iapHook;

  // ============================================
  // INITIALIZATION
  // ============================================

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      try {
        if (!isExpoGo && initConnection) {
          await initConnection();
          if (isMounted) {
            console.log('[IAP] Connection initialized (native)');
          }
        } else {
          console.log('[IAP] Running in mock mode (Expo Go)');
        }
        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('[IAP] Initialization error:', error);
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };

    init();

    return () => {
      isMounted = false;
      if (!isExpoGo && endConnection) {
        endConnection();
      }
    };
  }, []);

  // Fetch products when connected
  useEffect(() => {
    if (connected && isInitialized && allProductIds.length > 0) {
      fetchProducts().catch((error: any) => {
        console.warn('[IAP] Error loading products:', error);
      });
    }
  }, [connected, isInitialized, fetchProducts]);

  // Update local products state
  useEffect(() => {
    const allProducts = [
      ...(products || []),
      ...(subscriptions || []),
    ].map((p: any) => ({
      productId: p.productId || '',
      title: p.title,
      description: p.description,
      localizedPrice: p.localizedPrice,
      price: p.price,
      currency: p.currency,
    }));

    if (allProducts.length > 0) {
      setIapProducts(allProducts);
    }
  }, [products, subscriptions]);

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
  // RECEIPT VALIDATION (SERVER-SIDE)
  // ============================================

  const validateReceiptWithServer = useCallback(
    async (receiptData: string, productId: string): Promise<ReceiptValidationResult> => {
      try {
        // Call Supabase Edge Function for receipt validation
        const { data, error } = await supabase.functions.invoke('validate-receipt', {
          body: {
            platform: Platform.OS,
            receiptData,
            productId,
            userId: userIdRef.current,
          },
        });

        if (error) {
          console.error('[IAP] Receipt validation error:', error);
          return { isValid: false, error: error.message };
        }

        return {
          isValid: data?.isValid ?? false,
          expirationDate: data?.expirationDate,
          productId: data?.productId,
          originalTransactionId: data?.originalTransactionId,
          error: data?.error,
        };
      } catch (error) {
        console.error('[IAP] Receipt validation failed:', error);
        return { isValid: false, error: 'Validation failed' };
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
        // Validate planId before using
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
              canCancel: info.isCommitted ? false : true,
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
  // PURCHASE HANDLING
  // ============================================

  const handlePurchaseSuccess = useCallback(
    async (purchase: {
      productId: string;
      transactionId?: string;
      transactionReceipt?: string;
    }) => {
      const plan = getPlanByProductId(purchase.productId);
      if (!plan) {
        console.error('[IAP] Unknown product:', purchase.productId);
        return false;
      }

      // In production, validate receipt with server
      if (!isExpoGo && purchase.transactionReceipt) {
        const validation = await validateReceiptWithServer(
          purchase.transactionReceipt,
          purchase.productId
        );

        if (!validation.isValid) {
          console.error('[IAP] Receipt validation failed:', validation.error);
          Alert.alert(
            'Erreur de validation',
            'Impossible de valider votre achat. Veuillez réessayer ou contacter le support.',
            [{ text: 'OK' }]
          );
          return false;
        }
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

      return true;
    },
    [saveLocalSubscription, syncToSupabase, validateReceiptWithServer]
  );

  // ============================================
  // ACTIONS
  // ============================================

  const purchaseSubscription = useCallback(
    async (planId: PlanId): Promise<boolean> => {
      // Validate planId
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

      // En mode Expo Go, simuler l'achat avec avertissement
      if (isExpoGo) {
        console.log('[IAP] Mock purchase for:', planId);

        Alert.alert(
          'Mode Développement',
          'Les vrais achats ne sont disponibles que dans les builds de production. Ceci est une simulation.',
          [
            {
              text: 'Annuler',
              style: 'cancel',
              onPress: () => setIsPurchasing(false),
            },
            {
              text: 'Simuler',
              onPress: async () => {
                // Simuler un délai d'achat
                await new Promise((resolve) => setTimeout(resolve, 1500));

                // Simuler la réussite de l'achat (sans receipt car dev mode)
                const success = await handlePurchaseSuccess({
                  productId: plan.iap.productId,
                  transactionId: `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                });

                setIsPurchasing(false);

                if (success) {
                  // Return true via callback would be complex, so we just set state
                }
              },
            },
          ]
        );

        // Return false initially, the alert will handle the flow
        return false;
      }

      // En production, utiliser le vrai IAP
      try {
        if (!requestSubscription) {
          throw new Error('IAP not available');
        }

        const purchase = await requestSubscription({
          sku: plan.iap.productId,
          andDangerouslyFinishTransactionAutomaticallyIOS: false,
        });

        if (purchase) {
          const success = await handlePurchaseSuccess({
            productId: purchase.productId,
            transactionId: purchase.transactionId,
            transactionReceipt: purchase.transactionReceipt,
          });

          if (success && finishTransaction) {
            await finishTransaction({
              purchase,
              isConsumable: false,
            });
          }

          setIsPurchasing(false);
          return success;
        }

        setIsPurchasing(false);
        return false;
      } catch (error: any) {
        console.error('[IAP] Purchase request error:', error);

        // Handle user cancellation gracefully
        if (error.code === 'E_USER_CANCELLED') {
          // User cancelled, no alert needed
        } else {
          Alert.alert(
            'Erreur d\'achat',
            'Une erreur est survenue lors de l\'achat. Veuillez réessayer.',
            [{ text: 'OK' }]
          );
        }

        setIsPurchasing(false);
        return false;
      }
    },
    [handlePurchaseSuccess]
  );

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    // En mode Expo Go, chercher dans le stockage sécurisé local
    if (isExpoGo) {
      const localInfo = await loadLocalSubscription();
      if (localInfo && localInfo.status !== 'none' && localInfo.status !== 'expired') {
        const validatedInfo = validateSubscription(localInfo);
        setSubscriptionInfo(validatedInfo);
        Alert.alert(
          'Achats restaurés',
          `Votre abonnement a été restauré avec succès.`,
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return true;
      }

      Alert.alert(
        'Aucun achat trouvé',
        "Aucun achat précédent n'a été trouvé.",
        [{ text: 'OK' }]
      );
      setIsLoading(false);
      return false;
    }

    // En production
    try {
      if (!getAvailablePurchases) {
        throw new Error('IAP not available');
      }

      const purchases = await getAvailablePurchases();

      if (!purchases || purchases.length === 0) {
        Alert.alert(
          'Aucun achat trouvé',
          "Aucun achat précédent n'a été trouvé pour ce compte.",
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return false;
      }

      // Find the most recent valid subscription
      for (const purchase of purchases) {
        if (purchase.transactionReceipt) {
          const validation = await validateReceiptWithServer(
            purchase.transactionReceipt,
            purchase.productId
          );

          if (validation.isValid) {
            await handlePurchaseSuccess({
              productId: purchase.productId,
              transactionId: purchase.transactionId,
              transactionReceipt: purchase.transactionReceipt,
            });

            Alert.alert(
              'Achats restaurés',
              'Votre abonnement a été restauré avec succès.',
              [{ text: 'OK' }]
            );

            setIsLoading(false);
            return true;
          }
        }
      }

      Alert.alert(
        'Aucun abonnement actif',
        "Aucun abonnement actif n'a été trouvé.",
        [{ text: 'OK' }]
      );

      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('[IAP] Restore error:', error);
      Alert.alert(
        'Erreur de restauration',
        'Une erreur est survenue lors de la restauration des achats.',
        [{ text: 'OK' }]
      );
      setIsLoading(false);
      return false;
    }
  }, [loadLocalSubscription, validateSubscription, validateReceiptWithServer, handlePurchaseSuccess]);

  const openSubscriptionManagement = useCallback(async () => {
    if (isExpoGo) {
      Alert.alert(
        'Mode Développement',
        'La gestion des abonnements n\'est disponible que dans les builds de production.\n\nEn production, cette action ouvrira les paramètres d\'abonnement de l\'App Store ou du Play Store.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      if (deepLinkToSubscriptions) {
        await deepLinkToSubscriptions();
        return;
      }
    } catch {
      // Fallback
    }

    const url =
      Platform.OS === 'ios'
        ? 'https://apps.apple.com/account/subscriptions'
        : 'https://play.google.com/store/account/subscriptions';

    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else if (Platform.OS === 'ios') {
        await Linking.openURL('itms-apps://apps.apple.com/account/subscriptions');
      }
    } catch (error) {
      console.error('[IAP] Error opening subscription management:', error);
      Alert.alert(
        'Gérer les abonnements',
        Platform.OS === 'ios'
          ? 'Ouvrez Réglages > [Votre nom] > Abonnements pour gérer vos abonnements.'
          : 'Ouvrez le Play Store > Menu > Abonnements pour gérer vos abonnements.',
        [{ text: 'OK' }]
      );
    }
  }, []);

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
  }, [
    loadFromSupabase,
    loadLocalSubscription,
    validateSubscription,
    saveLocalSubscription,
    syncToSupabase,
  ]);

  // Load subscription on init and auth change
  useEffect(() => {
    if (isInitialized) {
      refreshSubscription();
    }
  }, [isInitialized, isAuthenticated, refreshSubscription]);

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
        isDevMode: isExpoGo,
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
