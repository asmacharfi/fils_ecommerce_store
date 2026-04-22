import getProduct from "@/actions/get-product";
import type { CurrentProductContext } from "@/lib/ai/request-context";
import type { Product } from "@/types";

const PRODUCT_PATH = /^\/product\/([^/]+)\/?/;

export function productIdFromPathname(pathname: string): string | null {
  const target = pathname.trim();
  const m = target.match(PRODUCT_PATH);
  return m?.[1] ?? null;
}

function productToCurrentContext(product: Product): CurrentProductContext | null {
  if (
    !product?.id ||
    !product.name ||
    !product.category?.id ||
    !product.category?.name
  ) {
    return null;
  }
  return {
    productId: product.id,
    productName: product.name,
    categoryId: product.category.id,
    categoryName: product.category.name,
  };
}

/**
 * Resolves {@link CurrentProductContext} from a `/product/[id]` pathname using the catalog API.
 * Use when the client has not yet populated `currentProductContext` (async race).
 */
export async function resolveCurrentProductContextFromPathname(
  pathname: string
): Promise<CurrentProductContext | null> {
  const id = productIdFromPathname(pathname);
  if (!id) return null;
  const product = await getProduct(id);
  if (!product) return null;
  return productToCurrentContext(product);
}
