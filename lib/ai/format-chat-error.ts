/**
 * Maps provider / transport errors to shopper-friendly English copy.
 */

function rawMessage(error: Error): string {
  return `${error.message} ${(error as Error & { cause?: unknown }).cause ?? ""}`;
}

export function formatAiChatError(error: Error): string {
  const raw = rawMessage(error);

  if (
    /insufficient_quota|exceeded your current quota|billing|insufficient credits|never purchased credits/i.test(
      raw
    )
  ) {
    return "The AI provider account has no usable credits or billing is disabled, so the assistant cannot run right now.";
  }

  if (/invalid_api_key|Incorrect API key/i.test(raw)) {
    return "The API key is missing or rejected. Check OPENAI_API_KEY or OPENROUTER_API_KEY (and AI_MODEL / AI_PROVIDER) on the server.";
  }

  if (/rate_limit|429|too many requests/i.test(raw)) {
    return "The AI service is rate-limited. Wait a minute and try again.";
  }

  if (/fetch failed|network|Failed to fetch/i.test(raw)) {
    return "Could not reach the assistant. Check your connection and try again.";
  }

  if (/Failed after \d+ attempts/i.test(raw) && /Provider returned error/i.test(raw)) {
    return "The AI provider returned an error after several attempts. Often: model unavailable (check AI_MODEL), OpenRouter credits exhausted, or a temporary outage. Try again later or change the model.";
  }

  if (/Provider returned error/i.test(raw)) {
    return "The AI provider returned an error. Check AI_MODEL (e.g. a valid OpenRouter model), account credits, then try again.";
  }

  if (/No endpoints found|model not found|does not exist|invalid model/i.test(raw)) {
    return "The requested model does not exist or is not available for your key. Fix the AI_MODEL variable on the deployment.";
  }

  if (/context length|maximum context|token limit|too long/i.test(raw)) {
    return "The conversation or context exceeds the model limit. Shorten your message or start a new chat.";
  }

  if (/overloaded|capacity|try again later/i.test(raw)) {
    return "The AI service is overloaded. Try again in a few moments.";
  }

  if (/content policy|safety|blocked/i.test(raw)) {
    return "The request was blocked by content policy. Rephrase your message.";
  }

  return error.message || "Something went wrong with the assistant.";
}

export function isQuotaOrBillingError(error: Error): boolean {
  const raw = rawMessage(error);
  return /insufficient_quota|exceeded your current quota|billing|insufficient credits|never purchased credits/i.test(
    raw
  );
}
