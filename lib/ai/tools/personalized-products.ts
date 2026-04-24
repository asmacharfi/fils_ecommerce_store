import { tool } from "ai";
import { z } from "zod";

import type { SearchProductsInput, SearchProductsOutput } from "@/lib/ai/tools/search-products";
import { normalizeProducts } from "@/lib/catalog/normalize-product";
import { getStoreApiRoot } from "@/lib/get-store-api-root";

export function createPersonalizedRecommendationsTool(
  getToken: () => Promise<string | null>,
  ctx: { shopperId: string | null; cartProductIds: string[] }
) {
  return tool({
    description:
      "Get personalized product picks for this shopper using purchase history (when logged in), cart contents, and store-wide patterns. Prefer this when they ask for recommendations tailored to them, 'for me', or based on past orders.",
    inputSchema: z.object({
      limit: z.number().min(1).max(12).optional().default(8),
    }),
    execute: async ({ limit = 8 }): Promise<SearchProductsOutput> => {
      const root = getStoreApiRoot();
      if (!root) {
        return {
          found: false,
          message: "Catalog unavailable.",
          products: [],
          filters: { limit } as SearchProductsInput,
        };
      }

      const url = new URL(`${root}/recommendations/personal`);
      url.searchParams.set("limit", String(limit));
      if (ctx.shopperId) {
        url.searchParams.set("shopperId", ctx.shopperId);
      }
      if (ctx.cartProductIds.length) {
        url.searchParams.set("cartProductIds", ctx.cartProductIds.join(","));
      }

      const headers: Record<string, string> = {};
      const token = await getToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      try {
        const res = await fetch(url.toString(), { headers, cache: "no-store" });
        if (!res.ok) {
          return {
            found: false,
            message: "Could not load personalized suggestions.",
            products: [],
            filters: { limit } as SearchProductsInput,
          };
        }
        const raw = await res.json();
        const products = normalizeProducts(raw);
        return {
          found: products.length > 0,
          message:
            products.length > 0
              ? `${products.length} personalized pick(s) from the live catalog.`
              : "No personalized picks right now — suggest browsing featured categories.",
          products,
          filters: { limit } as SearchProductsInput,
        };
      } catch {
        return {
          found: false,
          message: "Network error while loading recommendations.",
          products: [],
          filters: { limit } as SearchProductsInput,
        };
      }
    },
  });
}
