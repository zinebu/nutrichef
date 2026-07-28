/**
 * Normalise les noms d'ingrédients pour regrouper les variantes
 * (pluriel, accents, casse, synonymes).
 */

const COMPOUND_CANONICAL: [RegExp, string][] = [
  [/pommes?\s+de\s+terre?s?/gi, "pomme de terre"],
  [/huile[s]?\s+d['']?\s*olive/gi, "huile d'olive"],
  [/pommes?\s+noire?s?/gi, "pomme noire"],
  [/haricots?\s+verts?/gi, "haricot vert"],
  [/poivrons?\s+rouge?s?/gi, "poivron rouge"],
  [/poivrons?\s+vert?s?/gi, "poivron vert"],
  [/choux?\s+-?\s*fleurs?/gi, "chou-fleur"],
  [/choux?\s+fleurs?/gi, "chou-fleur"],
  [/feuilles?\s+de\s+laurier/gi, "feuille de laurier"],
  [/sauce[s]?\s+soja/gi, "sauce soja"],
  [/creme?\s+fra[iî]che?s?/gi, "crème fraîche"],
  [/p[aâ]tes?\s+de\s+riz/gi, "pâte de riz"],
];

const ALIAS_MAP: Record<string, string> = {
  tomates: "tomate",
  tomate: "tomate",
  oignons: "oignon",
  oignon: "oignon",
  oeufs: "oeuf",
  oeuf: "oeuf",
  œufs: "oeuf",
  œuf: "oeuf",
  carottes: "carotte",
  carotte: "carotte",
  courgettes: "courgette",
  courgette: "courgette",
  aubergines: "aubergine",
  aubergine: "aubergine",
  poivrons: "poivron",
  poivron: "poivron",
  champignons: "champignon",
  champignon: "champignon",
  pommes: "pomme",
  pomme: "pomme",
  bananes: "banane",
  banane: "banane",
  citrons: "citron",
  citron: "citron",
  avocats: "avocat",
  avocat: "avocat",
  poulets: "poulet",
  poulet: "poulet",
  crevettes: "crevette",
  crevette: "crevette",
  pates: "pate",
  pate: "pate",
  riz: "riz",
  laits: "lait",
  lait: "lait",
  fromages: "fromage",
  fromage: "fromage",
  yaourts: "yaourt",
  yaourt: "yaourt",
  beurres: "beurre",
  beurre: "beurre",
  epinards: "épinard",
  épinards: "épinard",
  epinard: "épinard",
  épinard: "épinard",
  salades: "salade",
  salade: "salade",
  ail: "ail",
  ails: "ail",
  saumons: "saumon",
  saumon: "saumon",
  thons: "thon",
  thon: "thon",
  boeuf: "boeuf",
  bœuf: "boeuf",
  viande: "viande",
  viandes: "viande",
  farines: "farine",
  farine: "farine",
  sucre: "sucre",
  sucres: "sucre",
  sel: "sel",
  sels: "sel",
  poivre: "poivre",
  poivres: "poivre",
  basilic: "basilic",
  persils: "persil",
  persil: "persil",
  coriandres: "coriandre",
  coriandre: "coriandre",
  menthes: "menthe",
  menthe: "menthe",
  lardons: "lardon",
  lardon: "lardon",
  jambons: "jambon",
  jambon: "jambon",
  brocolis: "brocoli",
  brocoli: "brocoli",
  broccoli: "brocoli",
  broccolis: "brocoli",
  concombres: "concombre",
  concombre: "concombre",
  navets: "navet",
  navet: "navet",
  poireaux: "poireau",
  poireau: "poireau",
  celeris: "céleri",
  céleris: "céleri",
  celeri: "céleri",
  céleri: "céleri",
  noix: "noix",
  amandes: "amande",
  amande: "amande",
  noisettes: "noisette",
  noisette: "noisette",
  miel: "miel",
  miels: "miel",
  vinaigre: "vinaigre",
  vinaigres: "vinaigre",
  moutarde: "moutarde",
  moutardes: "moutarde",
  tofu: "tofu",
  tofus: "tofu",
  lentilles: "lentille",
  lentille: "lentille",
  pois: "pois",
  pois_chiche: "pois chiche",
  "pois chiches": "pois chiche",
  semoule: "semoule",
  semoules: "semoule",
  quinoa: "quinoa",
  quinoas: "quinoa",
  pain: "pain",
  pains: "pain",
  champignons_de_paris: "champignon de paris",
  "champignons de paris": "champignon de paris",
};

const SKIP_SINGULAR = new Set(["de", "du", "des", "d", "la", "le", "les", "au", "aux", "en", "et"]);

function stripAccents(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function baseNormalize(name: string): string {
  return stripAccents(name)
    .toLowerCase()
    .replace(/œ/g, "oe")
    .replace(/æ/g, "ae")
    .replace(/['']/g, "'")
    .replace(/[^a-z0-9àâäéèêëïîôùûüç'\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function applyCompoundRules(text: string): string {
  let result = text;
  for (const [pattern, canonical] of COMPOUND_CANONICAL) {
    result = result.replace(pattern, canonical);
  }
  return result.replace(/\s+/g, " ").trim();
}

function singularizeWord(word: string): string {
  if (SKIP_SINGULAR.has(word) || word.length <= 2) return word;

  const irregular: Record<string, string> = {
    oeufs: "oeuf",
    baux: "bal",
    chevaux: "cheval",
    gâteaux: "gâteau",
    gateaux: "gateau",
    houx: "houx",
    bois: "bois",
    prix: "prix",
    frais: "frai",
    pais: "pai",
  };

  if (irregular[word]) return irregular[word];

  if (word.endsWith("aux") && word.length > 4) {
    return word.slice(0, -3) + "al";
  }
  if (word.endsWith("eux") && word.length > 4) {
    return word.slice(0, -3) + "eu";
  }
  if (word.endsWith("s") && !word.endsWith("ss") && !word.endsWith("us") && !word.endsWith("is")) {
    return word.slice(0, -1);
  }

  return word;
}

function singularizePhrase(phrase: string): string {
  return phrase
    .split(" ")
    .map((w) => singularizeWord(w))
    .join(" ");
}

/** Clé de fusion pour regrouper les ingrédients identiques */
export function getIngredientKey(name: string): string {
  let normalized = baseNormalize(name);
  normalized = applyCompoundRules(normalized);

  if (ALIAS_MAP[normalized]) {
    return baseNormalize(ALIAS_MAP[normalized]);
  }

  normalized = singularizePhrase(normalized);

  if (ALIAS_MAP[normalized]) {
    return baseNormalize(ALIAS_MAP[normalized]);
  }

  return normalized;
}

/** Nom affiché normalisé (forme canonique) */
export function formatIngredientName(name: string): string {
  const key = getIngredientKey(name);
  if (!key) return name.trim();

  const smallWords = new Set(["de", "du", "des", "d'", "d", "la", "le", "les", "au", "aux", "et"]);

  return key
    .split(" ")
    .map((word, i) => {
      if (i > 0 && smallWords.has(word)) return word;
      if (word === "d") return "d'";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ")
    .replace(/d' /g, "d'")
    .replace(/D'/g, "d'");
}

/** Normalise un ingrédient complet (nom uniquement) */
export function normalizeIngredientName(name: string): string {
  if (!name.trim()) return name;
  return formatIngredientName(name);
}
