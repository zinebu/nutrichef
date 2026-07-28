"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  CreateRecipeInput,
  MealPlan,
  MealPlanItem,
  MealSlot,
  QuickNutrition,
  Recipe,
  RecipeFilters,
  ShoppingList,
  ShoppingListItem,
} from "@/types";
import { isDemoModeClient } from "@/lib/demo";
import { getWeekStart, mergeIngredients, categorizeIngredient } from "@/lib/utils/shopping-list";
import { normalizeIngredientName, getIngredientKey } from "@/lib/utils/ingredient-normalize";
import { compressImage } from "@/lib/utils/image-compress";
import { resolveGramOverrides } from "@/lib/utils/weight-resolver";
import { toGrams } from "@/lib/utils/unit-convert";
import {
  getBreakfastAppliedWeek,
  getDefaultBreakfastId,
  markBreakfastApplied,
  setDefaultBreakfastId,
} from "@/lib/preferences";

const STORAGE_KEYS = {
  recipes: "cherry_recipes",
  mealPlan: "cherry_meal_plan",
  shoppingList: "cherry_shopping_list",
};

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

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

let saveTimers: Record<string, ReturnType<typeof setTimeout>> = {};

function saveToStorageDebounced<T>(key: string, data: T) {
  clearTimeout(saveTimers[key]);
  saveTimers[key] = setTimeout(() => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch {
      // Quota dépassé — ignorer silencieusement
    }
  }, 300);
}

function useLocalOnly(): boolean {
  return isDemoModeClient();
}

async function shrinkRecipePhotos(recipes: Recipe[]): Promise<Recipe[]> {
  let changed = false;
  const result = await Promise.all(
    recipes.map(async (recipe) => {
      const photo = recipe.photo_url;
      if (photo?.startsWith("data:") && photo.length > 150_000) {
        try {
          changed = true;
          return { ...recipe, photo_url: await compressImage(photo, 600, 0.72) };
        } catch {
          return recipe;
        }
      }
      return recipe;
    })
  );
  if (changed) saveToStorageDebounced(STORAGE_KEYS.recipes, result);
  return result;
}

async function normalizeRecipeInput(input: CreateRecipeInput) {
  let photo_url = input.photo_url;
  if (photo_url?.startsWith("data:")) {
    photo_url = await compressImage(photo_url, 800, 0.75);
  }

  return {
    ...input,
    photo_url,
    ingredients: input.ingredients.map((ing) => {
      const name = normalizeIngredientName(ing.name);
      return {
        ...ing,
        name,
        grams: ing.grams ?? toGrams(name, ing.quantity, ing.unit) ?? undefined,
      };
    }),
  };
}

interface AppDataContextValue {
  recipes: Recipe[];
  recipesLoading: boolean;
  createRecipe: (input: CreateRecipeInput) => Promise<Recipe>;
  updateRecipe: (id: string, input: CreateRecipeInput) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  filterRecipes: (filters: RecipeFilters) => Recipe[];
  mealPlan: MealPlan | null;
  mealPlanLoading: boolean;
  setDayRecipe: (day: number, slot: MealSlot, recipeId: string | null) => Promise<void>;
  addSnack: (day: number, recipeId: string) => Promise<void>;
  addQuickSnack: (day: number, name: string, quantity?: string) => Promise<QuickNutrition>;
  addManualSnack: (day: number, name: string, calories: number) => Promise<void>;
  removeMealItem: (item: MealPlanItem) => Promise<void>;
  defaultBreakfastId: string | null;
  setDefaultBreakfast: (recipeId: string | null) => void;
  applyDefaultBreakfast: (recipeId: string) => Promise<void>;
  weekStart: string;
  list: ShoppingList | null;
  listLoading: boolean;
  generateFromMealPlan: (mealPlan: MealPlan) => Promise<void>;
  toggleItem: (itemId: string) => void;
  addItem: (name: string) => void;
  removeItem: (itemId: string) => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipesLoading, setRecipesLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState<MealPlan | null>(null);
  const [mealPlanLoading, setMealPlanLoading] = useState(true);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [listLoading, setListLoading] = useState(true);
  const [defaultBreakfastId, setDefaultBreakfastState] = useState<string | null>(null);
  const initialized = useRef(false);

