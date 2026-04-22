import { stepCountIs, ToolLoopAgent } from "ai";

import { createChatLanguageModel } from "@/lib/ai/create-chat-model";
import type {
  ChatToolRequestContext,
  CheapestInCategoryRequestContext,
  SimilarProductsRequestContext,
} from "@/lib/ai/request-context";
import {
  createSearchProductsTool,
  searchProductsTool,
} from "@/lib/ai/tools/search-products";

const baseInstructions = `You are a friendly shopping assistant for this e-commerce store.

## Tools
You have a searchProducts tool backed by the live catalog. Use it whenever the shopper asks for:
- product ideas, recommendations, or "best" picks
- items similar to what they are viewing
- filters like price (cheap, under $X, budget), category, color, or size

## Price and "cheap" requests
- Words like "cheap", "affordable", "budget", "lowest price", "on sale" are **price intent**, not product name keywords.
- For those requests, set sortBy to "price-asc" and leave query empty unless the shopper also names a product type or brand in the product title (e.g. a word that would appear in product names).
- Use maxPrice and minPrice when the shopper gives a number (e.g. "under 50" -> maxPrice: 50).
- For a single, clear product search, call searchProducts **once** (do not run multiple searches in the same turn unless the shopper asked for a follow-up).

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
- Prefer leaving query empty unless the shopper adds an extra constraint such as color, size, or a name keyword.`;
}

function cheapestInCategoryInstructions(context: CheapestInCategoryRequestContext) {
  return `\n\n## Cheapest in this category
The shopper is viewing "${context.productName}" in category ${context.categoryName} (${context.categoryId}) and asked for cheap or lowest-priced options in this category.

For this turn:
- Call searchProducts with categoryId set to ${context.categoryId}, sortBy "price-asc", and query empty unless they also specified a name or brand to match in product titles.
- Do not filter other categories.
- If no products are found, say there are no products in this category for those filters.`;
}

function toolForContext(requestContext: ChatToolRequestContext | null) {
  if (!requestContext) {
    return searchProductsTool;
  }
  if (requestContext.kind === "similar-products") {
    return createSearchProductsTool({
      lockedCategoryId: requestContext.categoryId,
      lockedCategoryName: requestContext.categoryName,
      lockedExcludeProductId: requestContext.productId,
      strictCategoryEmpty: "similar",
    });
  }
  if (requestContext.kind === "cheapest-in-category") {
    return createSearchProductsTool({
      lockedCategoryId: requestContext.categoryId,
      lockedCategoryName: requestContext.categoryName,
      strictCategoryEmpty: "cheapest",
    });
  }
  return searchProductsTool;
}

export function createGuestShoppingAgent(
  pageContext: string,
  requestContext: ChatToolRequestContext | null = null
) {
  const contextBlock =
    pageContext.trim().length > 0
      ? `\n\n## Current page context\n${pageContext.trim()}`
      : "\n\n## Current page context\nBrowsing the store.";

  let requestBlock = "";
  if (requestContext?.kind === "similar-products") {
    requestBlock = similarProductsInstructions(requestContext);
  } else if (requestContext?.kind === "cheapest-in-category") {
    requestBlock = cheapestInCategoryInstructions(requestContext);
  }

  const searchTool = toolForContext(requestContext);

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
