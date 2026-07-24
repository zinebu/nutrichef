import { INGREDIENT_CATEGORY_MAP } from "@/lib/constants";
import type { Ingredient, ShoppingListItem } from "@/types";

function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export function categorizeIngredient(name: string): string {
  const normalized = normalizeName(name);
  for (const [key, category] of Object.entries(INGREDIENT_CATEGORY_MAP)) {
    if (normalized.includes(key.replace(/_/g, " ")) || normalized.includes(key)) {
      return category;
    }
  }
  if (/légume|legume|herbe|ail|épinard|brocoli/.test(normalized)) return "legumes";
  if (/fruit|baie/.test(normalized)) return "fruits";
  if (/poulet|viande|poisson|oeuf|tofu|jambon/.test(normalized)) return "proteines";
  if (/lait|fromage|crème|beurre|yaourt/.test(normalized)) return "laitiers";
  if (/riz|pâte|pain|farine|semoule|quinoa/.test(normalized)) return "feculents";
  if (/épice|sel|poivre|huile|vinaigre|sauce/.test(normalized)) return "epices";
  return "autres";
}

export function mergeIngredients(ingredients: Ingredient[]): Omit<ShoppingListItem, "id" | "shopping_list_id">[] {
  const merged = new Map<string, Omit<ShoppingListItem, "id" | "shopping_list_id">>();

  for (const ing of ingredients) {
    const key = normalizeName(ing.name);
    const existing = merged.get(key);

    if (existing && existing.unit === ing.unit) {
      existing.quantity = (existing.quantity ?? 0) + ing.quantity;
    } else {
      merged.set(key, {
        name: ing.name.charAt(0).toUpperCase() + ing.name.slice(1),
        quantity: ing.quantity,
        unit: ing.unit,
        category: categorizeIngredient(ing.name),
        is_checked: false,
        is_manual: false,
      });
    }
  }

  return Array.from(merged.values()).sort((a, b) =>
    a.category.localeCompare(b.category) || a.name.localeCompare(b.name)
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
