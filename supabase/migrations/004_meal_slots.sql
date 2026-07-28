-- Cherry - Plusieurs repas par jour (matin / midi / soir + snacks)
-- Exécuter dans l'éditeur SQL Supabase

-- Un jour peut désormais contenir plusieurs snacks, donc la contrainte
-- d'unicité (plan, jour, type) est levée. L'application garantit elle-même
-- qu'un créneau fixe ne contient qu'un seul repas (suppression puis insertion).
ALTER TABLE meal_plan_items
  DROP CONSTRAINT IF EXISTS meal_plan_items_meal_plan_id_day_of_week_meal_type_key;

CREATE INDEX IF NOT EXISTS idx_meal_plan_items_plan_day
  ON meal_plan_items(meal_plan_id, day_of_week);
