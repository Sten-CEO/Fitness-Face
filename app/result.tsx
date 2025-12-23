import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import BackgroundScreen from '../components/BackgroundScreen';
import CleanCard from '../components/CleanCard';
import PrimaryButton from '../components/PrimaryButton';
import TabSlider from '../components/TabSlider';
import { useProgress } from '../contexts/ProgressContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useUser } from '../contexts/UserContext';
import {
  getAlternativePlan,
  getPlanById,
  Plan,
  PlanId,
  plans,
  hasFreeTrial,
  getTrialDays,
} from '../data/plans';
import { validatePlanId } from '../lib/secureStorage';
import { typography, textColors } from '../theme/typography';

const { width } = Dimensions.get('window');

// URLs des pages légales
const LEGAL_URLS = {
  terms: 'https://www.jaw-app.com/terms.html',
  privacy: 'https://www.jaw-app.com/privacy-policy.html',
};

// Texte Apple standard pour les abonnements auto-renouvelables
const APPLE_SUBSCRIPTION_DISCLAIMER =
  "L'abonnement est renouvelé automatiquement sauf annulation au moins 24 heures avant la fin de la période en cours. " +
  "Le compte sera débité via l'App Store. La gestion et l'annulation se font dans les réglages de l'App Store.";

interface DisplayPrice {
  priceText: string;
  priceSuffix: string;
  isFromApple: boolean;
}

// Render price with proper formatting - UNIQUEMENT prix Apple (conformité 3.1.2)
// Si le prix Apple n'est pas disponible, afficher "Chargement..."
function renderPriceInfo(plan: Plan, displayPrice?: DisplayPrice) {
  // CONFORMITÉ APPLE 3.1.2: Afficher UNIQUEMENT le prix Apple (localizedPrice)
  // AUCUN fallback hardcodé visible à l'utilisateur
  if (displayPrice?.isFromApple && displayPrice.priceText) {
    return (
      <View style={styles.priceContainer}>
        <View style={styles.priceMainRow}>
          <Text style={styles.priceApple}>{displayPrice.priceText}</Text>
          <Text style={styles.priceSuffix}>{displayPrice.priceSuffix}</Text>
        </View>
        {plan.priceDetails && (
          <Text style={styles.priceDetails}>{plan.priceDetails}</Text>
        )}
      </View>
    );
  }

  // Prix Apple non disponible → afficher message de chargement
  // JAMAIS de prix hardcodé visible
  return (
    <View style={styles.priceContainer}>
      <View style={styles.priceMainRow}>
        <Text style={styles.priceLoading}>Chargement du prix...</Text>
      </View>
    </View>
  );
}

