import { getIngredientKey } from "@/lib/utils/ingredient-normalize";

/**
 * Convertit n'importe quelle mesure culinaire en grammes pour pouvoir
 * additionner « 400 g de farine » et « 1 c. à soupe de farine ».
 */

function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

const MASS_TO_G: Record<string, number> = {
  mg: 0.001,
  g: 1,
  kg: 1000,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  cl: 10,
  dl: 100,
  l: 1000,
  cas: 15,
  cac: 5,
  verre: 200,
  tasse: 240,
  louche: 120,
};

const UNIT_ALIASES: Record<string, string> = {
  mg: "mg",
  g: "g",
  gr: "g",
  grs: "g",
  gramme: "g",
  grammes: "g",
  kg: "kg",
  kilo: "kg",
  kilos: "kg",
  kilogramme: "kg",
  ml: "ml",
  millilitre: "ml",
  millilitres: "ml",
  cl: "cl",
  centilitre: "cl",
  centilitres: "cl",
  dl: "dl",
  l: "l",
  litre: "l",
  litres: "l",
  cas: "cas",
  cuillere: "cas",
  cuilleres: "cas",
  "c a soupe": "cas",
  "c a s": "cas",
  "cuillere a soupe": "cas",
  "cuilleres a soupe": "cas",
  "cuillere soupe": "cas",
  cac: "cac",
  "c a cafe": "cac",
  "c a c": "cac",
  "cuillere a cafe": "cac",
  "cuilleres a cafe": "cac",
  "cuillere cafe": "cac",
  "cuillere a the": "cac",
  verre: "verre",
  verres: "verre",
  tasse: "tasse",
  tasses: "tasse",
  louche: "louche",
  louches: "louche",
  piece: "piece",
  pieces: "piece",
  unite: "piece",
  unites: "piece",
  u: "piece",
  tranche: "tranche",
  tranches: "tranche",
  gousse: "gousse",
  gousses: "gousse",
  pincee: "pincee",
  pincees: "pincee",
  botte: "botte",
  bottes: "botte",
  brin: "brin",
  brins: "brin",
  feuille: "feuille",
  feuilles: "feuille",
  sachet: "sachet",
  sachets: "sachet",
  boite: "boite",
  boites: "boite",
};

/** Densités en g/ml, clés normalisées via getIngredientKey */
const DENSITIES: Record<string, number> = {
  eau: 1,
  lait: 1.03,
  "lait de coco": 0.99,
  "lait de soja": 1.03,
  "lait d'amande": 1.02,
  creme: 1,
  "creme fraiche": 1,
  "creme liquide": 1,
  yaourt: 1.03,
  huile: 0.92,
  "huile d'olive": 0.92,
  beurre: 0.96,
  margarine: 0.95,
  vinaigre: 1.01,
  "sauce soja": 1.2,
  sauce: 1.05,
  ketchup: 1.1,
  mayonnaise: 0.95,
  moutarde: 1.05,
  miel: 1.42,
  sirop: 1.3,
  confiture: 1.3,
  jus: 1.02,
  "jus de citron": 1.02,
  bouillon: 1,
  vin: 0.99,
  biere: 1.01,
  farine: 0.55,
  maizena: 0.6,
  chapelure: 0.4,
  semoule: 0.75,
  couscous: 0.75,
  sucre: 0.85,
  "sucre glace": 0.56,
  cacao: 0.45,
  cafe: 0.4,
  riz: 0.85,
  quinoa: 0.8,
  boulgour: 0.8,
  lentille: 0.85,
  "pois chiche": 0.8,
  flocon: 0.4,
  avoine: 0.4,
  "flocon d'avoine": 0.4,
  sel: 1.2,
  poivre: 0.45,
  paprika: 0.45,
  cumin: 0.45,
  curcuma: 0.5,
  cannelle: 0.45,
  curry: 0.45,
  levure: 0.55,
  "fromage rape": 0.4,
  parmesan: 0.45,
  noix: 0.5,
  amande: 0.6,
  noisette: 0.6,
  raisin: 0.6,
  chocolat: 0.7,
};

/** Poids moyen d'une pièce en grammes */
const PIECE_WEIGHTS: Record<string, number> = {
  oeuf: 55,
  "blanc d'oeuf": 33,
  "jaune d'oeuf": 18,
  tomate: 120,
  "tomate cerise": 15,
  oignon: 150,
  echalote: 30,
  ail: 5,
  "gousse d'ail": 5,
  carotte: 80,
  "pomme de terre": 150,
  patate: 150,
  pomme: 180,
  poire: 170,
  banane: 120,
  citron: 100,
  "citron vert": 70,
  orange: 200,
  clementine: 80,
  mandarine: 80,
  kiwi: 90,
  peche: 150,
  abricot: 45,
  prune: 60,
  figue: 50,
  avocat: 200,
  mangue: 300,
  ananas: 1200,
  melon: 1000,
  pasteque: 3000,
  courgette: 250,
  aubergine: 300,
  poivron: 150,
  concombre: 300,
  brocoli: 500,
  "chou-fleur": 800,
  chou: 900,
  salade: 300,
  laitue: 300,
  poireau: 150,
  navet: 150,
  betterave: 150,
  fenouil: 250,
  celeri: 400,
  champignon: 20,
  radis: 15,
  endive: 130,
  artichaut: 350,
  asperge: 20,
  "blanc de poulet": 150,
  poulet: 1300,
  steak: 150,
  escalope: 130,
  saucisse: 70,
  merguez: 60,
  saumon: 140,
  truite: 200,
  sardine: 80,
  crevette: 12,
  pain: 250,
  baguette: 250,
  "pain de mie": 500,
  tortilla: 45,
  galette: 60,
  yaourt: 125,
};

