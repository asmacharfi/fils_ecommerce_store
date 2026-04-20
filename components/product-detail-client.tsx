"use client";

import { useEffect, useMemo, useState } from "react";

import Gallery from "@/components/gallery";
import Info, { SimpleProductInfo } from "@/components/info";
import { isSimpleCatalogProduct } from "@/lib/catalog/cart-variant";
import type { Color, Product, ProductVariant, Size } from "@/types";

function defaultSelection(product: Product): { colorId: string; sizeId: string } {
  const v = product.variants.find((x) => x.stock > 0) ?? product.variants[0];
  if (!v) return { colorId: "", sizeId: "" };
  return { colorId: v.color.id, sizeId: v.size.id };
}

function uniqueColors(variants: ProductVariant[]): Color[] {
  const m = new Map<string, Color>();
  for (const v of variants) {
    if (!m.has(v.color.id)) m.set(v.color.id, v.color);
  }
  return Array.from(m.values());
}

function sizesForColor(product: Product, colorId: string): Size[] {
  const m = new Map<string, Size>();
  for (const v of product.variants) {
    if (v.color.id === colorId) m.set(v.size.id, v.size);
  }
  return Array.from(m.values());
}

interface ProductDetailClientProps {
  product: Product;
  /** Wide PDP grid vs modal-friendly split */
  layout?: "page" | "modal";
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ product, layout = "page" }) => {
  const initial = useMemo(() => defaultSelection(product), [product]);
  const [selectedColorId, setSelectedColorId] = useState(initial.colorId);
  const [selectedSizeId, setSelectedSizeId] = useState(initial.sizeId);

  useEffect(() => {
    const next = defaultSelection(product);
    setSelectedColorId(next.colorId);
    setSelectedSizeId(next.sizeId);
  }, [product]);

  const sizes = useMemo(() => sizesForColor(product, selectedColorId), [product, selectedColorId]);

  useEffect(() => {
    if (!sizes.some((s) => s.id === selectedSizeId)) {
      const next = sizes[0]?.id ?? "";
      if (next) setSelectedSizeId(next);
    }
  }, [sizes, selectedSizeId]);

  const activeVariant = useMemo(
    () =>
      product.variants.find((v) => v.color.id === selectedColorId && v.size.id === selectedSizeId) ?? null,
    [product.variants, selectedColorId, selectedSizeId]
  );

  const galleryImages = useMemo(() => {
    const filtered = product.images.filter((img) => !img.colorId || img.colorId === selectedColorId);
    return filtered.length ? filtered : product.images;
  }, [product.images, selectedColorId]);

  const onSelectColor = (colorId: string) => {
    setSelectedColorId(colorId);
  };

  const onSelectSize = (sizeId: string) => {
    setSelectedSizeId(sizeId);
  };

  const grid =
    layout === "modal"
      ? "grid w-full grid-cols-1 items-start gap-x-6 gap-y-8 sm:grid-cols-12 lg:gap-x-8"
      : "lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8";

  const infoWrap =
    layout === "modal"
      ? "sm:col-span-8 lg:col-span-7"
      : "mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0";

  const galleryEl = <Gallery images={galleryImages} />;

  if (isSimpleCatalogProduct(product)) {
    const simpleGallery = <Gallery images={product.images} />;
    return (
      <div className={grid}>
        {layout === "modal" ? (
          <div className="sm:col-span-4 lg:col-span-5">{simpleGallery}</div>
        ) : (
          simpleGallery
        )}
        <div className={infoWrap}>
          <SimpleProductInfo product={product} />
        </div>
      </div>
    );
  }

  if (!product.variants?.length) {
    return (
      <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        This product has no purchasable variants yet. Add variants or enable &quot;No color/size&quot; inventory in the admin dashboard.
      </div>
    );
  }

  return (
    <div className={grid}>
      {layout === "modal" ? (
        <div className="sm:col-span-4 lg:col-span-5">{galleryEl}</div>
      ) : (
        galleryEl
      )}
      <div className={infoWrap}>
        <Info
          product={product}
          colors={uniqueColors(product.variants)}
          sizes={sizes}
          selectedColorId={selectedColorId}
          selectedSizeId={selectedSizeId}
          onSelectColor={onSelectColor}
          onSelectSize={onSelectSize}
          activeVariant={activeVariant}
        />
      </div>
    </div>
  );
};

export default ProductDetailClient;
