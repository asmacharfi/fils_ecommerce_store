import { z } from "zod";

export const similarProductsRequestContextSchema = z.object({
  kind: z.literal("similar-products"),
  productId: z.string().min(1),
  productName: z.string().min(1),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
});

export const cheapestInCategoryRequestContextSchema = z.object({
  kind: z.literal("cheapest-in-category"),
  productId: z.string().min(1),
  productName: z.string().min(1),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
});

export const currentProductContextSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  categoryId: z.string().min(1),
  categoryName: z.string().min(1),
});

export type CurrentProductContext = z.infer<typeof currentProductContextSchema>;
export type SimilarProductsRequestContext = z.infer<
  typeof similarProductsRequestContextSchema
>;
export type CheapestInCategoryRequestContext = z.infer<
  typeof cheapestInCategoryRequestContextSchema
>;

export type ChatToolRequestContext =
  | SimilarProductsRequestContext
  | CheapestInCategoryRequestContext;

export function parseSimilarProductsRequestContext(
  value: unknown
): SimilarProductsRequestContext | null {
  const parsed = similarProductsRequestContextSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function parseCurrentProductContext(
  value: unknown
): CurrentProductContext | null {
  const parsed = currentProductContextSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function toSimilarProductsRequestContext(
  value: CurrentProductContext
): SimilarProductsRequestContext {
  return {
    kind: "similar-products",
    ...value,
  };
}

export function parseCheapestInCategoryRequestContext(
  value: unknown
): CheapestInCategoryRequestContext | null {
  const parsed = cheapestInCategoryRequestContextSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export function toCheapestInCategoryRequestContext(
  value: CurrentProductContext
): CheapestInCategoryRequestContext {
  return {
    kind: "cheapest-in-category",
    ...value,
  };
}

/**
 * For chat route: accept explicit `requestContext` from the client
 * (e.g. similar products button = similar-products only).
 */
export function parseChatToolRequestContext(
  value: unknown
): ChatToolRequestContext | null {
  const sim = parseSimilarProductsRequestContext(value);
  if (sim) return sim;
  return parseCheapestInCategoryRequestContext(value);
}
