"use client";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { WeeklyPlanner, ShoppingListView } from "@/components/courses/WeeklyPlanner";
import { useRecipes, useMealPlan, useShoppingList } from "@/hooks/useAppData";

export default function CoursesPage() {
  const { recipes } = useRecipes();
  const { mealPlan, setDayRecipe } = useMealPlan();
  const { list, generateFromMealPlan, toggleItem, removeItem, addItem } =
    useShoppingList(recipes);

  return (
    <>
      <MobileHeader title="Courses" handwritten />

      <main className="px-4 py-4 space-y-8 max-w-lg mx-auto">
        <section className="animate-fade-up">
          <WeeklyPlanner
            mealPlan={mealPlan}
            recipes={recipes}
            onSelectRecipe={setDayRecipe}
            onGenerateList={() => mealPlan && generateFromMealPlan(mealPlan)}
          />
        </section>

        <section className="animate-fade-up stagger-2">
          <h2 className="font-handwritten text-2xl text-accent mb-3">Ma liste</h2>
          <ShoppingListView
            items={list?.items ?? []}
            onToggle={toggleItem}
            onRemove={removeItem}
            onAdd={addItem}
          />
        </section>
      </main>
    </>
  );
}