export default function ResultScreen() {
  const router = useRouter();
  const { firstName } = useUser();
  const { completePurchase } = useProgress();
  const {
    purchaseSubscription,
    isPurchasing,
    hasActiveAccess,
    subscriptionInfo,
    restorePurchases,
    isLoading: subscriptionLoading,
    getProductForPlan,
    initializeIAP,
    isIapReady,
    areProductsLoaded,
    products: iapProducts,
    isDevMode,
    // Debug IAP
    iapInitStatus,
    iapInitError,
    lastIapLog,
    iapLogs,
    reloadIAP,
  } = useSubscription();
  const { planId } = useLocalSearchParams<{ planId: string }>();

  // Helper: obtenir le prix à afficher - UNIQUEMENT prix Apple (conformité 3.1.2)
  // Retourne undefined si le prix Apple n'est pas disponible
  const getDisplayPrice = (plan: Plan | undefined): DisplayPrice | undefined => {
    if (!plan) return undefined;

    const product = getProductForPlan(plan.id);

    // CONFORMITÉ APPLE 3.1.2: UNIQUEMENT le prix Apple (localizedPrice)
    // JAMAIS de fallback hardcodé visible à l'utilisateur
    if (product?.localizedPrice) {
      return {
        priceText: product.localizedPrice,
        priceSuffix: plan.priceSuffix,
        isFromApple: true,
      };
    }

    // Pas de prix Apple disponible → retourner un objet indiquant le chargement
    // Le renderPriceInfo affichera "Chargement..."
    return {
      priceText: '',
      priceSuffix: plan.priceSuffix,
      isFromApple: false,
    };
  };

  // Validate planId from URL params to prevent injection
  // Guard contre null/undefined pour éviter crash Hermes
  const validPlanIds = plans.map(p => p.id);
  const safePlanId = typeof planId === 'string' ? planId : '';
  const selectedPlanId: PlanId = (safePlanId && validatePlanId(safePlanId) && validPlanIds.includes(safePlanId as PlanId))
    ? (safePlanId as PlanId)
    : 'jawline_guided';
  const mainPlan = getPlanById(selectedPlanId);
  const alternativePlan = getAlternativePlan(selectedPlanId);

  const isMonthlyPlan = selectedPlanId ? selectedPlanId.includes('monthly') : false;
  const planMain = isMonthlyPlan ? alternativePlan : mainPlan;
  const planMonthly = isMonthlyPlan ? mainPlan : alternativePlan;

  const [activeTab, setActiveTab] = useState(isMonthlyPlan ? 'monthly' : 'main');
  const [currentPlan, setCurrentPlan] = useState(mainPlan);
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [debugTapCount, setDebugTapCount] = useState(0);
  const debugTapTimeout = useRef<NodeJS.Timeout | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Triple-tap on title to toggle debug overlay
  const handleTitleTap = () => {
    if (debugTapTimeout.current) {
      clearTimeout(debugTapTimeout.current);
    }
    const newCount = debugTapCount + 1;
    setDebugTapCount(newCount);

    if (newCount >= 5) {
      setShowDebugOverlay(prev => !prev);
      setDebugTapCount(0);
    } else {
      debugTapTimeout.current = setTimeout(() => setDebugTapCount(0), 1500);
    }
  };

  // Initialiser IAP dès le montage du paywall (CRITIQUE pour Apple)
  useEffect(() => {
    console.log('🟣 [RESULT] Screen mounted - planId:', planId, 'selectedPlanId:', selectedPlanId);
    console.log('🟣 [RESULT] subscriptionLoading:', subscriptionLoading, 'hasActiveAccess:', hasActiveAccess);

    // CRITIQUE: Initialiser IAP AVANT que l'utilisateur clique sur "Commencer"
    // Cela charge les produits depuis l'App Store
    console.log('🟣 [RESULT] 🔄 Initializing IAP on paywall mount...');
    initializeIAP().then(() => {
      console.log('🟣 [RESULT] ✅ IAP initialized, isIapReady:', isIapReady);
    }).catch((err) => {
      console.error('🟣 [RESULT] ❌ IAP init error:', err);
    });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  // Log quand les produits sont chargés
  useEffect(() => {
    console.log('🟣 [RESULT] 📦 Products state changed - areProductsLoaded:', areProductsLoaded);
    if (currentPlan) {
      const product = getProductForPlan(currentPlan.id);
      console.log('🟣 [RESULT] 📦 Current plan product:', product?.productId, '→', product?.localizedPrice);
    }
  }, [areProductsLoaded, currentPlan]);

  // PAS DE REDIRECTION AUTOMATIQUE VERS LE DASHBOARD
  // L'utilisateur doit toujours voir l'écran de choix de programme
  // La redirection vers le dashboard se fait UNIQUEMENT après un achat réussi

  const handleTabChange = (key: string) => {
    if (key === activeTab) return;

    const slideDirection = key === 'monthly' ? -1 : 1;
    const newPlan = key === 'monthly' ? planMonthly : planMain;

    Animated.timing(slideAnim, {
      toValue: slideDirection * width * 0.3,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setActiveTab(key);
      setCurrentPlan(newPlan);
      slideAnim.setValue(-slideDirection * width * 0.3);
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  };

  const handleSelectPlan = async (selectedPlan: Plan | undefined) => {
    console.log('🟣 [RESULT] 🛒 handleSelectPlan called');
    console.log('🟣 [RESULT] 🛒 selectedPlan:', selectedPlan?.id);
    console.log('🟣 [RESULT] 🛒 productId:', selectedPlan?.iap?.productId);
    console.log('🟣 [RESULT] 🛒 areProductsLoaded:', areProductsLoaded);
    console.log('🟣 [RESULT] 🛒 isIapReady:', isIapReady);

    if (!selectedPlan) {
      Alert.alert('Erreur', 'Aucun plan sélectionné');
      return;
    }

    // Vérifier que le produit Apple est disponible
    const storeProduct = getProductForPlan(selectedPlan.id);
    console.log('🟣 [RESULT] 🛒 storeProduct:', storeProduct);

    if (!storeProduct && areProductsLoaded) {
      console.error('🟣 [RESULT] ❌ Product not found in store for plan:', selectedPlan.id);
      Alert.alert(
        'Produit indisponible',
        'Ce produit n\'est pas disponible actuellement. Veuillez réessayer plus tard.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      // Lancer l'achat natif (popup Apple Pay / Google Pay)
      console.log('🟣 [RESULT] 🚀 Calling purchaseSubscription...');
      const success = await purchaseSubscription(selectedPlan.id);
      console.log('🟣 [RESULT] 🛒 Purchase result:', success);

      if (success) {
        // Enregistrer l'achat dans le contexte de progression
        await completePurchase(selectedPlan.id, selectedPlan.name);

        // Naviguer vers l'écran de transition (replace pour vider la stack)
        router.replace({
          pathname: '/transition',
          params: {
            firstName: firstName || '',
            planId: selectedPlan.id,
            planName: selectedPlan.name,
          },
        });
      }
    } catch (error) {
      console.error('🟣 [RESULT] ❌ Purchase error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue. Réessaie.');
    }
  };

  const handleRestorePurchases = async () => {
    const restored = await restorePurchases();
    if (restored && subscriptionInfo.planId) {
      await completePurchase(subscriptionInfo.planId, subscriptionInfo.planId);
      router.replace('/(tabs)/dashboard');
    }
  };

  if (!mainPlan) {
    return (
      <BackgroundScreen>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Erreur : Programme non trouvé</Text>
        </View>
      </BackgroundScreen>
    );
  }

  const is60DayProgram = selectedPlanId ? selectedPlanId.includes('double') : false;
  const tabs = [
    { key: 'main', label: is60DayProgram ? '60 jours' : '90 jours', badge: 'Conseillé' },
    { key: 'monthly', label: 'Mensuel' },
  ];

  return (
    <BackgroundScreen centered={false}>
      {/* Debug toggle button - petit bouton discret en haut à droite */}
      <TouchableOpacity
        style={styles.debugToggleButton}
        onPress={() => setShowDebugOverlay(prev => !prev)}
        activeOpacity={0.7}
      >
        <Text style={styles.debugToggleText}>🐛</Text>
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleTitleTap} activeOpacity={1}>
              <Text style={styles.title}>
                Ton programme{'\n'}
                <Text style={styles.titleBlue}>personnalisé</Text>
              </Text>
            </TouchableOpacity>
            <Text style={styles.subtitle}>
              {firstName ? `${firstName}, voici` : 'Voici'} ce qu'on te recommande
            </Text>
          </View>

          {alternativePlan && (
            <TabSlider
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
            />
          )}

          <Animated.View style={{ transform: [{ translateX: slideAnim }] }}>
            <CleanCard style={styles.programCard}>
              {/* Card header with badge and icon */}
              <View style={styles.cardHeader}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {activeTab === 'main' ? 'Recommandé' : 'Flexible'}
                  </Text>
                </View>
                <Ionicons name="diamond-outline" size={32} color={textColors.accent} />
              </View>

              <Text style={styles.planName}>{currentPlan?.name}</Text>
              <Text style={styles.planDuration}>{currentPlan?.durationLabel}</Text>

              {currentPlan?.shortDescription && (
                <Text style={styles.planDescription}>{currentPlan.shortDescription}</Text>
              )}

              <View style={styles.separator} />

              {/* Features list */}
              <View style={styles.featuresList}>
                {currentPlan?.features.slice(0, 7).map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <View style={styles.featureIcon}>
                      <Ionicons name="diamond" size={10} color={textColors.accent} />
                    </View>
                    <Text style={styles.featureText}>{feature.text}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.separator} />

              {/* Price section - Apple 3.1.2 compliant */}
              {currentPlan && (
                <View style={styles.priceSection}>
                  <Text style={styles.priceLabel}>Tarif</Text>
                  {renderPriceInfo(currentPlan, getDisplayPrice(currentPlan))}
                  <Text style={styles.durationText}>
                    Durée : {currentPlan.durationLabel}
                  </Text>
                  {/* Afficher SOIT le texte d'essai gratuit (orange) pour les programmes guidés,
                      SOIT le engagementLabel pour les autres cas - PAS les deux */}
                  {hasFreeTrial(currentPlan.id) ? (
                    <Text style={styles.engagementText}>
                      {getTrialDays(currentPlan.id)} jours d'essai gratuit
                    </Text>
                  ) : currentPlan.engagementLabel ? (
                    <Text style={styles.engagementText}>{currentPlan.engagementLabel}</Text>
                  ) : null}
                </View>
              )}
            </CleanCard>
          </Animated.View>

          <View style={styles.ctaContainer}>
            <PrimaryButton
              title={isPurchasing ? '' : (!areProductsLoaded ? 'Chargement...' : 'Commencer')}
              onPress={() => handleSelectPlan(currentPlan)}
              disabled={isPurchasing || !areProductsLoaded}
            >
              {(isPurchasing || !areProductsLoaded) && (
                <ActivityIndicator color="#FFFFFF" size="small" />
              )}
            </PrimaryButton>
            {currentPlan && hasFreeTrial(currentPlan.id) && (
              <Text style={styles.trialDisclaimer}>
                {getDisplayPrice(currentPlan)?.isFromApple
                  ? `${getTrialDays(currentPlan.id)} jours d'essai gratuit, puis ${getDisplayPrice(currentPlan)?.priceText}${currentPlan?.priceSuffix}`
                  : `${getTrialDays(currentPlan.id)} jours d'essai gratuit`}
              </Text>
            )}
            {!areProductsLoaded && (
              <Text style={styles.loadingHint}>
                Connexion à l'App Store en cours...
              </Text>
            )}
          </View>

          {/* Restore purchases */}
          <TouchableOpacity
            onPress={handleRestorePurchases}
            style={styles.restoreButton}
          >
            <Text style={styles.restoreButtonText}>
              Restaurer mes achats
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/programs')}
            style={styles.secondaryLink}
          >
            <Text style={styles.secondaryLinkText}>
              Voir tous les programmes
            </Text>
          </TouchableOpacity>

          {/* Legal section - Apple 3.1.2 compliant */}
          <View style={styles.legalSection}>
            {/* Links */}
            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => Linking.openURL(LEGAL_URLS.terms)}>
                <Text style={styles.legalLinkText}>Conditions d'utilisation</Text>
              </TouchableOpacity>
              <Text style={styles.legalSeparator}>•</Text>
              <TouchableOpacity onPress={() => Linking.openURL(LEGAL_URLS.privacy)}>
                <Text style={styles.legalLinkText}>Politique de confidentialité</Text>
              </TouchableOpacity>
            </View>

            {/* Apple subscription disclaimer */}
            <Text style={styles.appleDisclaimer}>
              {APPLE_SUBSCRIPTION_DISCLAIMER}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* Debug Overlay - Toggle avec 5 taps sur le titre */}
      {showDebugOverlay && (
        <View style={styles.debugOverlay}>
          <View style={styles.debugHeader}>
            <Text style={styles.debugTitle}>🐛 IAP Debug</Text>
            <TouchableOpacity onPress={() => setShowDebugOverlay(false)} style={styles.debugClose}>
              <Ionicons name="close" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.debugScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>ENV</Text>
              <Text style={styles.debugValue}>{isDevMode ? '🧪 DEV (Expo Go)' : '🚀 PROD (EAS Build)'}</Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>iapInitStatus</Text>
              <Text style={[styles.debugValue, iapInitStatus === 'ready' ? styles.debugGreen : iapInitStatus === 'error' ? styles.debugRed : styles.debugYellow]}>
                {iapInitStatus}
              </Text>
            </View>

            {iapInitError ? (
              <View style={styles.debugSection}>
                <Text style={styles.debugLabel}>iapInitError</Text>
                <Text style={[styles.debugValue, styles.debugRed]}>{iapInitError}</Text>
              </View>
            ) : null}

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>areProductsLoaded</Text>
              <Text style={[styles.debugValue, areProductsLoaded ? styles.debugGreen : styles.debugRed]}>
                {areProductsLoaded ? '✅ true' : '❌ false'}
              </Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>iapProducts.length</Text>
              <Text style={styles.debugValue}>{iapProducts.length}</Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>Product IDs</Text>
              {iapProducts.map((p, i) => (
                <Text key={i} style={styles.debugValueSmall}>
                  {p.productId} → {p.localizedPrice || '(no price)'}
                </Text>
              ))}
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>currentPlan</Text>
              <Text style={styles.debugValueSmall}>ID: {currentPlan?.id}</Text>
              <Text style={styles.debugValueSmall}>productId: {currentPlan?.iap?.productId}</Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>storeProduct match</Text>
              {currentPlan ? (
                <Text style={[styles.debugValue, getProductForPlan(currentPlan.id) ? styles.debugGreen : styles.debugRed]}>
                  {getProductForPlan(currentPlan.id) ? '✅ FOUND' : '❌ NOT FOUND'}
                </Text>
              ) : <Text style={styles.debugValue}>-</Text>}
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>isPurchasing</Text>
              <Text style={[styles.debugValue, isPurchasing ? styles.debugYellow : styles.debugGreen]}>
                {isPurchasing ? '⏳ true' : 'false'}
              </Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>lastIapLog</Text>
              <Text style={styles.debugValueSmall}>{lastIapLog || '(none)'}</Text>
            </View>

            <View style={styles.debugSection}>
              <Text style={styles.debugLabel}>Recent Logs ({iapLogs.length})</Text>
              {iapLogs.slice(-5).map((log, i) => (
                <Text key={i} style={styles.debugLogLine}>{log}</Text>
              ))}
            </View>

            <TouchableOpacity style={styles.debugButton} onPress={reloadIAP}>
              <Text style={styles.debugButtonText}>🔄 Recharger IAP</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </BackgroundScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
    alignItems: 'center',
  },
  title: {
    ...typography.h2,
    color: textColors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  titleBlue: {
    color: textColors.accent,
  },
  subtitle: {
    ...typography.body,
    color: textColors.secondary,
    textAlign: 'center',
  },
  programCard: {
    marginBottom: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  badge: {
    backgroundColor: textColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  badgeText: {
    ...typography.labelSmall,
    color: textColors.primary,
    fontSize: 11,
  },
  planName: {
    ...typography.h3,
    color: textColors.primary,
    marginBottom: 4,
  },
  planDuration: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    marginBottom: 8,
  },
  planDescription: {
    ...typography.bodySmall,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...typography.bodySmall,
    flex: 1,
    color: 'rgba(255, 255, 255, 0.85)',
    fontWeight: '500',
  },
  priceSection: {
    gap: 6,
  },
  priceLabel: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    marginBottom: 4,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceMainRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceIntPart: {
    fontSize: 24,
    fontWeight: '700',
    color: textColors.accent,
  },
  priceDecPart: {
    fontSize: 16,
    fontWeight: '400',
    color: textColors.accent,
  },
  priceSuffix: {
    fontSize: 16,
    fontWeight: '700',
    color: textColors.accent,
    marginLeft: 2,
  },
  priceDetails: {
    ...typography.caption,
    color: textColors.tertiary,
    marginTop: 2,
  },
  engagementText: {
    ...typography.caption,
    color: '#F59E0B',
    textAlign: 'right',
    fontWeight: '500',
  },
  ctaContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  trialDisclaimer: {
    ...typography.caption,
    color: textColors.tertiary,
    marginTop: 10,
  },
  loadingHint: {
    ...typography.caption,
    color: textColors.tertiary,
    marginTop: 6,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 8,
  },
  restoreButtonText: {
    ...typography.caption,
    color: textColors.accent,
    textDecorationLine: 'underline',
  },
  secondaryLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  secondaryLinkText: {
    ...typography.bodySmall,
    color: textColors.tertiary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: '#EF4444',
    textAlign: 'center',
  },
  legalSection: {
    marginTop: 16,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  legalLinkText: {
    ...typography.caption,
    color: textColors.accent,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    ...typography.caption,
    color: textColors.tertiary,
  },
  appleDisclaimer: {
    ...typography.caption,
    color: textColors.tertiary,
    textAlign: 'center',
    lineHeight: 16,
    fontSize: 10,
  },
  priceApple: {
    fontSize: 20,
    fontWeight: '700',
    color: textColors.accent,
  },
  priceLoading: {
    ...typography.bodySmall,
    color: textColors.tertiary,
    fontStyle: 'italic',
  },
  durationText: {
    ...typography.caption,
    color: textColors.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  // Debug toggle button (top-right corner)
  debugToggleButton: {
    position: 'absolute',
    top: 50,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  debugToggleText: {
    fontSize: 18,
  },
  // Debug Overlay styles
  debugOverlay: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    bottom: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.5)',
    zIndex: 1000,
  },
  debugHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  debugTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  debugClose: {
    padding: 4,
  },
  debugScroll: {
    flex: 1,
  },
  debugSection: {
    marginBottom: 12,
  },
  debugLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  debugValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFF',
  },
  debugValueSmall: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'monospace',
  },
  debugLogLine: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  debugGreen: {
    color: '#22C55E',
  },
  debugRed: {
    color: '#EF4444',
  },
  debugYellow: {
    color: '#F59E0B',
  },
  debugButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  debugButtonText: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
});
