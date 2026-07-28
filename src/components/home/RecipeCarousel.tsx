"use client";

import Link from "next/link";
import { Heart, PenLine } from "lucide-react";
import { RecipePhoto } from "@/components/home/HomeHero";
import type { Recipe } from "@/types";

interface RecipeCarouselProps {
  recipes: Recipe[];
  title: string;
  emptyLabel: string;
  emptyHref: string;
}

export function RecipeCarousel({ recipes, title, emptyLabel, emptyHref }: RecipeCarouselProps) {
  if (recipes.length === 0) {
    return (
      <section className="animate-fade-up stagger-4">
        <h2 className="font-handwritten text-2xl text-accent mb-3">{title}</h2>
        <Link
          href={emptyHref}
          className="tap-scale flex items-center justify-center gap-2 py-8 rounded-2xl border border-dashed border-border text-muted"
        >
          <PenLine className="w-5 h-5" />
          <span className="text-sm">{emptyLabel}</span>
        </Link>
      </section>
    );
  }

  return (
    <section className="animate-fade-up stagger-4">
      <div className="flex items-end justify-between mb-3">
        <h2 className="font-handwritten text-2xl text-accent">{title}</h2>
        <Link href="/recettes" className="text-xs text-accent font-medium tap-scale">
          Tout voir
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4 snap-x snap-mandatory">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={`/recettes/${recipe.id}`}
            className="tap-scale shrink-0 snap-start w-36"
          >
            <RecipePhoto recipe={recipe} className="w-36 h-44 rounded-2xl" sizes="150px" />
            <p className="text-sm font-medium mt-2 line-clamp-2 leading-snug">{recipe.name}</p>
            {recipe.is_favorite && (
              <Heart className="w-3.5 h-3.5 text-accent fill-accent mt-1" />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
