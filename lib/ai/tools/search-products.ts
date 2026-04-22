import { tool } from "ai";
import { z } from "zod";

import { fetchStoreProducts } from "@/lib/catalog/fetch-store-products";
import type { Product } from "@/types";

/** Word tokens to strip from `query` before name matching; never used as a product name filter on their own. */
const BUDGET_AND_FILLER = new Set([
  "cheap",
  "cheaper",
  "cheapest",
  "budget",
  "affordable",
  "inexpensive",
  "product",
  "products",
  "item",
  "items",
  "thing",
  "things",
  "show",
  "me",
  "us",
  "get",
  "find",
  "search",
  "list",
  "any",
  "some",
  "all",
  "the",
  "a",
  "an",
  "in",
  "on",
  "at",
  "to",
  "for",
  "and",
  "or",
  "are",
  "is",
  "it",
  "if",
  "as",
  "deals",
  "deal",
  "low",
  "lower",
  "lowest",
  "discount",
  "discounted",
  "sale",
  "bargain",
  "under",
  "below",
]);

const CHEAP_INTENT = /\b(cheap|cheaper|cheapest|affordable|budget|inexpensive|bargain|lowest|low|discount|on sale|clearance|deal|deals)\b/i;

function tokenizeForNameQuery(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Strips price-intent and filler words so "cheap levi jeans" can still match "Levi" in the name.
 * Returns a normalized substring for `includes` matching, or empty to skip name filter.
 */
function nameQueryFromUserQuery(raw: string): string {
  const tokens = tokenizeForNameQuery(raw);
  const kept = tokens.filter((t) => !BUDGET_AND_FILLER.has(t));
  return kept.join(" ").trim();
}

function hasCheapIntentOnly(raw: string, nameSubquery: string): boolean {
  const t = raw.trim();
  if (!t) return false;
  if (nameSubquery) return false;
  return CHEAP_INTENT.test(t);
}

type SearchProductsToolOptions = {
  lockedCategoryId?: string;
  lockedCategoryName?: string;
  lockedExcludeProductId?: string;
  /** How to label empty results when category is fixed by request context. */
  strictCategoryEmpty?: "similar" | "cheapest" | "none";
};

const searchProductsInputSchema = z.object({
  query: z
    .string()
    .optional()
    .describe(
      "Product name filter: case-insensitive substring. Do not put only words like 'cheap' or 'budget' here, use sortBy price-asc and maxPrice for budget. Leave empty for broad or price-sorted search."
    ),
  categoryId: z
    .string()
    .optional()
    .describe("Filter by category id when the shopper is browsing a category or asks for that category."),
  colorId: z.string().optional().describe("Filter by color id when relevant."),
  sizeId: z.string().optional().describe("Filter by size id when relevant."),
  minPrice: z.number().optional().describe("Minimum numeric price."),
  maxPrice: z.number().optional().describe("Maximum numeric price."),
  sortBy: z
    .enum(["default", "price-asc", "price-desc"])
    .optional()
    .describe(
      "default: no price ordering. price-asc: lowest price first (for cheap, budget, lowest, affordable). price-desc: highest first."
    ),
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

function applySort(
  products: Product[],
  sortBy: "default" | "price-asc" | "price-desc" | undefined
): Product[] {
  if (!sortBy || sortBy === "default") return products;
  const copy = [...products];
  if (sortBy === "price-asc") {
    copy.sort((a, b) => priceNumber(a) - priceNumber(b));
  } else {
    copy.sort((a, b) => priceNumber(b) - priceNumber(a));
  }
  return copy;
}

export function createSearchProductsTool(
  options: SearchProductsToolOptions = {}
) {
  return tool({
    description:
      "Search the live product catalog. For cheap/budget/lowest price, use sortBy: price-asc and maxPrice or minPrice as needed; do not put 'cheap' alone in query. Call at most once per user turn for simple product discovery.",
    inputSchema: searchProductsInputSchema,
    execute: async (params): Promise<SearchProductsOutput> => {
      const {
        query = "",
        categoryId,
        colorId,
        sizeId,
        minPrice,
        maxPrice,
        sortBy: sortByParam = "default",
        excludeProductId,
        limit = 8,
      } = params;

      const effectiveCategoryId = options.lockedCategoryId ?? categoryId;
      const excludedProductIds = new Set(
        [excludeProductId, options.lockedExcludeProductId].filter(
          (value): value is string => Boolean(value)
        )
      );

      const nameSubquery = nameQueryFromUserQuery(query);
      const inferredCheapSort =
        sortByParam === "default" && hasCheapIntentOnly(query, nameSubquery) ? "price-asc" : sortByParam;

      const filters: SearchProductsInput = {
        ...params,
        sortBy: inferredCheapSort,
        categoryId: effectiveCategoryId,
        excludeProductId: options.lockedExcludeProductId ?? excludeProductId,
      };

      try {
        const baseList = await fetchStoreProducts({
          categoryId: effectiveCategoryId,
          colorId,
          sizeId,
        });

        let products = baseList.filter((p) => !(p as { isArchived?: boolean }).isArchived);

        if (nameSubquery) {
          const q = nameSubquery.toLowerCase();
          products = products.filter((p) => p.name.toLowerCase().includes(q));
        }

        if (typeof minPrice === "number") {
          products = products.filter((p) => priceNumber(p) >= minPrice);
        }
        if (typeof maxPrice === "number") {
          products = products.filter((p) => priceNumber(p) <= maxPrice);
        }

        if (excludedProductIds.size > 0) {
          products = products.filter((p) => !excludedProductIds.has(p.id));
        }

        products = applySort(products, inferredCheapSort);
        products = products.slice(0, limit);

        if (!products.length) {
          let message: string;
          if (options.lockedCategoryId && options.strictCategoryEmpty === "similar") {
            message = "No similar products found in this category.";
          } else if (options.lockedCategoryId && options.strictCategoryEmpty === "cheapest") {
            message = "No products found in this category for those filters.";
          } else {
            message =
              "No products matched those filters. Suggest broadening the search (fewer filters, or a different keyword in query).";
          }
          return {
            found: false,
            message,
            products: [],
            filters,
          };
        }

        return {
          found: true,
          message: options.lockedCategoryName
            ? `Found ${products.length} matching product(s) in ${options.lockedCategoryName}.`
            : `Found ${products.length} matching product(s).`,
          products,
          filters,
        };
      } catch (error) {
        return {
          found: false,
          message:
            error instanceof Error ? error.message : "Unable to search the catalog right now.",
          products: [],
          filters,
        };
      }
    },
  });
}

export const searchProductsTool = createSearchProductsTool();
