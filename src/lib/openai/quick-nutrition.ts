import OpenAI from "openai";
import { z } from "zod";
import type { QuickNutrition } from "@/types";

const quickSchema = z.object({
  name: z.string(),
  servingDescription: z.string(),
  caloriesPerServing: z.number(),
  proteinsG: z.number(),
  carbsG: z.number(),
  fatsG: z.number(),
  sugarG: z.number(),
  fiberG: z.number(),
  tips: z.string().optional(),
});

/**
 * Estime l'apport d'un produit acheté à partir de son seul nom,
 * ex. « Kinder Bueno », « chips Lay's 30 g », « yaourt Danone vanille ».
 */
export async function analyzeQuickProduct(params: {
  name: string;
  quantity?: string;
}): Promise<QuickNutrition> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `Tu es un expert en composition des produits alimentaires vendus en France.
À partir du nom d'un produit acheté (marque, barre, biscuit, boisson, fruit, sachet…), donne son apport pour la portion indiquée.

Règles:
- Si une quantité est donnée, calcule pour cette quantité exacte.
- Sinon utilise la portion vendue la plus courante (une barre, un sachet individuel, un pot…) et décris-la dans "servingDescription".
- Base-toi sur les valeurs officielles de la marque quand tu la reconnais, sinon sur un produit équivalent.
- "name": reprends un nom propre et lisible du produit.
- "tips": une phrase courte et utile, sans jugement moralisateur.

Réponds UNIQUEMENT en JSON valide:
{
  "name": "...",
  "servingDescription": "1 barre de 43 g",
  "caloriesPerServing": number,
  "proteinsG": number,
  "carbsG": number,
  "fatsG": number,
  "sugarG": number,
  "fiberG": number,
  "tips": "..."
}
Tous les textes en français.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: `Produit: ${params.name}
Quantité: ${params.quantity?.trim() || "portion standard"}`,
      },
    ],
    response_format: { type: "json_object" },
    max_tokens: 600,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Réponse OpenAI vide");

  return quickSchema.parse(JSON.parse(content));
}
