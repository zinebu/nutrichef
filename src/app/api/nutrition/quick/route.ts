import { NextResponse } from "next/server";
import { analyzeQuickProduct } from "@/lib/openai/quick-nutrition";
import { MISSING_KEY_MESSAGE, describeOpenAIError } from "@/lib/openai/errors";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: MISSING_KEY_MESSAGE }, { status: 503 });
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
    const { error: message, status } = describeOpenAIError(
      error,
      "Impossible d'estimer ce produit"
    );
    return NextResponse.json({ error: message }, { status });
  }
}
