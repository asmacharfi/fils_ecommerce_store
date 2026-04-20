import { getStoreApiRoot } from "@/lib/get-store-api-root";
import { Color } from "@/types";

const getColors = async (): Promise<Color[]> => {
  const root = getStoreApiRoot();
  if (!root) return [];

  try {
    const res = await fetch(`${root}/colors`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export default getColors;
