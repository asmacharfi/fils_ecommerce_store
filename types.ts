export interface Product {
  id: string;
  category: Category;
  name: string;
  description: string;
  price: string;
  stock: number;
  width?: number | null;
  height?: number | null;
  depth?: number | null;
  isFeatured: boolean;
  isBillboard: boolean;
  size: Size;
  color: Color;
  images: Image[];
}

export interface Image {
  id: string;
  url: string;
}

export interface Billboard {
  id: string;
  label: string;
  imageUrl: string;
};

export interface Category {
  id: string;
  name: string;
  billboard: Billboard;
};

export interface Size {
  id: string;
  name: string;
  value: string;
};

export interface Color {
  id: string;
  name: string;
  value: string;
};
