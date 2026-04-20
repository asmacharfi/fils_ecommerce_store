import type { Color, Image, Product, ProductVariant, Size } from "@/types";

function toInt(value: unknown, fallback: number): number {
  const n = typeof value === "number" ? value : parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(n) || n < 0) return fallback;
  return Math.trunc(n);
}

function toFloatOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : null;
}

function normalizeColor(raw: unknown): Color {
  const c = raw as Record<string, unknown>;
  return {
    id: String(c.id ?? ""),
    name: String(c.name ?? ""),
    value: String(c.value ?? ""),
  };
}

function normalizeSize(raw: unknown): Size {
  const s = raw as Record<string, unknown>;
  return {
    id: String(s.id ?? ""),
    name: String(s.name ?? ""),
    value: String(s.value ?? ""),
  };
}

function normalizeVariant(raw: unknown): ProductVariant | null {
  const v = raw as Record<string, unknown>;
  const id = String(v.id ?? "");
  if (!id) return null;
  const color = normalizeColor(v.color);
  const size = normalizeSize(v.size);
  if (!color.id || !size.id) return null;
  return {
    id,
    stock: toInt(v.stock, 0),
    color,
    size,
  };
}

function normalizeImage(raw: unknown): Image {
  const i = raw as Record<string, unknown>;
  return {
    id: String(i.id ?? ""),
    url: String(i.url ?? ""),
    colorId: i.colorId === null || i.colorId === undefined ? null : String(i.colorId),
  };
}

/** Normalizes API JSON (Prisma decimals, missing fields) into a storefront `Product`. */
export function normalizeProduct(raw: unknown): Product {
  const p = raw as Record<string, unknown>;
  const variantsRaw = p.variants;
  const variants: ProductVariant[] = Array.isArray(variantsRaw)
    ? (variantsRaw.map(normalizeVariant).filter(Boolean) as ProductVariant[])
    : [];

  const imagesRaw = p.images;
  const images: Image[] = Array.isArray(imagesRaw) ? imagesRaw.map(normalizeImage) : [];

  return {
    id: String(p.id ?? ""),
    name: String(p.name ?? ""),
    price: String(p.price ?? "0"),
    stock: toInt(p.stock, 0),
    description: typeof p.description === "string" ? p.description : "",
    width: toFloatOrNull(p.width),
    height: toFloatOrNull(p.height),
    depth: toFloatOrNull(p.depth),
    isFeatured: Boolean(p.isFeatured),
    isBillboard: Boolean(p.isBillboard),
    category: (p.category ?? {}) as Product["category"],
    variants,
    images,
  };
}

export function normalizeProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeProduct(item));
}
