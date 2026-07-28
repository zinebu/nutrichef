import OpenAI from "openai";

/**
 * Illustre un snack à partir de sa description.
 * Volontairement sans texte ni logo : les modèles rendent mal les marques,
 * et une photo appétissante du produit suffit comme vignette.
 */
export async function generateProductImage(params: {
  name: string;
  productType?: string;
}): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const subject = params.productType?.trim()
    ? `${params.productType} (du type ${params.name})`
    : params.name;

  const prompt = `Photo culinaire carrée d'un ${subject}, posé sur une surface claire et neutre, lumière naturelle douce, cadrage rapproché et appétissant, style photographie de food minimaliste. Aucun texte, aucun logo, aucune marque, aucun emballage visible.`;

  // gpt-image-1 donne le meilleur rendu mais demande une organisation vérifiée,
  // d'où le repli sur dall-e-3.
  try {
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "low",
      n: 1,
    });
    const b64 = response.data?.[0]?.b64_json;
    if (b64) return `data:image/png;base64,${b64}`;
  } catch (error) {
    console.warn("gpt-image-1 indisponible, repli dall-e-3", error);
  }

  const fallback = await openai.images.generate({
    model: "dall-e-3",
    prompt,
    size: "1024x1024",
    quality: "standard",
    response_format: "b64_json",
    n: 1,
  });

  const b64 = fallback.data?.[0]?.b64_json;
  if (!b64) throw new Error("Aucune image générée");
  return `data:image/png;base64,${b64}`;
}
