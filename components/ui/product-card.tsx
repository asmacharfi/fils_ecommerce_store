"use client";

import Image from "next/image";
import { MouseEventHandler } from "react";
import { Expand, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

import Currency from "@/components/ui/currency";
import IconButton from "@/components/ui/icon-button";
import usePreviewModal from "@/hooks/use-preview-modal";
import useCart from "@/hooks/use-cart";
import { defaultVariantForQuickAdd, effectiveCatalogStock, isSimpleCatalogProduct } from "@/lib/catalog/cart-variant";
import { Product } from "@/types";

interface ProductCard {
  data: Product;
}

const ProductCard: React.FC<ProductCard> = ({ data }) => {
  const openPreview = usePreviewModal((state) => state.onOpen);
  const addOrIncrement = useCart((state) => state.addOrIncrement);
  const router = useRouter();

  const handleClick = () => {
    router.push(`/product/${data?.id}`);
  };

  const onPreview: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    openPreview(data);
  };

  const simple = isSimpleCatalogProduct(data);
  const quickVariant = defaultVariantForQuickAdd(data);
  const stock = effectiveCatalogStock(data);

  const onAddToCart: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.stopPropagation();
    if (stock <= 0) return;
    if (simple) addOrIncrement(data, null, 1);
    else if (quickVariant) addOrIncrement(data, quickVariant, 1);
  };

  const imageUrl = data.images?.[0]?.url?.trim();

  return (
    <div onClick={handleClick} className="group cursor-pointer space-y-4 rounded-xl border bg-white p-3">
      {/* Image & actions */}
      <div className="relative aspect-square rounded-xl bg-gray-100">
        {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
          className="aspect-square rounded-md object-cover"
        />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-neutral-400">No image</div>
        )}
        <div className="absolute bottom-5 w-full px-6 opacity-0 transition group-hover:opacity-100">
          <div className="flex justify-center gap-x-6">
            <IconButton onClick={onPreview} icon={<Expand size={20} className="text-gray-600" />} />
            <IconButton
              onClick={onAddToCart}
              disabled={stock <= 0}
              icon={<ShoppingCart size={20} className={stock <= 0 ? "text-gray-300" : "text-gray-600"} />}
            />
          </div>
        </div>
      </div>
      {/* Description */}
      <div>
        <p className="text-lg font-semibold">{data.name}</p>
        <p className="text-sm text-gray-500">{data.category?.name}</p>
      </div>
      {/* Price & Reiew */}
      <div className="flex items-center justify-between">
        <Currency value={data?.price} />
      </div>
    </div>
  );
};

export default ProductCard;
