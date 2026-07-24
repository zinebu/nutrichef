import { INGREDIENT_CATEGORY_MAP } from "@/lib/constants";
import {
  formatIngredientName,
  getIngredientKey,
} from "@/lib/utils/ingredient-normalize";
import type { Ingredient, ShoppingListItem } from "@/types";

function normalizeName(name: string): string {
  return getIngredientKey(name);
}

export function categorizeIngredient(name: string): string {
  const normalized = getIngredientKey(name);
  for (const [key, category] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
    if (normalized.includes(key.replace(/_/g, " ")) || normalized.includes(key)) {
      return category;
    }
  }
  if (/legume|herbe|ail|epinard|brocoli|oignon|tomate|carotte|courgette|poivron/.test(normalized))
    return "legumes";
  if (/fruit|baie|pomme|banane|citron/.test(normalized)) return "fruits";
  if (/poulet|viande|poisson|oeuf|tofu|jambon|crevette|saumon|thon|boeuf/.test(normalized))
    return "proteines";
  if (/lait|fromage|creme|beurre|yaourt/.test(normalized)) return "laitiers";
  if (/riz|pate|pain|farine|semoule|quinoa|pomme de terre/.test(normalized)) return "feculents";
  if (/epice|sel|poivre|huile|vinaigre|sauce|moutarde/.test(normalized)) return "epices";
  return "autres";
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
      // Même ingrédient, unités différentes → entrées séparées avec suffixe
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
