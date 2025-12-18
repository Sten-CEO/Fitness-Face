import { Session, User, AuthError } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Profile } from '../lib/supabase';
import { secureStorage, SECURE_KEYS, STORAGE_KEYS } from '../lib/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  // État
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshProfile: () => Promise<void>;
  deleteAccount: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser et écouter les changements de session
  useEffect(() => {
    // Récupérer la session actuelle
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchOrCreateProfile(session.user.id, session.user.email || '');
      } else {
        setIsLoading(false);
      }
    });

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchOrCreateProfile(session.user.id, session.user.email || '');
        } else {
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Créer un profil local minimal (fallback)
  const createLocalProfile = (userId: string, email: string): Profile => ({
    id: userId,
    email,
    created_at: new Date().toISOString(),
    program_type: null,
    start_date: null,
    timezone: 'Europe/Paris',
  });

  // Récupérer ou créer le profil utilisateur avec timeout
  const fetchOrCreateProfile = async (userId: string, email: string) => {
    // Timeout de 10 secondes pour éviter les blocages
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
    );

    try {
      const fetchProfile = async () => {
        // Essayer de récupérer ou créer le profil
        const { data: upsertedProfile, error: upsertError } = await supabase
          .from('profiles')
          .upsert(
            { id: userId, email },
            { onConflict: 'id', ignoreDuplicates: true }
          )
          .select()
          .maybeSingle();

        if (upsertError) {
          console.warn('[Auth] Profile upsert error:', upsertError.message);
          return createLocalProfile(userId, email);
        }

        if (upsertedProfile) {
          return upsertedProfile;
        }

        // Essayer de récupérer le profil existant
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (fetchError) {
          console.warn('[Auth] Profile fetch error:', fetchError.message);
        }

        return existingProfile || createLocalProfile(userId, email);
      };

      // Race entre le fetch et le timeout
      const profileData = await Promise.race([fetchProfile(), timeout]);
      setProfile(profileData);

      // Créer user_progress et settings en arrière-plan (non bloquant)
      Promise.all([
        supabase
          .from('user_progress')
          .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true })
          .then(({ error }) => {
            if (error) console.warn('[Auth] user_progress upsert error:', error.message);
          }),
        supabase
          .from('settings')
          .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true })
          .then(({ error }) => {
            if (error) console.warn('[Auth] settings upsert error:', error.message);
          }),
      ]).catch(console.warn);

    } catch (error) {
      console.warn('[Auth] fetchOrCreateProfile error:', error);
      // Fallback en cas d'erreur ou timeout
      setProfile(createLocalProfile(userId, email));
    } finally {
      setIsLoading(false);
    }
  };

  // Inscription avec timeout
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);

    // IMPORTANT: Nettoyer TOUTES les données locales AVANT l'inscription
    // pour éviter qu'un nouvel utilisateur hérite des données d'un ancien
    try {
      await Promise.all([
        secureStorage.deleteItem(SECURE_KEYS.SUBSCRIPTION_INFO),
        secureStorage.deleteItem(SECURE_KEYS.TRANSACTION_RECEIPT),
        AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS),
      ]);
      console.log('[Auth] Cleared local data before signup');
    } catch (clearError) {
      console.warn('[Auth] Error clearing data before signup:', clearError);
    }

    // Timeout de 15 secondes
    const timeout = new Promise<{ error: AuthError }>((resolve) =>
      setTimeout(() => resolve({
        error: { message: 'Délai dépassé. Vérifie ta connexion internet.', status: 408 } as AuthError
      }), 15000)
    );

    try {
      const signUpPromise = supabase.auth.signUp({ email, password });
      const result = await Promise.race([signUpPromise, timeout]);

      if (result.error) {
        setIsLoading(false);
      }
      // Note: Si pas d'erreur, isLoading sera mis à false par onAuthStateChange → fetchOrCreateProfile
      return { error: result.error };
    } catch (error) {
      setIsLoading(false);
      return { error: error as AuthError };
    }
  };

  // Connexion avec timeout
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);

    // Timeout de 15 secondes
    const timeout = new Promise<{ data: null; error: AuthError }>((resolve) =>
      setTimeout(() => resolve({
        data: null,
        error: { message: 'Délai dépassé. Vérifie ta connexion internet.', status: 408 } as AuthError
      }), 15000)
    );

    try {
      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const result = await Promise.race([signInPromise, timeout]);

      if (result.error) {
        setIsLoading(false);
      }
      return { error: result.error };
    } catch (error) {
      setIsLoading(false);
      return { error: error as AuthError };
    }
  };

  // Déconnexion - nettoie toutes les données utilisateur
  const signOut = async () => {
    setIsLoading(true);

    // Nettoyer les données locales de l'utilisateur
    try {
      await Promise.all([
        secureStorage.deleteItem(SECURE_KEYS.SUBSCRIPTION_INFO),
        secureStorage.deleteItem(SECURE_KEYS.TRANSACTION_RECEIPT),
        AsyncStorage.removeItem(STORAGE_KEYS.PROGRESS),
      ]);
      console.log('[Auth] User data cleared on sign out');
    } catch (error) {
      console.warn('[Auth] Error clearing user data:', error);
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsLoading(false);
  };

  // Réinitialiser le mot de passe
  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'fitness-face://reset-password',
    });
    return { error };
  };

  // Mettre à jour le profil
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('Non authentifié') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        return { error };
      }

      await fetchOrCreateProfile(user.id, user.email || '');
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  // Rafraîchir le profil
  const refreshProfile = async () => {
    if (user) {
      await fetchOrCreateProfile(user.id, user.email || '');
    }
  };

  // Supprimer le compte et toutes les données
  const deleteAccount = async (): Promise<{ error: Error | null }> => {
    if (!user || !session) {
      return { error: new Error('Non authentifié') };
    }

    try {
      // Appeler l'Edge Function pour supprimer complètement le compte
      // Cette fonction utilise l'API admin pour supprimer l'utilisateur auth
      const { data, error: functionError } = await supabase.functions.invoke('delete-account', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (functionError) {
        console.error('Delete account function error:', functionError);
        return { error: new Error(functionError.message || 'Erreur lors de la suppression du compte') };
      }

      if (data?.error) {
        console.error('Delete account error:', data.error);
        return { error: new Error(data.error) };
      }

      // Nettoyer l'état local
      setUser(null);
      setSession(null);
      setProfile(null);

      // Déconnecter localement (le compte auth est déjà supprimé côté serveur)
      await supabase.auth.signOut();

      return { error: null };
    } catch (error) {
      console.error('Delete account exception:', error);
      return { error: error as Error };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAuthenticated: !!session,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
