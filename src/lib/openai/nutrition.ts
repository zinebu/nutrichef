import OpenAI from "openai";
import { z } from "zod";
import type { CookingType, Ingredient, NutritionData } from "@/types";

const nutritionSchema = z.object({
  detectedFoods: z.array(z.string()),
  caloriesTotal: z.number(),
  caloriesPerServing: z.number(),
  proteinsG: z.number(),
  carbsG: z.number(),
  fatsG: z.number(),
  sugarG: z.number(),
  fiberG: z.number(),
  tips: z.string(),
  estimatedIngredients: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number(),
        unit: z.string(),
      })
    )
    .optional(),
});

export async function analyzeNutrition(params: {
  imageBase64?: string;
  ingredients: Ingredient[];
  cookingType?: CookingType;
  servings?: number;
  recipeName?: string;
}): Promise<NutritionData> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const ingredientsText = params.ingredients
    .map((i) => `- ${i.name}: ${i.quantity}${i.unit}`)
    .join("\n");

  const systemPrompt = `Tu es un nutritionniste expert. Analyse les recettes et fournis des estimations nutritionnelles précises.
Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "detectedFoods": ["aliment1", "aliment2"],
  "caloriesTotal": number,
  "caloriesPerServing": number,
  "proteinsG": number,
  "carbsG": number,
  "fatsG": number,
  "sugarG": number,
  "fiberG": number,
  "tips": "conseil nutritionnel en français",
  "estimatedIngredients": [{"name": "...", "quantity": number, "unit": "g|ml|pièce"}]
}
Les valeurs nutritionnelles doivent être réalistes. Les conseils en français.`;

  const userContent: OpenAI.Chat.ChatCompletionContentPart[] = [];

  if (params.imageBase64) {
    userContent.push({
      type: "image_url",
      image_url: {
        url: params.imageBase64.startsWith("data:")
          ? params.imageBase64
          : `data:image/jpeg;base64,${params.imageBase64}`,
        detail: "high",
      },
    });
  }

  userContent.push({
    type: "text",
    text: `Analyse cette recette:
${params.recipeName ? `Nom: ${params.recipeName}` : ""}
Type de cuisson: ${params.cookingType ?? "non spécifié"}
Portions: ${params.servings ?? 1}
Ingrédients:
${ingredientsText || "Non spécifiés — estime à partir de l'image"}

Estime les valeurs nutritionnelles totales et par portion.`,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1500,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Réponse OpenAI vide");

  const parsed = nutritionSchema.parse(JSON.parse(content));
  return parsed;
}
