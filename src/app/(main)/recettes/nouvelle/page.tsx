"use client";

import { useRouter } from "next/navigation";
import { MobileHeader } from "@/components/layout/MobileHeader";
import { RecipeForm } from "@/components/recipes/RecipeForm";
import { useRecipes } from "@/hooks/useAppData";
import type { CreateRecipeInput } from "@/types";

export default function NewRecipePage() {
  const router = useRouter();
  const { createRecipe } = useRecipes();

  const handleSubmit = async (data: CreateRecipeInput) => {
    await createRecipe(data);
    router.push("/recettes");
  };

  return (
    <>
      <MobileHeader title="Nouvelle recette" showBack />
      <main className="px-4 py-4">
        <RecipeForm onSubmit={handleSubmit} />
      </main>
    </>
  );
}
