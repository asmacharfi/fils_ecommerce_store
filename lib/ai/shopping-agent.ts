import { stepCountIs, ToolLoopAgent } from "ai";

import type { ChatViewerProduct } from "@/lib/ai/chat-viewer-product";
import { createChatLanguageModel } from "@/lib/ai/create-chat-model";
import { createGetMyOrdersTool } from "@/lib/ai/tools/get-my-orders";
import { createPersonalizedRecommendationsTool } from "@/lib/ai/tools/personalized-products";
import { createFindSimilarProductsTool, searchProductsTool } from "@/lib/ai/tools/search-products";

const guestInstructions = `You are a friendly shopping assistant for this e-commerce store.
Reply in **English** (the storefront is English).

## Tools
- searchProducts: live catalog search (filters, names, price).
- findSimilarProducts: when available on a product page, for "similar to this item".
- getPersonalizedRecommendations: picks tailored to this shopper (history, cart, patterns). Use when they ask for personal recommendations or what suits them.

## Rules
- Prefer searchProducts for specific product lookups; use getPersonalizedRecommendations for broad personal picks.
- Call searchProducts at most once per shopper message unless zero results and broadening is clearly needed.
- For vague "cheap" requests with no amount, use searchProducts with maxPrice=100 and empty query.
- Only recommend products returned by tools (names and prices from tool output).
- No raw image URLs or markdown images in text; the UI renders product cards.
- For **their orders** or shipping: guests must **sign in** — explain briefly and point to **My orders** in the header.
- Be concise; short bullets when comparing options.
- Use only product fields from tool results; do not invent reviews or materials not in data.`;

const signedInOrderBlock = `

## Signed-in shopper (verified on the server)
- The shopper **is signed in**. Do **not** say they must log in or create an account.
- getMyOrders is available: call it when they ask about orders, shipping, delivery, or past purchases.
- After getMyOrders returns, give a **short** English summary; the chat UI already shows each order with **images**, **status colors**, and **links** to products and the full order history page.
- You may combine getMyOrders with getPersonalizedRecommendations or searchProducts as needed.`;

function viewerAnchorBlock(viewer: ChatViewerProduct): string {
  const nameLiteral = JSON.stringify(viewer.name);
  return `\n\n## Product page anchor\n- viewerProductId: ${viewer.id}\n- viewerCategoryId: ${viewer.categoryId}\n- viewerProductName: ${nameLiteral}\nWhen the shopper asks for similar, like, or alternative products and this block is present:\n- Call findSimilarProducts, not searchProducts.\n- Keep results inside viewerCategoryId.\n- Never list the excluded product as a recommendation.\n- If they add a style hint (pull, polo, linen, floral, perfume), pass it as the optional query to findSimilarProducts.`;
}

export type ShoppingAgentContext = {
  pageContext: string;
  viewerProduct: ChatViewerProduct | null;
  clerkUserId: string | null;
  shopperId: string | null;
  browseSummary: string;
  cartProductIds: string[];
  getToken: () => Promise<string | null>;
};

export function createShoppingAgent(ctx: ShoppingAgentContext) {
  const contextBlock =
    ctx.pageContext.trim().length > 0
      ? `\n\n## Current page context\n${ctx.pageContext.trim()}`
      : "\n\n## Current page context\nBrowsing the store.";

  const browseBlock =
    ctx.browseSummary.trim().length > 0
      ? `\n\n## Browsing signals\n${ctx.browseSummary.trim()}`
      : "";

  const cartBlock =
    ctx.cartProductIds.length > 0
      ? `\n\n## Cart product ids\n${ctx.cartProductIds.join(", ")}`
      : "";

  const viewerBlock = ctx.viewerProduct ? viewerAnchorBlock(ctx.viewerProduct) : "";

  const authHint = ctx.clerkUserId
    ? signedInOrderBlock
    : "\n\n## Account\nThe shopper is browsing as a guest unless they sign in. For order tracking, direct them to sign in and open **My orders**.";

  return new ToolLoopAgent({
    id: "store-shopping-agent",
    model: createChatLanguageModel(),
    instructions: `${guestInstructions}${authHint}${contextBlock}${browseBlock}${cartBlock}${viewerBlock}`,
    tools: {
      searchProducts: searchProductsTool,
      getPersonalizedRecommendations: createPersonalizedRecommendationsTool(ctx.getToken, {
        shopperId: ctx.shopperId,
        cartProductIds: ctx.cartProductIds,
      }),
      ...(ctx.viewerProduct ? { findSimilarProducts: createFindSimilarProductsTool(ctx.viewerProduct) } : {}),
      ...(ctx.clerkUserId ? { getMyOrders: createGetMyOrdersTool(ctx.getToken) } : {}),
    },
    stopWhen: stepCountIs(14),
  });
}
