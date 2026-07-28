"use client";

import { useMemo } from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { TodaySpotlight } from "@/components/home/TodaySpotlight";
import { WeekStrip } from "@/components/home/WeekStrip";
import { RecipeCarousel } from "@/components/home/RecipeCarousel";
import { HomeQuickActions } from "@/components/home/HomeQuickActions";
import { useRecipes, useMealPlan, useShoppingList } from "@/hooks/useAppData";
import { getTodayDayIndex } from "@/lib/utils/date";

export default function DashboardPage() {
  const { recipes, loading } = useRecipes();
  const { mealPlan } = useMealPlan();
  const { list } = useShoppingList();

  const todayIndex = getTodayDayIndex();

  const todayRecipe = useMemo(() => {
    const item = mealPlan?.items?.find((i) => i.day_of_week === todayIndex);
    if (!item?.recipe_id) return null;
    return recipes.find((r) => r.id === item.recipe_id) ?? null;
  }, [mealPlan, recipes, todayIndex]);

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
        <TodaySpotlight recipe={todayRecipe} />
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
