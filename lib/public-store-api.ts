/** Client-safe API root (same shape as `NEXT_PUBLIC_API_URL`). */
export function getBrowserStoreApiRoot(): string | null {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) return null;
  let s = raw.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  if (!s) return null;
  return s.replace(/\/$/, "");
}
