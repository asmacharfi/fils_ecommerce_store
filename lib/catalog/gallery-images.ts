import type { Image } from "@/types";

function isUntagged(img: Image): boolean {
  return img.colorId == null || img.colorId === "";
}

/**
 * PDP gallery: prefer images tagged for `colorId`, else shared (untagged) shots, else full set.
 * Avoids showing another color’s photos when a color has its own gallery.
 */
export function galleryImagesForColor(images: Image[], colorId: string): Image[] {
  if (!images.length) return [];
  if (!colorId) return images;

  const forColor = images.filter((img) => img.colorId === colorId);
  if (forColor.length > 0) return forColor;

  const untagged = images.filter(isUntagged);
  if (untagged.length > 0) return untagged;

  return images;
}

export function galleryTabGroupKey(images: Image[]): string {
  if (!images.length) return "__empty__";
  return images.map((i) => i.id).join("|");
}
