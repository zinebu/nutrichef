"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChefHat, Heart, SlidersHorizontal, ArrowUpDown, X } from "lucide-react";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { RecipeTile } from "@/components/recipes/RecipeTile";
import { CategoryRail } from "@/components/recipes/CategoryRail";
import { RecipeHeader, type RecipeView } from "@/components/recipes/RecipeHeader";
import { RecipeFilterSheet } from "@/components/recipes/RecipeFilterSheet";
import { useRecipes } from "@/hooks/useAppData";
import { cn } from "@/lib/utils/cn";
import type { Recipe, RecipeCategory, RecipeFilters } from "@/types";

type SortMode = "recent" | "name" | "quick" | "light";

const SORT_LABELS: Record<SortMode, string> = {
  recent: "Récentes",
  name: "A → Z",
  quick: "Plus rapides",
  light: "Plus légères",
};

const SORT_ORDER: SortMode[] = ["recent", "name", "quick", "light"];

const EMPTY_FILTERS: RecipeFilters = {
  search: "",
  category: "",
  tags: [],
  maxCalories: null,
  maxPrepTime: null,
  cookingType: "",
  ingredients: [],
  favoritesOnly: false,
};

function sortRecipes(recipes: Recipe[], mode: SortMode): Recipe[] {
  const sorted = [...recipes];
  switch (mode) {
    case "name":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "quick":
      return sorted.sort(
        (a, b) => (a.prep_time_minutes ?? 9999) - (b.prep_time_minutes ?? 9999)
      );
    case "light":
      return sorted.sort(
        (a, b) => (a.calories_per_serving ?? 99999) - (b.calories_per_serving ?? 99999)
      );
    default:
      return sorted;
  }
}

export default function RecipesPage() {
  const { recipes, loading, toggleFavorite, filterRecipes } = useRecipes();
  const [filters, setFilters] = useState<RecipeFilters>(EMPTY_FILTERS);
  const [view, setView] = useState<RecipeView>("mosaic");
  const [sort, setSort] = useState<SortMode>("recent");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(
    () => sortRecipes(filterRecipes(filters), sort),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filterRecipes, filters, recipes, sort]
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = { all: recipes.length };
    for (const recipe of recipes) {
      result[recipe.category] = (result[recipe.category] ?? 0) + 1;
    }
    return result;
  }, [recipes]);

  const advancedCount =
    filters.tags.length +
    (filters.cookingType ? 1 : 0) +
    (filters.maxCalories ? 1 : 0) +
    (filters.maxPrepTime ? 1 : 0);

  const cycleSort = () => {
    const next = SORT_ORDER[(SORT_ORDER.indexOf(sort) + 1) % SORT_ORDER.length];
    setSort(next);
  };

  return (
    <>
      <RecipeHeader
        total={recipes.length}
        shown={filtered.length}
        search={filters.search}
        view={view}
        onSearch={(search) => setFilters((prev) => ({ ...prev, search }))}
        onViewChange={setView}
      />

      <main className="max-w-lg mx-auto px-4 pb-8 space-y-5">
        <CategoryRail
          active={filters.category}
          counts={counts}
          onSelect={(category: RecipeCategory | "") =>
            setFilters((prev) => ({
              ...prev,
              category: prev.category === category ? "" : category,
            }))
          }
        />

        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
          <Chip
            active={filters.favoritesOnly}
            onClick={() =>
              setFilters((prev) => ({ ...prev, favoritesOnly: !prev.favoritesOnly }))
            }
          >
            <Heart
              className={cn("w-3.5 h-3.5", filters.favoritesOnly && "fill-current")}
            />
            Favoris
          </Chip>

          <Chip active={advancedCount > 0} onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Affiner
            {advancedCount > 0 && (
              <span className="ml-0.5 px-1.5 rounded-full bg-white/25 text-[10px]">
                {advancedCount}
              </span>
            )}
          </Chip>

          <Chip active={sort !== "recent"} onClick={cycleSort}>
            <ArrowUpDown className="w-3.5 h-3.5" />
            {SORT_LABELS[sort]}
          </Chip>

          {(advancedCount > 0 || filters.favoritesOnly || filters.category) && (
            <Chip active={false} onClick={() => setFilters(EMPTY_FILTERS)}>
              <X className="w-3.5 h-3.5" />
              Effacer
            </Chip>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 aspect-[16/10] rounded-3xl bg-surface animate-pulse" />
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-[3/4] rounded-3xl bg-surface animate-pulse"
                style={{ animationDelay: `${i * 0.08}s` }}
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState hasRecipes={recipes.length > 0} />
        ) : view === "mosaic" ? (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((recipe, i) => (
              <div
                key={recipe.id}
                className={cn("animate-fade-up", i % 5 === 0 && "col-span-2")}
                style={{ animationDelay: `${Math.min(i, 8) * 0.05}s`, opacity: 0 }}
              >
                <RecipeTile
                  recipe={recipe}
                  featured={i % 5 === 0}
                  onToggleFavorite={toggleFavorite}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((recipe, i) => (
              <div
                key={recipe.id}
                className="animate-fade-up"
                style={{ animationDelay: `${Math.min(i, 10) * 0.04}s`, opacity: 0 }}
              >
                <RecipeCard recipe={recipe} onToggleFavorite={toggleFavorite} />
              </div>
            ))}
          </div>
        )}
      </main>

      {showFilters && (
        <RecipeFilterSheet
          filters={filters}
          onChange={setFilters}
          onClose={() => setShowFilters(false)}
          onReset={() => setFilters(EMPTY_FILTERS)}
          resultCount={filtered.length}
        />
      )}
    </>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "tap-scale shrink-0 flex items-center gap-1.5 px-3.5 h-9 rounded-full text-xs font-medium border transition-colors",
        active
          ? "bg-accent border-accent text-white shadow-sm shadow-accent/20"
          : "bg-surface border-border text-muted"
      )}
    >
      {children}
    </button>
  );
}

function EmptyState({ hasRecipes }: { hasRecipes: boolean }) {
  return (
    <div className="flex flex-col items-center text-center py-14 px-6">
      <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mb-4">
        <ChefHat className="w-9 h-9 text-accent/70" strokeWidth={1.5} />
      </div>
      <p className="font-handwritten text-3xl text-accent">
        {hasRecipes ? "Aucun résultat" : "Ton carnet est vide"}
      </p>
      <p className="text-sm text-muted mt-2 max-w-xs">
        {hasRecipes
          ? "Essaie un autre mot-clé ou enlève quelques filtres."
          : "Prends une photo de ton plat, Cherry s'occupe de la nutrition."}
      </p>
      {!hasRecipes && (
        <Link
          href="/recettes/nouvelle"
          className="tap-scale mt-5 px-5 py-3 rounded-full bg-accent text-white text-sm font-medium shadow-lg shadow-accent/25"
        >
          Créer ma première recette
        </Link>
      )}
    </div>
  );
}
