/** Server-only: used by middleware and route handlers. */
export function isClerkSecretConfigured(): boolean {
  return Boolean(process.env.CLERK_SECRET_KEY?.trim());
}
