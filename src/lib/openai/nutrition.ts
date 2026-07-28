import OpenAI from "openai";
import { z } from "zod";
import { normalizeUnit, toGrams } from "@/lib/utils/unit-convert";
import { COOKING_TYPES } from "@/lib/constants";
import type { CookingFat, CookingType, Ingredient, NutritionData } from "@/types";

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
        note: z.string().optional(),
      })
    )
    .optional(),
  missingInfo: z.array(z.string()).optional(),
  confidence: z.string().optional(),
});

function describeIngredient(ingredient: Ingredient): string {
  const grams =
    ingredient.grams ?? toGrams(ingredient.name, ingredient.quantity, ingredient.unit);
  const measured = `${ingredient.quantity} ${ingredient.unit}`;
  const gramsText =
    grams != null && normalizeUnit(ingredient.unit) !== "g"
      ? ` (≈ ${Math.round(grams)} g)`
      : "";
  const note = ingredient.note?.trim() ? ` — type/marque : ${ingredient.note.trim()}` : "";
  return `- ${ingredient.name} : ${measured}${gramsText}${note}`;
}

function describeCookingFat(fat: CookingFat | null | undefined): string {
  if (!fat?.type || !fat.quantity) return "Aucune matière grasse ajoutée déclarée";
  const grams = toGrams(fat.type, fat.quantity, fat.unit);
  const gramsText = grams != null ? ` (≈ ${Math.round(grams)} g)` : "";
  return `${fat.type} : ${fat.quantity} ${fat.unit}${gramsText}`;
}

export async function analyzeNutrition(params: {
  imageBase64?: string;
  ingredients: Ingredient[];
  cookingType?: CookingType;
  servings?: number;
  recipeName?: string;
  cookingFat?: CookingFat | null;
  totalCookedWeightG?: number | null;
  extras?: string;
}): Promise<NutritionData> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const systemPrompt = `Tu es un nutritionniste expert. Tu estimes les apports d'une recette à partir des tables de composition de référence (CIQUAL, USDA).

Méthode obligatoire:
1. Convertis chaque ingrédient en grammes avant tout calcul.
2. Utilise le type/marque précisé pour choisir la bonne valeur (ex: emmental 28% ≠ mozzarella, lait entier ≠ écrémé, crème 30% ≠ allégée, viande maigre ≠ grasse).
3. Si aucun type n'est précisé, prends la version la plus courante en France et signale-le dans "missingInfo".
4. Tiens compte de la cuisson: la friture ajoute la graisse absorbée (5 à 15% du poids selon l'aliment), le four et la vapeur n'ajoutent rien au-delà de la matière grasse déclarée.
5. Compte TOUTE la matière grasse déclarée, y compris celle qui sert juste à graisser le plat.
6. Ajoute les compléments déclarés (sauce, fromage sur le dessus, sucre, noix, chocolat…).
7. "caloriesTotal" = recette entière. "caloriesPerServing" = total ÷ nombre de portions.
8. Les macros retournées correspondent à la recette ENTIÈRE.
9. Vérifie la cohérence: calories ≈ (protéines × 4) + (glucides × 4) + (lipides × 9).

"missingInfo": liste courte, en français, des précisions qui amélioreraient l'estimation (type de fromage, matière grasse de la crème, marque d'un produit industriel, quantité d'huile, poids total après cuisson…). Tableau vide si tout est suffisamment précis.
"confidence": "faible", "moyenne" ou "bonne".

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
  "estimatedIngredients": [{"name": "...", "quantity": number, "unit": "g", "note": "type supposé"}],
  "missingInfo": ["..."],
  "confidence": "moyenne"
}
Toutes les valeurs numériques sont réalistes. Tous les textes en français.`;

  const ingredientsText = params.ingredients.map(describeIngredient).join("\n");
  const cookingLabel =
    COOKING_TYPES.find((type) => type.value === params.cookingType)?.label ??
    "non spécifié";

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
    text: `Analyse cette recette.

Nom: ${params.recipeName?.trim() || "non précisé"}
Mode de cuisson: ${cookingLabel}
Matière grasse de cuisson: ${describeCookingFat(params.cookingFat)}
Nombre de portions finales: ${params.servings ?? 1}
Poids total après cuisson: ${
      params.totalCookedWeightG ? `${params.totalCookedWeightG} g` : "non précisé"
    }
Ajouts / garnitures: ${params.extras?.trim() || "aucun"}

Ingrédients:
${ingredientsText || "Non spécifiés — déduis-les de la photo et estime les quantités en grammes"}

Estime les valeurs nutritionnelles de la recette entière et par portion.`,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userContent },
    ],
    response_format: { type: "json_object" },
    max_tokens: 2000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Réponse OpenAI vide");

  return nutritionSchema.parse(JSON.parse(content));
}
