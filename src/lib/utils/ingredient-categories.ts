/**
 * Catégories courses par nom d'ingrédient normalisé (clé getIngredientKey).
 */
export const INGREDIENT_CATEGORIES: Record<string, string> = {
  // Légumes
  tomate: "legumes",
  oignon: "legumes",
  echalote: "legumes",
  ail: "legumes",
  avocat: "legumes",
  carotte: "legumes",
  salade: "legumes",
  laitue: "legumes",
  roquette: "legumes",
  mesclun: "legumes",
  courgette: "legumes",
  poivron: "legumes",
  aubergine: "legumes",
  brocoli: "legumes",
  chou: "legumes",
  "chou-fleur": "legumes",
  choufleur: "legumes",
  chou_rave: "legumes",
  "chou rave": "legumes",
  concombre: "legumes",
  epinard: "legumes",
  celeri: "legumes",
  "celeri branche": "legumes",
  "celeri rave": "legumes",
  poireau: "legumes",
  navet: "legumes",
  fenouil: "legumes",
  betterave: "legumes",
  radis: "legumes",
  artichaut: "legumes",
  asperge: "legumes",
  endive: "legumes",
  champignon: "legumes",
  "champignon de paris": "legumes",
  haricot: "legumes",
  "haricot vert": "legumes",
  "petit pois": "legumes",
  pois: "legumes",
  mais: "legumes",
  patate: "feculents",
  "pomme de terre": "feculents",
  courge: "legumes",
  potiron: "legumes",
  butternut: "legumes",
  panais: "legumes",
  topinambour: "legumes",
  cresson: "legumes",
  mache: "legumes",
  batavia: "legumes",
  iceberg: "legumes",
  persil: "legumes",
  coriandre: "legumes",
  basilic: "legumes",
  menthe: "legumes",
  thym: "legumes",
  romarin: "legumes",
  ciboulette: "legumes",
  aneth: "legumes",
  estragon: "legumes",
  origan: "legumes",
  laurier: "legumes",
  "feuille de laurier": "legumes",

  // Fruits
  pomme: "fruits",
  "pomme noire": "fruits",
  banane: "fruits",
  citron: "fruits",
  citron_vert: "fruits",
  "citron vert": "fruits",
  lime: "fruits",
  orange: "fruits",
  mandarine: "fruits",
  clementine: "fruits",
  poire: "fruits",
  peche: "fruits",
  abricot: "fruits",
  prune: "fruits",
  cerise: "fruits",
  fraise: "fruits",
  framboise: "fruits",
  myrtille: "fruits",
  mure: "fruits",
  groseille: "fruits",
  raisin: "fruits",
  melon: "fruits",
  pasteque: "fruits",
  ananas: "fruits",
  mangue: "fruits",
  kiwi: "fruits",
  figue: "fruits",
  datte: "fruits",
  noix_coco: "fruits",
  "noix de coco": "fruits",

  // Protéines
  poulet: "proteines",
  dinde: "proteines",
  canard: "proteines",
  boeuf: "proteines",
  veau: "proteines",
  porc: "proteines",
  agneau: "proteines",
  viande: "proteines",
  steak: "proteines",
  entrecote: "proteines",
  bacon: "proteines",
  lardon: "proteines",
  jambon: "proteines",
  saucisse: "proteines",
  merguez: "proteines",
  saumon: "proteines",
  thon: "proteines",
  cabillaud: "proteines",
  colin: "proteines",
  truite: "proteines",
  sardine: "proteines",
  anchois: "proteines",
  crevette: "proteines",
  moule: "proteines",
  huitre: "proteines",
  calamar: "proteines",
  oeuf: "proteines",
  tofu: "proteines",
  tempeh: "proteines",
  seitan: "proteines",

  // Laitiers
  lait: "laitiers",
  beurre: "laitiers",
  creme: "laitiers",
  "creme fraiche": "laitiers",
  yaourt: "laitiers",
  fromage: "laitiers",
  mozzarella: "laitiers",
  parmesan: "laitiers",
  gruyere: "laitiers",
  emmental: "laitiers",
  comte: "laitiers",
  chevre: "laitiers",
  feta: "laitiers",
  ricotta: "laitiers",
  mascarpone: "laitiers",
  fromage_blanc: "laitiers",
  "fromage blanc": "laitiers",

  // Féculents
  riz: "feculents",
  pate: "feculents",
  nouille: "feculents",
  spaghetti: "feculents",
  tagliatelle: "feculents",
  penne: "feculents",
  lasagne: "feculents",
  pain: "feculents",
  farine: "feculents",
  semoule: "feculents",
  couscous: "feculents",
  quinoa: "feculents",
  boulgour: "feculents",
  lentille: "feculents",
  "pois chiche": "feculents",
  haricot_rouge: "feculents",
  "haricot rouge": "feculents",
  flocon: "feculents",
  "flocon d'avoine": "feculents",
  avoine: "feculents",
  polenta: "feculents",
  tortilla: "feculents",
  galette: "feculents",

  // Épices & condiments
  sel: "epices",
  poivre: "epices",
  huile: "epices",
  "huile d'olive": "epices",
  vinaigre: "epices",
  moutarde: "epices",
  sauce: "epices",
  "sauce soja": "epices",
  ketchup: "epices",
  mayonnaise: "epices",
  miel: "epices",
  sucre: "epices",
  paprika: "epices",
  cumin: "epices",
  curcuma: "epices",
  cannelle: "epices",
  muscade: "epices",
  gingembre: "epices",
  piment: "epices",
  curry: "epices",
  herbes: "epices",
  "herbes de provence": "epices",
  bouillon: "epices",
  cube: "epices",
  "cube de bouillon": "epices",
};

