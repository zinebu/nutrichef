import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
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

  const { data: current } = await supabase
    .from("recipes")
    .select("is_favorite")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!current) {
    return NextResponse.json({ error: "Recette introuvable" }, { status: 404 });
  }

  const { data: updated, error } = await supabase
    .from("recipes")
    .update({ is_favorite: !current.is_favorite })
    .eq("id", id)
    .select("*, ingredients(*)")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(updated);
}
