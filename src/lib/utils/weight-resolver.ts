import { conversionKey, missingConversions } from "@/lib/utils/unit-convert";

const CACHE_KEY = "cherry_unit_weights";

type WeightCache = Record<string, number>;

function loadCache(): WeightCache {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as WeightCache) : {};
  } catch {
    return {};
  }
}

function saveCache(cache: WeightCache) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // quota dépassé : le cache est optionnel
  }
}

/**
 * Table de conversion complète pour ces ingrédients : cache local d'abord,
 * puis estimation IA pour les unités encore inconnues (résultats mis en cache).
 */
export async function resolveGramOverrides(
  ingredients: Array<{ name: string; quantity: number; unit: string }>
): Promise<Map<string, number>> {
  const cache = loadCache();
  const overrides = new Map<string, number>(Object.entries(cache));

  const missing = missingConversions(ingredients, overrides);
  if (missing.length === 0) return overrides;

  try {
    const res = await fetch("/api/ingredients/convert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: missing }),
    });
    if (!res.ok) return overrides;

    const { conversions } = await res.json();
    if (!Array.isArray(conversions)) return overrides;

    let changed = false;
    for (const conversion of conversions) {
      const grams = Number(conversion?.gramsPerUnit);
      if (!conversion?.key || !conversion?.unit || !Number.isFinite(grams) || grams <= 0) {
        continue;
      }
      const key = conversionKey(conversion.key, conversion.unit);
      overrides.set(key, grams);
      cache[key] = grams;
      changed = true;
    }

    if (changed) saveCache(cache);
  } catch {
    // hors ligne : on conserve les unités d'origine
  }

  return overrides;
}
