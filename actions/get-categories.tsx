import { getStoreApiRoot } from "@/lib/get-store-api-root";
import { Category } from "@/types";

const getCategories = async (): Promise<Category[]> => {
  const root = getStoreApiRoot();
  if (!root) return [];

  try {
    const res = await fetch(`${root}/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export default getCategories;

