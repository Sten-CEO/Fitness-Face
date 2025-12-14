-- ============================================
-- SCHÉMA SUPABASE POUR FITNESS FACE
-- ============================================
-- Exécutez ce script dans l'éditeur SQL de Supabase Dashboard

-- 1. TABLE PROFILES (extension de auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  email TEXT NOT NULL,
  program_type TEXT, -- 'jawline-14', 'double-chin-14', 'all-in-one', etc.
  start_date DATE, -- Date de début du programme
  timezone TEXT DEFAULT 'Europe/Paris'
);

-- Index pour recherche par email
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- 2. TABLE USER_PROGRESS (progression utilisateur)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_day INTEGER DEFAULT 1 NOT NULL,
  streak INTEGER DEFAULT 0 NOT NULL,
  last_completed_date DATE,
  days_completed INTEGER[] DEFAULT '{}' NOT NULL,
  bonus_completed INTEGER[] DEFAULT '{}' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. TABLE ROUTINE_HISTORY (historique des routines)
-- ============================================
CREATE TABLE IF NOT EXISTS public.routine_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  day_index INTEGER NOT NULL,
  program_type TEXT NOT NULL,
  routine_name TEXT NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  exercises JSONB, -- Liste des exercices effectués
  bonus JSONB, -- Exercice bonus effectué (null si non fait)
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Index pour recherche par utilisateur et date
CREATE INDEX IF NOT EXISTS routine_history_user_idx ON public.routine_history(user_id);
CREATE INDEX IF NOT EXISTS routine_history_date_idx ON public.routine_history(completed_at DESC);

-- 4. TABLE SETTINGS (paramètres notifications)
-- ============================================
CREATE TABLE IF NOT EXISTS public.settings (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  notif_daily BOOLEAN DEFAULT TRUE NOT NULL,
  notif_streak_lost BOOLEAN DEFAULT TRUE NOT NULL,
  notif_tip BOOLEAN DEFAULT TRUE NOT NULL,
  daily_notif_time TIME DEFAULT '08:00' NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- PROFILES: L'utilisateur peut voir/modifier uniquement son profil
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- USER_PROGRESS: L'utilisateur peut voir/modifier uniquement sa progression
CREATE POLICY "Users can view own progress"
  ON public.user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progress"
  ON public.user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own progress"
  ON public.user_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- ROUTINE_HISTORY: L'utilisateur peut voir/ajouter uniquement son historique
CREATE POLICY "Users can view own routine history"
  ON public.routine_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own routine history"
  ON public.routine_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- SETTINGS: L'utilisateur peut voir/modifier uniquement ses paramètres
CREATE POLICY "Users can view own settings"
  ON public.settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON public.settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON public.settings FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS POUR CRÉER LES ENTRÉES AUTOMATIQUEMENT
-- ============================================

-- Fonction pour créer le profil et les données initiales à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer le profil
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);

  -- Créer l'entrée de progression
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id);

  -- Créer les paramètres par défaut
  INSERT INTO public.settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger à l'inscription d'un nouvel utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- FONCTION POUR METTRE À JOUR updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mise à jour automatique de updated_at
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
