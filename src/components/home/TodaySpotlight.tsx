"use client";

import Link from "next/link";
import { CalendarDays, ChevronRight } from "lucide-react";
import { RecipePhoto } from "@/components/home/HomeHero";
import { formatPrepTime } from "@/lib/utils/format-prep-time";
import { getTodayLabel } from "@/lib/utils/date";
import type { Recipe } from "@/types";

interface TodaySpotlightProps {
  recipe: Recipe | null;
  slotLabel?: string;
  dayCalories?: number;
}

export function TodaySpotlight({ recipe, slotLabel, dayCalories }: TodaySpotlightProps) {
  if (!recipe) {
    return (
      <Link href="/courses" className="tap-scale block animate-fade-up stagger-2">
        <div className="relative overflow-hidden rounded-3xl border-2 border-dashed border-accent/25 bg-accent/[0.03] p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
              <CalendarDays className="w-7 h-7 text-accent" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-accent font-medium uppercase tracking-wide">
                {getTodayLabel()}
              </p>
              <p className="font-handwritten text-2xl text-accent leading-tight mt-0.5">
                Planifie ta semaine
              </p>
              <p className="text-sm text-muted mt-1">
                {slotLabel
                  ? `Choisis ton ${slotLabel.toLowerCase()}`
                  : "Choisis un repas pour aujourd'hui"}
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-accent shrink-0" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={`/recettes/${recipe.id}`} className="tap-scale block animate-fade-up stagger-2">
      <div className="relative overflow-hidden rounded-3xl shadow-lg shadow-accent/10">
        <RecipePhoto recipe={recipe} className="aspect-[16/10] w-full" sizes="400px" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <p className="text-xs uppercase tracking-widest opacity-80">
            {getTodayLabel()} — {slotLabel ?? "Au menu"}
          </p>
          <h2 className="font-handwritten text-3xl leading-tight mt-1">{recipe.name}</h2>
          <div className="flex items-center gap-3 mt-2 text-sm opacity-90">
            {recipe.calories_per_serving && (
              <span>{Math.round(recipe.calories_per_serving)} kcal</span>
            )}
            {recipe.prep_time_minutes && (
              <span>{formatPrepTime(recipe.prep_time_minutes)}</span>
            )}
            {dayCalories != null && dayCalories > 0 && (
              <span className="opacity-75">{Math.round(dayCalories)} kcal / jour</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
