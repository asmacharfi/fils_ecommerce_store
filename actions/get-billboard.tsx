import { getStoreApiRoot } from "@/lib/get-store-api-root";
import { Billboard } from "@/types";

const getBillboard = async (id: string): Promise<Billboard | null> => {
  const root = getStoreApiRoot();
  if (!root) return null;

  try {
    const res = await fetch(`${root}/billboards/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as Billboard;
  } catch {
    return null;
  }
};

export default getBillboard;
