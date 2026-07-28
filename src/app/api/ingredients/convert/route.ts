import { NextResponse } from "next/server";
import { estimateGramWeights, type WeightRequestItem } from "@/lib/openai/ingredient-weights";

const MAX_ITEMS = 40;

export async function POST(request: Request) {
  // Sans clé OpenAI la liste garde simplement les unités d'origine.
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ conversions: [] });
  }

  try {
    const body = await request.json();
    const items: WeightRequestItem[] = Array.isArray(body?.items) ? body.items : [];

    const valid = items
      .filter((item) => item?.key && item?.unit)
      .slice(0, MAX_ITEMS);

    if (valid.length === 0) {
      return NextResponse.json({ conversions: [] });
    }

    const conversions = await estimateGramWeights(valid);
    return NextResponse.json({ conversions });
  } catch (error) {
    console.error("Ingredient weight conversion error:", error);
    return NextResponse.json({ conversions: [] });
  }
}
