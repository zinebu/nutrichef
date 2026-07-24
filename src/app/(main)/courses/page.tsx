"use client";

import { MobileHeader } from "@/components/layout/MobileHeader";
import { WeeklyPlanner, ShoppingListView } from "@/components/courses/WeeklyPlanner";
import { useRecipes, useMealPlan, useShoppingList } from "@/hooks/useAppData";

export default function CoursesPage() {
  const { recipes } = useRecipes();
  const { mealPlan, setDayRecipe } = useMealPlan();
  const { list, generateFromMealPlan, toggleItem, removeItem, addItem } =
    useShoppingList(recipes);

  const handleGenerate = () => {
    if (mealPlan) generateFromMealPlan(mealPlan);
  };

  return (
    <>
      <MobileHeader title="Courses" subtitle="Planning & liste" />

      <main className="px-4 py-4 space-y-8">
        <section>
          <h2 className="font-semibold mb-3">Planning de la semaine</h2>
          <WeeklyPlanner
            mealPlan={mealPlan}
            recipes={recipes}
            onSelectRecipe={setDayRecipe}
            onGenerateList={handleGenerate}
          />
        </section>

        <section>
          <h2 className="font-semibold mb-3">Liste de courses</h2>
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
