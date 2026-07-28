"use client";

import Link from "next/link";
import { DAYS_OF_WEEK } from "@/lib/constants";
import { getTodayDayIndex } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { RecipePhoto } from "@/components/home/HomeHero";
import { itemsForDay, mainRecipeForDay } from "@/lib/utils/meal-plan";
import { MEAL_SLOTS } from "@/lib/constants";
import type { MealPlan, Recipe } from "@/types";

interface WeekStripProps {
  mealPlan: MealPlan | null;
  recipes: Recipe[];
}

export function WeekStrip({ mealPlan, recipes }: WeekStripProps) {
  const today = getTodayDayIndex();

  const plannedCount = (mealPlan?.items ?? []).filter((i) => i.recipe_id).length;

  return (
    <section className="animate-fade-up stagger-3">
      <div className="flex items-end justify-between mb-3">
        <div>
          <h2 className="font-handwritten text-2xl text-accent">Ma semaine</h2>
          <p className="text-xs text-muted">
            {plannedCount > 0 ? `${plannedCount} repas planifié${plannedCount > 1 ? "s" : ""}` : "Aucun repas planifié"}
          </p>
        </div>
        <Link href="/courses" className="text-xs text-accent font-medium tap-scale">
          Voir tout
        </Link>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1 snap-x snap-mandatory">
        {DAYS_OF_WEEK.map((day, index) => {
          const recipe = mainRecipeForDay(mealPlan, recipes, index);
          const dayItems = itemsForDay(mealPlan, index).filter((i) => i.recipe_id);
          const isToday = index === today;

          return (
            <Link
              key={day}
              href="/courses"
              className={cn(
                "tap-scale shrink-0 snap-start flex flex-col items-center gap-1.5 w-[4.5rem]",
                isToday && "scale-105"
              )}
            >
              <div
                className={cn(
                  "relative w-[4.5rem] h-[4.5rem] rounded-2xl overflow-hidden border-2 transition-colors",
                  isToday ? "border-accent shadow-md shadow-accent/20" : "border-border",
                  !recipe && "bg-surface"
                )}
              >
                {recipe ? (
                  <RecipePhoto recipe={recipe} className="w-full h-full" sizes="80px" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-lg text-muted/40 font-handwritten">+</span>
                  </div>
                )}
                {isToday && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent ring-2 ring-background" />
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium",
                  isToday ? "text-accent" : "text-muted"
                )}
              >
                {day.slice(0, 3)}
              </span>
              <span className="flex gap-0.5 -mt-1">
                {MEAL_SLOTS.map((slot) => (
                  <span
                    key={slot.value}
                    className={cn(
                      "w-1 h-1 rounded-full",
                      dayItems.some((i) => i.meal_type === slot.value)
                        ? "bg-accent"
                        : "bg-border"
                    )}
                  />
                ))}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
