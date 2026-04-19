import { create } from "zustand";
import { toast } from "react-hot-toast";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Product } from "@/types";

export type CartLine = {
  product: Product;
  quantity: number;
};

interface CartStore {
  items: CartLine[];
  getQuantity: (productId: string) => number;
  addOrIncrement: (product: Product, delta?: number) => void;
  decrement: (productId: string) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  removeAll: () => void;
}

const CART_STORAGE_KEY = "cart-storage-v2";

const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],

      getQuantity: (productId: string) => {
        const line = get().items.find((i) => i.product.id === productId);
        return line?.quantity ?? 0;
      },

      addOrIncrement: (product: Product, delta = 1) => {
        const stock = Math.max(0, Math.trunc(Number(product.stock) || 0));
        if (stock <= 0) {
          toast.error("This product is out of stock.");
          return;
        }

        const items = get().items;
        const idx = items.findIndex((i) => i.product.id === product.id);
        const currentQty = idx >= 0 ? items[idx].quantity : 0;
        const nextQty = Math.min(stock, currentQty + delta);

        if (nextQty <= currentQty) {
          if (currentQty >= stock) {
            toast.error("Maximum stock reached.");
          }
          return;
        }

        if (idx >= 0) {
          const next = [...items];
          next[idx] = { product, quantity: nextQty };
          set({ items: next });
        } else {
          set({ items: [...items, { product, quantity: nextQty }] });
          toast.success("Item added to cart.");
        }
      },

      decrement: (productId: string) => {
        const items = get().items;
        const idx = items.findIndex((i) => i.product.id === productId);
        if (idx < 0) return;

        const line = items[idx];
        const nextQty = line.quantity - 1;
        if (nextQty <= 0) {
          set({ items: items.filter((i) => i.product.id !== productId) });
          toast.success("Item removed from cart.");
          return;
        }

        const next = [...items];
        next[idx] = { ...line, quantity: nextQty };
        set({ items: next });
      },

      setQuantity: (productId: string, quantity: number) => {
        const items = get().items;
        const idx = items.findIndex((i) => i.product.id === productId);
        if (idx < 0) return;

        const product = items[idx].product;
        const stock = Math.max(0, Math.trunc(Number(product.stock) || 0));
        const clamped = Math.max(0, Math.min(stock, Math.trunc(quantity)));

        if (clamped <= 0) {
          set({ items: items.filter((i) => i.product.id !== productId) });
          toast.success("Item removed from cart.");
          return;
        }

        const next = [...items];
        next[idx] = { product, quantity: clamped };
        set({ items: next });
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) });
        toast.success("Item removed from cart.");
      },

      removeAll: () => set({ items: [] }),
    }),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCart;