const SORTED_KEYS = Object.keys(INGREDIENT_CATEGORIES).sort((a, b) => b.length - a.length);

const LEGUME_PATTERN =
  /legume|herbe|ail|epinard|brocoli|broccoli|concombre|aubergine|chou|courgette|carotte|tomate|oignon|poivron|poireau|navet|celeri|fenouil|radis|asperge|artichaut|champignon|haricot|cresson|salade|laitue|roquette|endive|courge|potiron|butternut|betterave|echalote|persil|basilic|coriandre|menthe|thym|romarin|ciboulette/;
const FRUIT_PATTERN =
  /fruit|baie|pomme(?!\s*de\s*terre)|banane|citron|orange|fraise|framboise|myrtille|poire|peche|abricot|prune|cerise|raisin|melon|pasteque|ananas|mangue|kiwi|figue|datte|clementine|mandarine/;
const PROTEIN_PATTERN =
  /poulet|viande|poisson|oeuf|tofu|jambon|lardon|crevette|saumon|thon|boeuf|porc|agneau|veau|dinde|canard|bacon|saucisse|merguez|cabillaud|colin|truite|moule|huitre|calamar|steak/;
const DAIRY_PATTERN = /lait|fromage|creme|beurre|yaourt|mozzarella|parmesan|gruyere|emmental|feta|ricotta|mascarpone|chevre/;
const STARCH_PATTERN =
  /riz|pate|nouille|spaghetti|pain|farine|semoule|quinoa|couscous|boulgour|lentille|pois chiche|haricot rouge|flocon|avoine|polenta|pomme de terre|patate/;
const SPICE_PATTERN =
  /epice|sel|poivre|huile|vinaigre|sauce|moutarde|miel|sucre|paprika|cumin|curcuma|cannelle|muscade|gingembre|piment|curry|bouillon/;

export function categorizeByKey(key: string): string | null {
  if (!key) return null;

  if (INGREDIENT_CATEGORIES[key]) {
    return INGREDIENT_CATEGORIES[key];
  }

  for (const word of key.split(" ")) {
    if (word.length > 2 && INGREDIENT_CATEGORIES[word]) {
      return INGREDIENT_CATEGORIES[word];
    }
  }

  for (const ingredientKey of SORTED_KEYS) {
    if (key.includes(ingredientKey)) {
      return INGREDIENT_CATEGORIES[ingredientKey];
    }
  }

  if (LEGUME_PATTERN.test(key)) return "legumes";
  if (FRUIT_PATTERN.test(key)) return "fruits";
  if (PROTEIN_PATTERN.test(key)) return "proteines";
  if (DAIRY_PATTERN.test(key)) return "laitiers";
  if (STARCH_PATTERN.test(key)) return "feculents";
  if (SPICE_PATTERN.test(key)) return "epices";

  return null;
}
