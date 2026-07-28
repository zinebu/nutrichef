import {
  formatIngredientName,
  getIngredientKey,
} from "@/lib/utils/ingredient-normalize";
import { categorizeByKey } from "@/lib/utils/ingredient-categories";
import type { Ingredient, ShoppingListItem } from "@/types";

function normalizeName(name: string): string {
  return getIngredientKey(name);
}

export function categorizeIngredient(name: string): string {
  const key = getIngredientKey(name);
  return categorizeByKey(key) ?? "autres";
}

export function mergeIngredients(
  ingredients: Ingredient[]
): Omit<ShoppingListItem, "id" | "shopping_list_id">[] {
  const merged = new Map<string, Omit<ShoppingListItem, "id" | "shopping_list_id">>();

  for (const ing of ingredients) {
    const key = normalizeName(ing.name);
    if (!key) continue;

    const displayName = formatIngredientName(ing.name);
    const existing = merged.get(key);

    if (existing && existing.unit === ing.unit) {
      existing.quantity = (existing.quantity ?? 0) + ing.quantity;
    } else if (existing && existing.unit !== ing.unit) {
      const altKey = `${key}__${ing.unit}`;
      merged.set(altKey, {
        name: displayName,
        quantity: ing.quantity,
        unit: ing.unit,
        category: categorizeIngredient(ing.name),
        is_checked: false,
        is_manual: false,
      });
    } else {
      merged.set(key, {
        name: displayName,
        quantity: ing.quantity,
        unit: ing.unit,
        category: categorizeIngredient(ing.name),
        is_checked: false,
        is_manual: false,
      });
    }
  }

  return Array.from(merged.values()).sort(
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
