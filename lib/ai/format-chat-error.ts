/**
 * Maps provider / transport errors to shopper-friendly copy.
 * OpenAI quota and billing issues surface as stream errors with varying message shapes.
 */
export function formatAiChatError(error: Error): string {
  const raw = `${error.message} ${(error as Error & { cause?: unknown }).cause ?? ""}`;

  if (
    /insufficient_quota|exceeded your current quota|billing|insufficient credits|never purchased credits/i.test(
      raw
    )
  ) {
    return "The configured AI provider account does not have usable credits or billing enabled, so the assistant cannot run right now.";
  }

  if (/invalid_api_key|Incorrect API key/i.test(raw)) {
    return "The AI API key is missing or rejected. Check OPENAI_API_KEY or OPENROUTER_API_KEY (and AI_PROVIDER) in your environment.";
  }

  if (/rate_limit|429|too many requests/i.test(raw)) {
    return "The AI service is rate-limited right now. Wait a minute and try again.";
  }

  if (/fetch failed|network|Failed to fetch/i.test(raw)) {
    return "Could not reach the assistant. Check your connection and try again.";
  }

  return error.message || "Something went wrong while talking to the assistant.";
}

export function isQuotaOrBillingError(error: Error): boolean {
  const raw = `${error.message} ${(error as Error & { cause?: unknown }).cause ?? ""}`;
  return /insufficient_quota|exceeded your current quota|billing|insufficient credits|never purchased credits/i.test(
    raw
  );
}
