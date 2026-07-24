"use client";

import Link from "next/link";
import { Plus, Heart, ArrowRight } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { useRecipes } from "@/hooks/useAppData";
import { APP_NAME } from "@/lib/constants";

export default function DashboardPage() {
  const { recipes, loading, toggleFavorite } = useRecipes();

  const favorites = recipes.filter((r) => r.is_favorite).slice(0, 3);
  const recent = recipes.slice(0, 3);

  return (
    <>
      <MobileHeader
        title={APP_NAME}
        action={
          <Link href="/recettes/nouvelle">
            <Button size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
        }
      />

      <main className="px-4 py-4 space-y-6">
        <div className="flex gap-4 text-center">
          <div className="flex-1">
            <p className="text-2xl font-bold text-accent">{recipes.length}</p>
            <p className="text-xs text-muted">Recettes</p>
          </div>
          <div className="w-px bg-border" />
          <div className="flex-1">
            <p className="text-2xl font-bold text-accent">
              {recipes.filter((r) => r.is_favorite).length}
            </p>
            <p className="text-xs text-muted">Favoris</p>
          </div>
        </div>

        {favorites.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-medium text-sm flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-accent" />
                Favoris
              </h2>
              <Link href="/recettes?favorites=1" className="text-xs text-accent">
                Tout voir
              </Link>
            </div>
            <div className="space-y-2">
              {favorites.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-medium text-sm">Récentes</h2>
            <Link href="/recettes" className="text-xs text-accent flex items-center gap-1">
              Toutes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 rounded-xl bg-surface animate-pulse" />
              ))}
            </div>
          ) : recent.length > 0 ? (
            <div className="space-y-2">
              {recent.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-6 space-y-3">
              <p className="text-sm text-muted">Aucune recette</p>
              <Link href="/recettes/nouvelle">
                <Button size="sm">Ajouter</Button>
              </Link>
            </Card>
          )}
        </section>

        <Link href="/courses">
          <Card className="flex items-center justify-between">
            <span className="text-sm font-medium">Liste de courses</span>
            <ArrowRight className="w-4 h-4 text-accent" />
          </Card>
        </Link>
      </main>
    </>
  );
}
