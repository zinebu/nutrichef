"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { useRecipes } from "@/hooks/useAppData";
import type { CreateRecipeInput, Recipe } from "@/types";

export default function EditRecipePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { recipes, loading, updateRecipe } = useRecipes();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const found = recipes.find((r) => r.id === id);
    if (found) {
      setRecipe(found);
      return;
    }
    if (loading) return;

    fetch(`/api/recipes/${id}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => (data ? setRecipe(data) : setNotFound(true)))
      .catch(() => setNotFound(true));
  }, [id, recipes, loading]);

  const handleSubmit = async (data: CreateRecipeInput) => {
    await updateRecipe(id, data);
    router.push(`/recettes/${id}`);
  };

  return (
    <>
      <MobileHeader title="Modifier" handwritten showBack />
      <main className="px-4 py-4">
        {notFound ? (
          <p className="text-center text-muted text-sm py-10">Recette introuvable.</p>
        ) : recipe ? (
          <RecipeForm
            initialRecipe={recipe}
            onSubmit={handleSubmit}
            submitLabel="Enregistrer les modifications"
          />
        ) : (
          <div className="space-y-4">
            <div className="h-48 rounded-3xl bg-surface animate-pulse" />
            <div className="h-12 rounded-2xl bg-surface animate-pulse" />
            <div className="h-12 rounded-2xl bg-surface animate-pulse" />
          </div>
        )}
      </main>
    </>
  );
}
