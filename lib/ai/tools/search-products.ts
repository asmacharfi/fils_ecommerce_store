import { tool } from "ai";
import { z } from "zod";

import type { ChatViewerProduct } from "@/lib/ai/chat-viewer-product";
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
  maxPrice: z
    .number()
    .optional()
    .describe(
      "Maximum numeric price in store currency. For vague cheap or budget requests without a number, use 100."
    ),
  excludeProductId: z
    .string()
    .optional()
    .describe(
      "Exclude this product id (e.g. when the shopper asks for similar items to the one on the page)."
    ),
  similarToName: z
    .string()
    .optional()
    .describe(
      "Anchor product name for ranking similar items in the same category (token overlap). Use with categoryId + excludeProductId; leave query empty unless retrying after zero results."
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

/** Default ceiling when the shopper asks for “cheap” etc. without naming a product keyword. */
const DEFAULT_CHEAP_MAX_PRICE = 100;

const PRICE_SIGNAL_WORDS = new Set([
  "cheap",
  "cheaper",
  "cheapest",
  "inexpensive",
  "affordable",
  "budget",
]);

const PRICE_ONLY_STOP_TOKENS = new Set([
  ...Array.from(PRICE_SIGNAL_WORDS),
  "low",
  "lower",
  "price",
  "prices",
  "pricing",
  "under",
  "below",
  "less",
  "than",
  "around",
  "about",
  "show",
  "find",
  "get",
  "give",
  "see",
  "list",
  "recommend",
  "suggest",
  "want",
  "need",
  "please",
  "help",
  "me",
  "us",
  "i",
  "the",
  "a",
  "an",
  "some",
  "any",
  "all",
  "for",
  "to",
  "in",
  "with",
  "my",
  "your",
  "our",
  "products",
  "product",
  "items",
  "item",
  "goods",
  "options",
  "option",
  "deals",
  "deal",
  "stuff",
  "things",
  "picks",
  "selection",
  "what",
  "which",
  "are",
  "is",
  "do",
  "can",
  "could",
  "would",
  "looking",
  "shop",
  "buy",
  "browse",
  "range",
  "tier",
  "entry",
  "level",
  "good",
  "best",
  "nice",
  "great",
]);

function tokenizeWords(raw: string): string[] {
  return raw.toLowerCase().match(/[a-z0-9]+/g) ?? [];
}

/** True when query is only generic price/shopping words (no product name tokens). */
function isPriceOnlyShoppingQuery(raw: string): boolean {
  const words = tokenizeWords(raw);
  if (words.length === 0) return false;
  for (const w of words) {
    if (/^\d+$/.test(w)) return false;
    if (!PRICE_ONLY_STOP_TOKENS.has(w)) return false;
  }
  return true;
}

/** Counts overlapping alphanumeric tokens (length >= 3) between anchor and candidate name. */
function tokenOverlapScore(anchor: string, productName: string): number {
  const tokens = anchor.toLowerCase().match(/[a-z0-9]{3,}/g);
  if (!tokens?.length) return 0;
  const hay = productName.toLowerCase();
  let score = 0;
  const seen = new Set<string>();
  for (const t of tokens) {
    if (seen.has(t)) continue;
    seen.add(t);
    if (hay.includes(t)) score++;
  }
  return score;
}

function sortAndFilterByAnchor(products: Product[], anchor: string): Product[] {
  const scored = products.map((product) => ({
    product,
    score: tokenOverlapScore(anchor, product.name),
  }));

  const positiveMatches = scored.filter((entry) => entry.score > 0);
  const rankedPool = positiveMatches.length > 0 ? positiveMatches : scored;

  rankedPool.sort((a, b) => {
    const diff = b.score - a.score;
    if (diff !== 0) return diff;
    return a.product.name.localeCompare(b.product.name);
  });

  return rankedPool.map((entry) => entry.product);
}

export const searchProductsTool = tool({
  description:
    "Search the live product catalog for this store. Use it for recommendations, comparisons, and filters. When a dedicated similar-products tool is available for the current product page, use that instead for similar-item requests. Call at most once per user turn unless results are empty and broadening filters is clearly needed.",
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
      similarToName,
      limit = 8,
    } = params;

    try {
      const baseList = await fetchStoreProducts({
        categoryId,
        colorId,
        sizeId,
      });

      let products = baseList.filter((p) => !(p as { isArchived?: boolean }).isArchived);

      let nameQuery = query.trim();
      let effectiveMinPrice = minPrice;
      let effectiveMaxPrice = maxPrice;

      if (nameQuery && isPriceOnlyShoppingQuery(nameQuery)) {
        nameQuery = "";
        if (typeof effectiveMaxPrice !== "number") {
          effectiveMaxPrice = DEFAULT_CHEAP_MAX_PRICE;
        }
      } else if (nameQuery) {
        const words = tokenizeWords(nameQuery);
        const hasPriceSignal = words.some((w) => PRICE_SIGNAL_WORDS.has(w));
        const productWords = words.filter(
          (w) => !PRICE_ONLY_STOP_TOKENS.has(w) && !PRICE_SIGNAL_WORDS.has(w) && !/^\d+$/.test(w)
        );
        if (hasPriceSignal && productWords.length > 0) {
          nameQuery = productWords.join(" ");
          if (typeof effectiveMaxPrice !== "number") {
            effectiveMaxPrice = DEFAULT_CHEAP_MAX_PRICE;
          }
        }
      }

      const q = nameQuery.toLowerCase();
      if (q) {
        products = products.filter((p) => p.name.toLowerCase().includes(q));
      }

      if (typeof effectiveMinPrice === "number") {
        const minP = effectiveMinPrice;
        products = products.filter((p) => priceNumber(p) >= minP);
      }
      if (typeof effectiveMaxPrice === "number") {
        const maxP = effectiveMaxPrice;
        products = products.filter((p) => priceNumber(p) <= maxP);
      }

      if (excludeProductId) {
        products = products.filter((p) => p.id !== excludeProductId);
      }

      const anchor = similarToName?.trim();
      if (anchor) {
        products = sortAndFilterByAnchor(products, anchor);
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

const findSimilarProductsInputSchema = z.object({
  query: z
    .string()
    .optional()
    .describe(
      "Optional keyword to narrow results within the current product's category, for example parfum, pull, linen, polo, floral, or oversized."
    ),
  limit: z.number().min(1).max(12).optional().default(8),
});

export function createFindSimilarProductsTool(viewerProduct: ChatViewerProduct) {
  return tool({
    description:
      "Find products similar to the current product page item. This tool is already locked to the current product's category and excludes the current product.",
    inputSchema: findSimilarProductsInputSchema,
    execute: async ({
      query = "",
      limit = 8,
    }): Promise<SearchProductsOutput> => {
      try {
        const baseList = await fetchStoreProducts({
          categoryId: viewerProduct.categoryId,
        });

        let products = baseList.filter((p) => !(p as { isArchived?: boolean }).isArchived);
        products = products.filter((p) => p.id !== viewerProduct.id);

        const narrowedQuery = query.trim().toLowerCase();
        if (narrowedQuery) {
          products = products.filter((p) => p.name.toLowerCase().includes(narrowedQuery));
        }

        const anchor = query.trim() || viewerProduct.name;
        products = sortAndFilterByAnchor(products, anchor).slice(0, limit);

        if (!products.length) {
          return {
            found: false,
            message:
              "No similar products were found in this category. Suggest trying a broader style keyword or browsing the category directly.",
            products: [],
            filters: {
              categoryId: viewerProduct.categoryId,
              excludeProductId: viewerProduct.id,
              similarToName: viewerProduct.name,
              query,
              limit,
            },
          };
        }

        return {
          found: true,
          message: `Found ${products.length} similar product(s) in this category.`,
          products,
          filters: {
            categoryId: viewerProduct.categoryId,
            excludeProductId: viewerProduct.id,
            similarToName: viewerProduct.name,
            query,
            limit,
          },
        };
      } catch (error) {
        return {
          found: false,
          message:
            error instanceof Error ? error.message : "Unable to search for similar products right now.",
          products: [],
          filters: {
            categoryId: viewerProduct.categoryId,
            excludeProductId: viewerProduct.id,
            similarToName: viewerProduct.name,
            query,
            limit,
          },
        };
      }
    },
  });
}
