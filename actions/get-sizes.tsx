import { getStoreApiRoot } from "@/lib/get-store-api-root";
import { Size } from "@/types";

const getSizes = async (): Promise<Size[]> => {
  const root = getStoreApiRoot();
  if (!root) return [];

  try {
    const res = await fetch(`${root}/sizes`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

export default getSizes;
