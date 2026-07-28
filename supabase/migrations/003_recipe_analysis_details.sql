-- Cherry - Détails de précision pour l'analyse nutritionnelle
-- Exécuter dans l'éditeur SQL Supabase

-- Matière grasse de cuisson, poids final et garnitures
ALTER TABLE recipes
  ADD COLUMN IF NOT EXISTS cooking_fat_type TEXT,
  ADD COLUMN IF NOT EXISTS cooking_fat_grams NUMERIC,
  ADD COLUMN IF NOT EXISTS total_cooked_weight_g NUMERIC,
  ADD COLUMN IF NOT EXISTS extras TEXT;

-- Type/marque d'un ingrédient (ex: emmental 28%) et équivalent en grammes
ALTER TABLE ingredients
  ADD COLUMN IF NOT EXISTS note TEXT,
  ADD COLUMN IF NOT EXISTS grams NUMERIC;
