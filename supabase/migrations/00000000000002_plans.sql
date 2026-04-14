CREATE TABLE public.plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mode TEXT NOT NULL DEFAULT 'local' CHECK (mode IN ('local', 'travel')),
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  location_name TEXT,
  radius_km NUMERIC(5,1) NOT NULL,
  preferences_snapshot JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'generating' CHECK (status IN ('generating', 'completed', 'failed')),
  total_estimated_cost NUMERIC(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plans_user_id ON public.plans(user_id);
CREATE INDEX idx_plans_created_at ON public.plans(created_at DESC);

CREATE TRIGGER set_updated_at_plans
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own plans"
  ON public.plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own plans"
  ON public.plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own plans"
  ON public.plans FOR UPDATE USING (auth.uid() = user_id);

-- Plan items
CREATE TABLE public.plan_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.plans(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('restaurant', 'activity', 'event')),
  name TEXT NOT NULL,
  description TEXT,
  reason TEXT,
  address TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  rating NUMERIC(2,1),
  price_level INTEGER CHECK (price_level BETWEEN 1 AND 4),
  estimated_cost NUMERIC(8,2),
  duration_minutes INTEGER,
  image_url TEXT,
  external_url TEXT,
  external_id TEXT,
  external_source TEXT,
  metadata JSONB DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_plan_items_plan_id ON public.plan_items(plan_id);

ALTER TABLE public.plan_items ENABLE ROW LEVEL SECURITY;

-- plan_items RLS via join on plans.user_id
CREATE POLICY "Users can view own plan items"
  ON public.plan_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = plan_items.plan_id AND plans.user_id = auth.uid()));
CREATE POLICY "Users can create own plan items"
  ON public.plan_items FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.plans WHERE plans.id = plan_items.plan_id AND plans.user_id = auth.uid()));
