import type { Recipe, RecipeCategory } from "@/types";

const RESTRICTED_FRIEND_VISIBLE_CATEGORIES = new Set<RecipeCategory>([
  "petit_dejeuner",
  "snack",
]);

export function isVisibleToFriends(category: RecipeCategory | string | null | undefined): boolean {
  return category != null && !RESTRICTED_FRIEND_VISIBLE_CATEGORIES.has(category as RecipeCategory);
}

export function filterVisibleToFriends(recipes: Recipe[]): Recipe[] {
  return recipes.filter((recipe) => isVisibleToFriends(recipe.category));
}

export { RESTRICTED_FRIEND_VISIBLE_CATEGORIES };
