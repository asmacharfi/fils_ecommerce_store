import qs from "query-string";

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
  const base = process.env.NEXT_PUBLIC_API_URL;
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured");
  }

  const url = qs.stringifyUrl({
    url: `${base}/products`,
    query: {
      colorId: query.colorId,
      sizeId: query.sizeId,
      categoryId: query.categoryId,
      isFeatured: query.isFeatured,
      isBillboard: query.isBillboard,
    },
  });

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const data = (await res.json()) as Product[];
  return Array.isArray(data) ? data : [];
}
