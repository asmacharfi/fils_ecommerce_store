"use client";

import Image from "next/image";

import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import useCart from "@/hooks/use-cart";
import { defaultVariantForQuickAdd, effectiveCatalogStock, isSimpleCatalogProduct } from "@/lib/catalog/cart-variant";
import { Product } from "@/types";

interface AIProductCardProps {
  product: Product;
}

const AIProductCard: React.FC<AIProductCardProps> = ({ product }) => {
  const addOrIncrement = useCart((state) => state.addOrIncrement);
  const simple = isSimpleCatalogProduct(product);
  const v = defaultVariantForQuickAdd(product);
  const stock = effectiveCatalogStock(product);
  const out = stock <= 0 || (!simple && !v);

  return (
    <div className="min-w-0 space-y-3 rounded-xl border bg-white p-3">
      <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100">
        {product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 16rem, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">No image</div>
        )}
      </div>
      <div className="min-w-0 space-y-1">
        <p className="break-words text-sm font-semibold leading-snug">{product.name}</p>
        <p className="text-xs text-gray-500">{product.category?.name}</p>
      </div>
      <div className="flex items-center justify-between">
        <Currency value={product.price} />
        <Button
          onClick={() => {
            if (stock <= 0) return;
            if (simple) addOrIncrement(product, null, 1);
            else if (v) addOrIncrement(product, v, 1);
          }}
          disabled={out}
          className="px-4 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50"
        >
          {out ? "Out of Stock" : "Add to Cart"}
        </Button>
      </div>
    </div>
  );
};

export default AIProductCard;
