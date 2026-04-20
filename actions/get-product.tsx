import { normalizeProduct } from "@/lib/catalog/normalize-product";
import { getStoreApiRoot } from "@/lib/get-store-api-root";
import type { Product } from "@/types";

const getProduct = async (id: string): Promise<Product | null> => {
  const root = getStoreApiRoot();
  if (!root) return null;

  try {
    const res = await fetch(`${root}/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return normalizeProduct(json);
  } catch {
    return null;
  }
};

export default getProduct;
