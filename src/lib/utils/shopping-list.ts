import {
  formatIngredientName,
  getIngredientKey,
} from "@/lib/utils/ingredient-normalize";
import { categorizeByKey } from "@/lib/utils/ingredient-categories";
import { formatGrams, toGrams } from "@/lib/utils/unit-convert";
import type { Ingredient, ShoppingListItem } from "@/types";

type ShoppingDraft = Omit<ShoppingListItem, "id" | "shopping_list_id">;

export function categorizeIngredient(name: string): string {
  return categorizeByKey(getIngredientKey(name)) ?? "autres";
}

interface Bucket {
  name: string;
  category: string;
  grams: number;
  /** Mesures impossibles à convertir, conservées dans leur unité d'origine */
  leftovers: Map<string, number>;
}

/**
 * Regroupe les ingrédients par produit en additionnant tout en grammes,
 * pour que « 400 g de farine » et « 1 c. à soupe de farine » ne fassent
 * qu'une seule ligne. `gramOverrides` vient de la table locale + IA.
 */
export function mergeIngredients(
  ingredients: Ingredient[],
  gramOverrides?: Map<string, number>
): ShoppingDraft[] {
  const buckets = new Map<string, Bucket>();

  for (const ing of ingredients) {
    const key = getIngredientKey(ing.name);
    if (!key) continue;

    const bucket = buckets.get(key) ?? {
      name: formatIngredientName(ing.name),
      category: categorizeIngredient(ing.name),
      grams: 0,
      leftovers: new Map<string, number>(),
    };

    const grams = ing.grams ?? toGrams(ing.name, ing.quantity, ing.unit, gramOverrides);

    if (grams != null && grams > 0) {
      bucket.grams += grams;
    } else {
      const unit = ing.unit?.trim() || "pièce";
      bucket.leftovers.set(unit, (bucket.leftovers.get(unit) ?? 0) + ing.quantity);
    }

    buckets.set(key, bucket);
  }

  const items: ShoppingDraft[] = [];

  for (const bucket of buckets.values()) {
    if (bucket.grams > 0) {
      const { quantity, unit } = formatGrams(bucket.grams);
      items.push({
        name: bucket.name,
        quantity,
        unit,
        category: bucket.category,
        is_checked: false,
        is_manual: false,
      });
    }

    for (const [unit, quantity] of bucket.leftovers) {
      items.push({
        name: bucket.name,
        quantity,
        unit,
        category: bucket.category,
        is_checked: false,
        is_manual: false,
      });
    }
  }

  return items.sort(
    (a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
  );
}

export function getWeekStart(date = new Date()): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0];
}
