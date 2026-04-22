import { stepCountIs, ToolLoopAgent } from "ai";

import { createChatLanguageModel } from "@/lib/ai/create-chat-model";
import type { SimilarProductsRequestContext } from "@/lib/ai/request-context";
import {
  createSearchProductsTool,
  searchProductsTool,
} from "@/lib/ai/tools/search-products";

const baseInstructions = `You are a friendly shopping assistant for this e-commerce store.

## Tools
You have a searchProducts tool backed by the live catalog. Use it whenever the shopper asks for:
- product ideas, recommendations, or "best" picks
- items similar to what they are viewing
- filters like cheap, under a price, category, color, or size

## Rules
- Prefer calling searchProducts instead of guessing inventory.
- Only recommend products returned by searchProducts (use their names and prices from the tool output).
- Do not put product image URLs or markdown image syntax in your message; the UI shows images on product cards from the tool output.
- If the shopper asks about **their orders** or account-specific data, explain that order lookup is not available in this guest assistant and they can use checkout or support as usual.
- Keep replies concise and helpful. Use short bullet lists when comparing options.
- After searchProducts returns items, summarize the top matches in natural language; the UI will also show product cards from the tool output.`;

function similarProductsInstructions(context: SimilarProductsRequestContext) {
  return `\n\n## Similar products request
The shopper asked for products similar to "${context.productName}".
Original product id: ${context.productId}
Original category: ${context.categoryName} (${context.categoryId})

For this turn:
- Treat ${context.categoryName} as a strict category filter.
- Call searchProducts with categoryId set to ${context.categoryId}.
- Always exclude product id ${context.productId}.
- Do not broaden to other categories or product types.
- If no products are found, say: "No similar products found in this category."
- Prefer leaving query empty unless the shopper adds an extra constraint such as color, size, or price.`;
}

export function createGuestShoppingAgent(
  pageContext: string,
  requestContext: SimilarProductsRequestContext | null = null
) {
  const contextBlock =
    pageContext.trim().length > 0
      ? `\n\n## Current page context\n${pageContext.trim()}`
      : "\n\n## Current page context\nBrowsing the store.";
  const requestBlock = requestContext
    ? similarProductsInstructions(requestContext)
    : "";
  const searchTool = requestContext
    ? createSearchProductsTool({
        lockedCategoryId: requestContext.categoryId,
        lockedCategoryName: requestContext.categoryName,
        lockedExcludeProductId: requestContext.productId,
      })
    : searchProductsTool;

  return new ToolLoopAgent({
    id: "guest-shopping-agent",
    model: createChatLanguageModel(),
    instructions: `${baseInstructions}${contextBlock}${requestBlock}`,
    tools: {
      searchProducts: searchTool,
    },
    stopWhen: stepCountIs(12),
  });
}
