import { stepCountIs, ToolLoopAgent } from "ai";

import type { ChatViewerProduct } from "@/lib/ai/chat-viewer-product";
import { createChatLanguageModel } from "@/lib/ai/create-chat-model";
import { createFindSimilarProductsTool, searchProductsTool } from "@/lib/ai/tools/search-products";

const baseInstructions = `You are a friendly shopping assistant for this e-commerce store.

## Tools
You have a searchProducts tool backed by the live catalog. Use it whenever the shopper asks for:
- product ideas, recommendations, or "best" picks
- filters like cheap, under a price, category, color, or size
- If a findSimilarProducts tool is available, use that for "similar to this product" requests on the current product page.

## Rules
- Prefer calling searchProducts instead of guessing inventory.
- Call searchProducts at most once per shopper message unless the tool returned zero products and a single follow-up with broader filters is clearly needed.
- For vague requests like cheap, budget-friendly, affordable, or low price with no dollar amount, call searchProducts with maxPrice=100 and an empty query (do not search product names for the word "cheap").
- Only recommend products returned by searchProducts (use their names and prices from the tool output).
- Do not put product image URLs or markdown image syntax in your message; the UI shows images on product cards from the tool output.
- If the shopper asks about **their orders** or account-specific data, explain that order lookup is not available in this guest assistant and they can use checkout or support as usual.
- Keep replies concise and helpful. Use short bullet lists when comparing options.
- Do not invent brand names, materials, ingredients, or reviews; only use product fields present in searchProducts results (name, price, category name).
- After searchProducts returns items, summarize the top matches in natural language; the UI will also show product cards from the tool output.`;

function viewerAnchorBlock(viewer: ChatViewerProduct): string {
  const nameLiteral = JSON.stringify(viewer.name);
  return `\n\n## Product page anchor\n- viewerProductId: ${viewer.id}\n- viewerCategoryId: ${viewer.categoryId}\n- viewerProductName: ${nameLiteral}\nWhen the shopper asks for similar, like, or alternative products and this block is present:\n- Call findSimilarProducts, not searchProducts.\n- Keep results inside viewerCategoryId.\n- Never list the excluded product as a recommendation.\n- If the shopper adds a style/type hint such as pull, polo, linen, floral, or parfum, pass that word as the optional query to findSimilarProducts.`;
}

export function createGuestShoppingAgent(
  pageContext: string,
  viewerProduct: ChatViewerProduct | null = null
) {
  const contextBlock =
    pageContext.trim().length > 0
      ? `\n\n## Current page context\n${pageContext.trim()}`
      : "\n\n## Current page context\nBrowsing the store.";

  const viewerBlock = viewerProduct ? viewerAnchorBlock(viewerProduct) : "";
  const tools = {
    searchProducts: searchProductsTool,
    ...(viewerProduct ? { findSimilarProducts: createFindSimilarProductsTool(viewerProduct) } : {}),
  };

  return new ToolLoopAgent({
    id: "guest-shopping-agent",
    model: createChatLanguageModel(),
    instructions: `${baseInstructions}${contextBlock}${viewerBlock}`,
    tools,
    stopWhen: stepCountIs(12),
  });
}
