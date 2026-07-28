import type { CookingType, MealSlot, RecipeCategory, RecipeTag } from "@/types";

export const APP_NAME = "Cherry";

export const DEMO_COOKIE = "cherry_demo";

export const RECIPE_CATEGORIES: { value: RecipeCategory; label: string }[] = [
  { value: "petit_dejeuner", label: "Petit déjeuner" },
  { value: "dejeuner", label: "Déjeuner" },
  { value: "diner", label: "Dîner" },
  { value: "dessert", label: "Dessert" },
  { value: "snack", label: "Snack" },
];

export const COOKING_TYPES: { value: CookingType; label: string }[] = [
  { value: "frit", label: "Frit" },
  { value: "bouilli", label: "Bouilli" },
  { value: "vapeur", label: "Vapeur" },
  { value: "four", label: "Four" },
  { value: "grille", label: "Grillé" },
  { value: "saute", label: "Sauté" },
  { value: "cru", label: "Cru" },
];

export const RECIPE_TAGS: { value: RecipeTag; label: string; color: string }[] = [
  { value: "healthy", label: "Healthy", color: "bg-red-500/10 text-red-600" },
  { value: "sucre", label: "Sucré", color: "bg-red-500/15 text-red-500" },
  { value: "proteine", label: "Protéiné", color: "bg-neutral-500/10 text-neutral-600" },
  { value: "rapide", label: "Rapide", color: "bg-red-500/10 text-red-400" },
  { value: "vegetarien", label: "Végétarien", color: "bg-red-500/10 text-red-600" },
  { value: "sans_gluten", label: "Sans gluten", color: "bg-neutral-500/10 text-neutral-500" },
  { value: "leger", label: "Léger", color: "bg-red-500/10 text-red-400" },
  { value: "gourmand", label: "Gourmand", color: "bg-red-600/15 text-red-700" },
];

/** Repère calorique quotidien utilisé pour équilibrer les suggestions */
export const DAILY_CALORIE_TARGET = 2000;

/** Créneaux fixes affichés pour chaque journée du planning */
export const MEAL_SLOTS: {
  value: Exclude<MealSlot, "snack">;
  label: string;
  short: string;
}[] = [
  { value: "petit_dejeuner", label: "Petit déjeuner", short: "Matin" },
  { value: "dejeuner", label: "Repas principal", short: "Midi" },
  { value: "diner", label: "Dîner", short: "Soir" },
];

export const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export const SHOPPING_CATEGORIES: Record<string, string> = {
  legumes: "Légumes",
  fruits: "Fruits",
  proteines: "Protéines",
  laitiers: "Laitiers",
  feculents: "Féculents",
  epices: "Épices & Condiments",
  autres: "Autres",
};