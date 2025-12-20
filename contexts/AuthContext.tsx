import { Session, User, AuthError } from '@supabase/supabase-js';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase, Profile } from '../lib/supabase';

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
  // IMPORTANT: Délai pour éviter crash TurboModule au boot
  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let mounted = true;

    const initAuth = async () => {
      try {
        // Récupérer la session actuelle
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchOrCreateProfile(session.user.id, session.user.email || '');
        } else {
          setIsLoading(false);
        }

        // Écouter les changements d'état d'authentification
        const { data } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!mounted) return;

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
        subscription = data.subscription;
      } catch (e) {
        console.warn('[Auth] Init failed:', e);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Délai de 1 seconde avant d'initialiser l'auth
    const timer = setTimeout(initAuth, 1000);

    return () => {
      mounted = false;
      clearTimeout(timer);
      subscription?.unsubscribe();
    };
  }, []);

  // Récupérer ou créer le profil utilisateur
  const fetchOrCreateProfile = async (userId: string, email: string) => {
    try {
      // Utiliser upsert pour créer ou mettre à jour le profil
      const { data: upsertedProfile, error: upsertError } = await supabase
        .from('profiles')
        .upsert(
          { id: userId, email },
          { onConflict: 'id', ignoreDuplicates: true }
        )
        .select()
        .maybeSingle();

      if (upsertError) {
        // En cas d'erreur, créer un profil local minimal
        setProfile({
          id: userId,
          email,
          created_at: new Date().toISOString(),
          program_type: null,
          start_date: null,
          timezone: 'Europe/Paris',
        });
      } else if (upsertedProfile) {
        setProfile(upsertedProfile);
      } else {
        // Essayer de récupérer le profil existant
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (existingProfile) {
          setProfile(existingProfile);
        } else {
          // Fallback: profil local minimal
          setProfile({
            id: userId,
            email,
            created_at: new Date().toISOString(),
            program_type: null,
            start_date: null,
            timezone: 'Europe/Paris',
          });
        }
      }

      // S'assurer que user_progress et settings existent
      await supabase
        .from('user_progress')
        .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });

      await supabase
        .from('settings')
        .upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true });

    } catch {
      // Fallback en cas d'erreur
      setProfile({
        id: userId,
        email,
        created_at: new Date().toISOString(),
        program_type: null,
        start_date: null,
        timezone: 'Europe/Paris',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Inscription
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        setIsLoading(false);
      }
      return { error };
    } catch (error) {
      setIsLoading(false);
      return { error: error as AuthError };
    }
  };

  // Connexion
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      setIsLoading(false);
    }
    return { error };
  };

  // Déconnexion
  const signOut = async () => {
    setIsLoading(true);
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
