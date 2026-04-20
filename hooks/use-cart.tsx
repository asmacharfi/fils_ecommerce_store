import { create } from "zustand";
import { toast } from "react-hot-toast";
import { persist, createJSONStorage } from "zustand/middleware";

import type { Product, ProductVariant } from "@/types";
import { simpleProductLineId } from "@/lib/catalog/cart-variant";

export type CartProduct = Pick<Product, "id" | "name" | "price" | "stock"> & {
  images: Array<{
    id: string;
    url: string;
    colorId?: string | null;
  }>;
};

export type CartLine = {
  /** `variant.id` or `simple:<productId>` for product-level stock */
  lineId: string;
  variantId: string | null;
  product: CartProduct;
  variant: ProductVariant | null;
  quantity: number;
};

export function cartLineStock(line: CartLine): number {
  if (line.variant) {
    return Math.max(0, Math.trunc(Number(line.variant.stock) || 0));
  }
  return Math.max(0, Math.trunc(Number(line.product.stock) || 0));
}

interface CartStore {
  items: CartLine[];
  getQuantity: (lineId: string) => number;
  addOrIncrement: (product: Product | CartProduct, variant: ProductVariant | null, delta?: number) => void;
  decrement: (lineId: string) => void;
  setQuantity: (lineId: string, quantity: number) => void;
  removeItem: (lineId: string) => void;
  removeAll: () => void;
}

const CART_STORAGE_KEY = "cart-storage-v4";

function toCartProduct(product: Product): CartProduct {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    images: product.images.slice(0, 1).map((image) => ({
      id: image.id,
      url: image.url,
      colorId: image.colorId,
    })),
  };
}

function isCartProduct(product: Product | CartProduct): product is CartProduct {
  return !("variants" in product);
}

const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      items: [],

      getQuantity: (lineId: string) => {
        const line = get().items.find((i) => i.lineId === lineId);
        return line?.quantity ?? 0;
      },

      addOrIncrement: (product: Product | CartProduct, variant: ProductVariant | null, delta = 1) => {
        const hasVariants = "variants" in product && (product.variants?.length ?? 0) > 0;
        if (hasVariants && !variant) {
          toast.error("Select a variant before adding to cart.");
          return;
        }
        if (!hasVariants && variant) {
          toast.error("This product does not use variants.");
          return;
        }

        const lineId = variant?.id ?? simpleProductLineId(product.id);
        const stock = hasVariants && variant ? Math.max(0, Math.trunc(Number(variant.stock) || 0)) : Math.max(0, Math.trunc(Number(product.stock) || 0));

        if (stock <= 0) {
          toast.error("This product is out of stock.");
          return;
        }

        const items = get().items;
        const idx = items.findIndex((i) => i.lineId === lineId);
        const currentQty = idx >= 0 ? items[idx].quantity : 0;
        const nextQty = Math.min(stock, currentQty + delta);
        const cartProduct = isCartProduct(product) ? product : toCartProduct(product);

        if (nextQty <= currentQty) {
          if (currentQty >= stock) {
            toast.error("Maximum stock reached.");
          }
          return;
        }

        if (idx >= 0) {
          const next = [...items];
          next[idx] = {
            lineId,
            variantId: variant?.id ?? null,
            product: cartProduct,
            variant,
            quantity: nextQty,
          };
          set({ items: next });
        } else {
          set({
            items: [
              ...items,
              {
                lineId,
                variantId: variant?.id ?? null,
                product: cartProduct,
                variant,
                quantity: nextQty,
              },
            ],
          });
          toast.success("Item added to cart.");
        }
      },

      decrement: (lineId: string) => {
        const items = get().items;
        const idx = items.findIndex((i) => i.lineId === lineId);
        if (idx < 0) return;

        const line = items[idx];
        const nextQty = line.quantity - 1;
        if (nextQty <= 0) {
          set({ items: items.filter((i) => i.lineId !== lineId) });
          toast.success("Item removed from cart.");
          return;
        }

        const next = [...items];
        next[idx] = { ...line, quantity: nextQty };
        set({ items: next });
      },

      setQuantity: (lineId: string, quantity: number) => {
        const items = get().items;
        const idx = items.findIndex((i) => i.lineId === lineId);
        if (idx < 0) return;

        const line = items[idx];
        const stock = cartLineStock(line);
        const clamped = Math.max(0, Math.min(stock, Math.trunc(quantity)));

        if (clamped <= 0) {
          set({ items: items.filter((i) => i.lineId !== lineId) });
          toast.success("Item removed from cart.");
          return;
        }

        const next = [...items];
        next[idx] = { ...line, quantity: clamped };
        set({ items: next });
      },

      removeItem: (lineId: string) => {
        set({ items: get().items.filter((item) => item.lineId !== lineId) });
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
