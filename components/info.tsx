"use client";

import { ShoppingCart } from "lucide-react";

import { AskAISimilarButton } from "@/components/ask-ai-similar-button";
import { CartQuantityControls } from "@/components/cart-quantity-controls";
import Currency from "@/components/ui/currency";
import Button from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import type { Product } from "@/types";

interface InfoProps {
  data: Product;
}

const LOW_STOCK_THRESHOLD = 5;

function formatDimensions(p: Product): string | null {
  const parts: string[] = [];
  if (p.width != null) parts.push(`W ${p.width}`);
  if (p.height != null) parts.push(`H ${p.height}`);
  if (p.depth != null) parts.push(`D ${p.depth}`);
  return parts.length ? parts.join(" × ") : null;
}

const Info: React.FC<InfoProps> = ({ data }) => {
  const quantity = useCart((s) => s.items.find((i) => i.product.id === data.id)?.quantity ?? 0);
  const addOrIncrement = useCart((s) => s.addOrIncrement);
  const decrement = useCart((s) => s.decrement);

  const stock = Math.max(0, Math.trunc(Number(data.stock) || 0));
  const outOfStock = stock <= 0;
  const dims = formatDimensions(data);
  const showLowStock = !outOfStock && stock > 0 && stock <= LOW_STOCK_THRESHOLD;

  const onAddToCart = () => {
    addOrIncrement(data, 1);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{data.name}</h1>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl text-gray-900">
          <Currency value={data?.price} />
        </p>
      </div>

      {!outOfStock && (
        <p className="mt-2 text-sm text-gray-600">
          {showLowStock ? (
            <span className="font-medium text-amber-700">Only {stock} left in stock</span>
          ) : (
            <span>{stock} in stock</span>
          )}
        </p>
      )}

      {data.description?.trim() ? (
        <div className="mt-6">
          <h3 className="font-semibold text-black">Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{data.description}</p>
        </div>
      ) : null}

      {dims ? (
        <div className="mt-6">
          <h3 className="font-semibold text-black">Dimensions</h3>
          <p className="mt-2 text-sm text-gray-700">{dims}</p>
        </div>
      ) : null}

      <hr className="my-4" />
      <div className="flex flex-col gap-y-6">
        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Size:</h3>
          <div>{data?.size?.value}</div>
        </div>
        <div className="flex items-center gap-x-4">
          <h3 className="font-semibold text-black">Color:</h3>
          <div
            className="h-6 w-6 rounded-full border border-gray-600"
            style={{ backgroundColor: data?.color?.value }}
          />
        </div>
      </div>
      <div className="mt-10 space-y-3">
        <div className="transition-opacity duration-200">
          {outOfStock ? (
            <Button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 px-4 py-3 text-sm opacity-70">
              Out of Stock
            </Button>
          ) : quantity > 0 ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CartQuantityControls
                quantity={quantity}
                maxStock={stock}
                onIncrement={() => addOrIncrement(data, 1)}
                onDecrement={() => decrement(data.id)}
                className="w-full justify-between sm:w-auto"
              />
            </div>
          ) : (
            <Button
              onClick={onAddToCart}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm"
            >
              Add To Cart
              <ShoppingCart className="h-4 w-4 shrink-0" />
            </Button>
          )}
        </div>
        <AskAISimilarButton productName={data.name} />
      </div>
    </div>
  );
};

export default Info;
