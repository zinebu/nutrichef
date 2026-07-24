"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Flame } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RECIPE_CATEGORIES, RECIPE_TAGS } from "@/lib/constants";
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
      <Card elevated className="overflow-hidden p-0 active:scale-[0.98] transition-transform">
        <div className="relative aspect-[16/10] bg-surface">
          {recipe.photo_url ? (
            <Image
              src={recipe.photo_url}
              alt={recipe.name}
              fill
              className="object-cover"
              sizes="(max-width: 512px) 100vw, 512px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-4xl">
              🍽️
            </div>
          )}
          <button
            onClick={(e) => {
              e.preventDefault();
              onToggleFavorite?.(recipe.id);
            }}
            className="absolute top-3 right-3 p-2 rounded-full bg-black/40 backdrop-blur-sm"
            aria-label={recipe.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          >
            <Heart
              className={cn(
                "w-5 h-5 transition-colors",
                recipe.is_favorite ? "fill-red-500 text-red-500" : "text-white"
              )}
            />
          </button>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight">{recipe.name}</h3>
            <span className="text-xs text-muted shrink-0">{categoryLabel}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted">
            {recipe.calories_per_serving && (
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                {Math.round(recipe.calories_per_serving)} kcal
              </span>
            )}
            {recipe.prep_time_minutes && (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {recipe.prep_time_minutes} min
              </span>
            )}
          </div>
          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {recipe.tags.slice(0, 3).map((tag) => {
                const tagInfo = RECIPE_TAGS.find((t) => t.value === tag);
                return (
                  <Badge key={tag} className={tagInfo?.color ?? "bg-surface text-muted"}>
                    {tagInfo?.label ?? tag}
                  </Badge>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
