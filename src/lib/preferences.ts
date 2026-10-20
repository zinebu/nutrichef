import { getUserScopedStorageKey } from "@/lib/storage-scopes";

const DEFAULT_BREAKFAST_KEY = "cherry_default_breakfast";
const BREAKFAST_APPLIED_KEY = "cherry_default_breakfast_week";

function read(key: string, userId?: string | null): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(getUserScopedStorageKey(key, userId ?? "local"));
  } catch {
    return null;
  }
}

function write(key: string, value: string | null, userId?: string | null) {
  if (typeof window === "undefined") return;
  try {
    const scopedKey = getUserScopedStorageKey(key, userId ?? "local");
    if (value === null) localStorage.removeItem(scopedKey);
    else localStorage.setItem(scopedKey, value);
  } catch {
    // stockage indisponible : la préférence est optionnelle
  }
}

export function getDefaultBreakfastId(userId?: string | null): string | null {
  return read(DEFAULT_BREAKFAST_KEY, userId);
}

export function setDefaultBreakfastId(recipeId: string | null, userId?: string | null) {
  write(DEFAULT_BREAKFAST_KEY, recipeId, userId);
  // Changer de petit déjeuner par défaut le rend applicable à la semaine en cours
  write(BREAKFAST_APPLIED_KEY, null, userId);
}

/** Semaine pour laquelle le petit déjeuner par défaut a déjà été appliqué */
export function getBreakfastAppliedWeek(userId?: string | null): string | null {
  return read(BREAKFAST_APPLIED_KEY, userId);
}

export function markBreakfastApplied(weekStart: string, userId?: string | null) {
  write(BREAKFAST_APPLIED_KEY, weekStart, userId);
}
