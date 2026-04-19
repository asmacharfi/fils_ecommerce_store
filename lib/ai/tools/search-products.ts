import { tool } from "ai";
import { z } from "zod";

import { fetchStoreProducts } from "@/lib/catalog/fetch-store-products";
import type { Product } from "@/types";

const searchProductsInputSchema = z.object({
  query: z
    .string()
    .optional()
    .describe(
      "Free-text match against product names (case-insensitive). Leave empty to only use structured filters."
    ),
  categoryId: z
    .string()
    .optional()
    .describe("Filter by category id when the shopper is browsing a category or asks for that category."),
  colorId: z.string().optional().describe("Filter by color id when relevant."),
  sizeId: z.string().optional().describe("Filter by size id when relevant."),
  minPrice: z.number().optional().describe("Minimum numeric price."),
  maxPrice: z.number().optional().describe("Maximum numeric price."),
  excludeProductId: z
    .string()
    .optional()
    .describe(
      "Exclude this product id (e.g. when the shopper asks for similar items to the one on the page)."
    ),
  limit: z.number().min(1).max(12).optional().default(8),
});

export type SearchProductsInput = z.infer<typeof searchProductsInputSchema>;

export type SearchProductsOutput = {
  found: boolean;
  message: string;
  products: Product[];
  filters: SearchProductsInput;
};

function priceNumber(product: Product): number {
  const n = Number(product.price);
  return Number.isFinite(n) ? n : 0;
}

export const searchProductsTool = tool({
  description:
    "Search the live product catalog for this store. Use it whenever the shopper wants recommendations, comparisons, filters, or similar items. Call at most once per user turn unless results are empty and broadening filters is clearly needed.",
  inputSchema: searchProductsInputSchema,
  execute: async (params): Promise<SearchProductsOutput> => {
    const {
      query = "",
      categoryId,
      colorId,
      sizeId,
      minPrice,
      maxPrice,
      excludeProductId,
      limit = 8,
    } = params;

    try {
      const baseList = await fetchStoreProducts({
        categoryId,
        colorId,
        sizeId,
      });

      let products = baseList.filter((p) => !(p as { isArchived?: boolean }).isArchived);

      const q = query.trim().toLowerCase();
      if (q) {
        products = products.filter((p) => p.name.toLowerCase().includes(q));
      }

      if (typeof minPrice === "number") {
        products = products.filter((p) => priceNumber(p) >= minPrice);
      }
      if (typeof maxPrice === "number") {
        products = products.filter((p) => priceNumber(p) <= maxPrice);
      }

      if (excludeProductId) {
        products = products.filter((p) => p.id !== excludeProductId);
      }

      products = products.slice(0, limit);

      if (!products.length) {
        return {
          found: false,
          message:
            "No products matched those filters. Suggest broadening the search (different category, fewer filters, or a shorter keyword).",
          products: [],
          filters: params,
        };
      }

      return {
        found: true,
        message: `Found ${products.length} matching product(s).`,
        products,
        filters: params,
      };
    } catch (error) {
      return {
        found: false,
        message:
          error instanceof Error ? error.message : "Unable to search the catalog right now.",
        products: [],
        filters: params,
      };
    }
  },
});
