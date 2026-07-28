import OpenAI from "openai";
import { z } from "zod";

const weightsSchema = z.object({
  conversions: z.array(
    z.object({
      key: z.string(),
      unit: z.string(),
      gramsPerUnit: z.number().positive(),
    })
  ),
});

export interface WeightRequestItem {
  name: string;
  key: string;
  unit: string;
}

export type WeightConversion = z.infer<typeof weightsSchema>["conversions"][number];

/**
 * Estime le poids en grammes d'UNE unité pour des couples (ingrédient, unité)
 * absents de la table locale.
 */
export async function estimateGramWeights(
  items: WeightRequestItem[]
): Promise<WeightConversion[]> {
  if (items.length === 0) return [];

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `Tu es un expert en mesures culinaires françaises.
Pour chaque couple (ingrédient, unité), donne le poids moyen en grammes d'UNE SEULE unité de cet ingrédient.

Règles:
- Pour "piece": poids moyen d'une pièce entière crue et parée (ex: 1 oignon = 150 g).
- Pour "cas": cuillère à soupe rase (15 ml) convertie selon la densité de l'ingrédient.
- Pour "cac": cuillère à café rase (5 ml).
- Pour "verre": 200 ml, "tasse": 240 ml, "louche": 120 ml.
- Pour "tranche": poids d'une tranche standard.
- Pour "botte", "sachet", "boite": poids courant du conditionnement français.
- Reprends EXACTEMENT les valeurs "key" et "unit" fournies.

Réponds UNIQUEMENT en JSON valide:
{"conversions":[{"key":"...","unit":"...","gramsPerUnit":number}]}`;

  const userPrompt = `Estime le poids d'une unité pour chaque ligne:
${items.map((item) => `- key: "${item.key}" | unit: "${item.unit}" | ingrédient: ${item.name}`).join("\n")}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    response_format: { type: "json_object" },
    max_tokens: 1200,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) return [];

  return weightsSchema.parse(JSON.parse(content)).conversions;
}
