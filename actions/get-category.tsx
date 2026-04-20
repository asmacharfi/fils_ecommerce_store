import { getStoreApiRoot } from "@/lib/get-store-api-root";
import { Category } from "@/types";

const getCategory = async (id: string): Promise<Category | null> => {
  const root = getStoreApiRoot();
  if (!root) return null;

  try {
    const res = await fetch(`${root}/categories/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as Category;
    if (!data?.id || !data?.billboard) return null;
    return data;
  } catch {
    return null;
  }
};

export default getCategory;
