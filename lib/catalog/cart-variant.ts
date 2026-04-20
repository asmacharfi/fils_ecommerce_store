import type { Product, ProductVariant } from "@/types";

export const SIMPLE_LINE_PREFIX = "simple:" as const;

export function simpleProductLineId(productId: string): string {
  return `${SIMPLE_LINE_PREFIX}${productId}`;
}

export function isSimpleProductLineId(lineId: string): boolean {
  return lineId.startsWith(SIMPLE_LINE_PREFIX);
}

export function isSimpleCatalogProduct(product: Product): boolean {
  return !product.variants?.length;
}

/** First variant with stock > 0, else first variant in the list. */
export function defaultVariantForQuickAdd(product: Product): ProductVariant | null {
  if (!product.variants?.length) return null;
  const inStock = product.variants.find((v) => v.stock > 0);
  return inStock ?? product.variants[0] ?? null;
}

/** Sellable units: variant row stock, or product.stock when there are no variants. */
export function effectiveCatalogStock(product: Product): number {
  if (product.variants?.length) {
    const v = defaultVariantForQuickAdd(product);
    return v ? Math.max(0, Math.trunc(Number(v.stock) || 0)) : 0;
  }
  return Math.max(0, Math.trunc(Number(product.stock) || 0));
}

export function findVariant(product: Product, variantId: string): ProductVariant | null {
  return product.variants.find((v) => v.id === variantId) ?? null;
}
