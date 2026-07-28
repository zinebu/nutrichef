"use client";

import { memo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Clock, Flame, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { RECIPE_CATEGORIES } from "@/lib/constants";
import { formatPrepTime } from "@/lib/utils/format-prep-time";
import type { Recipe } from "@/types";

interface RecipeTileProps {
  recipe: Recipe;
  featured?: boolean;
  onToggleFavorite?: (id: string) => void;
}

export const RecipeTile = memo(function RecipeTile({
  recipe,
  featured = false,
  onToggleFavorite,
}: RecipeTileProps) {
  const categoryLabel =
    RECIPE_CATEGORIES.find((c) => c.value === recipe.category)?.label ?? recipe.category;

  return (
    <Link
      href={`/recettes/${recipe.id}`}
      className={cn("tap-scale group block", featured && "col-span-2")}
    >
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl bg-accent/10 shadow-sm",
          featured ? "aspect-[16/10]" : "aspect-[3/4]"
        )}
      >
        {recipe.photo_url ? (
          recipe.photo_url.startsWith("data:") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.photo_url}
              alt={recipe.name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover transition-transform duration-500 group-active:scale-105"
            />
          ) : (
            <Image
              src={recipe.photo_url}
              alt={recipe.name}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-500 group-active:scale-105"
              sizes={featured ? "440px" : "220px"}
            />
          )
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-accent/15 to-accent/5">
            <UtensilsCrossed
              className={cn("text-accent/40", featured ? "w-12 h-12" : "w-8 h-8")}
              strokeWidth={1.5}
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleFavorite?.(recipe.id);
            e.currentTarget.classList.add("animate-pop");
          }}
          className="absolute top-2 right-2 p-2 rounded-full bg-black/25 backdrop-blur-sm"
          aria-label="Favori"
        >
          <Heart
            className={cn(
              "w-4 h-4 transition-all duration-200",
              recipe.is_favorite ? "fill-white text-white scale-110" : "text-white/80"
            )}
          />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
          <p className="text-[10px] uppercase tracking-widest opacity-80">
            {categoryLabel}
          </p>
          <h3
            className={cn(
              "font-handwritten leading-tight mt-0.5 line-clamp-2",
              featured ? "text-3xl" : "text-xl"
            )}
          >
            {recipe.name}
          </h3>
          <div className="flex items-center gap-2.5 mt-1 text-[11px] opacity-90">
            {recipe.calories_per_serving != null && (
              <span className="flex items-center gap-1">
                <Flame className="w-3 h-3" />
                {Math.round(recipe.calories_per_serving)} kcal
              </span>
            )}
            {recipe.prep_time_minutes != null && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatPrepTime(recipe.prep_time_minutes, { compact: true })}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
});
