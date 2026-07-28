import { NextResponse } from "next/server";
import { analyzeQuickProduct } from "@/lib/openai/quick-nutrition";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Clé OpenAI non configurée. Ajoutez OPENAI_API_KEY dans .env.local" },
      { status: 503 }
    );
  }

  try {
    const { name, quantity } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nom du produit requis" }, { status: 400 });
    }

    const nutrition = await analyzeQuickProduct({ name: name.trim(), quantity });
    return NextResponse.json(nutrition);
  } catch (error) {
    console.error("Quick nutrition error:", error);
    return NextResponse.json(
      { error: "Impossible d'estimer ce produit" },
      { status: 500 }
    );
  }
}
