"use client";

import Link from "next/link";
import { Plus, Flame, Heart, ArrowRight } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { useRecipes } from "@/hooks/useAppData";

export default function DashboardPage() {
  const { recipes, loading, toggleFavorite } = useRecipes();

  const favorites = recipes.filter((r) => r.is_favorite).slice(0, 3);
  const recent = recipes.slice(0, 4);
  const totalCalories = recipes.reduce(
    (sum, r) => sum + (r.calories_per_serving ?? 0),
    0
  );
  const avgCalories = recipes.length
    ? Math.round(totalCalories / recipes.length)
    : 0;

  return (
    <>
      <MobileHeader
        title="NutriChef"
        subtitle="Votre assistant alimentaire"
        action={
          <Link href="/recettes/nouvelle">
            <Button size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </Link>
        }
      />

      <main className="px-4 py-4 space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <Card elevated className="col-span-2 bg-gradient-to-br from-accent/20 to-accent/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Calories moyennes</p>
                <p className="text-3xl font-bold text-accent">{avgCalories}</p>
                <p className="text-xs text-muted">kcal / portion</p>
              </div>
              <div className="p-4 rounded-2xl bg-accent/20">
                <Flame className="w-8 h-8 text-accent" />
              </div>
            </div>
          </Card>

          <Card elevated>
            <p className="text-xs text-muted">Recettes</p>
            <p className="text-2xl font-bold">{recipes.length}</p>
          </Card>
          <Card elevated>
            <p className="text-xs text-muted">Favoris</p>
            <p className="text-2xl font-bold">
              {recipes.filter((r) => r.is_favorite).length}
            </p>
          </Card>
        </div>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-400" />
              Favoris
            </h2>
            <Link href="/recettes?favorites=1" className="text-sm text-accent">
              Voir tout
            </Link>
          </div>
          {favorites.length > 0 ? (
            <div className="space-y-3">
              {favorites.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-6 text-muted text-sm">
              Aucun favori pour le moment
            </Card>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">Repas récents</h2>
            <Link href="/recettes" className="text-sm text-accent flex items-center gap-1">
              Toutes <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 rounded-3xl bg-surface-elevated animate-pulse" />
              ))}
            </div>
          ) : recent.length > 0 ? (
            <div className="space-y-3">
              {recent.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onToggleFavorite={toggleFavorite}
                />
              ))}
            </div>
          ) : (
            <Card className="text-center py-8 space-y-3">
              <p className="text-muted text-sm">Commencez par ajouter votre première recette</p>
              <Link href="/recettes/nouvelle">
                <Button>Ajouter une recette</Button>
              </Link>
            </Card>
          )}
        </section>

        <Link href="/courses">
          <Card elevated className="flex items-center justify-between active:scale-[0.98] transition-transform cursor-pointer">
            <div>
              <p className="font-medium">Liste de courses</p>
              <p className="text-sm text-muted">Planifiez votre semaine</p>
            </div>
            <ArrowRight className="w-5 h-5 text-accent" />
          </Card>
        </Link>
      </main>
    </>
  );
}
