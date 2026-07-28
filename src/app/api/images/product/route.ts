import { NextResponse } from "next/server";
import { generateProductImage } from "@/lib/openai/product-image";
import { MISSING_KEY_MESSAGE, describeOpenAIError } from "@/lib/openai/errors";

// La génération d'image dépasse largement la limite par défaut
export const maxDuration = 60;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: MISSING_KEY_MESSAGE }, { status: 503 });
  }

  try {
    const { name, productType } = await request.json();

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Nom du produit requis" }, { status: 400 });
    }

    const image = await generateProductImage({ name: name.trim(), productType });
    return NextResponse.json({ image });
  } catch (error) {
    console.error("Product image error:", error);
    const { error: message, status } = describeOpenAIError(
      error,
      "Impossible de générer l'illustration"
    );
    return NextResponse.json({ error: message }, { status });
  }
}
