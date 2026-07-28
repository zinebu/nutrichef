import { NextResponse } from "next/server";
import { analyzeNutrition } from "@/lib/openai/nutrition";
import { MISSING_KEY_MESSAGE, describeOpenAIError } from "@/lib/openai/errors";
import type { CookingFat, CookingType, Ingredient } from "@/types";

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: MISSING_KEY_MESSAGE }, { status: 503 });
  }

  try {
    const body = await request.json();
    const {
      imageBase64,
      ingredients = [],
      cookingType,
      servings = 1,
      recipeName,
      cookingFat,
      totalCookedWeightG,
      extras,
    }: {
      imageBase64?: string;
      ingredients?: Ingredient[];
      cookingType?: CookingType;
      servings?: number;
      recipeName?: string;
      cookingFat?: CookingFat | null;
      totalCookedWeightG?: number | null;
      extras?: string;
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
      cookingFat,
      totalCookedWeightG,
      extras,
    });

    return NextResponse.json(nutrition);
  } catch (error) {
    console.error("Nutrition analysis error:", error);
    const { error: message, status } = describeOpenAIError(
      error,
      "Erreur lors de l'analyse nutritionnelle"
    );
    return NextResponse.json({ error: message }, { status });
  }
}