  const weekStart = getWeekStart();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const localRecipes = loadFromStorage<Recipe[]>(STORAGE_KEYS.recipes, DEMO_RECIPES);
    setRecipes(localRecipes.length ? localRecipes : DEMO_RECIPES);
    setRecipesLoading(false);
    setMealPlan(loadFromStorage(STORAGE_KEYS.mealPlan, null));
    setMealPlanLoading(false);
    setList(loadFromStorage(STORAGE_KEYS.shoppingList, null));
    setListLoading(false);
    setDefaultBreakfastState(getDefaultBreakfastId());

    shrinkRecipePhotos(localRecipes.length ? localRecipes : DEMO_RECIPES).then(setRecipes);

    if (useLocalOnly()) return;

    fetch("/api/recipes")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setRecipes(data);
      })
      .catch(() => {});

    fetch(`/api/meal-plans?week=${weekStart}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setMealPlan(data);
      })
      .catch(() => {});

    fetch("/api/shopping-lists")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setList(data);
      })
      .catch(() => {});
  }, [weekStart]);

  const createRecipe = useCallback(async (input: CreateRecipeInput) => {
    const normalizedInput = await normalizeRecipeInput(input);
    const photo_url = normalizedInput.photo_url;

    if (!useLocalOnly()) {
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
    }

    const newRecipe: Recipe = {
      id: crypto.randomUUID(),
      user_id: "local",
      name: normalizedInput.name,
      description: normalizedInput.description ?? null,
      photo_url: photo_url ?? null,
      category: normalizedInput.category,
      tags: normalizedInput.tags,
      cooking_type: normalizedInput.cooking_type ?? null,
      prep_time_minutes: normalizedInput.prep_time_minutes ?? null,
      servings: normalizedInput.servings ?? 1,
      is_favorite: false,
      calories_total: normalizedInput.nutrition?.caloriesTotal ?? null,
      calories_per_serving: normalizedInput.nutrition?.caloriesPerServing ?? null,
      proteins_g: normalizedInput.nutrition?.proteinsG ?? null,
      carbs_g: normalizedInput.nutrition?.carbsG ?? null,
      fats_g: normalizedInput.nutrition?.fatsG ?? null,
      sugar_g: normalizedInput.nutrition?.sugarG ?? null,
      fiber_g: normalizedInput.nutrition?.fiberG ?? null,
      nutrition_tips: normalizedInput.nutrition?.tips ?? null,
      ai_detected_foods: normalizedInput.nutrition?.detectedFoods ?? [],
      ingredients: normalizedInput.ingredients,
      cooking_fat_type: normalizedInput.cooking_fat_type ?? null,
      cooking_fat_grams: normalizedInput.cooking_fat_grams ?? null,
      total_cooked_weight_g: normalizedInput.total_cooked_weight_g ?? null,
      extras: normalizedInput.extras ?? null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setRecipes((prev) => {
      const updated = [newRecipe, ...prev];
      saveToStorageDebounced(STORAGE_KEYS.recipes, updated);
      return updated;
    });
    return newRecipe;
  }, []);

  const updateRecipe = useCallback(async (id: string, input: CreateRecipeInput) => {
    const normalizedInput = await normalizeRecipeInput(input);

    if (!useLocalOnly()) {
      const res = await fetch(`/api/recipes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedInput),
      });
      if (res.ok) {
        const updated = await res.json();
        setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)));
        return;
      }
    }

    setRecipes((prev) => {
      const updated = prev.map((recipe) =>
        recipe.id === id
          ? {
              ...recipe,
              name: normalizedInput.name,
              description: normalizedInput.description ?? null,
              photo_url: normalizedInput.photo_url ?? null,
              category: normalizedInput.category,
              tags: normalizedInput.tags,
              cooking_type: normalizedInput.cooking_type ?? null,
              prep_time_minutes: normalizedInput.prep_time_minutes ?? null,
              servings: normalizedInput.servings ?? 1,
              calories_total: normalizedInput.nutrition?.caloriesTotal ?? null,
              calories_per_serving: normalizedInput.nutrition?.caloriesPerServing ?? null,
              proteins_g: normalizedInput.nutrition?.proteinsG ?? null,
              carbs_g: normalizedInput.nutrition?.carbsG ?? null,
              fats_g: normalizedInput.nutrition?.fatsG ?? null,
              sugar_g: normalizedInput.nutrition?.sugarG ?? null,
              fiber_g: normalizedInput.nutrition?.fiberG ?? null,
              nutrition_tips: normalizedInput.nutrition?.tips ?? null,
              ai_detected_foods: normalizedInput.nutrition?.detectedFoods ?? [],
              ingredients: normalizedInput.ingredients,
              cooking_fat_type: normalizedInput.cooking_fat_type ?? null,
              cooking_fat_grams: normalizedInput.cooking_fat_grams ?? null,
              total_cooked_weight_g: normalizedInput.total_cooked_weight_g ?? null,
              extras: normalizedInput.extras ?? null,
              updated_at: new Date().toISOString(),
            }
          : recipe
      );
      saveToStorageDebounced(STORAGE_KEYS.recipes, updated);
      return updated;
    });
  }, []);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!useLocalOnly()) {
      const res = await fetch(`/api/recipes/${id}/favorite`, { method: "PATCH" });
      if (res.ok) {
        const updated = await res.json();
        setRecipes((prev) => prev.map((r) => (r.id === id ? updated : r)));
        return;
      }
    }
    setRecipes((prev) => {
      const updated = prev.map((r) =>
        r.id === id ? { ...r, is_favorite: !r.is_favorite } : r
      );
      saveToStorageDebounced(STORAGE_KEYS.recipes, updated);
      return updated;
    });
  }, []);

  const deleteRecipe = useCallback(async (id: string) => {
    if (!useLocalOnly()) await fetch(`/api/recipes/${id}`, { method: "DELETE" });
    setRecipes((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      saveToStorageDebounced(STORAGE_KEYS.recipes, updated);
      return updated;
    });
  }, []);

  const filterRecipes = useCallback(
    (filters: RecipeFilters): Recipe[] =>
      recipes.filter((recipe) => {
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
        if (filters.cookingType && recipe.cooking_type !== filters.cookingType) return false;
        if (filters.maxCalories && (recipe.calories_per_serving ?? 9999) > filters.maxCalories)
          return false;
        if (filters.maxPrepTime && (recipe.prep_time_minutes ?? 9999) > filters.maxPrepTime)
          return false;
        if (filters.tags.length > 0 && !filters.tags.every((t) => recipe.tags.includes(t)))
          return false;
        return true;
      }),
    [recipes]
  );

  const updateLocalPlan = useCallback(
    (mutate: (items: MealPlanItem[]) => MealPlanItem[]) => {
      setMealPlan((prev) => {
        const plan: MealPlan = prev ?? {
          id: "local",
          user_id: "local",
          week_start: weekStart,
          items: [],
        };
        const updated = { ...plan, items: mutate([...(plan.items ?? [])]) };
        saveToStorageDebounced(STORAGE_KEYS.mealPlan, updated);
        return updated;
      });
    },
    [weekStart]
  );

  const setDayRecipe = useCallback(
    async (dayOfWeek: number, slot: MealSlot, recipeId: string | null) => {
      if (!useLocalOnly()) {
        const res = await fetch("/api/meal-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            week_start: weekStart,
            day_of_week: dayOfWeek,
            meal_type: slot,
            recipe_id: recipeId,
            mode: "set",
          }),
        });
        if (res.ok) {
          setMealPlan(await res.json());
          return;
        }
      }

      updateLocalPlan((items) => {
        const kept = items.filter(
          (i) => !(i.day_of_week === dayOfWeek && i.meal_type === slot)
        );
        if (!recipeId) return kept;
        return [
          ...kept,
          {
            id: crypto.randomUUID(),
            day_of_week: dayOfWeek,
            recipe_id: recipeId,
            meal_type: slot,
          },
        ];
      });
    },
    [weekStart, updateLocalPlan]
  );

  const addSnack = useCallback(
    async (dayOfWeek: number, recipeId: string) => {
      if (!useLocalOnly()) {
        const res = await fetch("/api/meal-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            week_start: weekStart,
            day_of_week: dayOfWeek,
            meal_type: "snack",
            recipe_id: recipeId,
            mode: "add",
          }),
        });
        if (res.ok) {
          setMealPlan(await res.json());
          return;
        }
      }

      updateLocalPlan((items) => [
        ...items,
        {
          id: crypto.randomUUID(),
          day_of_week: dayOfWeek,
          recipe_id: recipeId,
          meal_type: "snack",
        },
      ]);
    },
    [weekStart, updateLocalPlan]
  );

  const removeMealItem = useCallback(
    async (item: MealPlanItem) => {
      if (!useLocalOnly() && item.id) {
        const res = await fetch("/api/meal-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ week_start: weekStart, remove_item_id: item.id }),
        });
        if (res.ok) {
          setMealPlan(await res.json());
          return;
        }
      }

      updateLocalPlan((items) => {
        if (item.id) return items.filter((i) => i.id !== item.id);
        const idx = items.findIndex(
          (i) =>
            i.day_of_week === item.day_of_week &&
            i.meal_type === item.meal_type &&
            i.recipe_id === item.recipe_id
        );
        if (idx >= 0) items.splice(idx, 1);
        return items;
      });
    },
    [weekStart, updateLocalPlan]
  );

  /** Snack acheté saisi au clavier : l'IA estime l'apport, puis on l'enregistre */
  const addQuickSnack = useCallback(
    async (dayOfWeek: number, name: string, quantity?: string) => {
      const res = await fetch("/api/nutrition/quick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, quantity }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Analyse impossible");
      }
      const nutrition: QuickNutrition = await res.json();

      const recipe = await createRecipe({
        name: nutrition.name,
        description: nutrition.servingDescription,
        category: "snack",
        tags: [],
        servings: 1,
        ingredients: [{ name: nutrition.name, quantity: 1, unit: "pièce" }],
        nutrition: {
          detectedFoods: [],
          caloriesTotal: nutrition.caloriesPerServing,
          caloriesPerServing: nutrition.caloriesPerServing,
          proteinsG: nutrition.proteinsG,
          carbsG: nutrition.carbsG,
          fatsG: nutrition.fatsG,
          sugarG: nutrition.sugarG,
          fiberG: nutrition.fiberG,
          tips: nutrition.tips ?? "",
        },
      });

      await addSnack(dayOfWeek, recipe.id);
      return nutrition;
    },
    [createRecipe, addSnack]
  );

  /** Repli sans IA : les calories lues sur l'emballage */
  const addManualSnack = useCallback(
    async (dayOfWeek: number, name: string, calories: number) => {
      const recipe = await createRecipe({
        name,
        category: "snack",
        tags: [],
        servings: 1,
        ingredients: [{ name, quantity: 1, unit: "pièce" }],
        nutrition: { caloriesTotal: calories, caloriesPerServing: calories },
      });
      await addSnack(dayOfWeek, recipe.id);
    },
    [createRecipe, addSnack]
  );

  const setDefaultBreakfast = useCallback((recipeId: string | null) => {
    setDefaultBreakfastId(recipeId);
    setDefaultBreakfastState(recipeId);
  }, []);

  /** Remplit d'un coup les créneaux petit déjeuner encore vides de la semaine */
  const applyDefaultBreakfast = useCallback(
    async (recipeId: string) => {
      const planned = new Set(
        (mealPlan?.items ?? [])
          .filter((i) => i.meal_type === "petit_dejeuner" && i.recipe_id)
          .map((i) => i.day_of_week)
      );
      const days = [0, 1, 2, 3, 4, 5, 6].filter((day) => !planned.has(day));
      if (days.length === 0) return;

      if (!useLocalOnly()) {
        const res = await fetch("/api/meal-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            week_start: weekStart,
            bulk: days.map((day) => ({
              day_of_week: day,
              meal_type: "petit_dejeuner",
              recipe_id: recipeId,
            })),
          }),
        });
        if (res.ok) {
          setMealPlan(await res.json());
          return;
        }
      }

      updateLocalPlan((items) => [
        ...items,
        ...days.map((day) => ({
          id: crypto.randomUUID(),
          day_of_week: day,
          recipe_id: recipeId,
          meal_type: "petit_dejeuner" as const,
        })),
      ]);
    },
    [mealPlan, weekStart, updateLocalPlan]
  );

  // Le petit déjeuner par défaut se pose tout seul une fois par semaine.
  // Retirer un jour ensuite ne le fait pas revenir.
  useEffect(() => {
    if (mealPlanLoading || recipesLoading) return;
    if (!defaultBreakfastId) return;
    if (getBreakfastAppliedWeek() === weekStart) return;
    if (!recipes.some((r) => r.id === defaultBreakfastId)) return;
    markBreakfastApplied(weekStart);
    applyDefaultBreakfast(defaultBreakfastId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mealPlanLoading, recipesLoading, defaultBreakfastId, weekStart, recipes.length]);

  const generateFromMealPlan = useCallback(
    async (plan: MealPlan) => {
      const recipeIds = (plan.items ?? []).map((i) => i.recipe_id).filter(Boolean) as string[];
      const selectedRecipes = recipes.filter((r) => recipeIds.includes(r.id));
      const allIngredients = selectedRecipes.flatMap((r) => r.ingredients ?? []);
      const gramOverrides = await resolveGramOverrides(allIngredients);
      const merged = mergeIngredients(allIngredients, gramOverrides);

      if (!useLocalOnly()) {
        const res = await fetch("/api/shopping-lists", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: merged, meal_plan_id: plan.id }),
        });
        if (res.ok) {
          setList(await res.json());
          return;
        }
      }

      const localList: ShoppingList = {
        id: "local",
        user_id: "local",
        meal_plan_id: plan.id,
        name: "Liste de courses",
        items: merged.map((item, i) => ({
          ...item,
          id: `item-${i}`,
          shopping_list_id: "local",
        })),
      };
      saveToStorageDebounced(STORAGE_KEYS.shoppingList, localList);
      setList(localList);
    },
    [recipes]
  );

  const toggleItem = useCallback((itemId: string) => {
    setList((prev) => {
      if (!prev?.items) return prev;
      const updated = {
        ...prev,
        items: prev.items.map((i) =>
          i.id === itemId ? { ...i, is_checked: !i.is_checked } : i
        ),
      };
      saveToStorageDebounced(STORAGE_KEYS.shoppingList, updated);
      return updated;
    });
  }, []);

  const addItem = useCallback((name: string) => {
    const normalized = normalizeIngredientName(name);
    setList((prev) => {
      const items = [...(prev?.items ?? [])];
      if (items.some((i) => getIngredientKey(i.name) === getIngredientKey(normalized))) {
        return prev;
      }
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
      saveToStorageDebounced(STORAGE_KEYS.shoppingList, updated);
      return updated;
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setList((prev) => {
      if (!prev?.items) return prev;
      const updated = { ...prev, items: prev.items.filter((i) => i.id !== itemId) };
      saveToStorageDebounced(STORAGE_KEYS.shoppingList, updated);
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({
      recipes,
      recipesLoading,
      createRecipe,
      updateRecipe,
      toggleFavorite,
      deleteRecipe,
      filterRecipes,
      mealPlan,
      mealPlanLoading,
      setDayRecipe,
      addSnack,
      addQuickSnack,
      addManualSnack,
      removeMealItem,
      defaultBreakfastId,
      setDefaultBreakfast,
      applyDefaultBreakfast,
      weekStart,
      list,
      listLoading,
      generateFromMealPlan,
      toggleItem,
      addItem,
      removeItem,
    }),
    [
      recipes,
      recipesLoading,
      createRecipe,
      updateRecipe,
      toggleFavorite,
      deleteRecipe,
      filterRecipes,
      mealPlan,
      mealPlanLoading,
      setDayRecipe,
      addSnack,
      addQuickSnack,
      addManualSnack,
      removeMealItem,
      defaultBreakfastId,
      setDefaultBreakfast,
      applyDefaultBreakfast,
      weekStart,
      list,
      listLoading,
      generateFromMealPlan,
      toggleItem,
      addItem,
      removeItem,
    ]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

function useAppDataContext() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}

export function useRecipes() {
  const ctx = useAppDataContext();
  return {
    recipes: ctx.recipes,
    loading: ctx.recipesLoading,
    fetchRecipes: () => {},
    createRecipe: ctx.createRecipe,
    updateRecipe: ctx.updateRecipe,
    toggleFavorite: ctx.toggleFavorite,
    deleteRecipe: ctx.deleteRecipe,
    filterRecipes: ctx.filterRecipes,
  };
}

export function useMealPlan() {
  const ctx = useAppDataContext();
  return {
    mealPlan: ctx.mealPlan,
    loading: ctx.mealPlanLoading,
    setDayRecipe: ctx.setDayRecipe,
    addSnack: ctx.addSnack,
    addQuickSnack: ctx.addQuickSnack,
    addManualSnack: ctx.addManualSnack,
    removeMealItem: ctx.removeMealItem,
    defaultBreakfastId: ctx.defaultBreakfastId,
    setDefaultBreakfast: ctx.setDefaultBreakfast,
    applyDefaultBreakfast: ctx.applyDefaultBreakfast,
    weekStart: ctx.weekStart,
    fetchMealPlan: () => {},
  };
}

export function useShoppingList() {
  const ctx = useAppDataContext();
  return {
    list: ctx.list,
    loading: ctx.listLoading,
    generateFromMealPlan: ctx.generateFromMealPlan,
    toggleItem: ctx.toggleItem,
    addItem: ctx.addItem,
    removeItem: ctx.removeItem,
    fetchList: () => {},
  };
}
