import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const weekStart = searchParams.get("week");

  if (!weekStart) {
    return NextResponse.json({ error: "Paramètre week requis" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: plan } = await supabase
    .from("meal_plans")
    .select("*, meal_plan_items(*, recipes(*, ingredients(*)))")
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .single();

  if (!plan) {
    return NextResponse.json(null);
  }

  const items = (plan.meal_plan_items ?? []).map(
    (item: { day_of_week: number; recipe_id: string; recipes: unknown }) => ({
      day_of_week: item.day_of_week,
      recipe_id: item.recipe_id,
      meal_type: "dejeuner",
      recipe: item.recipes,
    })
  );

  return NextResponse.json({ ...plan, items });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { week_start, day_of_week, recipe_id } = await request.json();

  let { data: plan } = await supabase
    .from("meal_plans")
    .select("id")
    .eq("user_id", user.id)
    .eq("week_start", week_start)
    .single();

  if (!plan) {
    const { data: newPlan, error } = await supabase
      .from("meal_plans")
      .insert({ user_id: user.id, week_start })
      .select()
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    plan = newPlan;
  }

  if (!plan) {
    return NextResponse.json({ error: "Impossible de créer le planning" }, { status: 500 });
  }

  if (recipe_id) {
    await supabase.from("meal_plan_items").upsert(
      {
        meal_plan_id: plan.id,
        day_of_week,
        recipe_id,
        meal_type: "dejeuner",
      },
      { onConflict: "meal_plan_id,day_of_week,meal_type" }
    );
  } else {
    await supabase
      .from("meal_plan_items")
      .delete()
      .eq("meal_plan_id", plan.id)
      .eq("day_of_week", day_of_week);
  }

  const { data: fullPlan } = await supabase
    .from("meal_plans")
    .select("*, meal_plan_items(*, recipes(*, ingredients(*)))")
    .eq("id", plan.id)
    .single();

  const items = (fullPlan?.meal_plan_items ?? []).map(
    (item: { day_of_week: number; recipe_id: string; recipes: unknown }) => ({
      day_of_week: item.day_of_week,
      recipe_id: item.recipe_id,
      meal_type: "dejeuner",
      recipe: item.recipes,
    })
  );

  return NextResponse.json({ ...fullPlan, items });
}
