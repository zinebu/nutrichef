"use client";

import { useMemo } from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { TodaySpotlight } from "@/components/home/TodaySpotlight";
import { WeekStrip } from "@/components/home/WeekStrip";
import { RecipeCarousel } from "@/components/home/RecipeCarousel";
import { HomeQuickActions } from "@/components/home/HomeQuickActions";
import { useRecipes, useMealPlan, useShoppingList } from "@/hooks/useAppData";
import { getCurrentMealSlot, getTodayDayIndex } from "@/lib/utils/date";
import { MEAL_SLOTS } from "@/lib/constants";
import { dayCalories, mainRecipeForDay, recipeForSlot } from "@/lib/utils/meal-plan";

export default function DashboardPage() {
  const { recipes, loading } = useRecipes();
  const { mealPlan } = useMealPlan();
  const { list } = useShoppingList();

  const todayIndex = getTodayDayIndex();
  const currentSlot = getCurrentMealSlot();

  const todayRecipe = useMemo(
    () =>
      recipeForSlot(mealPlan, recipes, todayIndex, currentSlot) ??
      mainRecipeForDay(mealPlan, recipes, todayIndex),
    [mealPlan, recipes, todayIndex, currentSlot]
  );

  const todayCalories = useMemo(
    () => dayCalories(mealPlan, recipes, todayIndex),
    [mealPlan, recipes, todayIndex]
  );

  const currentSlotLabel =
    MEAL_SLOTS.find((slot) => slot.value === currentSlot)?.label ?? "Au menu";

  const favorites = useMemo(
    () => recipes.filter((r) => r.is_favorite).slice(0, 8),
    [recipes]
  );

  const recent = useMemo(() => recipes.slice(0, 8), [recipes]);

  const carouselRecipes = favorites.length > 0 ? favorites : recent;
  const carouselTitle = favorites.length > 0 ? "Mes favoris" : "Récentes";

  const favoriteCount = recipes.filter((r) => r.is_favorite).length;
  const shoppingLeft = (list?.items ?? []).filter((i) => !i.is_checked).length;

  if (loading) {
    return (
      <main className="max-w-lg mx-auto">
        <div className="h-52 home-hero-bg animate-pulse" />
        <div className="px-4 space-y-4 mt-4">
          <div className="h-44 rounded-3xl bg-surface animate-pulse" />
          <div className="h-24 rounded-2xl bg-surface animate-pulse" />
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-lg mx-auto pb-6">
      <HomeHero
        recipeCount={recipes.length}
        favoriteCount={favoriteCount}
        shoppingLeft={shoppingLeft}
      />

      <div className="px-4 space-y-7 -mt-1">
        <TodaySpotlight
          recipe={todayRecipe}
          slotLabel={currentSlotLabel}
          dayCalories={todayCalories}
        />
        <WeekStrip mealPlan={mealPlan} recipes={recipes} />
        <RecipeCarousel
          recipes={carouselRecipes}
          title={carouselTitle}
          emptyLabel="Créer ta première recette"
          emptyHref="/recettes/nouvelle"
        />
        <HomeQuickActions />
      </div>
    </main>
  );
}
