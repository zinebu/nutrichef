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

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const body = await request.json();
  const { mode, itemId, is_checked, name, quantity, unit, category } = body;

  const { data: currentList } = await supabase
    .from("shopping_lists")
    .select("*, shopping_list_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (mode === "toggle") {
    if (!itemId) {
      return NextResponse.json({ error: "itemId requis" }, { status: 400 });
    }

    const { data: item, error } = await supabase
      .from("shopping_list_items")
      .update({ is_checked })
      .eq("id", itemId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: updatedList } = await supabase
      .from("shopping_lists")
      .select("*, shopping_list_items(*)")
      .eq("id", item.shopping_list_id)
      .single();

    return NextResponse.json({
      ...updatedList,
      items: updatedList?.shopping_list_items ?? [],
    });
  }

  if (mode === "add") {
    const listId = currentList?.id ?? null;
    if (!listId) {
      const { data: createdList, error: listError } = await supabase
        .from("shopping_lists")
        .insert({ user_id: user.id, name: "Liste de courses" })
        .select()
        .single();

      if (listError) {
        return NextResponse.json({ error: listError.message }, { status: 500 });
      }

      const { data: inserted, error: insertError } = await supabase
        .from("shopping_list_items")
        .insert({
          shopping_list_id: createdList.id,
          name,
          quantity,
          unit,
          category: category ?? "autres",
          is_checked: false,
          is_manual: true,
        })
        .select();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      const { data: fullList } = await supabase
        .from("shopping_lists")
        .select("*, shopping_list_items(*)")
        .eq("id", createdList.id)
        .single();

      return NextResponse.json({ ...fullList, items: fullList?.shopping_list_items ?? [] });
    }

    const { data: inserted, error: insertError } = await supabase
      .from("shopping_list_items")
      .insert({
        shopping_list_id: listId,
        name,
        quantity,
        unit,
        category: category ?? "autres",
        is_checked: false,
        is_manual: true,
      })
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    const { data: fullList } = await supabase
      .from("shopping_lists")
      .select("*, shopping_list_items(*)")
      .eq("id", listId)
      .single();

    return NextResponse.json({ ...fullList, items: fullList?.shopping_list_items ?? [] });
  }

  if (mode === "remove") {
    if (!itemId) {
      return NextResponse.json({ error: "itemId requis" }, { status: 400 });
    }

    const { error } = await supabase.from("shopping_list_items").delete().eq("id", itemId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!currentList) {
      return NextResponse.json({ id: null, user_id: user.id, meal_plan_id: null, name: "Liste de courses", items: [] });
    }

    const { data: fullList } = await supabase
      .from("shopping_lists")
      .select("*, shopping_list_items(*)")
      .eq("id", currentList.id)
      .single();

    return NextResponse.json({ ...fullList, items: fullList?.shopping_list_items ?? [] });
  }

  return NextResponse.json({ error: "mode invalide" }, { status: 400 });
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
