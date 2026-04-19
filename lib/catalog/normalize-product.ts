import type { Product } from "@/types";

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

/** Normalizes API JSON (Prisma decimals, missing fields) into a storefront `Product`. */
export function normalizeProduct(raw: unknown): Product {
  const p = raw as Record<string, unknown>;
  const base = p as unknown as Product;
  return {
    ...base,
    id: String(p.id ?? ""),
    name: String(p.name ?? ""),
    price: String(p.price ?? "0"),
    description: typeof p.description === "string" ? p.description : "",
    stock: toInt(p.stock, 0),
    width: toFloatOrNull(p.width),
    height: toFloatOrNull(p.height),
    depth: toFloatOrNull(p.depth),
  };
}

export function normalizeProducts(raw: unknown): Product[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => normalizeProduct(item));
}
