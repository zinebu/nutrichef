"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  CreateRecipeInput,
  MealPlan,
  Recipe,
  RecipeFilters,
  ShoppingList,
  ShoppingListItem,
} from "@/types";
import { getWeekStart, mergeIngredients, categorizeIngredient } from "@/lib/utils/shopping-list";
import { normalizeIngredientName, getIngredientKey } from "@/lib/utils/ingredient-normalize";

const STORAGE_KEYS = {
  recipes: "cherry_recipes",
  mealPlan: "cherry_meal_plan",
  shoppingList: "cherry_shopping_list",
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

const DEMO_RECIPES: Recipe[] = [
  {
    id: "demo-1",
    user_id: "demo",
    name: "Salade avocat poulet",
    description: "Salade fraîche et protéinée",
    photo_url: null,
    category: "dejeuner",
    tags: ["healthy", "proteine", "rapide"],
    cooking_type: "cru",
    prep_time_minutes: 15,
    servings: 2,
    is_favorite: true,
    calories_total: 520,
    calories_per_serving: 260,
    proteins_g: 35,
    carbs_g: 12,
    fats_g: 38,
    sugar_g: 3,
    fiber_g: 8,
    nutrition_tips: "Excellente source de protéines et de bonnes graisses.",
    ai_detected_foods: ["avocat", "poulet", "salade"],
    ingredients: [
      { name: "Poulet", quantity: 200, unit: "g" },
      { name: "Avocat", quantity: 1, unit: "pièce" },
      { name: "Salade", quantity: 100, unit: "g" },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-2",
    user_id: "demo",
    name: "Omelette aux herbes",
    description: "Petit déjeuner rapide et savoureux",
    photo_url: null,
    category: "petit_dejeuner",
    tags: ["rapide", "proteine", "vegetarien"],
    cooking_type: "saute",
    prep_time_minutes: 10,
    servings: 1,
    is_favorite: false,
    calories_total: 280,
    calories_per_serving: 280,
    proteins_g: 18,
    carbs_g: 2,
    fats_g: 22,
    sugar_g: 1,
    fiber_g: 0,
    nutrition_tips: "Idéal pour un petit déjeuner protéiné.",
    ai_detected_foods: ["oeufs", "herbes"],
    ingredients: [
      { name: "Oeufs", quantity: 3, unit: "pièce" },
      { name: "Beurre", quantity: 10, unit: "g" },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export function useRecipes() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recipes");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data);
      } else {
        const stored = loadFromStorage<Recipe[]>(STORAGE_KEYS.recipes, DEMO_RECIPES);
        setRecipes(stored.length ? stored : DEMO_RECIPES);
      }
    } catch {
      const stored = loadFromStorage<Recipe[]>(STORAGE_KEYS.recipes, DEMO_RECIPES);
      setRecipes(stored.length ? stored : DEMO_RECIPES);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  const createRecipe = async (input: CreateRecipeInput) => {
    const normalizedInput = {
      ...input,
      ingredients: input.ingredients.map((ing) => ({
        ...ing,
        name: normalizeIngredientName(ing.name),
      })),
    };

    const res = await fetch("/api/recipes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(normalizedInput),
    });
    if (res.ok) {
      const recipe = await res.json();
      setRecipes((prev) => [recipe, ...prev]);
      return recipe;
    }

    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      user_id: "local",
      name: input.name,
      description: input.description ?? null,
      photo_url: input.photo_url ?? null,
      category: input.category,
      tags: input.tags,
      cooking_type: input.cooking_type ?? null,
      prep_time_minutes: input.prep_time_minutes ?? null,
      servings: input.servings ?? 1,
      is_favorite: false,
      calories_total: input.nutrition?.caloriesTotal ?? null,
      calories_per_serving: input.nutrition?.caloriesPerServing ?? null,
      proteins_g: input.nutrition?.proteinsG ?? null,
      carbs_g: input.nutrition?.carbsG ?? null,
      fats_g: input.nutrition?.fatsG ?? null,
      sugar_g: input.nutrition?.sugarG ?? null,
      fiber_g: input.nutrition?.fiberG ?? null,
      nutrition_tips: input.nutrition?.tips ?? null,
      ai_detected_foods: input.nutrition?.detectedFoods ?? [],
      ingredients: normalizedInput.ingredients,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRecipes((prev) => {
      const updated = [newRecipe, ...prev];
      saveToStorage(STORAGE_KEYS.recipes, updated);
      return updated;
    });
    return newRecipe;
  };

  const toggleFavorite = async (id: string) => {
    const res = await fetch(`/api/recipes/${id}/favorite`, { method: "PATCH" });
    if (res.ok) {
      const updated = await res.json();
      setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return;
    }
    setRecipes((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, is_favorite: !r.is_favorite } : r
      );
      saveToStorage(STORAGE_KEYS.recipes, updated);
      return updated;
    });
  };

  const deleteRecipe = async (id: string) => {
    await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    setRecipes((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveToStorage(STORAGE_KEYS.recipes, updated);
      return updated;
    });
  };

  const filterRecipes = (filters: RecipeFilters): Recipe[] => {
    return recipes.filter((recipe) => {
      if (filters.favoritesOnly && !recipe.is_favorite) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        if (
          !recipe.name.toLowerCase().includes(q) &&
          !recipe.description?.toLowerCase().includes(q)
        )
          return false;
      }
      if (filters.category && recipe.category !== filters.category) return false;
      if (filters.cookingType && recipe.cooking_type !== filters.cookingType)
        return false;
      if (filters.maxCalories && (recipe.calories_per_serving ?? 9999) > filters.maxCalories)
        return false;
      if (filters.maxPrepTime && (recipe.prep_time_minutes ?? 9999) > filters.maxPrepTime)
        return false;
      if (filters.tags.length > 0 && !filters.tags.every((t) => recipe.tags.includes(t)))
        return false;
      if (filters.ingredients.length > 0) {
        const recipeIngredients =
          recipe.ingredients?.map((i) => i.name.toLowerCase()) ?? [];
        if (
          !filters.ingredients.every((ing) =>
            recipeIngredients.some((ri) => ri.includes(ing.toLowerCase()))
          )
        )
          return false;
      }
      return true;
    });
  };

  return {
    recipes,
    loading,
    fetchRecipes,
    createRecipe,
    toggleFavorite,
    deleteRecipe,
    filterRecipes,
  };
}

