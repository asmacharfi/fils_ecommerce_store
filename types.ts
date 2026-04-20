export interface Image {
  id: string;
  url: string;
  colorId?: string | null;
}

export interface Color {
  id: string;
  name: string;
  value: string;
}

export interface Size {
  id: string;
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  stock: number;
  color: Color;
  size: Size;
}

export interface Product {
  id: string;
  category: Category;
  name: string;
  description: string;
  /** Product-level inventory when `variants` is empty (no color/size). */
  stock: number;
  price: string;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  isFeatured: boolean;
  isBillboard: boolean;
  variants: ProductVariant[];
  images: Image[];
}

export interface Billboard {
  id: string;
  label: string;
  imageUrl: string;
}

export interface Category {
  id: string;
  name: string;
  billboard: Billboard;
}
