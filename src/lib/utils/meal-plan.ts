import { MEAL_SLOTS } from "@/lib/constants";
import type { MealPlan, MealPlanItem, MealSlot, Recipe } from "@/types";

function resolveRecipe(
  item: MealPlanItem,
  recipes: Recipe[]
): Recipe | null {
  if (!item.recipe_id) return null;
  return recipes.find((r) => r.id === item.recipe_id) ?? item.recipe ?? null;
}

export function itemsForDay(plan: MealPlan | null, day: number): MealPlanItem[] {
  return (plan?.items ?? []).filter((item) => item.day_of_week === day);
}

export function recipeForSlot(
  plan: MealPlan | null,
  recipes: Recipe[],
  day: number,
  slot: MealSlot
): Recipe | null {
  const item = itemsForDay(plan, day).find((i) => i.meal_type === slot);
  return item ? resolveRecipe(item, recipes) : null;
}

export interface SnackEntry {
  item: MealPlanItem;
  recipe: Recipe;
}

export function snacksForDay(
  plan: MealPlan | null,
  recipes: Recipe[],
  day: number
): SnackEntry[] {
  return itemsForDay(plan, day)
    .filter((item) => item.meal_type === "snack")
    .map((item) => ({ item, recipe: resolveRecipe(item, recipes) }))
    .filter((entry): entry is SnackEntry => entry.recipe !== null);
}

export function dayCalories(
  plan: MealPlan | null,
  recipes: Recipe[],
  day: number
): number {
  return itemsForDay(plan, day).reduce((total, item) => {
    const recipe = resolveRecipe(item, recipes);
    return total + (recipe?.calories_per_serving ?? 0);
  }, 0);
}

/** Créneaux fixes encore vides pour cette journée */
export function emptySlotsForDay(
  plan: MealPlan | null,
  recipes: Recipe[],
  day: number
): Array<Exclude<MealSlot, "snack">> {
  return MEAL_SLOTS.filter(
    (slot) => !recipeForSlot(plan, recipes, day, slot.value)
  ).map((slot) => slot.value);
}

export function isDayPlanned(plan: MealPlan | null, day: number): boolean {
  return itemsForDay(plan, day).some((item) => item.recipe_id);
}

/** Repas mis en avant pour une journée : midi, sinon soir, sinon matin */
export function mainRecipeForDay(
  plan: MealPlan | null,
  recipes: Recipe[],
  day: number
): Recipe | null {
  return (
    recipeForSlot(plan, recipes, day, "dejeuner") ??
    recipeForSlot(plan, recipes, day, "diner") ??
    recipeForSlot(plan, recipes, day, "petit_dejeuner") ??
    null
  );
}
