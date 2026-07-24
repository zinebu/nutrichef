"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
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
        subtitle={`${filtered.length} recette${filtered.length !== 1 ? "s" : ""}`}
        action={
          <Link href="/recettes/nouvelle">
            <Button size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
        }
      />

      <main className="px-4 py-4 space-y-4">
        <RecipeFiltersPanel filters={filters} onChange={setFilters} />

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-3xl bg-surface-elevated animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-3">
            {filtered.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onToggleFavorite={toggleFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted">
            <p className="text-4xl mb-3">🍳</p>
            <p className="text-sm">Aucune recette trouvée</p>
            <Link href="/recettes/nouvelle" className="text-accent text-sm mt-2 inline-block">
              Créer une recette
            </Link>
          </div>
        )}
      </main>
    </>
  );
}
