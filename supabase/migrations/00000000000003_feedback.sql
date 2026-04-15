CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_item_id UUID NOT NULL REFERENCES public.plan_items(id) ON DELETE CASCADE,
  liked BOOLEAN,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  visited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, plan_item_id)
);

CREATE INDEX idx_feedback_user_id ON public.feedback(user_id);

CREATE TRIGGER set_updated_at_feedback
  BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON public.feedback FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own feedback"
  ON public.feedback FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own feedback"
  ON public.feedback FOR UPDATE USING (auth.uid() = user_id);
