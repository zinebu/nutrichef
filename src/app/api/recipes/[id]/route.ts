import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeIngredientName } from "@/lib/utils/ingredient-normalize";
import type { CreateRecipeInput } from "@/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("*, ingredients(*)")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(recipe);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body: CreateRecipeInput = await request.json();

  const baseRecipe = {
    name: body.name,
    description: body.description,
    photo_url: body.photo_url,
    category: body.category,
    tags: body.tags,
    cooking_type: body.cooking_type,
    prep_time_minutes: body.prep_time_minutes,
    servings: body.servings ?? 1,
    calories_total: body.nutrition?.caloriesTotal,
    calories_per_serving: body.nutrition?.caloriesPerServing,
    proteins_g: body.nutrition?.proteinsG,
    carbs_g: body.nutrition?.carbsG,
    fats_g: body.nutrition?.fatsG,
    sugar_g: body.nutrition?.sugarG,
    fiber_g: body.nutrition?.fiberG,
    nutrition_tips: body.nutrition?.tips,
    ai_detected_foods: body.nutrition?.detectedFoods ?? [],
    updated_at: new Date().toISOString(),
  };

  // Mêmes précautions qu'à la création : les colonnes de la migration 003
  // peuvent ne pas exister encore.
  let { error } = await supabase
    .from("recipes")
    .update({
      ...baseRecipe,
      cooking_fat_type: body.cooking_fat_type,
      cooking_fat_grams: body.cooking_fat_grams,
      total_cooked_weight_g: body.total_cooked_weight_g,
      extras: body.extras,
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    ({ error } = await supabase
      .from("recipes")
      .update(baseRecipe)
      .eq("id", id)
      .eq("user_id", user.id));
  }

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // La liste d'ingrédients est remplacée en bloc : plus simple et plus sûr
  // que de deviner quelles lignes ont bougé.
  await supabase.from("ingredients").delete().eq("recipe_id", id);

  if (body.ingredients.length > 0) {
    const baseIngredients = body.ingredients.map((ing, i) => ({
      recipe_id: id,
      name: normalizeIngredientName(ing.name),
      quantity: ing.quantity,
      unit: ing.unit,
      sort_order: i,
    }));

    const { error: ingredientError } = await supabase.from("ingredients").insert(
      baseIngredients.map((ing, i) => ({
        ...ing,
        note: body.ingredients[i].note,
        grams: body.ingredients[i].grams,
      }))
    );

    if (ingredientError) {
      await supabase.from("ingredients").insert(baseIngredients);
    }
  }

  const { data: fullRecipe } = await supabase
    .from("recipes")
    .select("*, ingredients(*)")
    .eq("id", id)
    .single();

  return NextResponse.json(fullRecipe);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { error } = await supabase
    .from("recipes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
