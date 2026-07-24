import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { data: list } = await supabase
    .from("shopping_lists")
    .select("*, shopping_list_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!list) return NextResponse.json(null);

  return NextResponse.json({
    ...list,
    items: list.shopping_list_items,
  });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { items, meal_plan_id } = await request.json();

  const { data: list, error } = await supabase
    .from("shopping_lists")
    .insert({
      user_id: user.id,
      meal_plan_id,
      name: "Liste de courses",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (items?.length) {
    await supabase.from("shopping_list_items").insert(
      items.map(
        (item: {
          name: string;
          quantity: number | null;
          unit: string | null;
          category: string;
        }) => ({
          shopping_list_id: list.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
        })
      )
    );
  }

  const { data: fullList } = await supabase
    .from("shopping_lists")
    .select("*, shopping_list_items(*)")
    .eq("id", list.id)
    .single();

  return NextResponse.json({
    ...fullList,
    items: fullList?.shopping_list_items,
  });
}
