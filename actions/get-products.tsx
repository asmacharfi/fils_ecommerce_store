import { normalizeProducts } from "@/lib/catalog/normalize-product";
import { getStoreApiRoot } from "@/lib/get-store-api-root";
import type { Product } from "@/types";
import qs from "query-string";

interface Query {
  categoryId?: string;
  colorId?: string;
  sizeId?: string;
  isFeatured?: boolean;
  isBillboard?: boolean;
}

const getProducts = async (query: Query): Promise<Product[]> => {
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
    const json = await res.json();
    return normalizeProducts(json);
  } catch {
    return [];
  }
};

export default getProducts;
