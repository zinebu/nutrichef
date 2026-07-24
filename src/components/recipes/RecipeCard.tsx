"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { RECIPE_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils/cn";
import type { Recipe } from "@/types";

interface RecipeCardProps {
  recipe: Recipe;
  onToggleFavorite?: (id: string) => void;
}

export function RecipeCard({ recipe, onToggleFavorite }: RecipeCardProps) {
  const categoryLabel =
    RECIPE_CATEGORIES.find((c) => c.value === recipe.category)?.label ?? recipe.category;

  return (
    <Link href={`/recettes/${recipe.id}`}>
      <Card className="flex gap-3 p-3 items-center">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-elevated shrink-0">
          {recipe.photo_url ? (
            <Image
              src={recipe.photo_url}
              alt={recipe.name}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-2xl">🍒</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{recipe.name}</h3>
          <p className="text-xs text-muted">{categoryLabel}</p>
          <div className="flex items-center gap-2 text-xs text-muted mt-0.5">
            {recipe.calories_per_serving && (
              <span>{Math.round(recipe.calories_per_serving)} kcal</span>
            )}
            {recipe.prep_time_minutes && (
              <span className="flex items-center gap-0.5">
                <Clock className="w-3 h-3" />
                {recipe.prep_time_minutes} min
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(recipe.id);
          }}
          className="p-2 shrink-0"
          aria-label={recipe.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
        >
          <Heart
            className={cn(
              "w-5 h-5",
              recipe.is_favorite ? "fill-accent text-accent" : "text-muted"
            )}
          />
        </button>
      </Card>
    </Link>
  );
}
