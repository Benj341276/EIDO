CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  cuisines TEXT[] DEFAULT '{}',
  music_genres TEXT[] DEFAULT '{}',
  activities TEXT[] DEFAULT '{}',
  life_rhythm TEXT CHECK (life_rhythm IN ('early_bird', 'night_owl', 'flexible')),
  budget_level TEXT CHECK (budget_level IN ('budget', 'moderate', 'premium', 'luxury')),
  mobility_mode TEXT CHECK (mobility_mode IN ('walking', 'cycling', 'driving', 'transit')),
  default_radius_km NUMERIC(5,1) DEFAULT 5.0,
  dietary_restrictions TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

CREATE TRIGGER set_updated_at_user_preferences
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);