export function useMealPlan() {
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const weekStart = getWeekStart();

  const fetchMealPlan = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meal-plans?week=${weekStart}`);
      if (res.ok) {
        setMealPlan(await res.json());
      }
    } catch {
      setMealPlan(loadFromStorage(STORAGE_KEYS.mealPlan, null));
    } finally {
      setLoading(false);
    }
  }, [weekStart]);

  useEffect(() => {
    fetchMealPlan();
  }, [fetchMealPlan]);

  const setDayRecipe = async (dayOfWeek: number, recipeId: string | null) => {
    const res = await fetch("/api/meal-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ week_start: weekStart, day_of_week: dayOfWeek, recipe_id: recipeId }),
    });
    if (res.ok) {
      setMealPlan(await res.json());
      return;
    }

    setMealPlan((prev) => {
      const plan: MealPlan = prev ?? {
        id: "local",
        user_id: "local",
        week_start: weekStart,
        items: [],
      };
      const items = [...(plan.items ?? [])];
      const idx = items.findIndex((i) => i.day_of_week === dayOfWeek);
      if (recipeId) {
        const item = { day_of_week: dayOfWeek, recipe_id: recipeId, meal_type: "dejeuner" as const };
        if (idx >= 0) items[idx] = { ...items[idx], ...item };
        else items.push(item);
      } else if (idx >= 0) {
        items.splice(idx, 1);
      }
      const updated = { ...plan, items };
      saveToStorage(STORAGE_KEYS.mealPlan, updated);
      return updated;
    });
  };

  return { mealPlan, loading, setDayRecipe, weekStart, fetchMealPlan };
}

export function useShoppingList(recipes: Recipe[]) {
  const [list, setList] = useState<ShoppingList | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/shopping-lists");
      if (res.ok) setList(await res.json());
    } catch {
      setList(loadFromStorage(STORAGE_KEYS.shoppingList, null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const generateFromMealPlan = async (mealPlan: MealPlan) => {
    const recipeIds = (mealPlan.items ?? [])
      .map((i) => i.recipe_id)
      .filter(Boolean) as string[];
    const selectedRecipes = recipes.filter((r) => recipeIds.includes(r.id));
    const allIngredients = selectedRecipes.flatMap((r) => r.ingredients ?? []);
    const merged = mergeIngredients(allIngredients);

    const res = await fetch("/api/shopping-lists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: merged, meal_plan_id: mealPlan.id }),
    });
    if (res.ok) {
      setList(await res.json());
      return;
    }

    const localList: ShoppingList = {
      id: "local",
      user_id: "local",
      meal_plan_id: mealPlan.id,
      name: "Liste de courses",
      items: merged.map((item, i) => ({
        ...item,
        id: `item-${i}`,
        shopping_list_id: "local",
      })),
    };
    saveToStorage(STORAGE_KEYS.shoppingList, localList);
    setList(localList);
  };

  const toggleItem = async (itemId: string) => {
    setList((prev) => {
      if (!prev?.items) return prev;
      const updated = {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, is_checked: !i.is_checked } : i
        ),
      };
      saveToStorage(STORAGE_KEYS.shoppingList, updated);
      return updated;
    });
  };

  const addItem = (name: string) => {
    const normalized = normalizeIngredientName(name);
    setList((prev) => {
      const items = [...(prev?.items ?? [])];
      const existing = items.find(
        (i) => normalizeIngredientName(i.name) === getIngredientKey(normalized)
      );
      if (existing) return prev;

      const newItem: ShoppingListItem = {
        id: crypto.randomUUID(),
        shopping_list_id: prev?.id ?? "local",
        name: normalized,
        quantity: null,
        unit: null,
        category: categorizeIngredient(normalized),
        is_checked: false,
        is_manual: true,
      };
      const updated = {
        id: prev?.id ?? "local",
        user_id: "local",
        meal_plan_id: prev?.meal_plan_id ?? null,
        name: prev?.name ?? "Liste de courses",
        items: [...items, newItem],
      };
      saveToStorage(STORAGE_KEYS.shoppingList, updated);
      return updated;
    });
  };

  const removeItem = (itemId: string) => {
    setList((prev) => {
      if (!prev?.items) return prev;
      const updated = { ...prev, items: prev.items.filter((i) => i.id !== itemId) };
      saveToStorage(STORAGE_KEYS.shoppingList, updated);
      return updated;
    });
  };

  return {
    list,
    loading,
    generateFromMealPlan,
    toggleItem,
    addItem,
    removeItem,
    fetchList,
  };
}
