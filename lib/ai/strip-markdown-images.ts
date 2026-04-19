/** Removes `![alt](url)` from assistant text so raw image markdown does not appear in the chat UI. */
export function stripMarkdownImages(text: string): string {
  return text.replace(/!\[[^\]]*\]\([^)]+\)/g, "").replace(/\n{3,}/g, "\n\n");
}
