/**
 * Traduit les échecs d'appel OpenAI en messages actionnables :
 * une clé absente, invalide ou sans crédit se corrige côté configuration,
 * pas côté application.
 */
export function describeOpenAIError(error: unknown, fallback: string) {
  const status = (error as { status?: number } | null)?.status;

  if (status === 401) {
    return {
      error:
        "Clé OpenAI invalide. Remplace la valeur d'OPENAI_API_KEY par une vraie clé depuis platform.openai.com.",
      status: 401,
    };
  }

  if (status === 429) {
    return {
      error: "Quota OpenAI atteint. Vérifie le crédit de ton compte OpenAI.",
      status: 429,
    };
  }

  return { error: fallback, status: 500 };
}

export const MISSING_KEY_MESSAGE =
  "Clé OpenAI non configurée. Ajoute une vraie clé OPENAI_API_KEY (locale et sur Vercel).";