/** Poids moyen d'une tranche en grammes */
const SLICE_WEIGHTS: Record<string, number> = {
  pain: 30,
  "pain de mie": 25,
  baguette: 25,
  jambon: 40,
  bacon: 15,
  fromage: 20,
  emmental: 20,
  gruyere: 20,
  saumon: 30,
  tomate: 20,
  citron: 10,
  concombre: 10,
  ananas: 80,
  aubergine: 40,
  courgette: 25,
};

const DEFAULT_SLICE_WEIGHT = 25;
const PINCH_WEIGHT = 0.4;
const BUNCH_WEIGHT = 100;
const SPRIG_WEIGHT = 2;
const LEAF_WEIGHT = 1;

/** Normalise une unité vers sa forme canonique (g, kg, ml, cas, piece…) */
export function normalizeUnit(unit: string | null | undefined): string {
  if (!unit) return "piece";
  const cleaned = stripAccents(unit)
    .toLowerCase()
    .replace(/\./g, " ")
    .replace(/['']/g, "'")
    .replace(/\s+/g, " ")
    .trim();
  return UNIT_ALIASES[cleaned] ?? cleaned;
}

/** Clé de cache pour une conversion (ingrédient + unité) */
export function conversionKey(ingredientKey: string, unit: string): string {
  return `${ingredientKey}|${normalizeUnit(unit)}`;
}

function lookup(table: Record<string, number>, key: string): number | null {
  if (table[key] != null) return table[key];

  const words = key.split(" ");
  for (const word of words) {
    if (word.length > 2 && table[word] != null) return table[word];
  }

  const candidates = Object.keys(table)
    .filter((entry) => key.includes(entry))
    .sort((a, b) => b.length - a.length);

  return candidates.length > 0 ? table[candidates[0]] : null;
}

export interface GramConversion {
  gramsPerUnit: number;
  /** true uniquement pour les unités de masse, sans estimation */
  exact: boolean;
}

/**
 * Poids en grammes d'une unité de cet ingrédient.
 * `overrides` permet d'injecter des valeurs estimées par l'IA.
 */
export function gramsPerUnit(
  ingredientKey: string,
  unit: string,
  overrides?: Map<string, number>
): GramConversion | null {
  const canonical = normalizeUnit(unit);

  if (MASS_TO_G[canonical] != null) {
    return { gramsPerUnit: MASS_TO_G[canonical], exact: true };
  }

  const override = overrides?.get(conversionKey(ingredientKey, canonical));
  if (override != null && override > 0) {
    return { gramsPerUnit: override, exact: false };
  }

  if (VOLUME_TO_ML[canonical] != null) {
    const density = lookup(DENSITIES, ingredientKey);
    if (density == null) return null;
    return { gramsPerUnit: VOLUME_TO_ML[canonical] * density, exact: false };
  }

  if (canonical === "pincee") return { gramsPerUnit: PINCH_WEIGHT, exact: false };
  if (canonical === "brin") return { gramsPerUnit: SPRIG_WEIGHT, exact: false };
  if (canonical === "feuille") return { gramsPerUnit: LEAF_WEIGHT, exact: false };
  if (canonical === "botte") return { gramsPerUnit: BUNCH_WEIGHT, exact: false };

  if (canonical === "gousse") {
    return { gramsPerUnit: lookup(PIECE_WEIGHTS, ingredientKey) ?? 5, exact: false };
  }

  if (canonical === "tranche") {
    const weight = lookup(SLICE_WEIGHTS, ingredientKey);
    return { gramsPerUnit: weight ?? DEFAULT_SLICE_WEIGHT, exact: false };
  }

  if (canonical === "piece") {
    const weight = lookup(PIECE_WEIGHTS, ingredientKey);
    if (weight == null) return null;
    return { gramsPerUnit: weight, exact: false };
  }

  return null;
}

/** Convertit une mesure en grammes, ou null si l'équivalence est inconnue */
export function toGrams(
  name: string,
  quantity: number,
  unit: string,
  overrides?: Map<string, number>
): number | null {
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  const conversion = gramsPerUnit(getIngredientKey(name), unit, overrides);
  if (!conversion) return null;
  return quantity * conversion.gramsPerUnit;
}

export interface MissingConversion {
  name: string;
  key: string;
  unit: string;
}

/** Couples (ingrédient, unité) que la table locale ne sait pas convertir */
export function missingConversions(
  ingredients: Array<{ name: string; quantity: number; unit: string }>,
  overrides?: Map<string, number>
): MissingConversion[] {
  const missing = new Map<string, MissingConversion>();

  for (const ingredient of ingredients) {
    const key = getIngredientKey(ingredient.name);
    if (!key) continue;
    if (gramsPerUnit(key, ingredient.unit, overrides)) continue;

    const unit = normalizeUnit(ingredient.unit);
    missing.set(conversionKey(key, unit), { name: ingredient.name, key, unit });
  }

  return [...missing.values()];
}

/** Choisit g ou kg selon la masse totale */
export function formatGrams(grams: number): { quantity: number; unit: string } {
  if (grams >= 1000) {
    return { quantity: Math.round(grams / 10) / 100, unit: "kg" };
  }
  if (grams >= 10) {
    return { quantity: Math.round(grams), unit: "g" };
  }
  return { quantity: Math.round(grams * 10) / 10, unit: "g" };
}

/** Équivalent lisible pour l'UI, ex. « ≈ 9 g » */
export function describeGrams(grams: number | null): string | null {
  if (grams == null) return null;
  const { quantity, unit } = formatGrams(grams);
  return `≈ ${quantity} ${unit}`;
}
