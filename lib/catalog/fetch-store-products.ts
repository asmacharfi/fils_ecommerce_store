import qs from "query-string";

import { normalizeProducts } from "@/lib/catalog/normalize-product";
import { getStoreApiRoot } from "@/lib/get-store-api-root";
import type { Product } from "@/types";

export type StoreCatalogQuery = {
  categoryId?: string;
  colorId?: string;
  sizeId?: string;
  isFeatured?: boolean;
  isBillboard?: boolean;
};

/**
 * Server-side catalog fetch aligned with {@link actions/get-products.tsx}.
 */
export async function fetchStoreProducts(
  query: StoreCatalogQuery = {}
): Promise<Product[]> {
  const root = getStoreApiRoot();
  if (!root) return [];

  const url = qs.stringifyUrl({
    url: `${root}/products`,
    query: {
      colorId: query.colorId,
      sizeId: query.sizeId,
      categoryId: query.categoryId,
      isFeatured: query.isFeatured,
      isBillboard: query.isBillboard,
    },
  });

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return normalizeProducts(data);
  } catch {
    return [];
  }
}
