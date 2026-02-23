-- =============================================
-- ROGUESS - SCHÉMA SUPABASE
-- À coller dans : Supabase Dashboard > SQL Editor
-- =============================================

-- Table profiles (extension de auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id                UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username          TEXT UNIQUE NOT NULL,
  xp                INTEGER NOT NULL DEFAULT 0,
  is_premium        BOOLEAN NOT NULL DEFAULT false,
  premium_expires_at TIMESTAMPTZ,
  stripe_customer_id TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-création du profil à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sessions de jeu (1 par user / mode / jour)
CREATE TABLE IF NOT EXISTS public.game_sessions (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode        TEXT NOT NULL CHECK(mode IN ('game','limited','dev')),
  item_id     TEXT NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  hints_used  INTEGER NOT NULL DEFAULT 1,
  won         BOOLEAN NOT NULL DEFAULT false,
  score       INTEGER NOT NULL DEFAULT 0,
  time_taken  INTEGER,
  guesses     JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, mode, date)
);

-- Streaks
CREATE TABLE IF NOT EXISTS public.streaks (
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode            TEXT NOT NULL,
  current_streak  INTEGER NOT NULL DEFAULT 0,
  longest_streak  INTEGER NOT NULL DEFAULT 0,
  last_played     DATE,
  PRIMARY KEY (user_id, mode)
);

-- Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id  TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- Sessions Endless
CREATE TABLE IF NOT EXISTS public.endless_sessions (
  id        BIGSERIAL PRIMARY KEY,
  user_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  mode      TEXT NOT NULL,
  score     INTEGER NOT NULL DEFAULT 0,
  max_combo INTEGER NOT NULL DEFAULT 0,
  rounds    INTEGER NOT NULL DEFAULT 0,
  played_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_sessions_user_date ON public.game_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_sessions_mode_date ON public.game_sessions(mode, date, score DESC);
CREATE INDEX IF NOT EXISTS idx_streaks_user ON public.streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_badges_user ON public.user_badges(user_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.endless_sessions ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Profils publics en lecture"    ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users modifient leur profil"   ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Sessions
CREATE POLICY "Lecture sessions propres"      ON public.game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Insert sessions propres"       ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Lecture scores leaderboard"    ON public.game_sessions FOR SELECT USING (true);

-- Streaks
CREATE POLICY "Lecture streaks propres"       ON public.streaks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Upsert streaks propres"        ON public.streaks FOR ALL USING (auth.uid() = user_id);

-- Badges
CREATE POLICY "Badges publics"                ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "Insert badges propres"         ON public.user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Endless
CREATE POLICY "Sessions endless propres"      ON public.endless_sessions FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- FONCTION UTILITAIRE : increment_xp
-- =============================================
CREATE OR REPLACE FUNCTION public.increment_xp(user_id UUID, amount INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles
  SET xp = xp + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
