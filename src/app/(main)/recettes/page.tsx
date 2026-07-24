"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Button } from "@/components/ui/Button";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeFiltersPanel } from "@/components/recipes/RecipeFilters";
import { useRecipes } from "@/hooks/useAppData";
import type { RecipeFilters } from "@/types";

export default function RecipesPage() {
  const { recipes, loading, toggleFavorite, filterRecipes } = useRecipes();
  const [filters, setFilters] = useState<RecipeFilters>({
    search: "",
    category: "",
    tags: [],
    maxCalories: null,
    maxPrepTime: null,
    cookingType: "",
    ingredients: [],
    favoritesOnly: false,
  });

  const filtered = useMemo(() => filterRecipes(filters), [filterRecipes, filters, recipes]);

  return (
    <>
      <MobileHeader
        title="Recettes"
        handwritten
        action={
          <Link href="/recettes/nouvelle">
            <Button size="sm" className="rounded-full w-9 h-9 p-0">
              <Plus className="w-5 h-5" />
            </Button>
          </Link>
        }
      />

      <main className="px-4 py-4 space-y-4 max-w-lg mx-auto">
        <RecipeFiltersPanel filters={filters} onChange={setFilters} />

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 rounded-xl bg-surface animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-2">
            {filtered.map((recipe, i) => (
              <div
                key={recipe.id}
                className="animate-fade-up"
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
              >
                <RecipeCard recipe={recipe} onToggleFavorite={toggleFavorite} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="w-10 h-10 text-accent/50 mx-auto mb-2" strokeWidth={1.5} />
            <p className="font-handwritten text-2xl text-accent">Rien ici</p>
            <Link href="/recettes/nouvelle" className="text-sm text-muted mt-2 inline-block">
              + Ajouter
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
