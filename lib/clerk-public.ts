/** Safe to import from client components. */
export const CLERK_UI_ENABLED = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.trim()
);
