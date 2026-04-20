"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Button from "@/components/ui/button";
import Currency from "@/components/ui/currency";
import { Product } from "@/types";

interface BillboardCarouselProps {
  items: Product[];
}

const BillboardCarousel: React.FC<BillboardCarouselProps> = ({ items }) => {
  const slides = useMemo(
    () => (items || []).filter((item) => item.isBillboard === true && item.images?.[0]?.url),
    [items]
  );
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  useEffect(() => {
    if (activeIndex > slides.length - 1) {
      setActiveIndex(0);
    }
  }, [activeIndex, slides.length]);

  if (!slides.length) {
    return null;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 rounded-xl overflow-hidden">
      <div className="relative rounded-xl overflow-hidden aspect-square md:aspect-[2.4/1]">
        {slides.map((product, index) => (
          <div
            key={product.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === activeIndex ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            }`}
          >
            <Image
              src={product.images[0].url}
              alt={product.name}
              fill
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
              sizes="(min-width: 768px) 100vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/45" />
            <div className="absolute inset-0 flex items-center justify-end p-6 md:p-10 lg:p-14">
              <div className="max-w-sm text-right text-white space-y-4">
                <p className="text-xs uppercase tracking-[0.25em] text-white/70">New Collection</p>
                <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight">{product.name}</h2>
                <div className="inline-flex bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5">
                  <Currency value={product.price} />
                </div>
                <div>
                  <Link href={`/product/${product.id}`}>
                    <Button className="bg-white text-black hover:bg-white/90">Shop Now</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          {slides.map((product, index) => (
            <button
              key={product.id}
              onClick={() => setActiveIndex(index)}
              className={`h-2.5 w-2.5 rounded-full transition ${
                index === activeIndex ? "bg-black" : "bg-black/30"
              }`}
              aria-label={`Go to ${product.name}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BillboardCarousel;
