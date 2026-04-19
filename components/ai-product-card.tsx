"use client";

import Image from "next/image";

import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import useCart from "@/hooks/use-cart";
import { Product } from "@/types";

interface AIProductCardProps {
  product: Product;
}

const AIProductCard: React.FC<AIProductCardProps> = ({ product }) => {
  const cart = useCart();
  const stock = Math.max(0, Math.trunc(Number(product.stock) || 0));
  const out = stock <= 0;

  return (
    <div className="rounded-xl border bg-white p-3 space-y-3">
      <div className="relative h-32 w-full overflow-hidden rounded-lg bg-gray-100">
        {product.images?.[0]?.url ? (
          <Image
            src={product.images[0].url}
            alt={product.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
            No image
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="font-semibold leading-tight">{product.name}</p>
        <p className="text-xs text-gray-500">{product.category?.name}</p>
      </div>
      <div className="flex items-center justify-between">
        <Currency value={product.price} />
        <Button
          onClick={() => cart.addOrIncrement(product, 1)}
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
