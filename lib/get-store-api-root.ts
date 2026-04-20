/** Trimmed `NEXT_PUBLIC_API_URL` without trailing slash, or `null` if unset. */
export function getStoreApiRoot(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}
