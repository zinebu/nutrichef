const DEFAULT_BREAKFAST_KEY = "cherry_default_breakfast";
const BREAKFAST_APPLIED_KEY = "cherry_default_breakfast_week";

function read(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // stockage indisponible : la préférence est optionnelle
  }
}

export function getDefaultBreakfastId(): string | null {
  return read(DEFAULT_BREAKFAST_KEY);
}

export function setDefaultBreakfastId(recipeId: string | null) {
  write(DEFAULT_BREAKFAST_KEY, recipeId);
  // Changer de petit déjeuner par défaut le rend applicable à la semaine en cours
  write(BREAKFAST_APPLIED_KEY, null);
}

/** Semaine pour laquelle le petit déjeuner par défaut a déjà été appliqué */
export function getBreakfastAppliedWeek(): string | null {
  return read(BREAKFAST_APPLIED_KEY);
}

export function markBreakfastApplied(weekStart: string) {
  write(BREAKFAST_APPLIED_KEY, weekStart);
}
