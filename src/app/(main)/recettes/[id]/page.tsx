"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, Trash2, Flame, Clock, UtensilsCrossed } from "lucide-react";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { NutritionPanel } from "@/components/recipes/NutritionPanel";
import { RECIPE_CATEGORIES, RECIPE_TAGS, COOKING_TYPES } from "@/lib/constants";
import { useRecipes } from "@/hooks/useAppData";
import { formatPrepTime } from "@/lib/utils/format-prep-time";
import type { Recipe, NutritionData } from "@/types";

export default function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { recipes, toggleFavorite, deleteRecipe } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);

  useEffect(() => {
    const found = recipes.find((r) => r.id === id);
    if (found) {
      setRecipe(found);
    } else {
      fetch(`/api/recipes/${id}`)
        .then((r) => (r.ok ? r.json() : null))
        .then(setRecipe);
    }
  }, [id, recipes]);

  if (!recipe) {
    return (
      <>
        <MobileHeader title="Recette" showBack />
        <div className="p-4">
          <div className="h-64 rounded-3xl bg-surface-elevated animate-pulse" />
        </div>
      </>
    );
  }

  const categoryLabel = RECIPE_CATEGORIES.find((c) => c.value === recipe.category)?.label;
  const cookingLabel = COOKING_TYPES.find((c) => c.value === recipe.cooking_type)?.label;

  const nutrition: NutritionData | null =
    recipe.calories_total != null
      ? {
          detectedFoods: recipe.ai_detected_foods,
          caloriesTotal: recipe.calories_total,
          caloriesPerServing: recipe.calories_per_serving ?? 0,
          proteinsG: recipe.proteins_g ?? 0,
          carbsG: recipe.carbs_g ?? 0,
          fatsG: recipe.fats_g ?? 0,
          sugarG: recipe.sugar_g ?? 0,
          fiberG: recipe.fiber_g ?? 0,
          tips: recipe.nutrition_tips ?? "",
        }
      : null;

  const handleDelete = async () => {
    if (confirm("Supprimer cette recette ?")) {
      await deleteRecipe(recipe.id);
      router.push("/recettes");
    }
  };

  return (
    <>
      <MobileHeader
        title={recipe.name}
        showBack
        action={
          <button
            onClick={() => toggleFavorite(recipe.id)}
            className="p-2 rounded-xl hover:bg-surface-elevated"
          >
            <Heart
              className={`w-6 h-6 ${recipe.is_favorite ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>
        }
      />

      <main className="px-4 py-4 space-y-4 pb-8">
        <div className="relative aspect-video rounded-3xl overflow-hidden bg-surface-elevated">
          {recipe.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.photo_url} alt={recipe.name} className="w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-accent/5">
              <UtensilsCrossed className="w-12 h-12 text-accent/40" strokeWidth={1.5} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {categoryLabel && (
            <Badge className="bg-accent/20 text-accent">{categoryLabel}</Badge>
          )}
          {cookingLabel && (
            <Badge className="bg-surface-elevated text-foreground">{cookingLabel}</Badge>
          )}
          {recipe.tags.map((tag) => {
            const info = RECIPE_TAGS.find((t) => t.value === tag);
            return (
              <Badge key={tag} className={info?.color}>
                {info?.label ?? tag}
              </Badge>
            );
          })}
        </div>

        <div className="flex gap-4 text-sm text-muted">
          {recipe.calories_per_serving && (
            <span className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-400" />
              {Math.round(recipe.calories_per_serving)} kcal/portion
            </span>
          )}
          {recipe.prep_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatPrepTime(recipe.prep_time_minutes)}
            </span>
          )}
        </div>

        {recipe.description && (
          <Card>
            <p className="text-sm leading-relaxed">{recipe.description}</p>
          </Card>
        )}

        {recipe.ingredients && recipe.ingredients.length > 0 && (
          <Card elevated>
            <h3 className="font-semibold mb-3">Ingrédients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex justify-between text-sm">
                  <span>{ing.name}</span>
                  <span className="text-muted">
                    {ing.quantity} {ing.unit}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {nutrition && <NutritionPanel nutrition={nutrition} />}

        <Button variant="danger" className="w-full" onClick={handleDelete}>
          <Trash2 className="w-4 h-4" />
          Supprimer la recette
        </Button>
      </main>
    </>
  );
}
