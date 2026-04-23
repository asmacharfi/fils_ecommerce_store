"use client";

import { useAuth } from "@clerk/nextjs";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import ProductList from "@/components/product-list";
import { getBrowserStoreApiRoot } from "@/lib/public-store-api";
import type { Product } from "@/types";
import { normalizeProducts } from "@/lib/catalog/normalize-product";
import { useShopperId } from "@/hooks/use-shopper-id";
import useCart from "@/hooks/use-cart";

export function PersonalizedForYou() {
  const { getToken } = useAuth();
  const shopperId = useShopperId();
  const cartItems = useCart((s) => s.items);
  const [items, setItems] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const root = getBrowserStoreApiRoot();
      if (!root) {
        setItems([]);
        return;
      }
      const token = await getToken();
      const url = new URL(`${root}/recommendations/personal`);
      url.searchParams.set("limit", "8");
      if (shopperId) url.searchParams.set("shopperId", shopperId);
      const cartIds = Array.from(new Set(cartItems.map((l) => l.product.id)));
      if (cartIds.length) url.searchParams.set("cartProductIds", cartIds.join(","));

      try {
        const res = await axios.get(url.toString(), {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (cancelled) return;
        setItems(normalizeProducts(res.data));
        setError(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setItems([]);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [getToken, shopperId, cartItems]);

  if (items === null) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" aria-hidden />
      </div>
    );
  }

  if (error || items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-y-8 px-4 sm:px-6 lg:px-8">
      <ProductList title="Picked for you" items={items} />
    </div>
  );
}
