"use client";

import Image from "next/image";

type StackedProductImagesProps = {
  urls: string[];
  alt: string;
  className?: string;
};

/** Up to 4 overlapping thumbnails (reference-style stack). */
export function StackedProductImages({ urls, alt, className = "" }: StackedProductImagesProps) {
  const unique = Array.from(new Set(urls.filter(Boolean))).slice(0, 4);
  if (unique.length === 0) {
    return (
      <div
        className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50 text-xs text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-500 ${className}`}
      >
        —
      </div>
    );
  }

  return (
    <div className={`relative h-24 w-24 shrink-0 ${className}`}>
      {unique.map((url, i) => (
        <div
          key={`stack-${i}`}
          className="absolute overflow-hidden rounded-xl border-2 border-white bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          style={{
            width: 56,
            height: 56,
            left: i * 14,
            top: i * 6,
            zIndex: unique.length - i,
          }}
        >
          <Image src={url} alt={alt} width={56} height={56} className="h-full w-full object-cover" unoptimized />
        </div>
      ))}
    </div>
  );
}
