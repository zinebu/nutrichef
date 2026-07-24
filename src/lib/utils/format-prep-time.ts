/** Affiche la durée en minutes, ou en heures si > 59 min. */
export function formatPrepTime(
  minutes: number,
  options?: { compact?: boolean }
): string {
  if (minutes <= 59) {
    return options?.compact ? `${minutes}m` : `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (options?.compact) {
    return mins === 0 ? `${hours}h` : `${hours}h${mins}`;
  }

  if (mins === 0) return `${hours} h`;
  return `${hours} h ${mins}`;
}
