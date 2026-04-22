import { z } from "zod";

export const similarProductsRequestContextSchema = z.object({
  kind: z.literal("similar-products"),
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
