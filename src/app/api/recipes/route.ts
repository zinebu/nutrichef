import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { normalizeIngredientName } from "@/lib/utils/ingredient-normalize";
import type { CreateRecipeInput } from "@/types";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("*, ingredients(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(recipes);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body: CreateRecipeInput = await request.json();

  const { data: recipe, error } = await supabase
    .from("recipes")
    .insert({
      user_id: user.id,
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
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (body.ingredients.length > 0) {
    await supabase.from("ingredients").insert(
      body.ingredients.map((ing, i) => ({
        recipe_id: recipe.id,
        name: normalizeIngredientName(ing.name),
        quantity: ing.quantity,
        unit: ing.unit,
        sort_order: i,
      }))
    );
  }

  const { data: fullRecipe } = await supabase
    .from("recipes")
    .select("*, ingredients(*)")
    .eq("id", recipe.id)
    .single();

  return NextResponse.json(fullRecipe, { status: 201 });
}
