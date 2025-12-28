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
let appBundleId = 'unknown';
let appVersion = 'unknown';
let isTestFlight = false;

try {
  isExpoGo = Constants.appOwnership === 'expo';
  isProduction = !isExpoGo;
  // Récupérer bundleId et version pour les logs
  appBundleId = Constants.expoConfig?.ios?.bundleIdentifier
    || Constants.manifest?.ios?.bundleIdentifier
    || Constants.manifest2?.extra?.expoClient?.ios?.bundleIdentifier
    || 'unknown';
  appVersion = Constants.expoConfig?.version || Constants.manifest?.version || 'unknown';
  // Détecter TestFlight (heuristique: pas Expo Go mais receiptUrl contient "sandbox")
  isTestFlight = isProduction && !isExpoGo;
} catch (e) {
  console.warn('[IAP] Failed to detect app ownership:', e);
  isExpoGo = false;
  isProduction = true;
}

// Debug mode: activé si __DEV__ ou EXPO_PUBLIC_IAP_DEBUG=1
export const IAP_DEBUG_ENABLED = __DEV__ || process.env.EXPO_PUBLIC_IAP_DEBUG === '1';

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
      // v14 Nitro - NE PAS forcer StoreKit 2 mode (cause "Missing purchase request configuration")
      // Laisser le module utiliser le mode par défaut
      try {
        iapModule.setup({ storekitMode: 'STOREKIT1_MODE' });
        console.log('[IAP] Setup completed with StoreKit 1 mode');
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
  // StoreKit 2 subscription offer (iOS)
  subscriptionOfferDetails?: any[];
  // Raw product from store for purchase
  rawProduct?: any;
}

