import type { CookingType, RecipeCategory, RecipeTag } from "@/types";

export const APP_NAME = "NutriChef";

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
  { value: "healthy", label: "Healthy", color: "bg-emerald-500/20 text-emerald-400" },
  { value: "sucre", label: "Sucré", color: "bg-pink-500/20 text-pink-400" },
  { value: "proteine", label: "Protéiné", color: "bg-blue-500/20 text-blue-400" },
  { value: "rapide", label: "Rapide", color: "bg-amber-500/20 text-amber-400" },
  { value: "vegetarien", label: "Végétarien", color: "bg-green-500/20 text-green-400" },
  { value: "sans_gluten", label: "Sans gluten", color: "bg-orange-500/20 text-orange-400" },
  { value: "leger", label: "Léger", color: "bg-cyan-500/20 text-cyan-400" },
  { value: "gourmand", label: "Gourmand", color: "bg-purple-500/20 text-purple-400" },
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

export const INGREDIENT_CATEGORY_MAP: Record<string, string> = {
  tomate: "legumes",
  oignon: "legumes",
  avocat: "legumes",
  carotte: "legumes",
  salade: "legumes",
  courgette: "legumes",
  poivron: "legumes",
  pomme: "fruits",
  banane: "fruits",
  citron: "fruits",
  poulet: "proteines",
  boeuf: "proteines",
  saumon: "proteines",
  oeuf: "proteines",
  tofu: "proteines",
  lait: "laitiers",
  fromage: "laitiers",
  yaourt: "laitiers",
  riz: "feculents",
  pates: "feculents",
  pain: "feculents",
  pomme_de_terre: "feculents",
};
