import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MealSlot } from "@/types";

const PLAN_SELECT = "*, meal_plan_items(*, recipes(*, ingredients(*)))";

interface RawItem {
  id: string;
  day_of_week: number;
  recipe_id: string | null;
  meal_type: MealSlot | null;
  recipes: unknown;
}

function mapPlan(plan: Record<string, unknown> | null) {
  if (!plan) return null;
  const rawItems = (plan.meal_plan_items ?? []) as RawItem[];
  const items = rawItems.map((item) => ({
    id: item.id,
    day_of_week: item.day_of_week,
    recipe_id: item.recipe_id,
    meal_type: item.meal_type ?? "dejeuner",
    recipe: item.recipes,
  }));
  return { ...plan, items };
}

async function loadPlan(supabase: SupabaseClient, planId: string) {
  const { data } = await supabase
    .from("meal_plans")
    .select(PLAN_SELECT)
    .eq("id", planId)
    .single();
  return mapPlan(data);
}

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
    .select(PLAN_SELECT)
    .eq("user_id", user.id)
    .eq("week_start", weekStart)
    .single();

  return NextResponse.json(mapPlan(plan));
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const {
    week_start,
    day_of_week,
    meal_type = "dejeuner",
    recipe_id,
    mode = "set",
    remove_item_id,
    bulk,
  }: {
    week_start: string;
    day_of_week?: number;
    meal_type?: MealSlot;
    recipe_id?: string | null;
    mode?: "set" | "add";
    remove_item_id?: string;
    bulk?: Array<{ day_of_week: number; meal_type: MealSlot; recipe_id: string }>;
  } = body;

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
      .select("id")
      .single();
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    plan = newPlan;
  }

  if (!plan) {
    return NextResponse.json({ error: "Impossible de créer le planning" }, { status: 500 });
  }

  if (remove_item_id) {
    await supabase
      .from("meal_plan_items")
      .delete()
      .eq("id", remove_item_id)
      .eq("meal_plan_id", plan.id);
    return NextResponse.json(await loadPlan(supabase, plan.id));
  }

  if (Array.isArray(bulk) && bulk.length > 0) {
    for (const entry of bulk) {
      await supabase
        .from("meal_plan_items")
        .delete()
        .eq("meal_plan_id", plan.id)
        .eq("day_of_week", entry.day_of_week)
        .eq("meal_type", entry.meal_type);
    }
    await supabase.from("meal_plan_items").insert(
      bulk.map((entry) => ({
        meal_plan_id: plan!.id,
        day_of_week: entry.day_of_week,
        recipe_id: entry.recipe_id,
        meal_type: entry.meal_type,
      }))
    );
    return NextResponse.json(await loadPlan(supabase, plan.id));
  }

  if (typeof day_of_week !== "number") {
    return NextResponse.json({ error: "day_of_week requis" }, { status: 400 });
  }

  // Un créneau fixe ne garde qu'un repas : on remplace. Les snacks s'ajoutent.
  if (mode === "set") {
    await supabase
      .from("meal_plan_items")
      .delete()
      .eq("meal_plan_id", plan.id)
      .eq("day_of_week", day_of_week)
      .eq("meal_type", meal_type);
  }

  if (recipe_id) {
    await supabase.from("meal_plan_items").insert({
      meal_plan_id: plan.id,
      day_of_week,
      recipe_id,
      meal_type,
    });
  }

  return NextResponse.json(await loadPlan(supabase, plan.id));
}