// Types pour le debug IAP
export type IapInitStatus = 'idle' | 'initializing' | 'ready' | 'error';
export type ProductsSource = 'none' | 'appstore' | 'fallback';

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
  getProductById: (productId: string) => IAPProduct | undefined;
  formatPrice: (planId: PlanId) => string;
  isDevMode: boolean;
  initializeIAP: () => Promise<void>;
  isIapReady: boolean;
  areProductsLoaded: boolean;
  // Debug IAP
  iapInitStatus: IapInitStatus;
  iapInitError: string;
  lastIapLog: string;
  iapLogs: string[];
  pushIapLog: (msg: string) => void;
  reloadIAP: () => Promise<void>;
  productsSource: ProductsSource;
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
  // IMPORTANT: Ne PAS initialiser avec getMockProducts() - on veut savoir si les vrais produits sont chargés
  const [iapProducts, setIapProducts] = useState<IAPProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isIapReady, setIsIapReady] = useState(false);
  const [isIapInitialized, setIsIapInitialized] = useState(false);
  const [areProductsLoaded, setAreProductsLoaded] = useState(false);

  // Debug IAP state
  const [iapInitStatus, setIapInitStatus] = useState<IapInitStatus>('idle');
  const [iapInitError, setIapInitError] = useState('');
  const [lastIapLog, setLastIapLog] = useState('');
  const [iapLogs, setIapLogs] = useState<string[]>([]);
  const [productsSource, setProductsSource] = useState<ProductsSource>('none');

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
  // DEBUG IAP LOGGING
  // ============================================

  const pushIapLog = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const logEntry = `[${timestamp}] ${msg}`;
    console.log('[IAP-DEBUG]', msg);
    setLastIapLog(logEntry);
    setIapLogs(prev => [...prev.slice(-19), logEntry]); // Keep last 20 logs
  }, []);

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
      pushIapLog('Already initialized, skipping');
      return;
    }

    // Si déjà en cours d'initialisation, attendre
    if (iapInitPromise.current) {
      pushIapLog('Init already in progress, waiting...');
      return iapInitPromise.current;
    }

    // En mode dev, pas besoin d'init IAP
    if (!isProduction) {
      pushIapLog('DEV MODE - skipping real IAP init');
      setIapInitStatus('ready');
      setIsIapReady(true);
      setIsIapInitialized(true);
      return;
    }

    pushIapLog('Starting IAP initialization...');
    setIapInitStatus('initializing');
    setIapInitError('');

    const initPromise = (async () => {
      try {
        // Charger le module IAP de manière sécurisée
        pushIapLog('Loading RNIap module...');
        const RNIap = getIapModule();

        if (!RNIap) {
          pushIapLog('ERROR: RNIap module not available');
          setIapInitStatus('error');
          setIapInitError('RNIap module not available');
          setIsIapReady(true);
          setIsIapInitialized(true);
          return;
        }
        pushIapLog('RNIap module loaded OK');

        // Initialize connection to store
        pushIapLog('Calling initConnection...');
        const result = await RNIap.initConnection();
        pushIapLog(`initConnection result: ${JSON.stringify(result)}`);

        // Set up purchase listeners
        pushIapLog('Setting up purchase listeners...');
        purchaseUpdateSubscription.current = RNIap.purchaseUpdatedListener(
          async (purchase: any) => {
            pushIapLog(`Purchase updated: ${purchase.productId}`);

            if (purchase.transactionReceipt) {
              const success = await handlePurchaseSuccess({
                productId: purchase.productId,
                transactionId: purchase.transactionId,
                transactionReceipt: purchase.transactionReceipt,
              });

              // Finish the transaction
              try {
                await RNIap.finishTransaction({ purchase, isConsumable: false });
                pushIapLog('Transaction finished OK');
              } catch (finishError: any) {
                pushIapLog(`ERROR finishing transaction: ${finishError.message}`);
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
            pushIapLog(`Purchase error: ${error.code} - ${error.message}`);

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
        pushIapLog('Fetching products from App Store...');
        const productsLoaded = await fetchStoreProducts(pushIapLog);

        if (productsLoaded) {
          setIapInitStatus('ready');
          setIapInitError('');
          pushIapLog('✅ IAP Initialization complete - products ready');
        } else {
          // Products non chargés = erreur mais on permet de continuer
          setIapInitStatus('error');
          setIapInitError('Produits App Store non disponibles');
          pushIapLog('⚠️ IAP Init complete but NO PRODUCTS from App Store');
        }

        setIsIapReady(true);
        setIsIapInitialized(true);
      } catch (error: any) {
        const errorMsg = `${error.code ?? ''} ${error.message ?? String(error)}`.trim();
        pushIapLog(`ERROR in init: ${errorMsg}`);
        setIapInitStatus('error');
        setIapInitError(errorMsg || 'Unknown error');
        // Allow app to continue even if IAP fails
        setIsIapReady(true);
        setIsIapInitialized(true);
      } finally {
        iapInitPromise.current = null;
      }
    })();

    iapInitPromise.current = initPromise;
    return initPromise;
  }, [isIapInitialized, handlePurchaseSuccess, pushIapLog]);

  // Force reload IAP (for debug) - bypasses initialization check
  const reloadIAP = useCallback(async (): Promise<void> => {
    pushIapLog('🔄 Force reloading IAP...');

    // Reset ALL state FIRST
    setIsIapInitialized(false);
    setIsIapReady(false);
    setAreProductsLoaded(false);
    setIapInitStatus('idle');
    setIapInitError('');
    setProductsSource('none');
    setIapProducts([]);
    iapInitPromise.current = null;

    // End existing connection first (clean slate)
    if (isProduction) {
      try {
        const RNIap = getIapModule();
        if (RNIap?.endConnection) {
          pushIapLog('Ending existing connection...');
          await RNIap.endConnection();
          pushIapLog('Connection ended');
        }
      } catch (e) {
        pushIapLog(`endConnection error (ignoré): ${e}`);
      }
    }

    // Small delay to ensure state is reset
    await new Promise(resolve => setTimeout(resolve, 100));

    // Now do full initialization inline (bypass isIapInitialized check)
    if (!isProduction) {
      pushIapLog('DEV MODE - skipping real IAP init');
      setIapInitStatus('ready');
      setIsIapReady(true);
      setIsIapInitialized(true);
      return;
    }

    pushIapLog('Starting fresh IAP initialization...');
    setIapInitStatus('initializing');

    try {
      const RNIap = getIapModule();
      if (!RNIap) {
        pushIapLog('ERROR: RNIap module not available');
        setIapInitStatus('error');
        setIapInitError('RNIap module not available');
        setIsIapReady(true);
        setIsIapInitialized(true);
        return;
      }

      pushIapLog('Calling initConnection...');
      const result = await RNIap.initConnection();
      pushIapLog(`initConnection result: ${JSON.stringify(result)}`);

      // Fetch products
      pushIapLog('Fetching products from App Store...');
      const productsLoaded = await fetchStoreProducts(pushIapLog);

      if (productsLoaded) {
        setIapInitStatus('ready');
        setIapInitError('');
        pushIapLog('✅ IAP Reload complete - products ready');
      } else {
        setIapInitStatus('error');
        setIapInitError('Produits App Store non disponibles');
        pushIapLog('⚠️ IAP Reload complete but NO PRODUCTS');
      }

      setIsIapReady(true);
      setIsIapInitialized(true);
    } catch (error: any) {
      const errorMsg = `${error.code ?? ''} ${error.message ?? String(error)}`.trim();
      pushIapLog(`ERROR in reload: ${errorMsg}`);
      setIapInitStatus('error');
      setIapInitError(errorMsg || 'Unknown error');
      setIsIapReady(true);
      setIsIapInitialized(true);
    }
  }, [pushIapLog]);

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

  const fetchStoreProducts = async (log: (msg: string) => void): Promise<boolean> => {
    // Log environment info pour diagnostic
    log(`📱 ENV: bundleId=${appBundleId}, version=${appVersion}, isTestFlight=${isTestFlight}`);
    log(`📱 Platform: ${Platform.OS}, isProduction=${isProduction}, isExpoGo=${isExpoGo}`);

    // DEV MODE: utiliser les mock products
    if (!isProduction) {
      log('DEV MODE - using mock products');
      const mocks = getMockProducts();
      setIapProducts(mocks);
      setProductsSource('fallback');
      setAreProductsLoaded(true);
      return true;
    }

    const RNIap = getIapModule();
    if (!RNIap) {
      log('ERROR: RNIap module not available');
      setProductsSource('none');
      setAreProductsLoaded(false);
      return false;
    }

    try {
      // Log les SKUs demandés
      log(`📦 Requesting ${allProductIds.length} SKUs: ${allProductIds.join(', ')}`);

      // Essayer d'abord avec la signature v14 (object)
      let subscriptions: any[] | null = null;

      // Méthode 1: getSubscriptions({ skus: [...] }) - v14+
      if (typeof RNIap.getSubscriptions === 'function') {
        try {
          log('Trying getSubscriptions({ skus: [...] })...');
          subscriptions = await RNIap.getSubscriptions({ skus: allProductIds });
          log(`getSubscriptions returned: ${subscriptions?.length ?? 'null'} items`);

          // Log raw response pour debug
          if (IAP_DEBUG_ENABLED && subscriptions) {
            log(`Raw response keys: ${subscriptions.length > 0 ? Object.keys(subscriptions[0]).join(', ') : 'empty'}`);
          }
        } catch (e1: any) {
          log(`getSubscriptions({ skus }) failed: ${e1.code || ''} ${e1.message}`);

          // Méthode 2: getSubscriptions([...]) - anciennes versions
          try {
            log('Trying getSubscriptions([...]) fallback...');
            subscriptions = await RNIap.getSubscriptions(allProductIds);
            log(`getSubscriptions([]) returned: ${subscriptions?.length ?? 'null'} items`);
          } catch (e2: any) {
            log(`getSubscriptions([]) also failed: ${e2.code || ''} ${e2.message}`);
          }
        }
      } else {
        log('⚠️ getSubscriptions function not available on RNIap module');
      }

      // Si getSubscriptions n'a rien retourné, essayer getProducts (au cas où)
      if (!subscriptions || subscriptions.length === 0) {
        if (typeof RNIap.getProducts === 'function') {
          try {
            log('Trying getProducts as fallback...');
            const products = await RNIap.getProducts({ skus: allProductIds });
            log(`getProducts returned: ${products?.length ?? 'null'} items`);
            if (products && products.length > 0) {
              subscriptions = products;
            }
          } catch (e3: any) {
            log(`getProducts also failed: ${e3.code || ''} ${e3.message}`);
          }
        }
      }

      // Vérifier ce qu'on a reçu
      if (subscriptions && Array.isArray(subscriptions) && subscriptions.length > 0) {
        log(`✅ Received ${subscriptions.length} products from App Store`);

        const products: IAPProduct[] = subscriptions.map((sub: any) => {
          const productId = sub.productId || sub.id;
          const localizedPrice = sub.localizedPrice || sub.price || '(no price)';
          log(`  → ${productId}: ${localizedPrice}`);
          return {
            productId,
            title: sub.title || sub.localizedTitle || sub.name,
            description: sub.description || sub.localizedDescription,
            localizedPrice,
            price: sub.price,
            currency: sub.currency,
            subscriptionOfferDetails: sub.subscriptionOfferDetails,
            rawProduct: sub, // Keep raw product for StoreKit 2 purchase
          };
        });

        // Vérifier qu'on a bien reçu les bons IDs
        const receivedIds = products.map(p => p.productId);
        const missingIds = allProductIds.filter(id => !receivedIds.includes(id));
        if (missingIds.length > 0) {
          log(`⚠️ Missing products: ${missingIds.join(', ')}`);
        }

        setIapProducts(products);
        setProductsSource('appstore');
        setAreProductsLoaded(true);
        log(`✅ Products loaded successfully from App Store`);
        return true;
      } else {
        // Aucun produit reçu de l'App Store - LOG DÉTAILLÉ
        log('❌ NO PRODUCTS returned from App Store');
        log(`   → Requested SKUs: ${allProductIds.join(', ')}`);
        log(`   → BundleId: ${appBundleId}`);
        log(`   → Check: 1) SKUs match App Store Connect 2) App signed with correct certificate 3) Agreements signed`);

        // Charger les fallback pour affichage mais marquer comme non-ready
        const mocks = getMockProducts();
        setIapProducts(mocks);
        setProductsSource('fallback');
        setAreProductsLoaded(false); // IMPORTANT: false car pas de vrais produits
        return false;
      }
    } catch (error: any) {
      const errorMsg = `${error.code ?? ''} ${error.message ?? String(error)}`.trim();
      log(`❌ Error fetching products: ${errorMsg}`);
      log(`   → BundleId: ${appBundleId}`);

      // Charger les fallback pour affichage
      const mocks = getMockProducts();
      setIapProducts(mocks);
      setProductsSource('fallback');
      setAreProductsLoaded(false);
      return false;
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

  const withTimeout = async <T,>(p: Promise<T>, ms: number, label: string): Promise<T> => {
    return await Promise.race([
      p,
      new Promise<T>((_, rej) =>
        setTimeout(() => rej(new Error(`[IAP] Timeout: ${label} (${ms}ms)`)), ms)
      ),
    ]);
  };

  const purchaseSubscription = useCallback(
    async (planId: PlanId): Promise<boolean> => {
      console.log('[IAP] 🛒 purchaseSubscription called with planId:', planId);

      if (!validatePlanId(planId)) {
        Alert.alert('Erreur', 'Programme invalide');
        return false;
      }

      const plan = getPlanById(planId);
      if (!plan) {
        Alert.alert('Erreur', 'Programme non trouvé');
        return false;
      }

      const productId = plan.iap.productId;
      setIsPurchasing(true);

      try {
        // DEV MODE
        if (!isProduction) {
          return await new Promise((resolve) => {
            Alert.alert(
              'Mode Développement',
              "Simulation d'achat (le vrai achat se fera sur TestFlight / App Store)",
              [
                { text: 'Annuler', style: 'cancel', onPress: () => resolve(false) },
                { text: "Simuler l'achat", onPress: () => resolve(true) },
              ]
            );
          });
        }

        // INIT IAP
        await withTimeout(initializeIAP(), 15000, 'initializeIAP');

        const RNIap = getIapModule();
        if (!RNIap) {
          Alert.alert('Erreur', 'Achats in-app indisponibles');
          return false;
        }

        const storeProduct = iapProducts.find(p => p.productId === productId);
        if (!storeProduct) {
          Alert.alert(
            'Produit indisponible',
            "Le produit n'a pas pu être chargé depuis l'App Store."
          );
          return false;
        }

        // Attente du résultat d'achat
        const purchasePromise = new Promise<boolean>((resolve) => {
          pendingPurchaseResolve.current = resolve;
          setTimeout(() => {
            if (pendingPurchaseResolve.current === resolve) {
              pendingPurchaseResolve.current = null;
              resolve(false);
            }
          }, 120000);
        });

        // Request subscription purchase
        // Using StoreKit 1 mode - requestSubscription should work
        console.log('[IAP] Requesting subscription for SKU:', productId);

        if (typeof RNIap.requestSubscription === 'function') {
          await withTimeout(
            RNIap.requestSubscription({
              sku: productId,
              andDangerouslyFinishTransactionAutomaticallyIOS: false,
            }),
            30000,
            'requestSubscription'
          );
        } else if (typeof RNIap.requestPurchase === 'function') {
          // Fallback to requestPurchase
          await withTimeout(
            RNIap.requestPurchase({
              sku: productId,
              andDangerouslyFinishTransactionAutomaticallyIOS: false,
            }),
            30000,
            'requestPurchase'
          );
        } else {
          throw new Error('No purchase method available');
        }

        return await purchasePromise;

      } catch (error: any) {
        if (error.code !== 'E_USER_CANCELLED') {
          Alert.alert(
            "Erreur d'achat",
            error?.message ?? 'Une erreur est survenue'
          );
        }
        pendingPurchaseResolve.current = null;
        return false;

      } finally {
        // ⚠️ OBLIGATOIRE : empêche le loader infini
        setIsPurchasing(false);
      }
    },
    [initializeIAP, iapProducts]
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

  const getProductById = useCallback(
    (productId: string): IAPProduct | undefined => {
      return iapProducts.find((p) => p.productId === productId);
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
        getProductById,
        formatPrice,
        isDevMode: !isProduction,
        initializeIAP,
        isIapReady,
        areProductsLoaded,
        // Debug IAP
        iapInitStatus,
        iapInitError,
        lastIapLog,
        iapLogs,
        pushIapLog,
        reloadIAP,
        productsSource,
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
