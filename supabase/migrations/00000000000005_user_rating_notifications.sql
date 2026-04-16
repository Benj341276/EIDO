-- user_rating : note 1-5 laissée par l'utilisateur après visite
-- (distinct de rating NUMERIC(2,1) qui est la note Google Places)
ALTER TABLE public.plan_items
  ADD COLUMN user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5);

-- Politique UPDATE manquante sur plan_items (nécessaire pour PATCH /user-rating)
CREATE POLICY "Users can update own plan items"
  ON public.plan_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.plans
    WHERE plans.id = plan_items.plan_id
      AND plans.user_id = auth.uid()
  ));

-- notifications_enabled : l'utilisateur peut désactiver les notifications post-visite
ALTER TABLE public.user_preferences
  ADD COLUMN notifications_enabled BOOLEAN NOT NULL DEFAULT true;
