"use client";

import { ShoppingCart } from "lucide-react";

import { AskAISimilarButton } from "@/components/ask-ai-similar-button";
import { CartQuantityControls } from "@/components/cart-quantity-controls";
import Currency from "@/components/ui/currency";
import Button from "@/components/ui/button";
import useCart from "@/hooks/use-cart";
import { simpleProductLineId } from "@/lib/catalog/cart-variant";
import type { Color, Product, ProductVariant, Size } from "@/types";

/** PDP / modal for products without color/size (stock on the product). */
export function SimpleProductInfo({ product }: { product: Product }) {
  const lineId = simpleProductLineId(product.id);
  const quantity = useCart((s) => s.items.find((i) => i.lineId === lineId)?.quantity ?? 0);
  const addOrIncrement = useCart((s) => s.addOrIncrement);
  const decrement = useCart((s) => s.decrement);

  const stock = Math.max(0, Math.trunc(Number(product.stock) || 0));
  const outOfStock = stock <= 0;
  const dims = formatDimensions(product);
  const showLowStock = !outOfStock && stock > 0 && stock < 5;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl text-gray-900">
          <Currency value={product.price} />
        </p>
      </div>

      {outOfStock ? (
        <p className="mt-2 text-sm font-medium text-red-700">Out of Stock</p>
      ) : showLowStock ? (
        <p className="mt-2 text-sm font-medium text-amber-700">Only {stock} left</p>
      ) : null}

      {product.description?.trim() ? (
        <div className="mt-6">
          <h3 className="font-semibold text-black">Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{product.description}</p>
        </div>
      ) : null}

      {dims ? (
        <div className="mt-6">
          <h3 className="font-semibold text-black">Dimensions</h3>
          <p className="mt-2 text-sm text-gray-700">{dims}</p>
        </div>
      ) : null}

      <hr className="my-4" />
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
                onIncrement={() => addOrIncrement(product, null, 1)}
                onDecrement={() => decrement(lineId)}
                className="w-full justify-between sm:w-auto"
              />
            </div>
          ) : (
            <Button
              onClick={() => addOrIncrement(product, null, 1)}
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm"
            >
              Add To Cart
              <ShoppingCart className="h-4 w-4 shrink-0" />
            </Button>
          )}
        </div>
        <AskAISimilarButton product={product} />
      </div>
    </div>
  );
}

export interface InfoProps {
  product: Product;
  colors: Color[];
  sizes: Size[];
  selectedColorId: string;
  selectedSizeId: string;
  onSelectColor: (colorId: string) => void;
  onSelectSize: (sizeId: string) => void;
  activeVariant: ProductVariant | null;
}

function formatDimensions(p: Product): string | null {
  const parts: string[] = [];
  if (p.width != null) parts.push(`W ${p.width}`);
  if (p.height != null) parts.push(`H ${p.height}`);
  if (p.depth != null) parts.push(`D ${p.depth}`);
  return parts.length ? parts.join(" × ") : null;
}

const Info: React.FC<InfoProps> = ({
  product,
  colors,
  sizes,
  selectedColorId,
  selectedSizeId,
  onSelectColor,
  onSelectSize,
  activeVariant,
}) => {
  const lineId = activeVariant?.id ?? "";
  const quantity = useCart((s) => s.items.find((i) => i.lineId === lineId)?.quantity ?? 0);
  const addOrIncrement = useCart((s) => s.addOrIncrement);
  const decrement = useCart((s) => s.decrement);

  const stock = activeVariant ? Math.max(0, Math.trunc(Number(activeVariant.stock) || 0)) : 0;
  const outOfStock = !activeVariant || stock <= 0;
  const dims = formatDimensions(product);
  const showLowStock = Boolean(activeVariant && !outOfStock && stock > 0 && stock < 5);

  const onAddToCart = () => {
    if (!activeVariant) return;
    addOrIncrement(product, activeVariant, 1);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
      <div className="mt-3 flex items-end justify-between">
        <p className="text-2xl text-gray-900">
          <Currency value={product.price} />
        </p>
      </div>

      {outOfStock ? (
        <p className="mt-2 text-sm font-medium text-red-700">Out of Stock</p>
      ) : showLowStock ? (
        <p className="mt-2 text-sm font-medium text-amber-700">Only {stock} left</p>
      ) : null}

      {product.description?.trim() ? (
        <div className="mt-6">
          <h3 className="font-semibold text-black">Description</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{product.description}</p>
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
        <div>
          <h3 className="font-semibold text-black">Color</h3>
          <div className="mt-2 flex flex-wrap gap-3">
            {colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectColor(c.id)}
                className={`relative h-9 w-9 rounded-full border-2 transition ${
                  selectedColorId === c.id ? "border-black ring-2 ring-black/20" : "border-gray-300"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.name}
                aria-label={c.name}
                aria-pressed={selectedColorId === c.id}
              />
            ))}
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-black">Size</h3>
          <div className="mt-2 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelectSize(s.id)}
                className={`rounded-md border px-3 py-2 text-sm transition ${
                  selectedSizeId === s.id
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-gray-900 hover:border-gray-400"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-10 space-y-3">
        <div className="transition-opacity duration-200">
          {!activeVariant ? (
            <Button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 px-4 py-3 text-sm opacity-70">
              Select options
            </Button>
          ) : outOfStock ? (
            <Button disabled className="flex w-full cursor-not-allowed items-center justify-center gap-2 px-4 py-3 text-sm opacity-70">
              Out of Stock
            </Button>
          ) : quantity > 0 ? (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CartQuantityControls
                quantity={quantity}
                maxStock={stock}
                onIncrement={() => addOrIncrement(product, activeVariant, 1)}
                onDecrement={() => decrement(activeVariant.id)}
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
        <AskAISimilarButton product={product} />
      </div>
    </div>
  );
};

export default Info;
