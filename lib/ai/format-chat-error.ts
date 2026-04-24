/**
 * Maps provider / transport errors to shopper-friendly French copy.
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
    return "Le compte du fournisseur d’IA n’a pas de crédits utilisables ou la facturation n’est pas activée. L’assistant ne peut pas répondre pour le moment.";
  }

  if (/invalid_api_key|Incorrect API key/i.test(raw)) {
    return "La clé API est absente ou refusée. Vérifiez OPENAI_API_KEY ou OPENROUTER_API_KEY (et AI_MODEL / AI_PROVIDER) sur le serveur.";
  }

  if (/rate_limit|429|too many requests/i.test(raw)) {
    return "Le service d’IA limite les requêtes. Patientez une minute et réessayez.";
  }

  if (/fetch failed|network|Failed to fetch/i.test(raw)) {
    return "Impossible de joindre l’assistant. Vérifiez votre connexion et réessayez.";
  }

  if (/Failed after \d+ attempts/i.test(raw) && /Provider returned error/i.test(raw)) {
    return "Le fournisseur d’IA a renvoyé une erreur après plusieurs tentatives. Souvent : modèle indisponible (vérifiez AI_MODEL), crédits OpenRouter épuisés, ou panne temporaire. Réessayez plus tard ou changez de modèle.";
  }

  if (/Provider returned error/i.test(raw)) {
    return "Le fournisseur d’IA a renvoyé une erreur. Vérifiez AI_MODEL (ex. modèle OpenRouter valide), les crédits du compte, puis réessayez.";
  }

  if (/No endpoints found|model not found|does not exist|invalid model/i.test(raw)) {
    return "Le modèle demandé n’existe pas ou n’est pas disponible pour votre clé. Corrigez la variable AI_MODEL sur le déploiement.";
  }

  if (/context length|maximum context|token limit|too long/i.test(raw)) {
    return "La conversation ou le contexte dépasse la limite du modèle. Réduisez le message ou recommencez une nouvelle discussion.";
  }

  if (/overloaded|capacity|try again later/i.test(raw)) {
    return "Le service d’IA est saturé. Réessayez dans quelques instants.";
  }

  if (/content policy|safety|blocked/i.test(raw)) {
    return "La requête a été refusée pour des raisons de politique de contenu. Reformulez votre demande.";
  }

  return error.message || "Une erreur s’est produite avec l’assistant.";
}

export function isQuotaOrBillingError(error: Error): boolean {
  const raw = rawMessage(error);
  return /insufficient_quota|exceeded your current quota|billing|insufficient credits|never purchased credits/i.test(
    raw
  );
}
