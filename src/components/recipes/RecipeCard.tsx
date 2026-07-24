"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RECIPE_CATEGORIES } from "@/lib/constants";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite?: (id: string) => void;
}

export function RecipeCard({ recipe, onToggleFavorite }: RecipeCardProps) {
  const categoryLabel =
    RECIPE_CATEGORIES.find((c) => c.value === recipe.category)?.label ?? recipe.category;

  return (
    <Link href={`/recettes/${recipe.id}`} className="block tap-scale">
      <div className="flex gap-3 p-3 items-center rounded-xl bg-surface border border-border active:border-accent/40 transition-colors duration-200">
        <div className="relative w-14 h-14 rounded-full overflow-hidden bg-accent/10 shrink-0 flex items-center justify-center">
          {recipe.photo_url ? (
            <Image
              src={recipe.photo_url}
              alt={recipe.name}
              fill
              className="object-cover"
              sizes="56px"
            />
          ) : (
            <UtensilsCrossed className="w-5 h-5 text-accent/60" strokeWidth={1.5} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{recipe.name}</h3>
          <p className="text-xs text-muted">{categoryLabel}</p>
          {(recipe.calories_per_serving || recipe.prep_time_minutes) && (
            <p className="text-xs text-muted mt-0.5 flex items-center gap-2">
              {recipe.calories_per_serving && (
                <span>{Math.round(recipe.calories_per_serving)} kcal</span>
              )}
              {recipe.prep_time_minutes && (
                <span className="flex items-center gap-0.5">
                  <Clock className="w-3 h-3" />
                  {recipe.prep_time_minutes}m
                </span>
              )}
            </p>
          )}
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(recipe.id);
            e.currentTarget.classList.add("animate-pop");
          }}
          className="p-2 shrink-0"
        >
          <Heart
            className={cn(
              "w-5 h-5 transition-all duration-200",
              recipe.is_favorite ? "fill-accent text-accent scale-110" : "text-muted"
            )}
          />
        </button>
      </div>
    </Link>
  );
}
