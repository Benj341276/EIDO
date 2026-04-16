ALTER TABLE plan_items
  ADD COLUMN is_visible BOOLEAN NOT NULL DEFAULT false;

-- Backfill: mark first 3 per plan+category as visible (by sort_order)
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY plan_id, category ORDER BY sort_order) AS rn
  FROM plan_items
)
UPDATE plan_items
SET is_visible = true
FROM ranked
WHERE plan_items.id = ranked.id
  AND ranked.rn <= 3;
