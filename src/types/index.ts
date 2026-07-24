export type RecipeCategory =
  | "petit_dejeuner"
  | "dejeuner"
  | "diner"
  | "dessert"
  | "snack";

export type CookingType =
  | "frit"
  | "bouilli"
  | "vapeur"
  | "four"
  | "grille"
  | "saute"
  | "cru";

export type RecipeTag =
  | "healthy"
  | "sucre"
  | "proteine"
  | "rapide"
  | "vegetarien"
  | "sans_gluten"
  | "leger"
  | "gourmand";

export interface Ingredient {
  id?: string;
  name: string;
  quantity: number;
  unit: string;
  sort_order?: number;
}

export interface NutritionData {
  detectedFoods: string[];
  caloriesTotal: number;
  caloriesPerServing: number;
  proteinsG: number;
  carbsG: number;
  fatsG: number;
  sugarG: number;
  fiberG: number;
  tips: string;
  estimatedIngredients?: Ingredient[];
}

export interface Recipe {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  photo_url: string | null;
  category: RecipeCategory;
  tags: RecipeTag[];
  cooking_type: CookingType | null;
  prep_time_minutes: number | null;
  servings: number;
  is_favorite: boolean;
  calories_total: number | null;
  calories_per_serving: number | null;
  proteins_g: number | null;
  carbs_g: number | null;
  fats_g: number | null;
  sugar_g: number | null;
  fiber_g: number | null;
  nutrition_tips: string | null;
  ai_detected_foods: string[];
  ingredients?: Ingredient[];
  created_at: string;
  updated_at: string;
}

export interface MealPlanItem {
  id?: string;
  day_of_week: number;
  recipe_id: string | null;
  meal_type: RecipeCategory;
  recipe?: Recipe;
}

export interface MealPlan {
  id: string;
  user_id: string;
  week_start: string;
  items?: MealPlanItem[];
}

export interface ShoppingListItem {
  id: string;
  shopping_list_id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  category: string;
  is_checked: boolean;
  is_manual: boolean;
}

export interface ShoppingList {
  id: string;
  user_id: string;
  meal_plan_id: string | null;
  name: string;
  items?: ShoppingListItem[];
}

export interface RecipeFilters {
  search: string;
  category: RecipeCategory | "";
  tags: RecipeTag[];
  maxCalories: number | null;
  maxPrepTime: number | null;
  cookingType: CookingType | "";
  ingredients: string[];
  favoritesOnly: boolean;
}

export interface CreateRecipeInput {
  name: string;
  description?: string;
  photo_url?: string;
  category: RecipeCategory;
  tags: RecipeTag[];
  cooking_type?: CookingType;
  prep_time_minutes?: number;
  servings?: number;
  ingredients: Ingredient[];
  nutrition?: Partial<NutritionData>;
}
