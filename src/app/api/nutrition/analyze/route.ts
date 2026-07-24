import { NextResponse } from "next/server";
import { analyzeNutrition } from "@/lib/openai/nutrition";
import type { CookingType, Ingredient } from "@/types";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Clé OpenAI non configurée. Ajoutez OPENAI_API_KEY dans .env.local" },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const {
      imageBase64,
      ingredients = [],
      cookingType,
      servings = 1,
      recipeName,
    }: {
      imageBase64?: string;
      ingredients?: Ingredient[];
      cookingType?: CookingType;
      servings?: number;
      recipeName?: string;
    } = body;

    if (!imageBase64 && ingredients.length === 0) {
      return NextResponse.json(
        { error: "Fournissez une photo ou des ingrédients" },
        { status: 400 }
      );
    }

    const nutrition = await analyzeNutrition({
      imageBase64,
      ingredients,
      cookingType,
      servings,
      recipeName,
    });

    return NextResponse.json(nutrition);
  } catch (error) {
    console.error("Nutrition analysis error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'analyse nutritionnelle" },
      { status: 500 }
    );
  }
}
