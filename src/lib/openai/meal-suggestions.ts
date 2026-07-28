import OpenAI from "openai";
import { z } from "zod";
import { MEAL_SLOTS } from "@/lib/constants";
import type { DaySuggestions, MealSlot } from "@/types";

const suggestionsSchema = z.object({
  comment: z.string(),
  suggestions: z.array(
    z.object({
      mealType: z.enum(["petit_dejeuner", "dejeuner", "diner", "snack"]),
      recipeId: z.string(),
      reason: z.string(),
    })
  ),
});

export interface PlannedMeal {
  mealType: MealSlot;
  name: string;
  calories: number;
}

export interface LibraryRecipe {
  id: string;
  name: string;
  category: string;
  calories: number | null;
  tags: string[];
}

const SLOT_LABELS: Record<string, string> = {
  ...Object.fromEntries(MEAL_SLOTS.map((slot) => [slot.value, slot.label])),
  snack: "Snack",
};

/**
 * Propose des recettes de la bibliothèque de l'utilisateur pour équilibrer
 * la journée : si un repas est très calorique, les autres créneaux sont plus légers.
 */
export async function suggestDayMeals(params: {
  dayLabel: string;
  planned: PlannedMeal[];
  emptySlots: MealSlot[];
  library: LibraryRecipe[];
  dailyTarget: number;
}): Promise<DaySuggestions> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `Tu es un nutritionniste qui aide à équilibrer une journée de repas.

Tu reçois les repas déjà choisis pour une journée, les créneaux encore vides, et la bibliothèque de recettes de l'utilisateur.

Règles:
- Choisis UNIQUEMENT des recettes de la bibliothèque, en reprenant leur "id" exact.
- Une seule suggestion par créneau vide.
- Respecte la cohérence du créneau: un petit déjeuner au matin, un plat complet à midi ou au dîner.
- Équilibre la journée autour de l'objectif calorique: si les repas déjà choisis sont lourds, propose nettement plus léger pour le reste.
- Si aucune recette de la bibliothèque ne convient à un créneau, n'invente rien: ne propose rien pour ce créneau et explique-le dans "comment".
- "reason": une phrase courte qui justifie le choix (ex: « plus léger pour compenser le petit déjeuner »).
- "comment": deux phrases maximum sur l'équilibre de la journée.

Réponds UNIQUEMENT en JSON valide:
{"comment":"...","suggestions":[{"mealType":"diner","recipeId":"...","reason":"..."}]}
Tous les textes en français.`;

  const plannedText =
    params.planned.length > 0
      ? params.planned
          .map(
            (meal) =>
              `- ${SLOT_LABELS[meal.mealType] ?? meal.mealType} : ${meal.name} (${Math.round(meal.calories)} kcal)`
          )
          .join("\n")
      : "Aucun repas choisi pour l'instant";

  const libraryText = params.library
    .map(
      (recipe) =>
        `- id: ${recipe.id} | ${recipe.name} | catégorie: ${recipe.category} | ${
          recipe.calories != null ? `${Math.round(recipe.calories)} kcal/portion` : "calories inconnues"
        }${recipe.tags.length > 0 ? ` | ${recipe.tags.join(", ")}` : ""}`
    )
    .join("\n");

  const totalPlanned = params.planned.reduce((sum, meal) => sum + meal.calories, 0);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Journée: ${params.dayLabel}
Objectif indicatif: ${params.dailyTarget} kcal
Total déjà planifié: ${Math.round(totalPlanned)} kcal

Repas déjà choisis:
${plannedText}

Créneaux à compléter: ${params.emptySlots
          .map((slot) => SLOT_LABELS[slot] ?? slot)
          .join(", ")}

Bibliothèque de recettes:
${libraryText}`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 900,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Réponse OpenAI vide");

  const parsed = suggestionsSchema.parse(JSON.parse(content));

  // On ne garde que les suggestions qui pointent vraiment vers une recette existante
  const validIds = new Set(params.library.map((recipe) => recipe.id));
  return {
    comment: parsed.comment,
    suggestions: parsed.suggestions.filter((s) => validIds.has(s.recipeId)),
  };
}
