import { DAYS_OF_WEEK } from "@/lib/constants";

/** Index 0 = Lundi … 6 = Dimanche (aligné sur le planning) */
export function getTodayDayIndex(date = new Date()): number {
  const jsDay = date.getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function getGreeting(date = new Date()): string {
  const hour = date.getHours();
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

export function formatTodayDate(date = new Date()): string {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function getTodayLabel(date = new Date()): string {
  return DAYS_OF_WEEK[getTodayDayIndex(date)];
}

/** Créneau le plus pertinent selon l'heure, pour mettre le bon repas en avant */
export function getCurrentMealSlot(
  date = new Date()
): "petit_dejeuner" | "dejeuner" | "diner" {
  const hour = date.getHours();
  if (hour < 10) return "petit_dejeuner";
  if (hour < 15) return "dejeuner";
  return "diner";
}
