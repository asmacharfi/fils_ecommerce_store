"use client";

import NextImage from "next/image";
import { Tab } from "@headlessui/react";

import { galleryTabGroupKey } from "@/lib/catalog/gallery-images";
import { Image } from "@/types";

import GalleryTab from "./gallery-tab";

interface GalleryProps {
  images: Image[];
}

const Gallery: React.FC<GalleryProps> = ({ images = [] }) => {
  if (!images.length) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-neutral-100 text-sm text-neutral-500">
        No product images yet.
      </div>
    );
  }

  return (
    <Tab.Group key={galleryTabGroupKey(images)} as="div" className="flex flex-col-reverse">
      <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
        <Tab.List className="grid grid-cols-4 gap-6">
          {images.map((image) => (
            <GalleryTab key={image.id} image={image} />
          ))}
        </Tab.List>
      </div>
      <Tab.Panels className="aspect-square w-full">
        {images.map((image) => (
          <Tab.Panel key={image.id}>
            <div className="aspect-square relative h-full w-full sm:rounded-lg overflow-hidden">
              <NextImage
                fill
                src={image.url}
                alt="Image"
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"
              />
            </div>
          </Tab.Panel>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
}
 
export default Gallery;
