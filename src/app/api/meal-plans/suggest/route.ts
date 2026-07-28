import { NextResponse } from "next/server";
import {
  suggestDayMeals,
  type LibraryRecipe,
  type PlannedMeal,
} from "@/lib/openai/meal-suggestions";
import type { MealSlot } from "@/types";

const MAX_LIBRARY = 60;

export async function POST(request: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Clé OpenAI non configurée" },
      { status: 503 }
    );
  }

  try {
    const {
      dayLabel,
      planned = [],
      emptySlots = [],
      library = [],
      dailyTarget = 2000,
    }: {
      dayLabel: string;
      planned?: PlannedMeal[];
      emptySlots?: MealSlot[];
      library?: LibraryRecipe[];
      dailyTarget?: number;
    } = await request.json();

    if (emptySlots.length === 0) {
      return NextResponse.json({ comment: "Ta journée est déjà complète.", suggestions: [] });
    }

    if (library.length === 0) {
      return NextResponse.json({
        comment: "Ajoute d'abord quelques recettes pour recevoir des suggestions.",
        suggestions: [],
      });
    }

    const result = await suggestDayMeals({
      dayLabel: dayLabel ?? "Journée",
      planned,
      emptySlots,
      library: library.slice(0, MAX_LIBRARY),
      dailyTarget,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Meal suggestion error:", error);
    return NextResponse.json(
      { error: "Impossible de générer des suggestions" },
      { status: 500 }
    );
  }
}
