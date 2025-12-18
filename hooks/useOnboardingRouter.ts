import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PlanId } from '../data/plans';

// DEBUG MODE - Affiche des Alert pour tracer le routing
const DEBUG_ALERTS = true;

/**
 * Hook pour gérer le routing après l'onboarding (questionnaire)
 *
 * RÈGLE UNIQUE:
 * - hasActiveAccess === false → /result (paywall/choix programme)
 * - hasActiveAccess === true → /(tabs)/dashboard
 *
 * Ce hook attend que le statut d'abonnement soit chargé avant de router.
 */
export function useOnboardingRouter() {
  const router = useRouter();
  const { hasActiveAccess, isLoading: subscriptionLoading } = useSubscription();
  const [isReady, setIsReady] = useState(false);

  // Marquer comme prêt quand le chargement est terminé
  useEffect(() => {
    if (!subscriptionLoading) {
      setIsReady(true);
      console.log('🎯 [ONBOARDING_ROUTER] Ready - hasActiveAccess:', hasActiveAccess);
    }
  }, [subscriptionLoading, hasActiveAccess]);

  /**
   * Route vers le bon écran après l'onboarding
   * @param planId - Le planId recommandé par le questionnaire
   */
  const routeAfterOnboarding = useCallback(
    async (planId?: PlanId | string) => {
      console.log('🎯 [ONBOARDING_ROUTER] routeAfterOnboarding called');
      console.log('🎯 [ONBOARDING_ROUTER] subscriptionLoading:', subscriptionLoading);
      console.log('🎯 [ONBOARDING_ROUTER] hasActiveAccess:', hasActiveAccess);
      console.log('🎯 [ONBOARDING_ROUTER] planId:', planId);

      // Attendre que le statut soit chargé
      if (subscriptionLoading) {
        console.log('🎯 [ONBOARDING_ROUTER] Waiting for subscription to load...');
        // On retourne false pour indiquer qu'on n'a pas encore routé
        return false;
      }

      // DÉCISION DE ROUTING
      if (hasActiveAccess) {
        // Utilisateur déjà abonné → Dashboard
        console.log('🎯 [ONBOARDING_ROUTER] Decision: hasActiveAccess=true → DASHBOARD');
        if (DEBUG_ALERTS) {
          Alert.alert('🎯 ROUTING DEBUG', `hasActiveAccess = TRUE\n→ Going to DASHBOARD`);
        }
        router.replace('/(tabs)/dashboard');
      } else {
        // Utilisateur non abonné → Paywall (choix programme)
        console.log('🎯 [ONBOARDING_ROUTER] Decision: hasActiveAccess=false → RESULT (paywall)');
        if (DEBUG_ALERTS) {
          Alert.alert('🎯 ROUTING DEBUG', `hasActiveAccess = FALSE\n→ Going to RESULT (paywall)\nplanId: ${planId || 'jawline_guided'}`);
        }
        router.replace({
          pathname: '/result',
          params: { planId: planId || 'jawline_guided' },
        });
      }

      return true;
    },
    [router, subscriptionLoading, hasActiveAccess]
  );

  /**
   * Route directement vers le paywall (pour nouveau user qui vient de s'inscrire)
   */
  const routeToPaywall = useCallback(
    (planId?: PlanId | string) => {
      console.log('🎯 [ONBOARDING_ROUTER] routeToPaywall → /result with planId:', planId);
      router.replace({
        pathname: '/result',
        params: { planId: planId || 'jawline_guided' },
      });
    },
    [router]
  );

  return {
    isReady,
    subscriptionLoading,
    hasActiveAccess,
    routeAfterOnboarding,
    routeToPaywall,
  };
}
