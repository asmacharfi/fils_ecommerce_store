function stripEnvQuotes(value: string): string {
  let s = value.trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/** Trimmed `NEXT_PUBLIC_API_URL` without trailing slash, or `null` if unset. */
export function getStoreApiRoot(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return null;
  const cleaned = stripEnvQuotes(raw);
  if (!cleaned) return null;
  return cleaned.replace(/\/$/, "");
}
