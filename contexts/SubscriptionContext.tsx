import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { Platform, Alert, Linking } from 'react-native';
import {
  useIAP,
  initConnection,
  endConnection,
  deepLinkToSubscriptions,
} from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  PlanId,
  allProductIds,
  getPlanById,
  getPlanByProductId,
} from '../data/plans';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export type SubscriptionStatus =
  | 'none' // Aucun abonnement
  | 'trial' // En période d'essai
  | 'active' // Abonnement actif (payé)
  | 'expired' // Abonnement expiré
  | 'cancelled'; // Abonnement annulé mais encore actif jusqu'à expiration

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
}

// Generic product type to avoid type issues
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
}

const SUBSCRIPTION_STORAGE_KEY = '@jaw_subscription_info';

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

  // Use the IAP hook
  const {
    connected,
    products,
    subscriptions,
    fetchProducts,
    requestPurchase,
    getAvailablePurchases,
    availablePurchases,
    finishTransaction,
  } = useIAP({
    onPurchaseSuccess: async (purchase) => {
      console.log('[IAP] Purchase successful:', purchase.productId);
      await handlePurchaseSuccess(purchase);
      setIsPurchasing(false);
    },
    onPurchaseError: (error) => {
      console.error('[IAP] Purchase error:', error);
      handlePurchaseError(error);
      setIsPurchasing(false);
    },
  });

  // ============================================
  // INITIALIZATION
  // ============================================

  useEffect(() => {
    const init = async () => {
      try {
        await initConnection();
        console.log('[IAP] Connection initialized');
        setIsInitialized(true);
      } catch (error) {
        console.error('[IAP] Initialization error:', error);
        setIsInitialized(true);
      }
    };

    init();

    return () => {
      endConnection();
    };
  }, []);

  // Fetch products when connected
  useEffect(() => {
    if (connected && isInitialized && allProductIds.length > 0) {
      fetchProducts({ skus: allProductIds, type: 'subs' }).catch((error) => {
        console.warn('[IAP] Error loading products:', error);
      });
    }
  }, [connected, isInitialized, fetchProducts]);

  // Update local products state from hook
  useEffect(() => {
    const allProducts = [
      ...(products || []),
      ...(subscriptions || []),
    ].map((p) => ({
      productId: (p as { productId?: string }).productId || '',
      title: (p as { title?: string }).title,
      description: (p as { description?: string }).description,
      localizedPrice: (p as { localizedPrice?: string }).localizedPrice,
      price: (p as { price?: string }).price,
      currency: (p as { currency?: string }).currency,
    }));

    if (allProducts.length > 0) {
      setIapProducts(allProducts);
    }
  }, [products, subscriptions]);

  // ============================================
  // PERSISTENCE
  // ============================================

  const loadLocalSubscription = useCallback(async (): Promise<SubscriptionInfo | null> => {
    try {
      const stored = await AsyncStorage.getItem(SUBSCRIPTION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return null;
    } catch (error) {
      console.error('[IAP] Error loading local subscription:', error);
      return null;
    }
  }, []);

  const saveLocalSubscription = useCallback(async (info: SubscriptionInfo) => {
    try {
      await AsyncStorage.setItem(SUBSCRIPTION_STORAGE_KEY, JSON.stringify(info));
    } catch (error) {
      console.error('[IAP] Error saving local subscription:', error);
    }
  }, []);

  // ============================================
  // SUPABASE SYNC
  // ============================================

  const syncToSupabase = useCallback(
    async (info: SubscriptionInfo) => {
      if (!user) return;

      try {
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            subscription_status: info.status,
            subscription_plan_id: info.planId,
            subscription_start_date: info.startDate,
            subscription_expiration_date: info.expirationDate,
            subscription_trial_end_date: info.trialEndDate,
            subscription_original_transaction_id: info.originalTransactionId,
          },
          { onConflict: 'id' }
        );
      } catch (error) {
        console.error('[IAP] Error syncing to Supabase:', error);
      }
    },
    [user]
  );

  const loadFromSupabase = useCallback(async (): Promise<SubscriptionInfo | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'subscription_status, subscription_plan_id, subscription_start_date, subscription_expiration_date, subscription_trial_end_date, subscription_original_transaction_id'
        )
        .eq('id', user.id)
        .maybeSingle();

      if (error || !data) return null;

      if (data.subscription_status && data.subscription_plan_id) {
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
        };
      }

      return null;
    } catch (error) {
      console.error('[IAP] Error loading from Supabase:', error);
      return null;
    }
  }, [user]);

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
    async (purchase: { productId: string; transactionId?: string }) => {
      const plan = getPlanByProductId(purchase.productId);
      if (!plan) {
        console.error('[IAP] Unknown product:', purchase.productId);
        return;
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
      };

      setSubscriptionInfo(newInfo);
      await saveLocalSubscription(newInfo);
      await syncToSupabase(newInfo);

      // Finish transaction
      try {
        await finishTransaction({
          purchase: purchase as Parameters<typeof finishTransaction>[0]['purchase'],
          isConsumable: false,
        });
      } catch (error) {
        console.error('[IAP] Error finishing transaction:', error);
      }
    },
    [saveLocalSubscription, syncToSupabase, finishTransaction]
  );

  const handlePurchaseError = useCallback((error: { code?: string; message?: string }) => {
    if (error.code === 'E_USER_CANCELLED' || error.message?.includes('cancelled')) {
      return;
    }

    Alert.alert(
      'Erreur de paiement',
      error.message || 'Une erreur est survenue lors du paiement. Veuillez réessayer.',
      [{ text: 'OK' }]
    );
  }, []);

  // ============================================
  // ACTIONS
  // ============================================

  const purchaseSubscription = useCallback(
    async (planId: PlanId): Promise<boolean> => {
      const plan = getPlanById(planId);
      if (!plan) {
        console.error('[IAP] Plan not found:', planId);
        return false;
      }

      setIsPurchasing(true);

      try {
        const purchaseParams =
          Platform.OS === 'ios'
            ? {
                sku: plan.iap.productId,
                andDangerouslyFinishTransactionAutomatically: false,
              }
            : {
                skus: [plan.iap.productId],
              };

        await requestPurchase(purchaseParams);
        return true;
      } catch (error) {
        console.error('[IAP] Purchase request error:', error);
        setIsPurchasing(false);
        return false;
      }
    },
    [requestPurchase]
  );

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);

    try {
      await getAvailablePurchases();

      if (!availablePurchases || availablePurchases.length === 0) {
        Alert.alert(
          'Aucun achat trouvé',
          "Aucun achat précédent n'a été trouvé pour ce compte.",
          [{ text: 'OK' }]
        );
        setIsLoading(false);
        return false;
      }

      const sortedPurchases = [...availablePurchases].sort(
        (a, b) =>
          new Date((b as { transactionDate?: string }).transactionDate || 0).getTime() -
          new Date((a as { transactionDate?: string }).transactionDate || 0).getTime()
      );

      const latestPurchase = sortedPurchases[0];
      const productId = (latestPurchase as { productId: string }).productId;
      const plan = getPlanByProductId(productId);

      if (!plan) {
        console.warn('[IAP] Unknown product in restore:', productId);
        setIsLoading(false);
        return false;
      }

      const restoredInfo: SubscriptionInfo = {
        status: 'active',
        planId: plan.id,
        productId,
        startDate:
          (latestPurchase as { transactionDate?: string }).transactionDate?.toString() ||
          new Date().toISOString(),
        expirationDate: null,
        trialEndDate: null,
        isInTrial: false,
        isCommitted: plan.iap.commitmentType === 'committed',
        canCancel: plan.iap.commitmentType !== 'committed',
        willRenew: true,
        originalTransactionId:
          (latestPurchase as { transactionId?: string }).transactionId || null,
      };

      setSubscriptionInfo(restoredInfo);
      await saveLocalSubscription(restoredInfo);
      await syncToSupabase(restoredInfo);

      Alert.alert(
        'Achats restaurés',
        `Votre abonnement "${plan.name}" a été restauré avec succès.`,
        [{ text: 'OK' }]
      );

      setIsLoading(false);
      return true;
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
  }, [
    getAvailablePurchases,
    availablePurchases,
    saveLocalSubscription,
    syncToSupabase,
  ]);

  const openSubscriptionManagement = useCallback(async () => {
    try {
      await deepLinkToSubscriptions();
    } catch {
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
  }, [isInitialized, isAuthenticated, user?.id, refreshSubscription]);

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
